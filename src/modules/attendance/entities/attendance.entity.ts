import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { TrainingSession } from '../../academy/entities/training-session.entity';
import { Player } from '../../players/entities/player.entity';
import { AttendanceSource } from '../enums/attendance-source.enum';
import { AttendanceStatus } from '../enums/attendance-status.enum';

@Entity('attendance_records')
@Index(['trainingSession', 'player'], { unique: true })
export class Attendance extends BaseEntity {
  @ManyToOne(() => TrainingSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_session_id' })
  trainingSession!: TrainingSession;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status!: AttendanceStatus;

  @Column({
    type: 'enum',
    enum: AttendanceSource,
    default: AttendanceSource.COACH,
  })
  source!: AttendanceSource;

  @Column({ name: 'checked_at', type: 'timestamptz', nullable: true })
  checkedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}
