import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Level } from '../../academy/entities/level.entity';
import { Coach } from '../../coaches/entities/coach.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('player_assessments')
@Index(['player', 'assessedAt'])
export class PlayerAssessment extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => Coach, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'coach_id' })
  coach!: Coach;

  @ManyToOne(() => Level, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recommended_level_id' })
  recommendedLevel!: Level | null;

  @Column({ name: 'assessed_at', type: 'date' })
  assessedAt!: string;

  @Column({ name: 'height_cm', type: 'integer', nullable: true })
  heightCm!: number | null;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg!: string | null;

  @Column({ name: 'reach_cm', type: 'integer', nullable: true })
  reachCm!: number | null;

  @Column({ name: 'vertical_jump_cm', type: 'integer', nullable: true })
  verticalJumpCm!: number | null;

  @Column({ name: 'speed_score', type: 'smallint', nullable: true })
  speedScore!: number | null;

  @Column({ name: 'passing_score', type: 'smallint', nullable: true })
  passingScore!: number | null;

  @Column({ name: 'reception_score', type: 'smallint', nullable: true })
  receptionScore!: number | null;

  @Column({ name: 'setting_score', type: 'smallint', nullable: true })
  settingScore!: number | null;

  @Column({ name: 'serving_score', type: 'smallint', nullable: true })
  servingScore!: number | null;

  @Column({ name: 'attack_score', type: 'smallint', nullable: true })
  attackScore!: number | null;

  @Column({ name: 'block_score', type: 'smallint', nullable: true })
  blockScore!: number | null;

  @Column({ name: 'defense_score', type: 'smallint', nullable: true })
  defenseScore!: number | null;

  @Column({ name: 'strength_score', type: 'smallint', nullable: true })
  strengthScore!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
