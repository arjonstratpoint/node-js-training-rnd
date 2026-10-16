# M07 — Prisma ORM & Migrations

**Week 3 · Days 2-4 · 8 hours**

## Builds on

[m05-express-task-api-v1](../m05-express-task-api-v1/write-up-template.md) — the Express
Task API v1 you are upgrading: its `AppError` hierarchy, central error handler, and Bruno
collection all stay. [m06-sql-fundamentals-sqlite](../m06-sql-fundamentals-sqlite/write-up-template.md)
— the `users` / `tasks` / `tags` / `task_tags` schema and ERD you translate into Prisma here.

> This module replaces the in-memory `tasks` array from v1 with a real, migrated, typed Prisma
> layer. Nothing that already passes is allowed to break.

## Learning Goals

By the end of this module, you should be able to:

- [ ] Explain what an ORM is, its trade-offs, and when dropping to raw SQL is still the right call.
- [ ] Set up Prisma 7 with SQLite, the `better-sqlite3` driver adapter, and the Prisma config file.
- [ ] Write a Prisma schema: models, scalar types, `@id`, `@default`, `@unique`, `@@index`,
      `@updatedAt`, 1:N and implicit M:N relations, and `onDelete`.
- [ ] Run and explain every migration command: `migrate dev --name`, `--create-only`, `migrate
      status`, `migrate deploy`, `migrate reset`, and `db push`.
- [ ] Hand-edit a generated migration and say why `migrate dev` could not generate it correctly.
- [ ] Use the typed client: `create`/`createMany`/`findUnique`/`findFirst`/`findMany`/`update`/
      `upsert`/`delete`, `where` operators, `orderBy`, `skip`/`take`, `select` vs `include`, nested
      writes, `count`/`groupBy`, and `$transaction` (batch and interactive).
- [ ] Drop to `$queryRaw` with tagged templates when the client is the wrong tool.
- [ ] Map `P2002`, `P2025`, and `P2003` into the existing M05 error handler.
- [ ] Type Prisma calls with generated types: `Prisma.TaskCreateInput`, `Prisma.TaskWhereInput`,
      `Prisma.TaskGetPayload`, `satisfies Prisma.TaskSelect`.
- [ ] Seed the database with an explicit `npm run db:seed` and inspect it with Prisma Studio.
- [ ] Describe, in words, what changes with PostgreSQL and MongoDB, and what Prisma 8 changes.

## Concept

### What an ORM is

An **ORM** (Object-Relational Mapper) maps rows in tables to objects your programming language can
use. Instead of writing SQL strings and converting `sqlite3` rows by hand, you describe your models
once and call typed methods: `prisma.task.findMany({ where: { status: 'todo' } })`.

The trade-offs are real:

- **You gain:** type safety (TypeScript knows the shape of every result), less boilerplate, a single
  source of truth for the schema, and migrations derived from that schema.
- **You pay:** a layer of abstraction that can hide expensive queries, generated code you must
  regenerate, and an ORM API to learn.

Drop to raw SQL when the ORM gets in the way: complex reporting queries, database-specific features,
or hot paths where you need to hand-tune the plan. Prisma gives you that escape hatch with
`$queryRaw` and `$executeRaw` (always using tagged templates, never string concatenation — the same
injection rule you learned in M06).

### The Prisma 7 setup shape

Prisma is not just a runtime library. It is three things:

1. The **`prisma` CLI** (`prisma@7`), a dev dependency. It reads your schema, generates the client,
   and runs migrations.
2. The **`@prisma/client`** runtime package, a regular dependency.
3. The **generated client** — real, project-local code written into an output folder (`generated/prisma`
   in this module). It is generated from `schema.prisma`, and it is **git-ignored**, so a teammate who
   clones the repo has no client until they run `prisma generate`.

Three Prisma 7 facts govern this whole module:

- **The datasource URL does not live in `schema.prisma`.** Prisma 7 removed `url` from the schema;
  putting it back fails validation with `P1012`. The URL lives in the config file — `prisma7.config.ts`
  on 7.10 and later (or `prisma.config.ts` before 7.10). `prisma init` writes the right file for the
  version you installed.
- **`PrismaClient` requires a driver adapter.** With SQLite that is
  `@prisma/adapter-better-sqlite3` (import name `PrismaBetterSqlite3`). You construct the adapter and
  pass it to `new PrismaClient({ adapter })`.
- **You import the client from the generated output, not `@prisma/client`.** With the `prisma-client`
  generator, `import { PrismaClient } from '@prisma/client'` fails — the client lives where the
  `output` points.

**The version pin is not optional.** This program is always Prisma `@7`. Lock `prisma` and
`@prisma/client` to `^7` in `package.json` from the first install, and run every one-off command as
`npx prisma@7`. A bare `npx prisma` currently resolves to Prisma 8, whose CLI does not read
`schema.prisma` for this stack and whose SQLite support is still experimental.

### The Prisma schema language

`schema.prisma` has three block types. You will need `generator` and `datasource`, then one `model`
per table:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

Model features you will use:

- `@id @default(autoincrement())` — the primary key.
- `@default(now())` and `@updatedAt` — timestamps set by Prisma (`@updatedAt` updates on every write).
- `@unique` — a unique constraint (`P2002` fires when you violate it).
- `@@index([col])` — a non-unique index; `@@id([a, b])` — a composite primary key.
- `@map("snake_case")` and `@@map("table_name")` — keep the database's snake_case names while your
  models stay `camelCase`.
- Relations: a 1:N is a scalar foreign key (`userId`) plus a relation field (`user User @relation(...)`)
  on the many side and `tasks Task[]` on the one side. An **implicit M:N** is a list on both sides
  (`tags Tag[]` and `tasks Task[]`) — Prisma maintains the hidden join table for you. To model the
  M06 `task_tags` junction **explicitly** (so you control it and can hang columns off it), you declare
  a `TaskTag` model with a `@@id([taskId, tagId])`.
- `onDelete: Cascade` — tell the database what to do when a parent row is deleted.

### Migrations

A **migration** is a versioned SQL file Prisma records as applied. `migrate dev` compares your schema
to the migration history and to the database, then generates and applies the deltas into
`prisma/migrations/<timestamp>_<name>/migration.sql`.

