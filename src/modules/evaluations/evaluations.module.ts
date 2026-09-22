import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAssessment } from './entities/player-assessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerAssessment])],
  exports: [TypeOrmModule],
})
export class EvaluationsModule {}
