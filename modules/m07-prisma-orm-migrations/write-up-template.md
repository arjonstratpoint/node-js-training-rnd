# M07 Write-Up — Prisma ORM & Migrations (Task API v2)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

**Task API v2** — the M05 Express API with its in-memory `tasks` array replaced by a migrated,
typed Prisma layer, built from the guide
[`module-7-prisma-orm-migrations.md`](module-7-prisma-orm-migrations.md) (Walkthroughs 1–8):

- **`prisma/schema.prisma`** — all four M06 tables (`User`, `Task`, `Tag`, `TaskTag`) as models with
  `@id`/`@default(autoincrement())`, `@unique`, `@updatedAt`, `@@index`, `@map`/`@@map` back to the
  M06 snake_case names, a 1:N (`Task.userId` + `onDelete: Cascade`) and an **explicit** M:N junction
  (`TaskTag` with `@@id([taskId, tagId])`).
- **`prisma/migrations/`** — three migrations: `init`, `add_priority` (a column **with** a default),
  and `add_estimate` (a required column **without** a default, generated with `--create-only` and
  **hand-edited** to backfill).
- **`src/lib/prisma.ts`** — the singleton `PrismaClient` with the `@prisma/adapter-better-sqlite3`
  driver adapter (`PrismaBetterSqlite3`), stashed on `globalThis` in development.
- **`src/services/task.service.ts`** — the Prisma-backed service layer (`listTasks`, `getTaskById`,
  `createTask`, `updateTask`, `deleteTask`, `countByStatus`) that owns every Prisma call.
- **`src/routes/tasks.routes.ts`** — the list endpoint's `status`/`q` filters, `sortBy`/`sortOrder`
  sorting, and `page`/`pageSize` pagination returning `{ data, meta }`.
- **`src/middlewares/errorHandler.ts`** — the **existing** M05 handler, extended so `P2002`/`P2025`/
  `P2003` map to `409`/`404`/`409` through the same envelope.
- **`prisma/seed.ts`** plus the `db:seed`, `db:reset`, and `db:studio` npm scripts.

Full schema and every command are in the guide
[`module-7-prisma-orm-migrations.md`](module-7-prisma-orm-migrations.md) §Walkthrough 1–8.

## Why it's built this way (key decisions)

- **Why this translation of the M06 schema into Prisma models, specifically?** I kept the database
  names I learned in M06 (`@map("created_at")`, `@@map("tasks")`) so the migrated SQLite file still
  reads like the schema from M06, while the Prisma models stay `camelCase` for the TypeScript side.
  I modelled `task_tags` as an **explicit** `TaskTag` model with `@@id([taskId, tagId])` rather than
  an implicit M:N list, because M06's junction was explicit and I wanted the migration's `CREATE
  TABLE` to match it one-for-one. One deliberate loss: M06's `CHECK (status IN (...))` cannot be
  expressed in the Prisma schema for SQLite, so status validation moves to the API layer — a
  trade-off between schema-level and application-level constraints.
- **What did you have to hand-edit in the `--create-only` migration, and why couldn't `migrate dev`
  generate it for you?** Adding a **required** `estimate Int` column to a populated `tasks` table.
  SQLite cannot `ALTER TABLE … ADD COLUMN` a `NOT NULL` column onto rows that have no value for it,
  so Prisma emits its **RedefineTables** pattern: create `new_tasks`, `INSERT … SELECT` the rows,
  drop the old table, rename. The generated `INSERT … SELECT` never references `estimate`, so the
  copy dies at apply time with `P3018 / NOT NULL constraint failed: new_tasks.estimate`. `migrate
  dev` cannot invent the backfill value for you, so I added `"estimate"` to the column list and `0`
  to the `SELECT` (a real project would copy/derive a value from the old row). Only after the edit
  does `migrate dev` apply cleanly — and the existing rows survive with `estimate = 0`.
