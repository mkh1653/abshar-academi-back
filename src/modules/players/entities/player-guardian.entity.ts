import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Guardian } from './guardian.entity';
import { Player } from './player.entity';
import { GuardianType } from '../enums/guardian-type.enum';

@Entity('player_guardians')
@Index(['player', 'guardian'], { unique: true })
export class PlayerGuardian extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => Guardian, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guardian_id' })
  guardian!: Guardian;

  @Column({ type: 'enum', enum: GuardianType })
  relationship!: GuardianType;

  @Column({ name: 'is_primary_contact', type: 'boolean', default: false })
  isPrimaryContact!: boolean;
}
