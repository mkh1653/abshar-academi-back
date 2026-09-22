import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Product } from './product.entity';

@Entity('product_variants')
@Index(['sku'], { unique: true })
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  size!: string | null;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'price_rial', type: 'bigint', nullable: true })
  priceRial!: string | null;
}
