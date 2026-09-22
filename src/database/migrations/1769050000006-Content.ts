import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContentDomain2026092107 implements MigrationInterface {
  name = 'ContentDomain2026092107';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "news_articles" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "slug" varchar(180) NOT NULL UNIQUE,
      "title" varchar(250) NOT NULL,
      "summary" text,
      "content" text NOT NULL,
      "cover_image_key" varchar(500),
      "published_at" timestamptz,
      "is_published" boolean NOT NULL DEFAULT false
    )`);

    await q.query(`CREATE TABLE "matches" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "title" varchar(200) NOT NULL,
      "opponent" varchar(150) NOT NULL,
      "match_date" timestamptz NOT NULL,
      "venue" varchar(200) NOT NULL,
      "result" varchar(50),
      "score" varchar(30),
      "is_published" boolean NOT NULL DEFAULT false
    )`);

    await q.query('CREATE INDEX "IDX_matches_date" ON "matches" ("match_date")');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS "matches"');
    await q.query('DROP TABLE IF EXISTS "news_articles"');
  }
}
