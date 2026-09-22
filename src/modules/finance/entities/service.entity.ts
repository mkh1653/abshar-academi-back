import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ServiceCategory } from '../enums/service-category.enum';

@Entity('services')
@Index(['code'], { unique: true })
export class Service extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category!: ServiceCategory;

  @Column({ name: 'default_price_rial', type: 'bigint' })
  defaultPriceRial!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
