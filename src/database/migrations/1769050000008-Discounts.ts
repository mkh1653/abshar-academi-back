import { MigrationInterface, QueryRunner } from 'typeorm';

export class Discounts2026092109 implements MigrationInterface {
  name = 'Discounts2026092109';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE TYPE "discount_type_enum" AS ENUM (\'PERCENT\',\'FIXED\')');
    await q.query(`CREATE TABLE "discounts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "code" varchar(50) NOT NULL UNIQUE,
      "type" "discount_type_enum" NOT NULL,
      "value" bigint NOT NULL,
      "starts_at" timestamptz,
      "ends_at" timestamptz,
      "is_active" boolean NOT NULL DEFAULT true
    )`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS "discounts"');
    await q.query('DROP TYPE IF EXISTS "discount_type_enum"');
  }
}
