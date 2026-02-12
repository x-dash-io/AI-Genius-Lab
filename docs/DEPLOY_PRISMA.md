# Prisma Deployment Guide (Vercel + Serverless)

## Why this exists
A `P2022` runtime error means Prisma Client expects a column that the database does not have.
This happens when code/schema/client are newer than the deployed DB schema.

## Required environment variables
- `DATABASE_URL`: runtime DB connection (used by app server code).
- `DIRECT_URL` (recommended): direct DB connection for Prisma CLI migrations.

Notes:
- CLI commands accept either `DIRECT_URL` or `DATABASE_URL` via `prisma.config.ts` fallback.
- In production, prefer `DIRECT_URL` for migrations and keep `DATABASE_URL` for runtime.

## Deploy commands (authoritative)
Build now runs Prisma checks before `next build`:

```bash
npm run build
```

`npm run build` executes:
1. `prisma generate`
2. `prisma migrate deploy`
3. If `P3005` occurs (non-empty DB with no migration history), it runs a safety gate:
   - compare live DB schema to `prisma/schema.prisma`
   - baseline existing DB only if there is no schema diff
   - fail immediately if schema differs (unsafe to auto-baseline)
4. `prisma migrate status`
5. `next build`

If migrations are pending or DB is unreachable, build fails (intentional).

## Local development
```bash
npm run dev
```

For local build without DB migration checks:
```bash
npm run build:local
```

## Production / Vercel checklist
1. Ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel project env vars.
2. Deploy using the default build command (`npm run build`).
3. Confirm build logs include:
   - `[prisma-check] Generate Prisma Client`
   - `[prisma-check] Apply migrations`
   - optional one-time baseline logs if this is a legacy DB:
     - `Detected P3005`
     - `Compare existing database schema`
     - `Mark migration as applied: ...`
   - `[prisma-check] Validate migration status`
4. Confirm app routes render (especially `/dashboard`, `/admin`).
5. If rollback is needed, rollback app + DB migration plan together.

## If `P2022` happens again
Run these checks against the production DB:

```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE lower(table_name) IN ('purchase', 'coupon')
ORDER BY table_name, ordinal_position;
```

Then verify migration state:

```bash
npx prisma migrate status
```

If migrations are not applied:

```bash
npx prisma migrate deploy
```

If you hit `P3005`:
1. Do not bypass the check.
2. Run `npx prisma migrate diff --from-url "$DIRECT_URL" --to-schema-datamodel prisma/schema.prisma --exit-code`.
3. Only baseline (`prisma migrate resolve --applied ...`) when diff exit code is `0`.

If schema changed without migration:
1. Create a migration and commit it.
2. Redeploy so `npm run build` applies it.
3. Never rely on `db push` for production schema changes.
