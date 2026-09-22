import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopNotifications2026092106 implements MigrationInterface {
  name = 'ShopNotifications2026092106';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE SEQUENCE IF NOT EXISTS "shop_order_number_seq" START WITH 1 INCREMENT BY 1');

    await q.query(`CREATE TYPE "notification_type_enum" AS ENUM ('ANNOUNCEMENT','PAYMENT','ATTENDANCE','TRAINING','MATCH','GENERAL')`);
    await q.query(`CREATE TYPE "notification_channel_enum" AS ENUM ('IN_APP','SMS')`);
    await q.query(`CREATE TYPE "sms_status_enum" AS ENUM ('PENDING','SENT','FAILED')`);
    await q.query(`CREATE TYPE "order_status_enum" AS ENUM ('PENDING','PAID','PROCESSING','SHIPPED','COMPLETED','CANCELLED')`);

    await q.query(`CREATE TABLE "notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "title" varchar(200) NOT NULL,
      "body" text NOT NULL,
      "type" "notification_type_enum" NOT NULL,
      "channel" "notification_channel_enum" NOT NULL DEFAULT 'IN_APP',
      "read_at" timestamptz,
      "data" jsonb
    )`);

    await q.query(`CREATE TABLE "sms_messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "recipient" varchar(20) NOT NULL,
      "message" text NOT NULL,
      "provider" varchar(100) NOT NULL DEFAULT 'default',
      "status" "sms_status_enum" NOT NULL DEFAULT 'PENDING',
      "sent_at" timestamptz,
      "provider_message_id" varchar(150),
      "error_message" text
    )`);

    await q.query(`CREATE TABLE "products" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "sku" varchar(50) NOT NULL UNIQUE,
      "name" varchar(200) NOT NULL,
      "description" text,
      "price_rial" bigint NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "product_variants" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "sku" varchar(50) NOT NULL UNIQUE,
      "size" varchar(30),
      "stock_quantity" integer NOT NULL DEFAULT 0,
      "price_rial" bigint
    )`);

    await q.query(`CREATE TABLE "shop_orders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE RESTRICT,
      "order_number" varchar(30) NOT NULL UNIQUE,
      "total_rial" bigint NOT NULL,
      "status" "order_status_enum" NOT NULL DEFAULT 'PENDING',
      "shipping_address" text
    )`);

    await q.query(`CREATE TABLE "shop_order_items" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "order_id" uuid NOT NULL REFERENCES "shop_orders"("id") ON DELETE CASCADE,
      "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
      "variant_id" uuid REFERENCES "product_variants"("id") ON DELETE SET NULL,
      "title" varchar(200) NOT NULL,
      "quantity" integer NOT NULL,
      "unit_price_rial" bigint NOT NULL,
      "size" varchar(30),
      "jersey_number" varchar(10)
    )`);

    await q.query('CREATE INDEX "IDX_notifications_user_read" ON "notifications" ("user_id","read_at")');
    await q.query('CREATE INDEX "IDX_sms_recipient_created" ON "sms_messages" ("recipient","created_at")');
    await q.query('CREATE INDEX "IDX_product_variants_product" ON "product_variants" ("product_id")');
    await q.query('CREATE INDEX "IDX_shop_orders_player_status" ON "shop_orders" ("player_id","status")');
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const table of ['shop_order_items','shop_orders','product_variants','products','sms_messages','notifications']) {
      await q.query('DROP TABLE IF EXISTS "' + table + '"');
    }
    for (const type of ['order_status_enum','sms_status_enum','notification_channel_enum','notification_type_enum']) {
      await q.query('DROP TYPE IF EXISTS "' + type + '"');
    }
    await q.query('DROP SEQUENCE IF EXISTS "shop_order_number_seq"');
  }
}
