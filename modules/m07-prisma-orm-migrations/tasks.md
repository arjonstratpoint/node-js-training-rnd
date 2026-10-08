# M07 Tasks — Prisma ORM & Migrations (Task API v2)

Model data with Prisma 7, evolve the schema safely with migrations, and use the typed client in the
Express API.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; have your M05 (API + error handler) and M06
      (schema + ERD) write-ups on hand.
- [ ] Install `prisma@7` and `@prisma/client@7`, plus the `better-sqlite3` driver adapter — lock
      both to `^7` in `package.json` from the start.
- [ ] Run `npx prisma@7 init` and confirm the datasource URL lives in the right config file for
      your Prisma version (`prisma7.config.ts`, or `prisma.config.ts` pre-7.10).
- [ ] Continue the branch → PR → peer review → merge habit for this module's checkpoint.

## Research

- [ ] What an ORM is, its trade-offs, and when it's still right to drop to raw SQL.
- [ ] Prisma schema language: models, scalar types, `@id`, `@default`, `@unique`, `@@index`,
      `@updatedAt`, relations (1:N, implicit M:N), `onDelete`.
- [ ] Migration commands: `migrate dev --name`, the anatomy of a `migration.sql` file,
      `--create-only` plus hand-editing SQL, `migrate status`, `migrate deploy`, `migrate reset`,
      and `db push` — know what each is for and when to use it.
- [ ] Why you never edit an already-applied migration, what adding a required column to a table
      with existing data requires, and how migration conflicts get resolved in a team PR.
- [ ] Prisma Client fundamentals: the singleton client pattern, `create`/`createMany`/`findUnique`/
      `findFirst`/`findMany`/`update`/`upsert`/`delete`, `where` with `AND`/`OR`/`NOT`/`contains`/
      `in`/`gte`, `orderBy`, pagination with `skip`/`take`, `select` vs `include`, nested writes,
      `count` and `groupBy`, `$transaction` (batch and interactive), `$queryRaw`, and query logging.
- [ ] The Prisma error codes `P2002`, `P2025`, and `P2003` — what each one means.
- [ ] TypeScript with Prisma: the generated model types, `Prisma.TaskCreateInput`,
      `Prisma.TaskWhereInput`, `Prisma.TaskGetPayload<{ include: … }>`, and
      `satisfies Prisma.TaskSelect`.
- [ ] Seeding with an explicit `npm run db:seed` script, and inspecting data with Prisma Studio.
- [ ] Concept-only: what changes with PostgreSQL, how MongoDB's document model differs, and what
      Prisma 8 changes — no lab for this, just know the shape of the answer.

## Build

- [ ] Translate your M06 schema into the Prisma schema language.
- [ ] Create your initial migration.
- [ ] Add a column (e.g. `dueDate` or `priority`) via a second migration.
- [ ] Create one hand-edited migration using `--create-only`.
- [ ] Build a service layer on Prisma that replaces the in-memory store from v1.
- [ ] Implement the list endpoint's `status` and `q` filters, sorting, and `page`/`pageSize`
      pagination, returning `{ data, meta }`.
- [ ] Write the seed script.
- [ ] Map `P2002`, `P2025`, and `P2003` into your existing M05 error handler (not a new one).

## Verify

- [ ] `migrate reset` plus the seed script rebuilds the database from scratch, every time.
- [ ] The Bruno collection from M05 is still green against v2.
- [ ] You can explain `migrate dev` vs `migrate deploy`, unaided.
- [ ] `P2002`, `P2025`, and `P2003` each map to the right status code through your existing error
      handler.
- [ ] `package.json` locks `prisma` and `@prisma/client` to `^7`, and every one-off command uses
      `npx prisma@7`.
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "What I built".
- [ ] "Why it's built this way (key decisions)": your schema-to-Prisma translation choices, what
      you had to hand-edit in the `--create-only` migration and why `migrate dev` couldn't generate
      it, and how you mapped Prisma error codes onto your M05 error handler.
- [ ] "How to build it (teach it to the next trainee)": write the add-a-column-to-an-existing-table
      guide.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "What tripped me up": migration conflicts, the hand-edited `--create-only` migration, the
      `better-sqlite3` install if it gave you trouble.
- [ ] "Checkpoint evidence": `migrate reset` plus the seed script rebuilding the database from
      scratch, the Bruno collection from M05 still green against v2, `P2002`/`P2025`/`P2003` each
      mapping to the right status code, your explanation of `migrate dev` vs `migrate deploy`, and
      `package.json` locking `prisma`/`@prisma/client` to `^7`.
- [ ] Close out "What I'd do differently".
