import { Controller, Get } from '@nestjs/common';
import { StudentsService } from '../students/students.service';

@Controller('checking')
export class CheckingController {
  constructor(private studentsService: StudentsService) {}

  @Get('optional')
  async getOptionalList() {
    const traces = await this.studentsService.getAllTraces();
    return traces
      .filter((t) => {
        const opt = t.subjects.find((s) => !s.isCompulsory);
        return opt && (opt.status === 'ABSENT' || opt.gradePoint <= 2);
      })
      .map((t) => {
        const opt = t.subjects.find((s) => !s.isCompulsory)!;
        return {
          studentId: t.studentId,
          name: t.name,
          className: t.className,
          subject: opt.code,
          reason: opt.status === 'ABSENT' ? 'Absent in optional subject' : `Optional GP ${opt.gradePoint} <= 2`,
          finalResult: t.finalGrade,
        };
      });
  }

  @Get('practical-fail')
  async getPracticalFailList() {
    const traces = await this.studentsService.getAllTraces();
    const rows: any[] = [];
    for (const t of traces) {
      for (const s of t.subjects) {
        if (s.hasPractical && !s.isAbsent && (s.practicalMark ?? 0) < 8) {
          rows.push({
            studentId: t.studentId,
            name: t.name,
            className: t.className,
            subject: s.code,
            practicalMark: s.practicalMark,
            finalResult: t.finalGrade,
          });
        }
      }
    }
    return rows;
  }

  @Get('absent')
  async getAbsentList() {
    const traces = await this.studentsService.getAllTraces();
    const rows: any[] = [];
    for (const t of traces) {
      for (const s of t.subjects) {
        if (s.isAbsent) {
          rows.push({
            studentId: t.studentId,
            name: t.name,
            className: t.className,
            subject: s.code,
            finalResult: t.finalGrade,
          });
        }
      }
    }
    return rows;
  }


    @Get('/summary')
  async getSummary() {
    const traces = await this.studentsService.getAllTraces();
    const total = traces.length;
    const passed = traces.filter((t) => t.finalGrade !== 'F').length;
    const gradeDist: Record<string, number> = {};
    const subjectFailCount: Record<string, number> = {};

    for (const t of traces) {
      gradeDist[t.finalGrade] = (gradeDist[t.finalGrade] || 0) + 1;
      for (const s of t.subjects) {
        if (s.status === 'FAIL') {
          subjectFailCount[s.code] = (subjectFailCount[s.code] || 0) + 1;
        }
      }
    }

    const worstSubject = Object.entries(subjectFailCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalStudents: total,
      passRate: Number(((passed / total) * 100).toFixed(2)),
      gradeDistribution: gradeDist,
      subjectFailCounts: subjectFailCount,
      worstSubject: worstSubject ? { code: worstSubject[0], failCount: worstSubject[1] } : null,
    };
  }
}