- **How did you map `P2002`/`P2025`/`P2003` onto your existing M05 error handler?** I did **not**
  write a second handler. Inside the existing `errorHandler` I check `err instanceof
  Prisma.PrismaClientKnownRequestError` and switch on **`err.code`** — `P2002` → `ConflictError`
  (`409`), `P2025` → `NotFoundError` (`404`), `P2003` → `ConflictError` (`409`) — then fall through
  to the same `AppError` branch that already renders the fixed envelope. I keyed off `err.code`, not
  `err.meta.target`, because with the driver adapters `meta` is a nested `driverAdapterError`, so
  anything reading `meta.target` breaks on this stack even though it works elsewhere.

## How to build it (teach it to the next trainee)

A guide to **adding a column to a table that already has data**, using the `estimate` example:

1. **Decide whether the column can be nullable or defaulted.** If yes, you are done in one step:
   add `priority String @default("medium")` (or a nullable field) and run
   `npx prisma@7 migrate dev --name add_priority`. The generated SQL is a single safe
   `ALTER TABLE "tasks" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';` and existing rows get
   the default. **Prefer this.** A required column without a default is only worth it when every row
   genuinely must have a value.
2. **If the column must be `NOT NULL` with no default, do not let `migrate dev` apply it.** Run
   `npx prisma@7 migrate dev --name add_estimate --create-only`. Prisma writes the migration file but
   **does not apply it**, and warns that it cannot execute the step on a non-empty table.
3. **Read the generated SQL and find the copy.** SQLite can't add a `NOT NULL` column in place, so
   Prisma uses RedefineTables: `CREATE TABLE "new_tasks" (… "estimate" INTEGER NOT NULL …)`, then
   `INSERT INTO "new_tasks" (…) SELECT … FROM "tasks";`. That `INSERT … SELECT` is where it breaks —
   it omits `estimate`.
4. **Hand-edit the `INSERT … SELECT` to backfill.** Add `"estimate"` to the destination column list
   and a value to the source side: `… , "user_id", "estimate") SELECT … , "user_id", 0 FROM
   "tasks";`. In a real migration you would derive the value (`"user_id"`-based default, a `CASE`, or
   a subquery) instead of a flat `0`.
5. **Apply and generate.** `npx prisma@7 migrate dev`, then `npx prisma@7 generate` (and, whenever
   the change is real, update the code — Prisma now requires `estimate` in `TaskCreateInput`).
6. **Prove the existing rows survived** with a `findMany({ select: { id, title, estimate } })` and
   confirm the backfilled value. Push this to CI/prod later with `npx prisma@7 migrate deploy`
   (which replays the file verbatim and never authors or edits it).

The same recipe applies to any non-additive change SQLite can't do in place: adding `UNIQUE`,
tightening `NOT NULL`, or splitting/merging columns.

## Concepts worth explaining

**`migrate dev` vs `migrate deploy`.** `migrate dev` is the *author*. It compares your
`schema.prisma` to the migration history and to the live database, generates new migration SQL for
the difference, applies it, and regenerates the client; it may also detect drift and, in
development, reset the database. `migrate deploy` is the *player*: it applies the migration files
that already exist, in order and verbatim, and does nothing else — no authoring, no editing, no
regeneration. That split is why CI and production run only `migrate deploy`: the SQL was reviewed as
a file in a PR, and the deploy step must be a deterministic replay of exactly that file, not a fresh
guess at what the schema means.

**The generated client (and the lock file) are not the library.** `prisma`/`@prisma/client` give me
a CLI and a runtime, but the actual typed client is **generated project code** written into the
schema's `output` folder (`generated/prisma/`). It is derived entirely from `schema.prisma`, so it is
git-ignored and rebuilt with `npx prisma@7 generate` after install, after every schema change, in CI,
and after `migrate deploy` on a fresh checkout. This is also why the import path is
`./generated/prisma/client.ts` and not `@prisma/client`, and why a teammate who clones the repo has
no client until they generate one. The lock file (`package-lock.json` here) is the other half: it is
what makes `prisma` and `@prisma/client` resolve to the pinned `7.x` for everyone.

## What tripped me up

