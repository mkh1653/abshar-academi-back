import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokens2026092102 implements MigrationInterface {
  name = 'AddRefreshTokens2026092102';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "refresh_tokens" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "token_hash" varchar(128) NOT NULL UNIQUE,
      "expires_at" timestamptz NOT NULL,
      "revoked_at" timestamptz
    )`);
    await q.query('CREATE INDEX "IDX_refresh_tokens_user" ON "refresh_tokens" ("user_id")');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS "refresh_tokens"');
  }
}