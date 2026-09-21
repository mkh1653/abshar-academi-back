import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Player } from '../../players/entities/player.entity';
import { TrainingGroup } from './training-group.entity';

@Entity('training_group_enrollments')
@Index(['player', 'trainingGroup'])
export class Enrollment extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => TrainingGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_group_id' })
  trainingGroup!: TrainingGroup;

  @Column({ name: 'starts_on', type: 'date' })
  startsOn!: string;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}
