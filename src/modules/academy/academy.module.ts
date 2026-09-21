import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Hall } from './entities/hall.entity';
import { Level } from './entities/level.entity';
import { TrainingGroup } from './entities/training-group.entity';
import { TrainingSession } from './entities/training-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Level,
      Hall,
      TrainingGroup,
      Enrollment,
      TrainingSession,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AcademyModule {}
