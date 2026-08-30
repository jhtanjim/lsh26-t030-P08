export type SubjectTrace = {
  subject: string;
  name: string;
  isCompulsory: boolean;
  hasPractical: boolean;
  theoryMark: number | null;
  practicalMark: number | null;
  markUsed: number | null;
  wasAbsent: boolean;
  gradePoint: number;
  ruleFired: string;
  isFail: boolean;
  failReason: string | null;
};

export type CompulsoryGradePoint = {
  subject: string;
  gradePoint: number;
};

export type OptionalContribution = {
  subject: string | null;
  gradePoint: number;
  formula: string;
  bonus: number;
};

export type ResultTrace = {
  studentId: number;
  name: string;
  className: string;
  subjects: SubjectTrace[];
  compulsoryGradePoints: CompulsoryGradePoint[];
  optionalContribution: OptionalContribution;
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalBonus: number;
  sum: number;
  divisor: number;
  uncancelledGpa: number;
  finalGpa: number;
  finalGrade: string;
  failureReason: string | null;
};