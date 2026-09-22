import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('shop_order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price_rial', type: 'bigint' })
  unitPriceRial!: string;

  @Column({ name: 'size', type: 'varchar', length: 30, nullable: true })
  size!: string | null;

  @Column({ name: 'jersey_number', type: 'varchar', length: 10, nullable: true })
  jerseyNumber!: string | null;
}