| Command | What it is for | Safe in production? |
| --- | --- | --- |
| `migrate dev --name <name>` | Author + apply migrations while developing; regenerates the client | **No** — dev only |
| `migrate dev --create-only` | Generate the migration SQL **without applying it**, so you can hand-edit | No — dev only |
| `migrate status` | Show which migrations are applied/pending | Yes (read-only) |
| `migrate deploy` | Apply pending migrations exactly as written; no authoring, no shadow DB | **Yes** — this is what CI and prod run |
| `migrate reset` | Drop the database and replay every migration from scratch | **No** — destroys data |
| `db push` | Sync the schema to the database with no migration files | **No** — prototyping only |

Rules that keep you out of trouble:

- **Never edit an already-applied migration.** Migrations are history; editing one makes every other
  environment disagree with your repo. To change something, add a *new* migration.
- **Adding a required column to a table that already has data is a data problem, not just a schema
  problem.** SQLite must create a new table and copy rows into it; a `NOT NULL` column with no value
  for the existing rows cannot be copied. You either give the column a `@default`, or you hand-edit
  the migration to backfill values (Walkthrough 6).
- **Migration conflicts happen in teams.** Two branches each add a migration; whoever merges second
  gets a history that does not match the database. The fix is to re-run `migrate dev` on the merged
  schema (which authors a new migration reconciling the difference) — never to renumber or edit the
  already-merged files.

### The Prisma Client

Every call returns a promise. The client is created once and reused for the life of the process (a
**singleton**); creating one per request exhausts connections.

- Writes: `create`, `createMany`, `update`, `upsert`, `delete`, `deleteMany`.
- Reads: `findUnique` (by a unique field), `findFirst`, `findMany`, `count`, `groupBy`.
- `where`: `equals`, `not`, `in`, `notIn`, `lt`/`lte`/`gt`/`gte`, `contains`/`startsWith`/`endsWith`,
  and the boolean combinators `AND`/`OR`/`NOT`.
- `orderBy`, `skip`, and `take` — pagination.
- `select` chooses fields; `include` pulls in relations. `select` and `include` cannot be combined at
  the same level. Result types follow whichever you used.
- **Nested writes** let one call touch several tables: `create`, `connect`, `disconnect`, `delete` on
  a relation field.
- `$transaction` groups work. The **array form** runs a fixed list of operations in one transaction
  and returns their results in order. The **interactive form** takes an `async (tx) => …` callback and
  rolls everything back if it throws.
- `$queryRaw` runs SQL you write (with a tagged template, so values are bound, not concatenated).
  `$executeRaw` runs statements that do not return rows.

Query logging is on the constructor: `new PrismaClient({ adapter, log: ['query', 'warn', 'error'] })`.

### Error handling

Prisma throws typed errors. The three you must handle:

| Code | Meaning | Typical cause | Maps to |
| --- | --- | --- | --- |
| `P2002` | Unique constraint violation | Duplicate `users.email` or `tags.name` | `409 Conflict` |
| `P2025` | Record required by an operation was not found | `update`/`delete` on a missing id | `404 Not Found` |
| `P2003` | Foreign key constraint failed | Creating a task with a `userId` that does not exist | `409` (or `400`) |

You detect them with `err instanceof Prisma.PrismaClientKnownRequestError` and switch on `err.code`.
**Do not read `err.meta.target`.** Under the driver adapters the `meta` shape is different (it nests a
`driverAdapterError`), but `err.code` is stable. Map each code to your existing `AppError` subclasses
so the wire envelope from M05 never changes.

### TypeScript with Prisma

The generated client exports a `Prisma` namespace alongside `PrismaClient`:

- `Prisma.TaskCreateInput` — the accepted shape for `create`/`createMany` data.
- `Prisma.TaskWhereInput` — the accepted shape for `where`.
- `Prisma.TaskGetPayload<{ include: … }>` — the exact result type for a given `include`/`select`.
- `satisfies Prisma.TaskSelect` — check a `select` object against the valid fields without widening it.

### Seeding and Prisma Studio

A **seed script** is ordinary code that inserts known sample data. This module wires it to an explicit
`npm run db:seed` so it is reproducible and obvious (no hidden Prisma hook). **Prisma Studio** is a
local GUI that browses and edits rows directly. It is SQL-driven (no schema needed) and supports
SQLite; on this stack you launch it with an explicit SQLite URL:
`npx prisma@7 studio --url "file://./dev.db"`.

### Concept only (no lab): PostgreSQL, MongoDB, Prisma 8

- **PostgreSQL** — same Prisma workflow, different provider. Install `@prisma/adapter-pg`, change
  `provider = "postgresql"`, and keep the connection string in the config file. You gain real types
  (`jsonb`, arrays, `numeric`), `SERIAL`/sequences, and server-side connection pooling.
- **MongoDB** — documents, not tables. `provider = "mongodb"`, `@id @default(auto()) @map("_id")
  @db.ObjectId`, and relations modelled by embedded or referenced documents. There are no SQL
  migrations; you `db push` the schema.
- **Prisma 8** — changes the CLI/config surface again (it does not read `schema.prisma` the same way
  for this stack, and SQLite support is still experimental). This program pins `@7` precisely so those
  changes cannot surprise you.

## Read These

> The Prisma docs now default to version 8, so every link below is pinned to the **`/v7/`** docs for
> this stack. If a link ever lands on unversioned docs, re-add `/v7/` after `/docs/orm/`.

