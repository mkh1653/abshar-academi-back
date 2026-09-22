import { MigrationInterface, QueryRunner } from 'typeorm';

export class GuestAttendance2026092110 implements MigrationInterface {
  name = 'GuestAttendance2026092110';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "guest_attendance" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "deleted_at" timestamptz,
      "training_session_id" uuid NOT NULL REFERENCES "training_sessions"("id") ON DELETE CASCADE,
      "guest_name" varchar(200) NOT NULL,
      "guest_mobile" varchar(20) NOT NULL,
      "note" text
    )`);
    await q.query('CREATE INDEX "IDX_guest_attendance_session" ON "guest_attendance" ("training_session_id")');
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE IF EXISTS "guest_attendance"');
  }
}
