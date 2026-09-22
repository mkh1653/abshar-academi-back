import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinanceSequences2026092105 implements MigrationInterface {
  name = 'FinanceSequences2026092105';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE SEQUENCE IF NOT EXISTS "invoice_number_seq" START WITH 1 INCREMENT BY 1');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP SEQUENCE IF EXISTS "invoice_number_seq"');
  }
}
