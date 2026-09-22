import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Coach } from '../coaches/entities/coach.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerGuardian } from '../players/entities/player-guardian.entity';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';
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
      Player,
      Coach,
      PlayerGuardian,
    ]),
    AuthModule,
  ],
  controllers: [AcademyController],
  providers: [AcademyService],
  exports: [TypeOrmModule, AcademyService],
})
export class AcademyModule {}
