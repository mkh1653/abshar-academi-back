import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { TrainingSession } from '../../academy/entities/training-session.entity';

@Entity('guest_attendance')
export class GuestAttendance extends BaseEntity {
  @ManyToOne(() => TrainingSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_session_id' })
  trainingSession!: TrainingSession;

  @Column({ name: 'guest_name', type: 'varchar', length: 200 })
  guestName!: string;

  @Column({ name: 'guest_mobile', type: 'varchar', length: 20 })
  guestMobile!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}
