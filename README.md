# Abshar Academy Backend

Backend API for Abshar Volleyball Academy.

## Stack

- NestJS
- TypeScript
- TypeORM
- PostgreSQL

## Core domain

The initial database model covers:

- Users and roles
- Coaches
- Players
- Parents/guardians
- Player documents and consents
- Technical levels
- Halls and training groups
- Training sessions
- Enrollments
- Attendance
- Technical assessments
- Progress reports

Financials, shop, notifications/SMS, advanced reports and authentication workflows will be added in the next phases.

## Local development

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start API

```bash
npm run start:dev
```

API base URL:

```
http://localhost:3000/api
```

## Database rule

Production schema changes must use TypeORM migrations. Keep `DB_SYNCHRONIZE=false` in production.
