import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('matches')
@Index(['matchDate'])
export class Match extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 150 })
  opponent!: string;

  @Column({ name: 'match_date', type: 'timestamptz' })
  matchDate!: Date;

  @Column({ type: 'varchar', length: 200 })
  venue!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  result!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  score!: string | null;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;
}
