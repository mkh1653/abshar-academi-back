# Abshar Academy Backend

Backend API for Abshar Volleyball Academy.

## Stack

- NestJS
- TypeScript
- TypeORM
- PostgreSQL

## Development

```bash
npm install
cp .env.example .env
npm run start:dev
```

API base URL: `http://localhost:3000/api`

## Database

Production schema changes must be handled through TypeORM migrations. Do not enable `DB_SYNCHRONIZE` in production.