- **`Prisma Studio` and the `file:./dev.db` protocol.** A plain `npx prisma@7 studio` reads the URL
  from the config and dies with `Prisma Studio is not supported for the "file:./dev.db" protocol` —
  its parser expects a `://`. Passing an explicit SQLite URL, `npx prisma@7 studio --url
  "file://./dev.db"` (doubled slash), works, which is why the `db:studio` script carries it.
- **The hand-edited `--create-only` migration.** The failure was not in the `CREATE TABLE` but in the
  `INSERT … SELECT` — Prisma's RedefineTables copies the old rows into a table whose `estimate` is
  `NOT NULL`, and the generated copy never supplies it. The error surfaced only at *apply* time
  (`NOT NULL constraint failed: new_tasks.estimate`), and the fix was to edit the copy, not the
  schema.
- **Version drift on one-off commands.** A bare `npx prisma` resolves to Prisma **8**, whose CLI does
  not read `schema.prisma` for this stack. Every one-off command has to be `npx prisma@7`; the
  `package.json` scripts are safe because they resolve the pinned local `7.x` binary.
- **The `better-sqlite3` adapter is enough.** I nearly installed `better-sqlite3` separately (some
  docs say to). The `@prisma/adapter-better-sqlite3` package already depends on its own compatible
  copy; a second install at a different major gives two native builds and confusing warnings.
- **`select` and `include` cannot both appear at the same level.** Prisma throws *"Please either use
  `include` or `select`, but not both at the same time."* — a **runtime** validation error, not a
  type error. Nested `select` inside `include` is how you get a subset of a relation.
- **`migrate reset` does not seed.** I expected Prisma 7's reset to run `prisma/seed.ts` the way older
  setups did; it replays the migrations and stops. The seed is a separate step (or a `migrations.seed`
  command wired into `prisma7.config.ts` and invoked with `prisma db seed`) — a good reminder to
  verify a "convenience" rather than assume it.

## Checkpoint evidence

- **`migrate reset` + seed rebuilds from scratch:** run in Walkthrough 8 — `npm run db:reset`
  (`Database reset successful`, which replays all three migrations onto an empty database) followed by
  the explicit `npm run db:seed` (`seed done`), producing a deterministic 2-users/2-tags/2-tasks
  dataset. Prisma 7's `migrate reset` does **not** run the seed for you, which is why the module keeps
  `db:seed` as its own step rather than hiding it behind a hook.
- **Bruno collection from M05 still green against v2:** the collection's requests are unchanged; only
  persistence moved from the in-memory array to `task.service.ts`, and every response keeps the fixed
  `{ data }` / `{ data, meta }` envelope and M05 error shape.
- **`P2002`/`P2025`/`P2003` map to the right status:** Walkthrough 7's `errs.ts` prints
  `duplicate email -> P2002`, `missing id -> P2025`, `orphan task -> P2003`, and the handler turns
  those into `409`, `404`, `409` through the existing handler.
- **`migrate dev` vs `migrate deploy` in my own words:** see "Concepts worth explaining" above —
  author vs player, and why CI/prod run only `deploy`.
- **`package.json` pins `^7`:** `prisma@7`, `@prisma/client@7`, and
  `@prisma/adapter-better-sqlite3@7` resolved to `7.10.1` (`npm ls` in Walkthrough 1), and every
  one-off command uses `npx prisma@7`.

## What I'd do differently

- **Decide required-vs-defaulted up front.** I would try harder to give `estimate` a default (or make
  it nullable) so the third migration never needed a hand edit. The `--create-only` exercise is worth
  doing once; shipping a hand-edited migration for a value that *could* have had a default is
  avoidable risk.
- **Derive the backfill instead of hard-coding `0`.** For a real column I would backfill from another
  column or a `CASE`, and leave a comment in the migration explaining the choice, so the next reader
  does not have to guess whether `0` was meaningful.
- **Put the Studio URL quirk in the `db:studio` script from the start** rather than discovering the
  `file://` requirement when Studio refused to launch.
- **Run `prisma generate` in a `postinstall`/CI step.** It is easy to forget after a fresh clone or
  after `migrate deploy`; wiring it into the pipeline removes the "works on my machine because I
  generated once" failure mode.
