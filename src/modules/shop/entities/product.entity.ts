import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('products')
@Index(['sku'], { unique: true })
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'price_rial', type: 'bigint' })
  priceRial!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
