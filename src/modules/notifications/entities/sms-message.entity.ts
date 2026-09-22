import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { SmsStatus } from '../enums/sms-status.enum';

@Entity('sms_messages')
@Index(['recipient', 'createdAt'])
export class SmsMessage extends BaseEntity {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ type: 'varchar', length: 20 })
  recipient!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 100, default: 'default' })
  provider!: string;

  @Column({ type: 'enum', enum: SmsStatus, default: SmsStatus.PENDING })
  status!: SmsStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'provider_message_id', type: 'varchar', length: 150, nullable: true })
  providerMessageId!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
}
