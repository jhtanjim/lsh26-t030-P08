import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/result')
  getResult(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getResult(id);
  }

  @Get(':id/trace')
  getTrace(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getTrace(id);
  }
}