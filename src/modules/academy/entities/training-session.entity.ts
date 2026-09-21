import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { TrainingGroup } from './training-group.entity';
import { SessionStatus } from '../enums/session-status.enum';

@Entity('training_sessions')
@Index(['trainingGroup', 'sessionDate'], { unique: true })
export class TrainingSession extends BaseEntity {
  @ManyToOne(() => TrainingGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_group_id' })
  trainingGroup!: TrainingGroup;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status!: SessionStatus;
}
