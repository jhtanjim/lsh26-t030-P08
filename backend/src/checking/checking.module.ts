import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { CheckingController } from './checking.controller';

@Module({
  imports: [StudentsModule],
  controllers: [CheckingController],
})
export class CheckingModule {}