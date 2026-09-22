import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinanceDomain2026092104 implements MigrationInterface {
  name = 'FinanceDomain2026092104';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "service_category_enum" AS ENUM ('TRAINING','GYM','COUNSELING','HALL','CLOTHING','OTHER')`);
    await q.query(`CREATE TYPE "billing_cycle_enum" AS ENUM ('MONTHLY','TERM')`);
    await q.query(`CREATE TYPE "invoice_status_enum" AS ENUM ('DRAFT','PENDING','PARTIALLY_PAID','PAID','CANCELLED','EXPIRED')`);
    await q.query(`CREATE TYPE "payment_status_enum" AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED')`);
    await q.query(`CREATE TYPE "payment_method_enum" AS ENUM ('ONLINE','CASH','POS','MANUAL')`);
    await q.query(`CREATE TYPE "expense_category_enum" AS ENUM ('HALL','EQUIPMENT','COACH','SALARY','MARKETING','OPERATIONAL','OTHER')`);

    await q.query(`CREATE TABLE "services" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "code" varchar(50) NOT NULL UNIQUE,
      "name" varchar(150) NOT NULL,
      "category" "service_category_enum" NOT NULL,
      "default_price_rial" bigint NOT NULL,
      "description" text,
      "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "player_subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
      "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE RESTRICT,
      "billing_cycle" "billing_cycle_enum" NOT NULL,
      "starts_on" date NOT NULL,
      "ends_on" date,
      "unit_price_rial" bigint NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "invoices" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE RESTRICT,
      "invoice_number" varchar(30) NOT NULL UNIQUE,
      "billing_cycle" "billing_cycle_enum" NOT NULL,
      "period_start" date,
      "period_end" date,
      "issue_date" date NOT NULL,
      "due_date" date NOT NULL,
      "subtotal_rial" bigint NOT NULL,
      "discount_rial" bigint NOT NULL DEFAULT 0,
      "total_rial" bigint NOT NULL,
      "paid_rial" bigint NOT NULL DEFAULT 0,
      "status" "invoice_status_enum" NOT NULL DEFAULT 'PENDING',
      "note" text
    )`);

    await q.query(`CREATE TABLE "invoice_items" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
      "service_id" uuid REFERENCES "services"("id") ON DELETE SET NULL,
      "title" varchar(200) NOT NULL,
      "quantity" bigint NOT NULL,
      "unit_price_rial" bigint NOT NULL,
      "total_price_rial" bigint NOT NULL
    )`);

    await q.query(`CREATE TABLE "payments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "invoice_id" uuid REFERENCES "invoices"("id") ON DELETE SET NULL,
      "amount_rial" bigint NOT NULL,
      "gateway" varchar(50) NOT NULL DEFAULT 'default',
      "authority" varchar(150) UNIQUE,
      "transaction_id" varchar(150),
      "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
      "method" "payment_method_enum" NOT NULL DEFAULT 'ONLINE',
      "paid_at" timestamptz,
      "callback_payload" jsonb
    )`);

    await q.query(`CREATE TABLE "expenses" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "title" varchar(200) NOT NULL,
      "category" "expense_category_enum" NOT NULL,
      "amount_rial" bigint NOT NULL,
      "occurred_on" date NOT NULL,
      "season" varchar(100),
      "description" text
    )`);

    await q.query('CREATE INDEX "IDX_services_active_category" ON "services" ("is_active","category")');
    await q.query('CREATE INDEX "IDX_subscriptions_player_active" ON "player_subscriptions" ("player_id","is_active")');
    await q.query('CREATE INDEX "IDX_invoices_player_status" ON "invoices" ("player_id","status")');
    await q.query('CREATE INDEX "IDX_payments_invoice_status" ON "payments" ("invoice_id","status")');
    await q.query('CREATE INDEX "IDX_expenses_date_category" ON "expenses" ("occurred_on","category")');

    await q.query(`INSERT INTO "services" ("code","name","category","default_price_rial","description") VALUES
      ('VOLLEY_TRAINING','تمرین تخصصی والیبال','TRAINING',0,'قیمت توسط ادمین تعیین می‌شود'),
      ('STRENGTH','بدنسازی','GYM',0,''),
      ('COUNSELING','مشاوره ورزشی','COUNSELING',0,''),
      ('ACADEMY_SHIRT','لباس آکادمی','CLOTHING',0,''),
      ('TRAINING_HALL','سالن تمرین','HALL',0,'')`
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const table of ['expenses','payments','invoice_items','invoices','player_subscriptions','services']) {
      await q.query('DROP TABLE IF EXISTS "' + table + '"');
    }
    for (const type of ['expense_category_enum','payment_method_enum','payment_status_enum','invoice_status_enum','billing_cycle_enum','service_category_enum']) {
      await q.query('DROP TYPE IF EXISTS "' + type + '"');
    }
  }
}
