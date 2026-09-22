import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Invoice } from './invoice.entity';
import { Service } from './service.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice;

  @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service!: Service | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'bigint' })
  quantity!: string;

  @Column({ name: 'unit_price_rial', type: 'bigint' })
  unitPriceRial!: string;

  @Column({ name: 'total_price_rial', type: 'bigint' })
  totalPriceRial!: string;
}