- 🔗 [Prisma — ORM 7 docs](https://www.prisma.io/docs/orm/v7) — the versioned entry point: CLI, schema,
  client, and migrations.
- 🔗 [Prisma 7 — SQLite quickstart](https://www.prisma.io/docs/v7/prisma-orm/quickstart/sqlite) — the
  end-to-end setup this module follows.
- 🔗 [Prisma — Prisma schema reference](https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference)
  — every model attribute (`@id`, `@default`, `@unique`, `@updatedAt`, `@relation`, `@@index`).
- 🔗 [Prisma — SQLite connector](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite)
  — the provider, the file URL, and the driver-adapter note.
- 🔗 [Prisma — Migrate overview](https://www.prisma.io/docs/orm/v7/prisma-migrate) — `dev`, `deploy`,
  `reset`, `status`, and the migration folder anatomy.
- 🔗 [Prisma — Data model / relations](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations)
  — 1:N, M:N, referential actions (`onDelete`).
- 🔗 [Prisma — Prisma Client CRUD](https://www.prisma.io/docs/orm/v7/prisma-client/queries/crud) and
  [Filtering/sorting](https://www.prisma.io/docs/orm/v7/prisma-client/queries/filtering-and-sorting) —
  the query API you use in the service layer.
- 🔗 [Prisma — Transactions and batch queries](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions)
  — array vs interactive `$transaction`.
- 🔗 [Prisma — Raw queries](https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries)
  — `$queryRaw`/`$executeRaw` and why tagged templates are binding.
- 🔗 [Prisma — Error reference](https://www.prisma.io/docs/orm/v7/reference/error-reference) — the full
  `PXXXX` catalogue; read `P2002`, `P2025`, `P2003` closely.
- 🔗 [Prisma — Seeding](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding) and
  [Prisma Studio](https://www.prisma.io/docs/studio/getting-started) (the Studio docs are not
  ORM-version-specific).

## Walkthrough(s)

Work inside your existing M05 Task API project (the folder with `src/app.ts`, `src/errors/AppError.ts`,
and `src/middlewares/errorHandler.ts`). Every command assumes you are at that project root.

### Walkthrough 1: Install and initialise Prisma 7 with the SQLite adapter

Install the runtime and the adapter as dependencies, and the CLI as a dev dependency. Pin to `^7`:

```bash
npm install @prisma/client@^7 @prisma/adapter-better-sqlite3@^7
npm install -D prisma@^7
```

> Do **not** install `better-sqlite3` separately. The adapter already depends on its own compatible
> copy; installing a second copy at a different major gives you two native builds and confusing
> warnings.

Confirm the versions resolved under `7.x`:

```bash
npm ls prisma @prisma/client @prisma/adapter-better-sqlite3
```

```
├── @prisma/adapter-better-sqlite3@7.10.1
├── @prisma/client@7.10.1
└── prisma@7.10.1
```

Initialise Prisma:

```bash
npx prisma@7 init
```

On Prisma 7.10 the output is:

```
- Installing skills
✔ Skills installed

Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma7.config.ts
  .env
  .gitignore
  .claude/skills/
  .windsurf/skills/
  .agents/skills/
  skills-lock.json
```

Three things to know about that output:

- The config file is named **`prisma7.config.ts`** on 7.10+. On older 7.x it is `prisma.config.ts`.
- `init` also drops AI-assistant **skill folders** (`.agents/`, `.claude/`, `.windsurf/`) and a
  `skills-lock.json`. They have nothing to do with your API — add them to `.gitignore` or delete them;
  do not let them distract you.
- `init` assumes PostgreSQL. You are switching it to SQLite next.

Open the generated config and leave its structure alone — it already reads the datasource from the
environment:

```bash
cat prisma7.config.ts
```

```ts
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

Install `dotenv` (the config imports it) and point the URL at a SQLite file:

```bash
npm install dotenv
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
EOF
```

Now edit `prisma/schema.prisma` to use SQLite. Write the whole file — note there is **no `url` line**
in the datasource; Prisma 7 rejects it (`P1012`):

```bash
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
EOF
```

Because the client is generated project code, keep it out of version control. Confirm `.gitignore`
contains it (init adds it):

```bash
cat .gitignore
```

```
node_modules
# Keep environment variables out of version control
.env

/generated/prisma
```

> The database URL is `file:./dev.db`. Prisma resolves it relative to the config file at the project
> root, so the file appears as `./dev.db`. Later, your adapter must use the same URL — a mismatch
> silently creates a second, empty database.

### Walkthrough 2: Translate the M06 schema and run the initial migration

Take the four tables from your M06 ERD and express them as Prisma models. The `@map`/`@@map`
attributes keep the database's snake_case names (so nothing you learned in M06 is lost), while the
models stay `camelCase`. Write the full schema:

```bash
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  tasks     Task[]

  @@map("users")
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("todo")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int       @map("user_id")
  tags        TaskTag[]

  @@index([userId])
  @@index([status])
  @@map("tasks")
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  tasks TaskTag[]

  @@map("tags")
}

model TaskTag {
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId Int  @map("task_id")
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  Int  @map("tag_id")

  @@id([taskId, tagId])
  @@index([tagId])
  @@map("task_tags")
}
```

Mapping notes, table by table:

- `users.email` is `@unique`; `TaskTag` is an **explicit** junction model so its composite primary key
  (`@@id([taskId, tagId])`) matches M06 exactly.
- `Task.userId` plus `user User @relation(...)` is the 1:N; `onDelete: Cascade` mirrors M06's
  `ON DELETE CASCADE`.
- `status` is a plain `String` with a `@default("todo")`. (SQLite has no enum; the `CHECK` constraint
  you wrote by hand in M06 is not expressible in the Prisma schema for SQLite, so status validation
  moves to the API layer — a trade-off worth noting in your write-up.)

Create the initial migration and apply it:

```bash
npx prisma@7 migrate dev --name init
```

```
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

SQLite database dev.db created at file:./dev.db

Applying migration `20261016064937_init`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20261016064937_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

Read the generated SQL — this is the anatomy of every migration:

```bash
cat prisma/migrations/*_init/migration.sql
```

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "task_tags" (
    "task_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("task_id", "tag_id"),
    CONSTRAINT "task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "task_tags_tag_id" ON "task_tags"("tag_id");
```

`migrate dev` also regenerated the client. Run `generate` yourself anyway, because that is the step
you must not forget after a schema change, in CI, and after `migrate deploy`:

```bash
npx prisma@7 generate
```

```
✔ Generated Prisma Client (7.10.1) to ./generated/prisma in 26ms
```

### Walkthrough 3: The singleton client and the service layer

Create the folders and the singleton. Because the client is created from the **generated output**,
the import path is `./generated/prisma/client.ts` (relative from `src/lib/` it is
`../../generated/prisma/client.ts`). The driver adapter also has an unusual export name:
`PrismaBetterSqlite3`.

```bash
mkdir -p src/lib src/services
```

```bash
cat > src/lib/prisma.ts << 'EOF'
import { PrismaClient } from '../../generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    }),
    log: ['query', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Why the singleton matters: in development, `tsx` re-evaluates modules on reload; without stashing the
client on `globalThis`, every reload opens a new connection until SQLite runs out. In production the
module is evaluated once, so the guard costs nothing.

Now the service layer that replaces the in-memory array. It owns all Prisma calls so the routes stay
thin:

```bash
cat > src/services/task.service.ts << 'EOF'
import { Prisma } from '../../generated/prisma/client.ts';
import { prisma } from '../lib/prisma.ts';
import type { TaskStatus } from '../types/task.ts';

export interface ListTasksParams {
  status?: TaskStatus;
  q?: string;
  sortBy: 'createdAt' | 'title' | 'id';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  userId?: number;
}

export async function listTasks(params: ListTasksParams) {
  const { status, q, sortBy, sortOrder, page, pageSize, userId } = params;

  const where: Prisma.TaskWhereInput = {
    ...(userId !== undefined ? { userId } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy: [{ [sortBy]: sortOrder }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return { data, total };
}

export async function getTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

export async function createTask(input: Prisma.TaskCreateInput) {
  return prisma.task.create({ data: input });
}

export async function updateTask(id: number, input: Prisma.TaskUpdateInput) {
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(id: number) {
  return prisma.task.delete({ where: { id } });
}

export async function countByStatus() {
  return prisma.task.groupBy({ by: ['status'], _count: { _all: true } });
}
```

Notice:

- `where` is built with spreads so an absent filter simply adds nothing — no `undefined` keys.
- `$transaction([...])` batches the page query and the count so both see the same database state.
- `getTaskById` returns `null` for a missing id; `updateTask`/`deleteTask` throw `P2025` instead —
  this difference is exactly why Walkthrough 7 maps `P2025`.

Next, update the shared types. v2 ids are **numbers** (SQLite autoincrement), not UUID strings:

```bash
cat > src/types/task.ts << 'EOF'
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
  userId: number;
  tagIds?: number[];
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
EOF
```

Finally, rewrite the routes to use the service. The list endpoint accepts `status`, `q`, `sortBy`,
`sortOrder`, `page`, and `pageSize`, and returns `{ data, meta }`:

```bash
cat > src/routes/tasks.routes.ts << 'EOF'
import { Router, type Request, type Response, type NextFunction } from 'express';
import { BadRequestError, NotFoundError, ValidationError } from '../errors/AppError.ts';
import type { TaskStatus } from '../types/task.ts';
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service.ts';

const router = Router();

function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('id must be a positive integer');
  return id;
}

function parseStatus(value: unknown): TaskStatus {
  if (value === 'todo' || value === 'in_progress' || value === 'done') return value;
  throw new ValidationError('Invalid status', [
    { path: 'status', message: 'Must be one of todo|in_progress|done' },
  ]);
}

// GET /api/v1/tasks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20) || 20));
    const sortBy = (['createdAt', 'title', 'id'] as const).includes(req.query.sortBy as never)
      ? (req.query.sortBy as 'createdAt' | 'title' | 'id')
      : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const { data, total } = await listTasks({
      page,
      pageSize,
      sortBy,
      sortOrder,
      status: req.query.status ? parseStatus(req.query.status) : undefined,
      q: typeof req.query.q === 'string' && req.query.q.trim() !== '' ? req.query.q.trim() : undefined,
    });

    res.json({
      data,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tasks
router.post('/', async (req: Request<{}, {}, any>, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, userId, tagIds } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
      throw new ValidationError('Request validation failed', [
        { path: 'title', message: 'Required and must be non-empty string' },
      ]);
    }
    if (!Number.isInteger(userId)) {
      throw new ValidationError('Request validation failed', [
        { path: 'userId', message: 'Required and must be an integer' },
      ]);
    }
    const task = await createTask({
      title: title.trim(),
      description,
      status: status ?? 'todo',
      user: { connect: { id: userId } },
      ...(Array.isArray(tagIds) && tagIds.length > 0
        ? { tags: { create: tagIds.map((tagId: number) => ({ tag: { connect: { id: tagId } } })) } }
        : {}),
    });
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks/:id
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const task = await getTaskById(parseId(req.params.id));
    if (!task) return next(new NotFoundError('Task not found'));
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/tasks/:id
router.patch('/:id', async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const task = await updateTask(parseId(req.params.id), req.body ?? {});
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteTask(parseId(req.params.id));
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
```

The routes no longer hold state: all persistence is in `task.service.ts`. Everything is a thin
translation from the request to the service and back into the fixed `{ data }` / `{ data, meta }`
envelope.

### Walkthrough 4: Filtering, sorting and pagination on the list endpoint

Every feature in the list endpoint is now a mapping from a query string to a Prisma clause. Start the
API and seed a little data through the client so you have rows to page through:

```bash
cat > scratch.ts << 'EOF'
import { prisma } from './src/lib/prisma.ts';

const alice = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: {},
  create: { name: 'Alice Chen', email: 'alice@example.com' },
});
const urgent = await prisma.tag.upsert({
  where: { name: 'urgent' },
  update: {},
  create: { name: 'urgent' },
});
await prisma.task.createMany({
  data: [
    { title: 'Design schema', status: 'done', userId: alice.id },
    { title: 'Write docs', status: 'todo', userId: alice.id },
  ],
});
await prisma.task.create({
  data: {
    title: 'A doc task',
    status: 'todo',
    user: { connect: { id: alice.id } },
    tags: { create: [{ tag: { connect: { id: urgent.id } } }] },
  },
});
console.log('rows:', await prisma.task.count());
await prisma.$disconnect();
EOF
npx tsx scratch.ts
```

Now exercise the filters through HTTP:

```bash
npm run dev
```

```bash
curl -s "http://localhost:3000/api/v1/tasks?status=todo&q=doc&sortBy=title&sortOrder=asc&page=1&pageSize=10"
```

```json
{
  "data": [
    {
      "id": 3,
      "title": "A doc task",
      "status": "todo",
      "tags": [{ "taskId": 3, "tagId": 1, "tag": { "id": 1, "name": "urgent" } }]
    },
    {
      "id": 2,
      "title": "Write docs",
      "status": "todo",
      "tags": []
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "total": 2, "totalPages": 1 }
}
```

> `q=doc` matches `Write docs` **and** `A doc task` on title. Both are `todo`, and
> `sortBy=title&sortOrder=asc` puts `A doc task` before `Write docs`. The default `id` tiebreaker
> keeps pages stable when titles collide.

Map each query parameter to its clause and confirm the intent:

- `status=todo` → `where: { status: 'todo' }`.
- `q=doc` → `where: { OR: [{ title: { contains: 'doc' } }, { description: { contains: 'doc' } }] }`.
- `sortBy`/`sortOrder` → `orderBy: [{ title: 'asc' }, { id: 'desc' }]` (the `id` tiebreaker keeps pages
  stable).
- `page`/`pageSize` → `skip: (page - 1) * pageSize, take: pageSize`.
- `meta.total` comes from a `count` with the **same** `where`, run in the same `$transaction`.

> Why offset pagination here and keyset in M06? The client gives you `skip`/`take` for free and the
> task list is small. Keyset pagination is still the right answer for deep pages; `$queryRaw` is how
> you would express `WHERE id > :last ORDER BY id LIMIT n` when you need it. Note the trade-off in
> your write-up.

### Walkthrough 5: A second migration — add a column

Add a `priority` field **with a default** so existing rows are valid. Rewrite the whole schema file
so the copy-paste is exact — the only change from Walkthrough 2 is the `priority` line under `status`:

```bash
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  tasks     Task[]

  @@map("users")
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("todo")
  priority    String    @default("medium")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int       @map("user_id")
  tags        TaskTag[]

  @@index([userId])
  @@index([status])
  @@map("tasks")
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  tasks TaskTag[]

  @@map("tags")
}

model TaskTag {
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId Int  @map("task_id")
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  Int  @map("tag_id")

  @@id([taskId, tagId])
  @@index([tagId])
  @@map("task_tags")
}
EOF
```

```bash
npx prisma@7 migrate dev --name add_priority
```

```
Applying migration `20261016065107_add_priority`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20261016065107_add_priority/
    └─ migration.sql

Your database is now in sync with your schema.
```

Read the SQL — adding a column **with a default** is a safe, single statement:

```bash
cat prisma/migrations/*_add_priority/migration.sql
```

```sql
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';
```

Regenerate and confirm the new field is queryable:

```bash
npx prisma@7 generate
```

This is the contrast that matters: a column **with** a default can be added to a populated table; a
required column **without** a default cannot. That is Walkthrough 6.

### Walkthrough 6: A hand-edited migration with `--create-only`

Suppose you want a required `estimate` (integer, in hours) on `tasks`, and the table already has rows.
Rewrite the schema adding `estimate Int` **without** a default so Prisma's generator trips (again,
the only change from Walkthrough 5 is the `estimate` line):

```bash
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  tasks     Task[]

  @@map("users")
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("todo")
  priority    String    @default("medium")
  estimate    Int
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int       @map("user_id")
  tags        TaskTag[]

  @@index([userId])
  @@index([status])
  @@map("tasks")
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  tasks TaskTag[]

  @@map("tags")
}

model TaskTag {
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId Int  @map("task_id")
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  Int  @map("tag_id")

  @@id([taskId, tagId])
  @@index([tagId])
  @@map("task_tags")
}
EOF
```

```bash
npx prisma@7 migrate dev --name add_estimate --create-only
```

```
⚠️ We found changes that cannot be executed:

  • Step 0 Added the required column `estimate` to the `tasks` table without a default value. There are 3 rows in this table, it is not possible to execute this step.

Prisma Migrate created the following migration without applying it 20261016065259_add_estimate

You can now edit it and apply it by running prisma migrate dev.
```

Look at the SQL Prisma wrote. SQLite cannot `ALTER TABLE … ADD COLUMN` a `NOT NULL` column onto a
populated table, so Prisma uses its **RedefineTables** pattern: create a new table, copy rows, drop
the old one, rename:

```bash
cat prisma/migrations/*_add_estimate/migration.sql
```

```sql
/*
  Warnings:

  - Added the required column `estimate` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    "estimate" INTEGER NOT NULL,
    CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("created_at", "description", "id", "priority", "status", "title", "updated_at", "user_id") SELECT "created_at", "description", "id", "priority", "status", "title", "updated_at", "user_id" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
```

The bug is in the `INSERT … SELECT`: it never provides a value for `estimate`, so the `NOT NULL` copy
fails at apply time with `P3018 / NOT NULL constraint failed: new_tasks.estimate`. **This is why the
migration is hand-edited, not generated.** You supply the missing values. Run the edit below — it
rewrites the file with `estimate` added to the `INSERT` column list and `0` added to the `SELECT`, so
existing rows get a backfilled value (a real project would copy a value from the old row):

```bash
cat > prisma/migrations/*_add_estimate/migration.sql << 'EOF'
/*
  Warnings:

  - Added the required column `estimate` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    "estimate" INTEGER NOT NULL,
    CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("created_at", "description", "id", "priority", "status", "title", "updated_at", "user_id", "estimate") SELECT "created_at", "description", "id", "priority", "status", "title", "updated_at", "user_id", 0 FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
EOF
```

> The glob `prisma/migrations/*_add_estimate/migration.sql` expands to the single migration folder
> Prisma just created, so you do not have to type the timestamp.

Apply it and prove the existing rows survived with a backfilled value:

```bash
npx prisma@7 migrate dev
npx prisma@7 generate
```

```bash
cat > check.ts << 'EOF'
import { prisma } from './src/lib/prisma.ts';
console.log(
  await prisma.task.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, title: true, estimate: true },
  }),
);
await prisma.$disconnect();
EOF
npx tsx check.ts
```

```
[
  { id: 1, title: 'Design schema', estimate: 0 },
  { id: 2, title: 'Write docs', estimate: 0 },
  { id: 3, title: 'A doc task', estimate: 0 }
]
```

**A schema change ripples into code.** `estimate` is now required, so the POST route you wrote in
Walkthrough 3 will no longer satisfy `Prisma.TaskCreateInput`. Add the field to the type and supply a
default in the handler. In `src/types/task.ts`, add `estimate?: number;` to `CreateTaskBody`:

```bash
cat > src/types/task.ts << 'EOF'
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
  estimate?: number;
  userId: number;
  tagIds?: number[];
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
EOF
```

Then update the POST handler in `src/routes/tasks.routes.ts` — destructure `estimate` and pass it with
a default of `0`:

```bash
cat > src/routes/tasks.routes.ts << 'EOF'
import { Router, type Request, type Response, type NextFunction } from 'express';
import { BadRequestError, NotFoundError, ValidationError } from '../errors/AppError.ts';
import type { TaskStatus } from '../types/task.ts';
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service.ts';

const router = Router();

function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('id must be a positive integer');
  return id;
}

function parseStatus(value: unknown): TaskStatus {
  if (value === 'todo' || value === 'in_progress' || value === 'done') return value;
  throw new ValidationError('Invalid status', [
    { path: 'status', message: 'Must be one of todo|in_progress|done' },
  ]);
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20) || 20));
    const sortBy = (['createdAt', 'title', 'id'] as const).includes(req.query.sortBy as never)
      ? (req.query.sortBy as 'createdAt' | 'title' | 'id')
      : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const { data, total } = await listTasks({
      page,
      pageSize,
      sortBy,
      sortOrder,
      status: req.query.status ? parseStatus(req.query.status) : undefined,
      q: typeof req.query.q === 'string' && req.query.q.trim() !== '' ? req.query.q.trim() : undefined,
    });

    res.json({
      data,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request<{}, {}, any>, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, estimate, userId, tagIds } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
      throw new ValidationError('Request validation failed', [
        { path: 'title', message: 'Required and must be non-empty string' },
      ]);
    }
    if (!Number.isInteger(userId)) {
      throw new ValidationError('Request validation failed', [
        { path: 'userId', message: 'Required and must be an integer' },
      ]);
    }
    const task = await createTask({
      title: title.trim(),
      description,
      status: status ?? 'todo',
      estimate: Number.isInteger(estimate) ? estimate : 0,
      user: { connect: { id: userId } },
      ...(Array.isArray(tagIds) && tagIds.length > 0
        ? { tags: { create: tagIds.map((tagId: number) => ({ tag: { connect: { id: tagId } } })) } }
        : {}),
    });
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const task = await getTaskById(parseId(req.params.id));
    if (!task) return next(new NotFoundError('Task not found'));
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const task = await updateTask(parseId(req.params.id), req.body ?? {});
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await deleteTask(parseId(req.params.id));
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
EOF
npm run typecheck
```

> This is the lesson of `--create-only` from a different angle: whenever the schema moves, the
> generated types move with it, and TypeScript tells you exactly which call site you forgot to update.

Now learn the rest of the migration commands by using them rather than reading about them:

```bash
npx prisma@7 migrate status
```

```
3 migrations found in prisma/migrations

Database schema is up to date!
```

`migrate deploy` is what runs in CI and production — it applies pending migrations exactly as written
and never authors or edits anything:

```bash
npx prisma@7 migrate deploy
```

```
All migrations have been successfully applied.
```

`db push` skips migration files entirely and syncs the schema straight to the database. It is for
prototyping spikes only:

```bash
npx prisma@7 db push
```

```
🚀  Your database is now in sync with your Prisma schema. Done in 7ms
```

`migrate reset` drops the database and replays every migration. It is destructive and **dev-only**:

```bash
npx prisma@7 migrate reset
```

> Prisma 7 warns loudly here — and if it detects an AI agent driving the CLI it refuses unless you set
> an explicit consent variable. That guard is a feature, not a bug: confirm you are pointed at a local
> `dev.db`, never a shared or production database. Note that on Prisma 7 `migrate reset` replays the
> migrations **but does not run your seed for you** — in Walkthrough 8 you will run the seed as its own
> explicit step after the reset. (You can wire a seed command into `prisma7.config.ts` so `prisma db
> seed` runs it; the module keeps the seed an explicit `npm run db:seed` on purpose.)

If a migration fails halfway in development, recover in this order:

```bash
npx prisma@7 migrate resolve --rolled-back 20261016065259_add_estimate
```

Then fix the SQL and apply again (or `migrate reset` on a local database). In production you resolve
forward with a *new* migration — you never rewrite applied history.

### Walkthrough 7: Map `P2002`/`P2025`/`P2003` into the M05 error handler

v1 mapped nothing, because an in-memory array cannot fail a constraint. v2 can. First see the three
errors for yourself. Trigger each one with a throwaway script against seeded data:

```bash
cat > errs.ts << 'EOF'
import { Prisma } from './generated/prisma/client.ts';
import { prisma } from './src/lib/prisma.ts';

async function attempt(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(label, '-> unexpectedly succeeded');
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(label, '->', e.code);
    } else {
      throw e;
    }
  }
}

const alice = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: {},
  create: { name: 'Alice Chen', email: 'alice@example.com' },
});
await attempt('duplicate email', () =>
  prisma.user.create({ data: { name: 'Dup', email: 'alice@example.com' } }),
);
await attempt('missing id', () => prisma.task.delete({ where: { id: 99999 } }));
await attempt('orphan task', () =>
  prisma.task.create({ data: { title: 'orphan', estimate: 0, userId: 99999 } }),
);
await prisma.$disconnect();
EOF
npx tsx errs.ts
```

```
duplicate email -> P2002
missing id -> P2025
orphan task -> P2003
```

> The singleton turns on `log: ['query', 'warn', 'error']`, so the `prisma:query …` lines are
> interleaved with those three results. Ignore them here; they are the point of the logging option,
> not noise to fix.

Now extend the **existing** M05 handler — do not write a second one. Detect the known-request error
and translate its `code` into the `AppError` subclasses that already produce the fixed envelope:

```bash
cat > src/middlewares/errorHandler.ts << 'EOF'
import type { Request, Response, NextFunction } from 'express';
import { AppError, ConflictError, NotFoundError } from '../errors/AppError.ts';
import { Prisma } from '../../generated/prisma/client.ts';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  let error: unknown = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = new ConflictError('Unique constraint violation');
        break;
      case 'P2025':
        error = new NotFoundError('Record not found');
        break;
      case 'P2003':
        error = new ConflictError('Foreign key constraint violation');
        break;
      default:
        break;
    }
  }

  if (error instanceof AppError) {
    const body: any = {
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    };
    if (error.code === 'VALIDATION_ERROR' && error.details && error.details.length > 0) {
      body.error.details = error.details;
    }
    return res.status(error.status).json(body);
  }

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProd ? 'Internal server error' : (err as any)?.message || 'Internal server error',
      requestId,
    },
  });
}
```

Prove the mapping over HTTP — each code becomes the right status through the *same* envelope:

```bash
curl -s -X POST http://localhost:3000/api/v1/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"x","userId":1}'
curl -s -X POST http://localhost:3000/api/v1/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"dup","userId":1}'
```

> Map by `err.code`, not `err.meta.target`. With the driver adapters `meta` is a nested
> `driverAdapterError` (for example `meta.driverAdapterError.cause.constraint.fields`), so any code
> that reads `meta.target` breaks on this stack even though it works on other Prisma setups.

### Walkthrough 8: Seeds, Studio, and the TypeScript types

Write a seed script that wipes and repopulates the database deterministically. It must use the same
singleton and the same URL:

```bash
cat > prisma/seed.ts << 'EOF'
import { prisma } from '../src/lib/prisma.ts';

async function main() {
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: { name: 'Alice Chen', email: 'alice@example.com' },
  });
  const ben = await prisma.user.create({
    data: { name: 'Ben Okafor', email: 'ben@example.com' },
  });

  const urgent = await prisma.tag.create({ data: { name: 'urgent' } });
  const backend = await prisma.tag.create({ data: { name: 'backend' } });

  await prisma.task.create({
    data: {
      title: 'Design schema',
      status: 'done',
      estimate: 3,
      userId: alice.id,
      tags: {
        create: [
          { tag: { connect: { id: urgent.id } } },
          { tag: { connect: { id: backend.id } } },
        ],
      },
    },
  });
  await prisma.task.create({
    data: { title: 'Write migrations', status: 'in_progress', estimate: 5, userId: ben.id },
  });

  console.log('seed done');
}

main().finally(() => prisma.$disconnect());
```

Wire the scripts into `package.json` (yours already has `dev` and `typecheck`; add these):

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio --url \"file://./dev.db\""
  }
}
```

> `prisma` in these scripts resolves to the pinned local `@7` binary in `node_modules/.bin`. For
> **one-off** commands you type yourself, always use `npx prisma@7` — a bare `npx prisma` fetches
> Prisma 8.

Rebuild the database from scratch and prove it is reproducible. `db:reset` replays the migrations
and leaves you with an empty schema; `db:seed` then fills it — two explicit steps, so nothing is
hidden behind a hook:

```bash
npm run db:reset
npm run db:seed
```

```
$ npm run db:reset
Database reset successful

$ npm run db:seed
seed done
```

Then browse it:

```bash
npm run db:studio
```

```
Prisma Studio is running at: http://localhost:51212
```

> **Quirk to know (Prisma 7.10.1):** a plain `npx prisma@7 studio` reads the URL `file:./dev.db`
> from your config and fails with `Prisma Studio is not supported for the "file:./dev.db" protocol`
> — its protocol parser expects a `://`. Passing an explicit `--url "file://./dev.db"` (note the
> doubled slash) works, which is why the `db:studio` script carries it. Studio uses Node's built-in
> `node:sqlite` on Node 22.5+ (your M04 toolchain is Node 24), so no extra driver is needed.

Finally, a tour of the generated types. Create a file that will not compile if the types are wrong —
that is the point:

```bash
cat > src/types/prisma-tour.ts << 'EOF'
import { Prisma, PrismaClient } from '../../generated/prisma/client.ts';

type TaskWithTags = Prisma.TaskGetPayload<{
  include: { tags: { include: { tag: true } } };
}>;

const select = { id: true, title: true, status: true } satisfies Prisma.TaskSelect;

const createInput: Prisma.TaskCreateInput = {
  title: 'Typed task',
  estimate: 2,
  user: { connect: { id: 1 } },
  tags: { create: [{ tag: { connect: { id: 1 } } }] },
};

const where: Prisma.TaskWhereInput = {
  AND: [{ status: { in: ['todo', 'in_progress'] } }],
  OR: [{ title: { contains: 'doc' } }],
};

export async function tour(prisma: PrismaClient): Promise<TaskWithTags[]> {
  const rows = await prisma.task.findMany({ where, include: { tags: { include: { tag: true } } } });
  const picked = await prisma.task.findMany({ select });
  console.log(createInput.title, picked.length);
  return rows;
}
EOF
npm run typecheck
```

A silent `npm run typecheck` is success. Now break it on purpose: change `status: { in: ['todo'] }` to
`status: { in: ['notastatus'] }` and run `npm run typecheck` — TypeScript rejects the value and names
the line. Put it back. That error is the whole reason the generated client exists.

## "What This Walkthrough Showed You"

- Prisma 7 splits responsibility: the CLI authors and applies migrations, the schema declares models,
  and the **generated** client is project code you must regenerate after every schema change.
- The datasource URL lives in `prisma7.config.ts` and `PrismaClient` needs a **driver adapter**
  (`PrismaBetterSqlite3`); the client is imported from `generated/prisma`, not `@prisma/client`.
- The `@7` pin plus `npx prisma@7` is what keeps an unversioned `npx prisma` (Prisma 8) from silently
  taking over and failing to read `schema.prisma`.
- Adding a column **with** a default is one safe `ALTER TABLE`; adding a required column **without**
  a default to a populated table forces SQLite's table-rebuild and must be hand-edited and backfilled.
- `--create-only` exists precisely so you can edit a migration before it applies; never edit an
  applied one.
- `migrate dev` authors migrations; `migrate deploy` replays them verbatim in CI/prod; `migrate reset`
  rebuilds a dev database; `db push` skips history for spikes.
- The list endpoint is a mapping from query string to `where`/`orderBy`/`skip`/`take`, with `count`
  sharing the same `where` inside one `$transaction`, returning `{ data, meta }`.
- `P2002`/`P2025`/`P2003` are translated by **`err.code`** into the existing M05 `AppError` classes,
  so the wire envelope never changes.
- `Prisma.TaskCreateInput`, `Prisma.TaskWhereInput`, `Prisma.TaskGetPayload`, and
  `satisfies Prisma.TaskSelect` make the compiler enforce the schema; a silent `typecheck` is the
  proof.

## Numbered EXERCISES

Each exercise is written against your own Task API v2. Run it, capture the output, and paste it into
your write-up — that is your evidence.

**A. Migrations**

1. **(Easy)** Add an `archived Boolean @default(false)` column to `Task` with `migrate dev --name
   add_archived`, and read the generated SQL.
2. **(Medium)** Delete your local `dev.db`, run `migrate deploy`, then `migrate status`, and explain
   what the status output proves about migrations versus the database file.
3. **(Medium)** Add a required `sequence Int` with no default to the populated `tasks` table using
   `--create-only`, explain why the generated `INSERT … SELECT` fails, then hand-edit it to backfill a
   value 1..n and apply it.
4. **(Hard)** Make two schema changes on two git branches, merge them, and show what `migrate dev`
   does to reconcile the merged schema. Describe how you would resolve it without editing applied
   migrations.

**B. Client CRUD and querying**

5. **(Easy)** Create a user and a task for them in one nested `prisma.task.create` call.
6. **(Medium)** Implement `GET /api/v1/tasks` `q` filtering so it matches `title` **or** `description`,
   then prove it with a `q` that only appears in a description.
7. **(Medium)** Add `sortBy=priority` and a secondary `id` tiebreaker; show two pages that stay stable.
8. **(Medium)** Use `createMany` to insert five tags at once, then `upsert` one of them by `name`.
9. **(Hard)** Add `GET /api/v1/tasks/stats` that returns task counts per `status` using `groupBy`, and
   include statuses with zero tasks.

**C. Relations**

10. **(Medium)** Attach two tags to a task with a nested `create`, then return the task with
    `include: { tags: { include: { tag: true } } }`.
11. **(Medium)** Use `select` to return only `id` and `title` for the list endpoint and show the
    response has *no* other fields.
12. **(Hard)** Implement "tasks with no tags" using a `where` on the relation (`tags: { none: {} }`)
    and confirm it matches a `LEFT JOIN … WHERE tag_id IS NULL` from M06.

**D. Transactions and raw SQL**

13. **(Medium)** Move a task from `todo` to `done` and append an audit row in one interactive
    `$transaction`; make the second write throw and show the first is rolled back.
14. **(Hard)** Write `$queryRaw` keyset pagination (`WHERE id > ${lastId} ORDER BY id LIMIT ${n}`)
    and compare it with the `skip`/`take` version. Note that the raw `COUNT(*)` comes back as a
    `BigInt`.

**E. Errors**

15. **(Easy)** Trigger `P2002`, `P2025`, and `P2003` and paste the status code each one produces
    through your error handler.
16. **(Medium)** Add handling for a Prisma code you have not seen (e.g. `P2000`), mapping it to `400`,
    and demonstrate it with a value that is too long.

## Self-Check

1. What does `prisma generate` produce, where does it put it, and why is it git-ignored?
2. Where does the datasource URL live in Prisma 7, and what error do you get if you put it back in
   `schema.prisma`?
3. Why does `PrismaClient` need a driver adapter on this stack, and what is the adapter class called?
4. Explain `migrate dev` versus `migrate deploy` in your own words.
5. When would you use `migrate dev --create-only`, and why would you hand-edit the result?
6. Why can you add a column with a default to a populated table but not a required column without one?
7. Why must you never edit an already-applied migration, and how do teams reconcile migration
   conflicts?
8. What is the difference between `select` and `include`, and can you use both at once?
9. What do `P2002`, `P2025`, and `P2003` each mean, and which HTTP status does each map to here?
10. Why map Prisma errors by `err.code` rather than `err.meta.target` on this stack?
11. What is the difference between the array form and the interactive form of `$transaction`?
12. Why is `$queryRaw` written as a tagged template rather than a concatenated string?

## Module Deliverable

Task API v2 — the M06 schema translated into Prisma, with 2+ migrations (one hand-edited), a service
layer replacing the in-memory store, filtered/sorted/paginated listing, a seed script, and Prisma
errors mapped into the existing M05 error handler:

- `prisma/schema.prisma` — all four M06 tables as models with keys, indexes, relations, and
  `onDelete`.
- `prisma/migrations/` — an initial migration, a second migration adding a column, and at least one
  hand-edited `--create-only` migration with a written explanation of the edit.
- `src/lib/prisma.ts` — the singleton client with the SQLite driver adapter.
- `src/services/task.service.ts` — the Prisma-backed service layer.
- `src/routes/tasks.routes.ts` — the list endpoint's `status`/`q` filters, sorting, and
  `page`/`pageSize` pagination returning `{ data, meta }`.
- `src/middlewares/errorHandler.ts` — `P2002`/`P2025`/`P2003` mapped through the **existing** handler.
- `prisma/seed.ts` plus the `npm run db:seed` and `npm run db:reset` scripts.
- A completed `write-up-template.md` and a ticked `tasks.md`.

Definition of done — every box, checked by running, not by asserting:

- [ ] `migrate reset` plus the seed script rebuilds the database from scratch, every time.
- [ ] The Bruno collection from M05 is still green against v2.
- [ ] You can explain `migrate dev` vs `migrate deploy`, unaided.
- [ ] `P2002`, `P2025`, and `P2003` each map to the right status code through your existing error
      handler — not a new one.
- [ ] `package.json` locks `prisma` and `@prisma/client` to `^7`, and every one-off command uses
      `npx prisma@7`, never a bare `npx prisma`.

## Appendix (Self-Check answers)

1. `prisma generate` writes the typed client into the schema's `output` folder (`generated/prisma`
   here). It is project code derived entirely from the schema, so it is rebuilt rather than committed
   — a clone has no client until they run `generate`.
2. The URL lives in the Prisma config file (`prisma7.config.ts` on 7.10+). Putting `url = env(...)`
   back in `schema.prisma` fails validation with `P1012`, because Prisma 7 removed the datasource URL
   from the schema.
3. Prisma 7's client does not ship a bundled database driver; the adapter connects it to the actual
   engine. On SQLite it is `@prisma/adapter-better-sqlite3`, imported as `PrismaBetterSqlite3`, and
   passed as `new PrismaClient({ adapter })`.
4. `migrate dev` is the development author: it compares schema to history and database, generates new
   migration SQL, applies it, and regenerates the client (and may reset/drift-check). `migrate deploy`
   only applies the migration files that already exist, verbatim, with no authoring — which is exactly
   why CI and production run it.
5. Use `--create-only` when the correct SQL cannot be generated from the schema alone — most often a
   required column on a populated table that needs a backfill, or a data migration. It writes the file
   without applying so you edit the `INSERT … SELECT` (or add statements) first.
6. A default lets the database fill the new column for every existing row, so one `ALTER TABLE ADD
   COLUMN` works. Without a default, existing rows have no value for a `NOT NULL` column; SQLite must
   rebuild the table and copy rows, and the copy fails — so you hand-edit to supply a value.
7. Applied migrations are shared history; editing one makes every other environment disagree with
   your repo. Teams reconcile conflicts by re-running `migrate dev` on the merged schema to author a
   **new** migration that captures the difference — never by renumbering or rewriting merged files.
8. `select` picks specific scalar fields (and relations); `include` adds whole relations to the full
   row. You cannot use both at the same level; use nested `select` inside `include` if you need a
   subset.
9. `P2002` unique constraint violation → `409`; `P2025` required record not found → `404`; `P2003`
   foreign key constraint failed → `409`.
10. Under the driver adapters the error `meta` is a nested `driverAdapterError` object rather than the
    flat `meta.target` older Prisma setups exposed, so code reading `meta.target` breaks. `err.code`
    is stable across the driver-adapter stack.
11. The array form runs a fixed list of operations in one transaction and resolves to their results
    in order. The interactive form takes an `async (tx) => …` callback so you can branch on results;
    throwing inside rolls the whole transaction back.
12. A tagged template sends the SQL text and the interpolated values separately, so the values are
    bound as data and can never be parsed as SQL. Concatenation pastes input into the query text and
    reopens the injection hole from M06.
