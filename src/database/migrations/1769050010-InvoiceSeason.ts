import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvoiceSeason2026092111 implements MigrationInterface {
  name = 'InvoiceSeason2026092111';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE "invoices" ADD COLUMN "season" varchar(100)');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE "invoices" DROP COLUMN IF EXISTS "season"');
  }
}
