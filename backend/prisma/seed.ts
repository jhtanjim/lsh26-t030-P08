import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectCode } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUBJECTS: { code: SubjectCode; name: string; hasPractical: boolean; isCompulsory: boolean }[] = [
  { code: 'BAN', name: 'Bangla', hasPractical: false, isCompulsory: true },
  { code: 'ENG', name: 'English', hasPractical: false, isCompulsory: true },
  { code: 'MAT', name: 'Mathematics', hasPractical: false, isCompulsory: true },
  { code: 'PHY', name: 'Physics', hasPractical: true, isCompulsory: true },
  { code: 'CHE', name: 'Chemistry', hasPractical: true, isCompulsory: true },
  { code: 'BIO', name: 'Biology', hasPractical: true, isCompulsory: true },
  { code: 'HMT', name: 'Higher Mathematics', hasPractical: true, isCompulsory: false },
  { code: 'AGR', name: 'Agriculture', hasPractical: true, isCompulsory: false },
  { code: 'REL', name: 'Religion', hasPractical: false, isCompulsory: false },
];

type MarkInput = {
  code: SubjectCode;
  theoryMark?: number;
  practicalMark?: number;
  isAbsent?: boolean;
};

type StudentInput = {
  name: string;
  className: string;
  roll: number;
  optional: SubjectCode; // HMT | AGR | REL
  marks: MarkInput[]; // compulsory + optional marks
};

// Helper to fill "clean pass" marks for subjects not explicitly overridden
function buildMarks(optional: SubjectCode, overrides: MarkInput[]): MarkInput[] {
  const compulsory: SubjectCode[] = ['BAN', 'ENG', 'MAT', 'PHY', 'CHE', 'BIO'];
  const all: SubjectCode[] = [...compulsory, optional];
  const overrideMap = new Map(overrides.map((o) => [o.code, o]));

  return all.map((code) => {
    if (overrideMap.has(code)) return overrideMap.get(code)!;
    const subj = SUBJECTS.find((s) => s.code === code)!;
    return subj.hasPractical
      ? { code, theoryMark: 60, practicalMark: 20 }
      : { code, theoryMark: 80 };
  });
}

const STUDENTS: StudentInput[] = [
  // 1. Normal pass, all clean
  { name: 'Rahim Uddin', className: '10A', roll: 1, optional: 'HMT', marks: buildMarks('HMT', []) },

  // 2. High average but one compulsory fails on practical (CHE practical < 8)
  {
    name: 'Karim Sheikh', className: '10A', roll: 2, optional: 'HMT',
    marks: buildMarks('HMT', [{ code: 'CHE', theoryMark: 70, practicalMark: 5 }]),
  },

  // 3. Theory < 25 in compulsory (MAT)
  {
    name: 'Sadia Islam', className: '10A', roll: 3, optional: 'AGR',
    marks: buildMarks('AGR', [{ code: 'MAT', theoryMark: 20 }]),
  },

  // 4. Practical < 8 in compulsory, theory fine (PHY)
  {
    name: 'Tanvir Ahmed', className: '10A', roll: 4, optional: 'AGR',
    marks: buildMarks('AGR', [{ code: 'PHY', theoryMark: 55, practicalMark: 6 }]),
  },

  // 5. Compulsory AB (BIO)
  {
    name: 'Mitu Akter', className: '10A', roll: 5, optional: 'REL',
    marks: buildMarks('REL', [{ code: 'BIO', isAbsent: true }]),
  },

  // 6. Optional AB
  {
    name: 'Jahid Hasan', className: '10B', roll: 1, optional: 'HMT',
    marks: buildMarks('HMT', [{ code: 'HMT', isAbsent: true }]),
  },

  // 7. Optional GP <= 2 (low optional marks, non-absent)
  {
    name: 'Nusrat Jahan', className: '10B', roll: 2, optional: 'AGR',
    marks: buildMarks('AGR', [{ code: 'AGR', theoryMark: 30, practicalMark: 10 }]),
  },

  // 8. Optional GP > 2 (already default clean case, but explicit)
  {
    name: 'Farhan Kabir', className: '10B', roll: 3, optional: 'HMT',
    marks: buildMarks('HMT', [{ code: 'HMT', theoryMark: 70, practicalMark: 22 }]),
  },

  // 9. All 5s -> GPA capped at 5.00
  {
    name: 'Anika Tabassum', className: '10B', roll: 4, optional: 'REL',
    marks: buildMarks('REL', [
      { code: 'BAN', theoryMark: 100 },
      { code: 'ENG', theoryMark: 100 },
      { code: 'MAT', theoryMark: 100 },
      { code: 'PHY', theoryMark: 75, practicalMark: 25 },
      { code: 'CHE', theoryMark: 75, practicalMark: 25 },
      { code: 'BIO', theoryMark: 75, practicalMark: 25 },
      { code: 'REL', theoryMark: 100 },
    ]),
  },

  // 10. Multiple compulsory failures (BAN theory fail + PHY practical fail)
  {
    name: 'Shakil Mahmud', className: '10B', roll: 5, optional: 'HMT',
    marks: buildMarks('HMT', [
      { code: 'BAN', theoryMark: 15 },
      { code: 'PHY', theoryMark: 50, practicalMark: 4 },
    ]),
  },

  // 11. Multiple checking lists at once (AB in compulsory + practical fail elsewhere)
  {
    name: 'Ruma Begum', className: '10A', roll: 6, optional: 'AGR',
    marks: buildMarks('AGR', [
      { code: 'CHE', isAbsent: true },
      { code: 'BIO', theoryMark: 60, practicalMark: 3 },
    ]),
  },
];


