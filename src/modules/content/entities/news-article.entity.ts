import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('news_articles')
@Index(['slug'], { unique: true })
export class NewsArticle extends BaseEntity {
  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'varchar', length: 250 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'cover_image_key', type: 'varchar', length: 500, nullable: true })
  coverImageKey!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;
}
