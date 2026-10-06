# M07 — Prisma ORM & Migrations

**Week 3 · Days 2-4 · 8 hours**

## Builds on

[m05-express-task-api-v1](../m05-express-task-api-v1/write-up-template.md) (the API you're
upgrading) and [m06-sql-fundamentals-sqlite](../m06-sql-fundamentals-sqlite/write-up-template.md)
(the schema you're translating into Prisma).

## Objective

Model data with Prisma 7, evolve the schema safely with migrations, and use the typed client in the
Express API.

## Scope

- What an ORM is, its trade-offs, and when to drop to raw SQL.
- **Setup (Prisma 7 + SQLite):** installing `prisma@7` and `@prisma/client@7`, the `better-sqlite3`
  driver adapter, `prisma init`. The datasource URL lives in the Prisma config file
  (`prisma7.config.ts`, or `prisma.config.ts` on versions before 7.10). `PrismaClient` requires a
  driver adapter. The generated client is project code but git-ignored, so `prisma generate` has to
  be run explicitly after install, after every schema change, and in CI.
- **Schema language:** models, scalar types, `@id`, `@default`, `@unique`, `@@index`, `@updatedAt`,
  relations (1:N, implicit M:N), `onDelete`.
- **Migrations:** `migrate dev --name`, the anatomy of `prisma/migrations/*/migration.sql`,
  `--create-only` plus hand-editing SQL, `migrate status`, `migrate deploy` (CI/production),
  `migrate reset` (dev only), `db push` (prototyping only). Never edit an applied migration. Adding a
  required column to a table that already has data. Resolving migration conflicts in a team PR.
- **Prisma Client:** a singleton client; `create`, `createMany`, `findUnique`, `findFirst`,
  `findMany`, `update`, `upsert`, `delete`; `where` with `AND`/`OR`/`NOT`/`contains`/`in`/`gte`;
  `orderBy`; pagination with `skip`/`take`; `select` vs `include`; nested writes; `count` and
  `groupBy`; `$transaction` (batch and interactive); `$queryRaw` with tagged templates; query
  logging.
- **Error handling:** `PrismaClientKnownRequestError` codes `P2002` (unique), `P2025` (not found),
  `P2003` (foreign key) mapped to 409 / 404 / 409-or-400 in your central error handler from M05.
- **TypeScript with Prisma:** generated model types, `Prisma.TaskCreateInput`,
  `Prisma.TaskWhereInput`, `Prisma.TaskGetPayload<{ include: … }>`, `satisfies Prisma.TaskSelect`;
  return types follow `select`/`include`.
- Seeding with an explicit `npm run db:seed`; inspecting data with Prisma Studio.
- **Concept only, no hands-on labs:** what changes with PostgreSQL (provider,
  `@prisma/adapter-pg`, connection pooling, richer types), how MongoDB's document model differs from
  relational, and what Prisma 8 changes.

## Stack constraints

- Prisma is always `@7`. Lock `prisma` and `@prisma/client` to `^7` in `package.json`, and use
  `npx prisma@7` for one-off commands — an unversioned install currently resolves to Prisma 8, whose
  CLI does not read `schema.prisma` for this stack, and whose SQLite support is still experimental.

## Deliverable: Task API v2

**The M06 schema translated into Prisma, with 2+ migrations (one hand-edited), a service layer
replacing the in-memory store, filtered/sorted/paginated listing, a seed script, and Prisma errors
mapped into the existing error handler.**

## Lab

*Goal: replace the in-memory store with a properly migrated, typed Prisma layer without breaking
anything already passing.*

**You do.**

1. Set up Prisma 7 with the SQLite driver adapter and translate the M06 schema.
2. Create your initial migration, then a second migration adding a column such as `dueDate` or
   `priority`.
3. Hand-edit one migration via `--create-only`.
4. Build the service layer on Prisma, replacing the in-memory store from v1.
5. Implement the list endpoint's `status`/`q` filters, sorting, and `page`/`pageSize` pagination,
   returning `{ data, meta }`.
6. Write the seed script and map Prisma's error codes into the existing M05 error handler.

**You build and capture.** `migrate reset` plus the seed script rebuilding the database from
scratch, and the Bruno collection from M05 still green against v2.

## Definition of done

- [ ] `migrate reset` plus the seed script rebuilds the database from scratch, every time.
- [ ] The Bruno collection from M05 is still green against v2.
- [ ] You can explain `migrate dev` vs `migrate deploy` in your own words.
- [ ] `P2002`, `P2025`, and `P2003` each map to the right status code through your existing error
      handler — not a new one.
- [ ] `package.json` locks `prisma` and `@prisma/client` to `^7`, and every one-off command uses
      `npx prisma@7`, never a bare `npx prisma` — this is non-negotiable for this program (see the
      Prisma warning in Stack constraints above), not a question to raise with your trainer.
