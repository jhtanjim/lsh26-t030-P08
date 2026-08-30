export type SubjectTrace = {
  code: string;
  name: string;
  isCompulsory: boolean;
  hasPractical: boolean;
  theoryMark: number | null;
  practicalMark: number | null;
  totalMark: number | null;
  isAbsent: boolean;
  status: 'PASS' | 'FAIL' | 'ABSENT';
  gradePoint: number;
  rule: string;
};

export type ResultTrace = {
  studentId: number;
  name: string;
  className: string;
  subjects: SubjectTrace[];
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalBonus: number;
  uncancelledGpa: number;
  finalGpa: number;
  finalGrade: string;
  failureReason: string | null;
};