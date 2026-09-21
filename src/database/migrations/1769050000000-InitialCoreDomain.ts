import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialCoreDomain2026092101 implements MigrationInterface {
  name = 'InitialCoreDomain2026092101';

  public async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await q.query(`CREATE TYPE "user_role_enum" AS ENUM ('ADMIN','COACH','PARENT','PLAYER')`);
    await q.query(`CREATE TYPE "player_gender_enum" AS ENUM ('MALE','FEMALE')`);
    await q.query(`CREATE TYPE "handedness_enum" AS ENUM ('RIGHT','LEFT')`);
    await q.query(`CREATE TYPE "player_goal_enum" AS ENUM ('RECREATION_HEALTH','PROFESSIONAL_DEVELOPMENT','COMPETITION')`);
    await q.query(`CREATE TYPE "player_status_enum" AS ENUM ('PENDING','ACTIVE','INACTIVE')`);
    await q.query(`CREATE TYPE "guardian_type_enum" AS ENUM ('FATHER','MOTHER','GUARDIAN')`);
    await q.query(`CREATE TYPE "class_gender_enum" AS ENUM ('MALE','FEMALE','MIXED')`);
    await q.query(`CREATE TYPE "training_day_enum" AS ENUM ('SATURDAY','SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY')`);
    await q.query(`CREATE TYPE "session_status_enum" AS ENUM ('SCHEDULED','COMPLETED','CANCELLED')`);
    await q.query(`CREATE TYPE "attendance_status_enum" AS ENUM ('PRESENT','ABSENT','LATE')`);
    await q.query(`CREATE TYPE "attendance_source_enum" AS ENUM ('COACH','QR','ADMIN')`);
    await q.query(`CREATE TYPE "player_document_type_enum" AS ENUM ('INSURANCE','PERSONAL_PHOTO','NATIONAL_ID_OR_BIRTH_CERTIFICATE','PREVIOUS_CLUB_RELEASE','PARENTAL_CONSENT','OTHER')`);

    await q.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "mobile" varchar(20) UNIQUE, "email" varchar(255) UNIQUE, "password_hash" varchar(255) NOT NULL,
      "role" "user_role_enum" NOT NULL DEFAULT 'PARENT', "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "coaches" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "user_id" uuid UNIQUE REFERENCES "users"("id") ON DELETE SET NULL, "first_name" varchar(100) NOT NULL, "last_name" varchar(100) NOT NULL,
      "mobile" varchar(20) NOT NULL UNIQUE, "bio" text, "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "guardians" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "user_id" uuid UNIQUE REFERENCES "users"("id") ON DELETE SET NULL, "first_name" varchar(100) NOT NULL, "last_name" varchar(100) NOT NULL,
      "occupation" varchar(150), "mobile" varchar(20) NOT NULL, "eitaa_mobile" varchar(20)
    )`);

    await q.query(`CREATE TABLE "levels" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "code" varchar(50) NOT NULL UNIQUE, "name" varchar(100) NOT NULL, "description" text, "sort_order" int NOT NULL DEFAULT 0, "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "halls" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "name" varchar(150) NOT NULL UNIQUE, "address" text NOT NULL, "capacity" int, "latitude" numeric(9,6), "longitude" numeric(9,6), "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "players" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "user_id" uuid UNIQUE REFERENCES "users"("id") ON DELETE SET NULL, "player_code" varchar(20) NOT NULL UNIQUE, "first_name_fa" varchar(100) NOT NULL, "last_name_fa" varchar(100) NOT NULL,
      "full_name_latin" varchar(200) NOT NULL, "birth_date" date NOT NULL, "national_id" varchar(10) NOT NULL UNIQUE, "gender" "player_gender_enum" NOT NULL,
      "height_cm" int NOT NULL, "weight_kg" numeric(5,2) NOT NULL, "dominant_hand" "handedness_enum" NOT NULL, "playing_position" varchar(100), "previous_club" varchar(200),
      "medical_conditions" text, "allergies" text, "player_mobile" varchar(20), "eitaa_mobile" varchar(20), "emergency_contact" varchar(20) NOT NULL,
      "address" text NOT NULL, "postal_code" varchar(20), "height_with_reach_cm" int, "vertical_jump_cm" int, "wingspan_cm" int, "volleyball_experience" text,
      "current_team_or_school" varchar(200), "goal" "player_goal_enum" NOT NULL, "technical_level_id" uuid REFERENCES "levels"("id") ON DELETE SET NULL,
      "responsible_coach_id" uuid REFERENCES "coaches"("id") ON DELETE SET NULL, "start_training_month" date, "insurance_expiry_date" date,
      "clothing_size" varchar(20), "shoe_size" varchar(20), "status" "player_status_enum" NOT NULL DEFAULT 'PENDING',
      "parental_consent_at" timestamptz, "media_consent_at" timestamptz, "academy_terms_accepted_at" timestamptz
    )`);

    await q.query(`CREATE TABLE "player_guardians" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE, "guardian_id" uuid NOT NULL REFERENCES "guardians"("id") ON DELETE CASCADE,
      "relationship" "guardian_type_enum" NOT NULL, "is_primary_contact" boolean NOT NULL DEFAULT false, UNIQUE ("player_id","guardian_id")
    )`);

    await q.query(`CREATE TABLE "training_groups" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "name" varchar(150) NOT NULL, "level_id" uuid REFERENCES "levels"("id") ON DELETE SET NULL, "hall_id" uuid NOT NULL REFERENCES "halls"("id") ON DELETE RESTRICT,
      "coach_id" uuid NOT NULL REFERENCES "coaches"("id") ON DELETE RESTRICT, "gender" "class_gender_enum" NOT NULL, "training_day" "training_day_enum" NOT NULL,
      "start_time" time NOT NULL, "end_time" time NOT NULL, "capacity" int, "is_active" boolean NOT NULL DEFAULT true
    )`);

    await q.query(`CREATE TABLE "training_group_enrollments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE, "training_group_id" uuid NOT NULL REFERENCES "training_groups"("id") ON DELETE CASCADE,
      "starts_on" date NOT NULL, "ends_on" date, "is_active" boolean NOT NULL DEFAULT true, "note" text
    )`);

    await q.query(`CREATE TABLE "training_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "training_group_id" uuid NOT NULL REFERENCES "training_groups"("id") ON DELETE CASCADE, "session_date" date NOT NULL, "starts_at" timestamptz NOT NULL, "ends_at" timestamptz NOT NULL,
      "status" "session_status_enum" NOT NULL DEFAULT 'SCHEDULED', UNIQUE ("training_group_id","session_date")
    )`);

    await q.query(`CREATE TABLE "attendance_records" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "training_session_id" uuid NOT NULL REFERENCES "training_sessions"("id") ON DELETE CASCADE, "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
      "status" "attendance_status_enum" NOT NULL, "source" "attendance_source_enum" NOT NULL DEFAULT 'COACH', "checked_at" timestamptz, "note" text,
      UNIQUE ("training_session_id","player_id")
    )`);

    await q.query(`CREATE TABLE "player_assessments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE, "coach_id" uuid NOT NULL REFERENCES "coaches"("id") ON DELETE RESTRICT,
      "recommended_level_id" uuid REFERENCES "levels"("id") ON DELETE SET NULL, "assessed_at" date NOT NULL, "height_cm" int, "weight_kg" numeric(5,2),
      "reach_cm" int, "vertical_jump_cm" int, "speed_score" smallint, "passing_score" smallint, "reception_score" smallint, "setting_score" smallint,
      "serving_score" smallint, "attack_score" smallint, "block_score" smallint, "defense_score" smallint, "strength_score" smallint, "notes" text
    )`);

    await q.query(`CREATE TABLE "progress_reports" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE, "coach_id" uuid NOT NULL REFERENCES "coaches"("id") ON DELETE RESTRICT,
      "period_start" date NOT NULL, "period_end" date NOT NULL, "physical_notes" text, "technical_notes" text, "psychological_notes" text, "general_notes" text
    )`);

    await q.query(`CREATE TABLE "player_documents" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz,
      "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE, "uploaded_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "type" "player_document_type_enum" NOT NULL, "storage_key" varchar(500) NOT NULL, "original_name" varchar(255) NOT NULL, "mime_type" varchar(100) NOT NULL,
      "file_size" bigint NOT NULL, "expires_at" date, "verified_at" timestamptz
    )`);

    await q.query('CREATE INDEX "IDX_training_groups_schedule" ON "training_groups" ("hall_id","training_day","start_time")');
    await q.query('CREATE INDEX "IDX_enrollments_player_group" ON "training_group_enrollments" ("player_id","training_group_id")');
    await q.query('CREATE INDEX "IDX_assessments_player_date" ON "player_assessments" ("player_id","assessed_at")');
    await q.query('CREATE INDEX "IDX_progress_player_period" ON "progress_reports" ("player_id","period_start","period_end")');
    await q.query('CREATE INDEX "IDX_documents_player_type" ON "player_documents" ("player_id","type")');

    await q.query(`INSERT INTO "levels" ("code","name","description","sort_order") VALUES
      ('BEGINNER','مبتدی','سطح اولیه ثبت‌نام بازیکن',1),
      ('INTERMEDIATE','متوسط','سطح متوسط با تشخیص مربی',2),
      ('ADVANCED','پیشرفته','سطح پیشرفته با تشخیص مربی',3),
      ('PROFESSIONAL','حرفه‌ای','سطح حرفه‌ای با تشخیص مربی',4)`);
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const table of ['player_documents','progress_reports','player_assessments','attendance_records','training_sessions','training_group_enrollments','training_groups','player_guardians','players','halls','levels','guardians','coaches','users']) {
      await q.query(`DROP TABLE IF EXISTS "${table}"`);
    }
    for (const type of ['player_document_type_enum','attendance_source_enum','attendance_status_enum','session_status_enum','training_day_enum','class_gender_enum','guardian_type_enum','player_status_enum','player_goal_enum','handedness_enum','player_gender_enum','user_role_enum']) {
      await q.query(`DROP TYPE IF EXISTS "${type}"`);
    }
  }
}