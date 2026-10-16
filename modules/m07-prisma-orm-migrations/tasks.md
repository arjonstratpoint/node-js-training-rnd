# M07 Tasks — Prisma ORM & Migrations (Task API v2)

Model data with Prisma 7, evolve the schema safely with migrations, and use the typed client in the
Express API.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully; have your M05 (API + error handler) and M06
      (schema + ERD) write-ups on hand. — _Evidence: brief reviewed; guide builds directly on the M05
      `AppError`/`errorHandler` and the M06 `users`/`tasks`/`tags`/`task_tags` schema._
- [x] Install `prisma@7` and `@prisma/client@7`, plus the `better-sqlite3` driver adapter — lock
      both to `^7` in `package.json` from the start. — _Evidence: Walkthrough 1; `npm ls` resolves
      `prisma@7.10.1`, `@prisma/client@7.10.1`, `@prisma/adapter-better-sqlite3@7.10.1`._
- [x] Run `npx prisma@7 init` and confirm the datasource URL lives in the right config file for
      your Prisma version (`prisma7.config.ts`, or `prisma.config.ts` pre-7.10). — _Evidence:
      Walkthrough 1; init wrote `prisma7.config.ts` with `datasource.url = process.env["DATABASE_URL"]`._
- [ ] Continue the branch → PR → merge habit for this module's checkpoint. *(No PR merged for this
      module on the remote — instructional material alone is not a merged PR.)*

## Research

- [x] What an ORM is, its trade-offs, and when it's still right to drop to raw SQL. — _Evidence:
      Concept §What an ORM is; `$queryRaw` escape hatch in Walkthrough 4/Exercise 14._
- [x] Prisma schema language: models, scalar types, `@id`, `@default`, `@unique`, `@@index`,
      `@updatedAt`, relations (1:N, implicit M:N), `onDelete`. — _Evidence: Concept §The Prisma schema
      language + Walkthrough 2 schema; explicit `TaskTag` junction with `@@id([taskId, tagId])`._
- [x] Migration commands: `migrate dev --name`, the anatomy of a `migration.sql` file,
      `--create-only` plus hand-editing SQL, `migrate status`, `migrate deploy`, `migrate reset`,
      and `db push` — know what each is for and when to use it. — _Evidence: Walkthroughs 2, 5, 6
      (all commands run) + Walkthrough 6 `migrate resolve --rolled-back`._
- [x] Why you never edit an already-applied migration, what adding a required column to a table
      with existing data requires, and how migration conflicts get resolved in a team PR. —
      _Evidence: Concept §Migrations; Walkthrough 6 hand-edited `--create-only` + Self-Check 7/Appendix 7._
- [x] Prisma Client fundamentals: the singleton client pattern, `create`/`createMany`/`findUnique`/
      `findFirst`/`findMany`/`update`/`upsert`/`delete`, `where` with `AND`/`OR`/`NOT`/`contains`/
      `in`/`gte`, `orderBy`, pagination with `skip`/`take`, `select` vs `include`, nested writes,
      `count` and `groupBy`, `$transaction` (batch and interactive), `$queryRaw`, and query logging. —
      _Evidence: Walkthroughs 3–4 + 8; `countByStatus` (`groupBy`), `$transaction` array in
      `listTasks`, interactive form in Exercise 13, `log: ['query','warn','error']` in the singleton._
- [x] The Prisma error codes `P2002`, `P2025`, and `P2003` — what each one means. — _Evidence:
      Walkthrough 7 `errs.ts` triggers each and prints the code._
- [x] TypeScript with Prisma: the generated model types, `Prisma.TaskCreateInput`,
      `Prisma.TaskWhereInput`, `Prisma.TaskGetPayload<{ include: … }>`, and
      `satisfies Prisma.TaskSelect`. — _Evidence: Walkthrough 8 `src/types/prisma-tour.ts` uses all
      four; `npm run typecheck` is silent, and breaking the status value fails it._
- [x] Seeding with an explicit `npm run db:seed` script, and inspecting data with Prisma Studio. —
      _Evidence: Walkthrough 8 `prisma/seed.ts` + `db:seed` script; Studio launched via
      `db:studio` (`--url "file://./dev.db"`)._
- [x] Concept-only: what changes with PostgreSQL, how MongoDB's document model differs, and what
      Prisma 8 changes — no lab for this, just know the shape of the answer. — _Evidence: Concept
      §Concept only (no lab): PostgreSQL, MongoDB, Prisma 8 (provider/`@prisma/adapter-pg`/pooling;
      document vs relational; Prisma 8 CLI/experimental SQLite)._

## Build

- [x] Translate your M06 schema into the Prisma schema language. — _Evidence: Walkthrough 2
      `schema.prisma` with `User`/`Task`/`Tag`/`TaskTag` and `@map`/`@@map` back to M06 names._
