import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Player } from '../../players/entities/player.entity';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
@Index(['player', 'status'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ name: 'invoice_number', type: 'varchar', length: 30 })
  invoiceNumber!: string;

  @Column({ name: 'billing_cycle', type: 'enum', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart!: string | null;

  @Column({ name: 'period_end', type: 'date', nullable: true })
  periodEnd!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  season!: string | null;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string;

  @Column({ name: 'subtotal_rial', type: 'bigint' })
  subtotalRial!: string;

  @Column({ name: 'discount_rial', type: 'bigint', default: 0 })
  discountRial!: string;

  @Column({ name: 'total_rial', type: 'bigint' })
  totalRial!: string;

  @Column({ name: 'paid_rial', type: 'bigint', default: 0 })
  paidRial!: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status!: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items!: InvoiceItem[];
}
