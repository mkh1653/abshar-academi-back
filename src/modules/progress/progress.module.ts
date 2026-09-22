import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressReport } from './entities/progress-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressReport])],
  exports: [TypeOrmModule],
})
export class ProgressModule {}
