import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentShopLink2026092108 implements MigrationInterface {
  name = 'PaymentShopLink2026092108';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE "payments" ADD COLUMN "order_id" uuid');
    await q.query('ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_order" FOREIGN KEY ("order_id") REFERENCES "shop_orders"("id") ON DELETE SET NULL');
    await q.query('CREATE INDEX "IDX_payments_order_status" ON "payments" ("order_id","status")');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP INDEX IF EXISTS "IDX_payments_order_status"');
    await q.query('ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_order"');
    await q.query('ALTER TABLE "payments" DROP COLUMN IF EXISTS "order_id"');
  }
}
