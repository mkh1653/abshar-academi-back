import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Player } from '../../players/entities/player.entity';
import { Service } from './service.entity';
import { BillingCycle } from '../enums/billing-cycle.enum';

@Entity('player_subscriptions')
@Index(['player', 'service', 'isActive'])
export class PlayerSubscription extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => Service, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  @Column({ name: 'billing_cycle', type: 'enum', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column({ name: 'starts_on', type: 'date' })
  startsOn!: string;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn!: string | null;

  @Column({ name: 'unit_price_rial', type: 'bigint' })
  unitPriceRial!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
