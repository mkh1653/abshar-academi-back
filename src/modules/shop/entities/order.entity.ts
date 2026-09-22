import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Player } from '../../players/entities/player.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity('shop_orders')
@Index(['orderNumber'], { unique: true })
@Index(['player', 'status'])
export class Order extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ name: 'order_number', type: 'varchar', length: 30 })
  orderNumber!: string;

  @Column({ name: 'total_rial', type: 'bigint' })
  totalRial!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  shippingAddress!: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];
}
