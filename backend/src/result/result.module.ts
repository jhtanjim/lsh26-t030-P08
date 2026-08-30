import { Module } from '@nestjs/common';
import { ResultEngineService } from './result-engine.service';

@Module({
  providers: [ResultEngineService],
  exports: [ResultEngineService],
})
export class ResultModule {}