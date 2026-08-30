const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type Student = { id: number; name: string; className: string; roll: number };

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

export type CheckingRow = {
  studentId: number;
  name: string;
  className: string;
  subject: string;
  reason?: string;
  practicalMark?: number;
  finalResult: string;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export const api = {
  getStudents: () => getJson<Student[]>('/students'),
  getStudent: (id: number) => getJson<Student>(`/students/${id}`),
  getTrace: (id: number) => getJson<ResultTrace>(`/students/${id}/trace`),
  getOptionalList: () => getJson<CheckingRow[]>('/checking/optional'),
  getPracticalFailList: () => getJson<CheckingRow[]>('/checking/practical-fail'),
  getAbsentList: () => getJson<CheckingRow[]>('/checking/absent'),
};


export function downloadCsv(filename: string, rows: any[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}