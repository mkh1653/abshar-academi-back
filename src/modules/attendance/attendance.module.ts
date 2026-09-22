import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Player } from '../players/entities/player.entity';
import { PlayerGuardian } from '../players/entities/player-guardian.entity';
import { TrainingGroup } from '../academy/entities/training-group.entity';
import { TrainingSession } from '../academy/entities/training-session.entity';
import { Attendance } from './entities/attendance.entity';
import { GuestAttendance } from './entities/guest-attendance.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      GuestAttendance,
      TrainingSession,
      TrainingGroup,
      Player,
      PlayerGuardian,
    ]),
    AuthModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService, TypeOrmModule],
})
export class AttendanceModule {}
