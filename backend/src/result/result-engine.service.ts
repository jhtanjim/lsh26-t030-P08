import { Injectable } from '@nestjs/common';
import { ResultTrace, SubjectTrace } from './result.types';

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

  private evaluateSubject(row: MarkRow): SubjectTrace {
    const { subject, theoryMark, practicalMark, isAbsent } = row;
    const base: Omit<SubjectTrace, 'status' | 'gradePoint' | 'rule' | 'totalMark'> = {
      code: subject.code,
      name: subject.name,
      isCompulsory: subject.isCompulsory,
      hasPractical: subject.hasPractical,
      theoryMark,
      practicalMark,
      isAbsent,
    };

    // R-12: Absent
    if (isAbsent) {
      return {
        ...base,
        totalMark: null,
        status: 'ABSENT',
        gradePoint: 0,
        rule: subject.isCompulsory
          ? 'R-12 — absent in compulsory subject'
          : 'R-12 — absent in optional subject',
      };
    }

    const theory = theoryMark ?? 0;

    if (subject.hasPractical) {
      const practical = practicalMark ?? 0;
      const total = theory + practical;

      // R-11: practical subject pass rule
      if (theory < 25 || practical < 8) {
        return {
          ...base,
          totalMark: total,
          status: 'FAIL',
          gradePoint: 0,
          rule:
            theory < 25 && practical < 8
              ? 'R-11 — theory below 25 AND practical below 8'
              : theory < 25
                ? 'R-11 — theory mark below 25'
                : 'R-11 — practical mark below 8',
        };
      }

      return {
        ...base,
        totalMark: total,
        status: 'PASS',
        gradePoint: this.markToGradePoint(total),
        rule: 'R-11 — passed theory and practical thresholds',
      };
    }

    // Non-practical subject — standard pass mark 33
    if (theory < 33) {
      return {
        ...base,
        totalMark: theory,
        status: 'FAIL',
        gradePoint: 0,
        rule: 'Subject total below pass mark (33)',
      };
    }

    return {
      ...base,
      totalMark: theory,
      status: 'PASS',
      gradePoint: this.markToGradePoint(theory),
      rule: 'Passed pass mark threshold',
    };
  }

  computeTrace(studentId: number, name: string, className: string, marks: MarkRow[]): ResultTrace {
    const subjects = marks.map((m) => this.evaluateSubject(m));

    const compulsorySubjects = subjects.filter((s) => s.isCompulsory);
    const optionalSubject = subjects.find((s) => !s.isCompulsory);

    const compulsoryGradePointSum = compulsorySubjects.reduce((sum, s) => sum + s.gradePoint, 0);
    const optionalGradePoint = optionalSubject ? optionalSubject.gradePoint : 0;
    const optionalBonus = Math.max(0, optionalGradePoint - 2);

    const uncancelledGpa = Math.min(5, (compulsoryGradePointSum + optionalBonus) / 6);

    const failedCompulsory = compulsorySubjects.find((s) => s.status !== 'PASS');
    const failureReason = failedCompulsory
      ? `Compulsory subject ${failedCompulsory.code} failed (${failedCompulsory.rule})`
      : null;

    const finalGpa = failedCompulsory ? 0 : uncancelledGpa;
    const finalGrade = this.gpaToLetter(finalGpa, !!failedCompulsory);

    return {
      studentId,
      name,
      className,
      subjects,
      compulsoryGradePointSum,
      optionalGradePoint,
      optionalBonus,
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