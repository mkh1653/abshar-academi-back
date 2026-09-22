import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('progress_reports')
@Index(['player', 'periodStart', 'periodEnd'])
export class ProgressReport extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => Coach, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'coach_id' })
  coach!: Coach;

  @Column({ name: 'period_start', type: 'date' })
  periodStart!: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd!: string;

  @Column({ name: 'physical_notes', type: 'text', nullable: true })
  physicalNotes!: string | null;

  @Column({ name: 'technical_notes', type: 'text', nullable: true })
  technicalNotes!: string | null;

  @Column({ name: 'psychological_notes', type: 'text', nullable: true })
  psychologicalNotes!: string | null;

  @Column({ name: 'general_notes', type: 'text', nullable: true })
  generalNotes!: string | null;
}