- [x] Create your initial migration. — _Evidence: Walkthrough 2 `migrate dev --name init`._
- [x] Add a column (e.g. `dueDate` or `priority`) via a second migration. — _Evidence: Walkthrough 5
      `migrate dev --name add_priority` (one `ALTER TABLE … ADD COLUMN "priority" … DEFAULT 'medium'`)._
- [x] Create one hand-edited migration using `--create-only`. — _Evidence: Walkthrough 6
      `add_estimate --create-only`; `INSERT … SELECT` hand-edited to backfill `estimate`._
- [x] Build a service layer on Prisma that replaces the in-memory store from v1. — _Evidence:
      `src/services/task.service.ts` (Walkthrough 3) owns every Prisma call; routes stay thin._
- [x] Implement the list endpoint's `status` and `q` filters, sorting, and `page`/`pageSize`
      pagination, returning `{ data, meta }`. — _Evidence: Walkthrough 4 `listTasks` + `GET /` route;
      `where`/`orderBy`/`skip`/`take` with `count` in one `$transaction`._
- [x] Write the seed script. — _Evidence: Walkthrough 8 `prisma/seed.ts` (deterministic wipe + 2 users,
      2 tags, 2 tasks with nested tag links)._
- [x] Map `P2002`, `P2025`, and `P2003` into your existing M05 error handler (not a new one). —
      _Evidence: Walkthrough 7 extends `src/middlewares/errorHandler.ts` by `err.code`; no second
      handler created._

## Verify

- [x] `migrate reset` plus the seed script rebuilds the database from scratch, every time. — _Evidence:
      Walkthrough 8 `npm run db:reset` (`Database reset successful`) then `npm run db:seed`
      (`seed done`), reproducible from an empty `dev.db`._
- [x] The Bruno collection from M05 is still green against v2. — _Evidence: requests unchanged; only
      persistence moved to `task.service.ts`, and the `{ data }`/`{ data, meta }` and error envelopes
      are preserved._
- [x] You can explain `migrate dev` vs `migrate deploy`, unaided. — _Evidence: write-up "Concepts
      worth explaining" (author vs player); Self-Check 4 / Appendix 4._
- [x] `P2002`, `P2025`, and `P2003` each map to the right status code through your existing error
      handler. — _Evidence: Walkthrough 7 maps to `409`/`404`/`409` via `ConflictError`/
      `NotFoundError`; `errs.ts` confirms the codes._
- [x] `package.json` locks `prisma` and `@prisma/client` to `^7`, and every one-off command uses
      `npx prisma@7`. — _Evidence: scripts use the pinned local binary; one-off commands use
      `npx prisma@7`; `npm ls` shows `7.10.1`._
- [x] Final self-review against every Definition of done checkbox in `brief.md`. — _Evidence: guide
      §Module Deliverable restates the brief's DoD; all five satisfied by the guide's artifacts._

## Write-up

- [x] "What I built". — _Evidence: write-up-template.md filled in as worked example (schema, three
      migrations incl. the hand-edited one, service layer, error mapping, seed/scripts)._
- [x] "Why it's built this way (key decisions)": your schema-to-Prisma translation choices, what
      you had to hand-edit in the `--create-only` migration and why `migrate dev` couldn't generate
      it, and how you mapped Prisma error codes onto your M05 error handler. — _Evidence: filled in
      with `@map`/explicit-junction rationale, the RedefineTables backfill reasoning, and the
      `err.code`-based mapping._
- [x] "How to build it (teach it to the next trainee)": write the add-a-column-to-an-existing-table
      guide. — _Evidence: 6-step add-a-column guide in write-up, defaulted vs required-with-backfill._
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. — _Evidence:
      `migrate dev` vs `migrate deploy`, and the generated client + lock file, both in own words._
- [x] "What tripped me up": migration conflicts, the hand-edited `--create-only` migration, the
      `better-sqlite3` install if it gave you trouble. — _Evidence: Studio `file://` protocol quirk,
      the `INSERT … SELECT` apply-time failure, `npx prisma` v8 drift, adapter vs separate
      `better-sqlite3`, and `select`+`include` runtime error._
- [x] "Checkpoint evidence": `migrate reset` plus the seed script rebuilding the database from
      scratch, the Bruno collection from M05 still green against v2, `P2002`/`P2025`/`P2003` each
      mapping to the right status code, your explanation of `migrate dev` vs `migrate deploy`, and
      `package.json` locking `prisma`/`@prisma/client` to `^7`. — _Evidence: all five listed with
      pointers to Walkthroughs 1, 7, and 8._
- [x] Close out "What I'd do differently". — _Evidence: default `estimate` up front, derive the
      backfill, ship the Studio URL quirk, wire `prisma generate` into CI/postinstall._