function generateFillerStudents(count: number): StudentInput[] {
  const optionals: SubjectCode[] = ['HMT', 'AGR', 'REL'];
  const names = [
    'Abir', 'Bithi', 'Chondon', 'Dola', 'Emon', 'Fahim', 'Gulshan', 'Hridoy',
    'Ismail', 'Joya', 'Kamal', 'Liza', 'Mahin', 'Nadia', 'Omar', 'Piya',
    'Qadir', 'Riya', 'Salma', 'Tamim', 'Urmi', 'Vinu', 'Wasim', 'Xara', 'Yasin', 'Zara',
  ];

  const students: StudentInput[] = [];
  let rollA = 7; // 10A already uses rolls 1-6
  let rollB = 6; // 10B already uses rolls 1-5

  for (let i = 0; i < count; i++) {
    const isA = i % 2 === 0;
    const className = isA ? '10A' : '10B';
    const roll = isA ? rollA++ : rollB++;
    const optional = optionals[i % 3];
    const namePart = names[i % names.length];
    const theoryVariant = 55 + ((i * 7) % 20);

    students.push({
      name: `${namePart} F${i + 1}`,
      className,
      roll,
      optional,
      marks: buildMarks(optional, [{ code: 'BAN', theoryMark: theoryVariant }]),
    });
  }
  return students;
}

STUDENTS.push(...generateFillerStudents(49));

async function main() {
  console.log('Seeding subjects...');

  // Seed all subjects
  for (const s of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }

  // Load subjects ONCE instead of querying for every mark
  const subjects = await prisma.subject.findMany();
  const subjectMap = new Map(
    subjects.map((subject) => [subject.code, subject]),
  );

  console.log('Seeding students...');

   await Promise.all(
    STUDENTS.map(async (s) => {
      const student = await prisma.student.upsert({
        where: { className_roll: { className: s.className, roll: s.roll } },
        update: {},
        create: { name: s.name, className: s.className, roll: s.roll },
      });

      await Promise.all(
        s.marks.map((m) => {
          const subject = subjectMap.get(m.code);
          if (!subject) return Promise.resolve();
          return prisma.mark.upsert({
            where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
            update: {
              theoryMark: m.theoryMark ?? null,
              practicalMark: m.practicalMark ?? null,
              isAbsent: m.isAbsent ?? false,
            },
            create: {
              studentId: student.id,
              subjectId: subject.id,
              theoryMark: m.theoryMark ?? null,
              practicalMark: m.practicalMark ?? null,
              isAbsent: m.isAbsent ?? false,
            },
          });
        }),
      );
    }),
  );

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });