import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Invoice } from './invoice.entity';
import { Order } from '../../shop/entities/order.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('payments')
@Index(['authority'], { unique: true })
@Index(['invoice', 'status'])
export class Payment extends BaseEntity {
  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice | null;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: Order | null;

  @Column({ name: 'amount_rial', type: 'bigint' })
  amountRial!: string;

  @Column({ type: 'varchar', length: 50, default: 'default' })
  gateway!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  authority!: string | null;

  @Column({ name: 'transaction_id', type: 'varchar', length: 150, nullable: true })
  transactionId!: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.ONLINE })
  method!: PaymentMethod;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ name: 'callback_payload', type: 'jsonb', nullable: true })
  callbackPayload!: Record<string, unknown> | null;
}
