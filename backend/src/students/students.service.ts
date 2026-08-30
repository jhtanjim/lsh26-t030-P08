import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResultEngineService } from '../result/result-engine.service';
import { ResultTrace } from '../result/result.types';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private resultEngine: ResultEngineService,
  ) {}

  findAll() {
    return this.prisma.student.findMany({
      orderBy: [{ className: 'asc' }, { roll: 'asc' }],
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  private async buildTrace(id: number): Promise<ResultTrace> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { marks: { include: { subject: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.resultEngine.computeTrace(
      student.id,
      student.name,
      student.className,
      student.marks,
    );
  }

  async getTrace(id: number): Promise<ResultTrace> {
    return this.buildTrace(id);
  }

  async getResult(id: number) {
    const trace = await this.buildTrace(id);
    return {
      studentId: trace.studentId,
      name: trace.name,
      className: trace.className,
      gpa: trace.finalGpa,
      letterGrade: trace.finalGrade,
      failureReason: trace.failureReason,
    };
  }

  // Used by checking-list endpoints
  async getAllTraces(): Promise<ResultTrace[]> {
    const students = await this.prisma.student.findMany({
      include: { marks: { include: { subject: true } } },
    });
    return students.map((s) =>
      this.resultEngine.computeTrace(s.id, s.name, s.className, s.marks),
    );
  }
}