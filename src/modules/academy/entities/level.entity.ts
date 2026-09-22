import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('levels')
@Index(['code'], { unique: true })
export class Level extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
