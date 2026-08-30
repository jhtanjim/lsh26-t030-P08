import { Injectable } from '@nestjs/common';
import { CompulsoryGradePoint, ResultTrace, SubjectTrace } from './result.types';

type MarkRow = {
  theoryMark: number | null;
  practicalMark: number | null;
  isAbsent: boolean;
  subject: {
    code: string;
    name: string;
    isCompulsory: boolean;
    hasPractical: boolean;
  };
};

@Injectable()
export class ResultEngineService {
  // Standard grade-point scale from total mark (out of 100)
  private markToGradePoint(total: number): number {
    if (total >= 80) return 5;
    if (total >= 70) return 4;
    if (total >= 60) return 3.5;
    if (total >= 50) return 3;
    if (total >= 40) return 2;
    if (total >= 33) return 1;
    return 0;
  }

  // Human-readable name for whichever band markToGradePoint would pick, for ruleFired.
  private bandLabel(total: number): string {
    if (total >= 80) return 'band 80+';
    if (total >= 70) return 'band 70-79';
    if (total >= 60) return 'band 60-69';
    if (total >= 50) return 'band 50-59';
    if (total >= 40) return 'band 40-49';
    if (total >= 33) return 'band 33-39';
    return 'band below 33';
  }

  private evaluateSubject(row: MarkRow): SubjectTrace {
    const { subject, theoryMark, practicalMark, isAbsent } = row;
    const base: Omit<
      SubjectTrace,
      'gradePoint' | 'ruleFired' | 'isFail' | 'failReason' | 'markUsed'
    > = {
      subject: subject.code,
      name: subject.name,
      isCompulsory: subject.isCompulsory,
      hasPractical: subject.hasPractical,
      theoryMark,
      practicalMark,
      wasAbsent: isAbsent,
    };

    // Check order: absent first, then theory/practical part-pass check, then band lookup.

    // R-12: Absent
    if (isAbsent) {
      return {
        ...base,
        markUsed: null,
        gradePoint: 0,
        ruleFired: 'absent',
        isFail: true,
        failReason: subject.isCompulsory
          ? 'Student was marked absent in compulsory subject'
          : 'Student was marked absent in optional subject',
      };
    }

    const theory = theoryMark ?? 0;

    if (subject.hasPractical) {
      const practical = practicalMark ?? 0;
      const total = theory + practical;

      // R-11: theory and practical part-pass check, before any banding of the total
      if (theory < 25 || practical < 8) {
        const theoryFails = theory < 25;
        const practicalFails = practical < 8;
        const ruleFired = theoryFails
          ? `theory ${theory} below pass mark 25`
          : `practical ${practical} below pass mark 8`;
        const failReason =
          theoryFails && practicalFails
            ? `Theory mark ${theory} is below the pass mark of 25 and practical mark ${practical} is below the pass mark of 8`
            : theoryFails
              ? `Theory mark ${theory} is below the pass mark of 25`
              : `Practical mark ${practical} is below the pass mark of 8`;

        return {
          ...base,
          markUsed: total,
          gradePoint: 0,
          ruleFired,
          isFail: true,
          failReason,
        };
      }

      return {
        ...base,
        markUsed: total,
        gradePoint: this.markToGradePoint(total),
        ruleFired: this.bandLabel(total),
        isFail: false,
        failReason: null,
      };
    }

    // Non-practical subject — standard pass mark 33
    if (theory < 33) {
      return {
        ...base,
        markUsed: theory,
        gradePoint: 0,
        ruleFired: `theory ${theory} below pass mark 33`,
        isFail: true,
        failReason: `Theory mark ${theory} is below the pass mark of 33`,
      };
    }

    return {
      ...base,
      markUsed: theory,
      gradePoint: this.markToGradePoint(theory),
      ruleFired: this.bandLabel(theory),
      isFail: false,
      failReason: null,
    };
  }

  computeTrace(studentId: number, name: string, className: string, marks: MarkRow[]): ResultTrace {
    const subjects = marks.map((m) => this.evaluateSubject(m));

    const compulsorySubjects = subjects.filter((s) => s.isCompulsory);
    const optionalSubject = subjects.find((s) => !s.isCompulsory);

    const compulsoryGradePoints: CompulsoryGradePoint[] = compulsorySubjects.map((s) => ({
      subject: s.subject,
      gradePoint: s.gradePoint,
    }));

    const compulsoryGradePointSum = compulsorySubjects.reduce((sum, s) => sum + s.gradePoint, 0);
    const optionalGradePoint = optionalSubject ? optionalSubject.gradePoint : 0;
    const optionalBonus = Math.max(0, optionalGradePoint - 2);

    const sum = compulsoryGradePointSum + optionalBonus;
    const divisor = 6;
    const uncancelledGpa = Math.min(5, sum / divisor);

    const failedCompulsory = compulsorySubjects.find((s) => s.isFail);
    const failureReason = failedCompulsory
      ? `Compulsory subject ${failedCompulsory.subject} failed (${failedCompulsory.ruleFired})`
      : null;

    const finalGpa = failedCompulsory ? 0 : uncancelledGpa;
    const finalGrade = this.gpaToLetter(finalGpa, !!failedCompulsory);

    return {
      studentId,
      name,
      className,
      subjects,
      compulsoryGradePoints,
      optionalContribution: {
        subject: optionalSubject ? optionalSubject.subject : null,
        gradePoint: optionalGradePoint,
        formula: `max(0, ${optionalGradePoint} - 2) = ${optionalBonus}`,
        bonus: optionalBonus,
      },
      compulsoryGradePointSum,
      optionalGradePoint,
      optionalBonus,
      sum,
      divisor,
      uncancelledGpa: Number(uncancelledGpa.toFixed(2)),
      finalGpa: Number(finalGpa.toFixed(2)),
      finalGrade,
      failureReason,
    };
  }

  private gpaToLetter(gpa: number, failed: boolean): string {
    if (failed) return 'F';
    if (gpa >= 5.0) return 'A+';
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.5) return 'A-';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.0) return 'D';
    return 'F';
  }
}