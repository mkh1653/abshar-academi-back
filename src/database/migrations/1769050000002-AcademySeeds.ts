import { MigrationInterface, QueryRunner } from 'typeorm';

export class AcademySeeds2026092103 implements MigrationInterface {
  name = 'AcademySeeds2026092103';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE SEQUENCE IF NOT EXISTS "player_code_seq" START WITH 1 INCREMENT BY 1');
    await q.query('ALTER TABLE "coaches" ALTER COLUMN "mobile" DROP NOT NULL');
    await q.query(
      'INSERT INTO "coaches" ("first_name","last_name","mobile","bio","is_active") VALUES ($1,$2,NULL,$3,true) ON CONFLICT DO NOTHING',
      ['احمد', 'احمدی', 'مربی مسئول پیش‌فرض آکادمی'],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DELETE FROM "coaches" WHERE "first_name" = $1 AND "last_name" = $2', ['احمد', 'احمدی']);
    await q.query('DROP SEQUENCE IF EXISTS "player_code_seq"');
  }
}
