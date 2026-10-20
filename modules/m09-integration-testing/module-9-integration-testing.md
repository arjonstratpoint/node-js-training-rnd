# M09 — Integration Testing with Jest + Supertest (Task API v4)

**Week 4 · Days 1-2 · 8 hours**

## Builds on

[m08-zod-validation](../m08-zod-validation/write-up-template.md) — you're writing tests against
Task API v3 and shipping it as v4.

## Learning Goals

By the end of this module, you should be able to:

- [ ] Explain the testing pyramid, the difference between unit, integration, and end-to-end tests,
      and what an API integration test should cover.
- [ ] Explain why these tests hit a **real SQLite database** instead of a mocked one, and what
      breaks when tests share one database without cleanup.
- [ ] Set up Jest 30 in ESM mode on TypeScript 7: `@swc/jest` transform,
      `--experimental-vm-modules`, `--runInBand`, and `tsc --noEmit` as the separate type gate.
- [ ] Write integration tests with `describe`/`it`/`expect` imported from `@jest/globals`, using
      Arrange-Act-Assert, `beforeAll`/`afterAll`/`beforeEach`, `test.each`, `toMatchObject`,
      `expect.objectContaining`, and `rejects`.
- [ ] Drive the HTTP layer with Supertest: `request(app)` against the exported app (no port),
      `.get/.post/.patch/.delete`, `.send`/`.set`/`.query`, and status/header/body assertions.
- [ ] Build an isolated test database: a separate `test.db` via `.env.test`, a Jest `globalSetup`
      that runs `prisma migrate deploy` against it, foreign-key-safe cleanup in `beforeEach`, and
      `afterAll(() => prisma.$disconnect())`.
- [ ] Assert the M05 error envelope on every failure path: 400 with `details`, 404, 409, malformed
      JSON, the request-ID header, and that the error handler never leaks a stack trace.
- [ ] Read a coverage report, set thresholds, and say what coverage does *not* prove.
- [ ] Diagnose flaky tests (shared state, time, ordering) and run the suite with `--randomize`.
- [ ] Mock only at boundaries, and explain why `jest.mock` hoisting does not apply in ESM
      (`jest.unstable_mockModule`).
- [ ] Add a feature test-first: red → green → refactor on `PATCH /tasks/:id/complete`.
- [ ] Wire GitHub Actions CI (`npm ci` → `prisma generate` → `typecheck` → `test`) and ship a green
      build on a pull request.

## Concept

- **The pyramid, in one breath.** Unit tests are fast and narrow (one function, collaborators
  replaced); integration tests exercise a real slice of the system (your Express app + a real
  database); end-to-end tests drive a running server or browser. For an API like this one,
  integration tests give the best bug-per-minute: they catch route wiring, validation, error-mapping,
  and SQL mistakes that unit tests can't see, without the slowness and flakiness of full E2E.
- **Why a real database, not a mock.** A mocked Prisma client proves your mock and your code agree
  — not that SQLite accepts your query, that your migrations match your schema, or that your
  `where` clauses return the rows you think. The database *is* the behavior under test. You pay for
  realism with setup work: isolation and cleanup, which is most of this module.
- **`app.ts` vs `server.ts` was for this moment.** Because M05 kept `listen()` in `server.ts`, the
  test can import the app and hand it to Supertest directly — no port, no `fetch`, no waiting for
  the server to boot.
- **The error envelope is the assertion contract.** Every failure path returns
  `{ error: { code, message, requestId, ...details } }` (details only on validation errors). Your
  tests assert that shape, so a refactor that changes the wire format fails CI immediately.
- **The toolchain has two separate jobs.** `@swc/jest` *strips types* so Jest can run the files;
  `tsc --noEmit` *checks types* and runs in the `typecheck` script and CI. Neither replaces the
  other. Jest runs in ESM mode (`--experimental-vm-modules`) because your project is
  `"type": "module"` with `.ts` import specifiers.
- **`--runInBand` is a SQLite constraint, not a speed setting.** SQLite allows a single writer; N
  Jest workers writing one `test.db` means `SQLITE_BUSY` and cross-test interference. One process,
  one database, in order. (The alternative — one database file per worker via `JEST_WORKER_ID` — is
  Exercise 6.)
- **Coverage is a gap-detector, not a score.** 80% coverage means 80% of lines ran, not 80% of
  bugs are gone. Use the report to find untested branches, never to celebrate a number.
- **Flaky tests have three classic causes:** shared state (yesterday's rows leak into today's
  assertions), time (the test embeds "now"), and ordering (test B only passes if test A ran first).
  `--randomize` exposes the third class immediately — a random-order failure is a bug in your setup.
- **Mock at the boundary, sparingly.** Spy on the seam (the service function, the clock, the HTTP
  client), not on your own internals. In ESM there is no `jest.mock` hoisting — module mocking goes
  through `jest.unstable_mockModule` and a dynamic import (Walkthrough 7).
- **Snapshots, sparingly.** `toMatchSnapshot` is useful for a stable payload shape you don't want
  to enumerate; it is a poor fit for error envelopes with `requestId` (every snapshot would differ)
  — assert those explicitly instead.
- **TDD is a design tool, not a ceremony.** Red (a failing test that names the contract) → green
  (the minimum code that satisfies it) → refactor (clean up with the safety net in place). You'll
  do one full cycle on `PATCH /tasks/:id/complete`.

## Read These

- [Jest Getting Started](https://jestjs.io/docs/getting-started) and
  [Mocking](https://jestjs.io/docs/mock-functions) (read the ESM caveats)
- [Supertest](https://github.com/ladjs/supertest) (the npm package's home repo)
- [@swc/jest](https://swc.rs/docs/usage/jest)
- [GitHub Actions: Quickstart](https://docs.github.com/en/actions/quickstart)
- [M05 — Express: Routing, Middleware & Error Handling](../m05-express-task-api-v1/module-5-express-task-api-v1.md)
  (the error envelope and `app.ts`/`server.ts` split)
- [M07 — Prisma ORM & Migrations](../m07-prisma-orm-migrations/module-7-prisma-orm-migrations.md)
  (`P2002`/`P2025`/`P2003`, the service layer, list query contract)
- [M08 — Zod Validation & Type Inference](../m08-zod-validation/module-8-zod-validation.md)
  (the `validate` middleware these tests depend on)
- [M09 Brief](./brief.md)

## Walkthrough(s)

All commands run from the project root of your Task API (the project you've been building since
M05). Check the state you're starting from:

```bash
git status
ls src tests 2>/dev/null || echo "no tests/ yet — expected"
```

### Walkthrough 1: Install Jest, Supertest, and `@swc/jest` — prove the transform first

Install the pinned toolchain from the PRD's cheat sheet:

```bash
npm install -D jest@30 @jest/globals supertest @types/supertest @swc/core @swc/jest
```

Add the scripts. `npm pkg set` edits `package.json` without making you rewrite the whole file:

```bash
npm pkg set "test=node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
npm pkg set "test:coverage=node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --coverage"
npm pkg set "typecheck=tsc --noEmit"
```

Why this form and not `NODE_OPTIONS=--experimental-vm-modules jest`? Because `VAR=value cmd` syntax
is a POSIX-shell trick that breaks in Windows `cmd`. Calling `node` on the Jest entrypoint directly
is the cross-platform script the program pins. `--runInBand` is there from day one because SQLite
allows a single writer.

Now the Jest config (ESM, because your `package.json` says `"type": "module"`):

```bash
cat > jest.config.js << 'EOF'
/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' } }],
  },
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  globalSetup: '<rootDir>/tests/global-setup.ts',
};
EOF
```

Read that config: `extensionsToTreatAsEsm: ['.ts']` tells Jest these files are ES modules;
`@swc/jest` strips the types and — in ESM mode — **keeps** `import`/`export` as-is (do not tell swc
to emit CommonJS; that would fight `--experimental-vm-modules`); `setupFiles` runs before every test
file; `globalSetup` runs once, before everything.

Tests must be type-checked too, so `tsconfig.json` has to see them. Rewrite it with `tests` added to
`include` (everything else stays exactly as M04 left it):

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "tests"]
}
EOF
```

The config already points at `tests/setup-env.ts` and `tests/global-setup.ts`, so create the
directory and minimal working versions now — `globalSetup` must export a function or Jest refuses
to start, so an empty file will not do. Walkthrough 2 explains and upgrades both:

```bash
mkdir -p tests
cat > tests/setup-env.ts << 'EOF'
import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test.db';
EOF
cat > tests/global-setup.ts << 'EOF'
export default async function globalSetup(): Promise<void> {
  // Walkthrough 2 replaces this with `npx prisma@7 migrate deploy`
}
EOF
```

Before writing a single real test, prove the transform copes with your whole import chain —
Express, Zod, and crucially the **Prisma-generated client** in ESM mode. That's the combination the
program flags as its biggest toolchain risk. The smoke test imports the app and hits the health
endpoint:

```bash
cat > tests/smoke.test.ts << 'EOF'
import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';

describe('smoke: the app boots under Jest', () => {
  it('GET /healthz returns 200 ok', async () => {
    const res = await request(app).get('/healthz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
EOF
```

```bash
npm test
```

**If it passes:** the toolchain works — continue to Walkthrough 2. **If it fails to transform or
resolve the Prisma-generated client:** apply the brief's fallback order exactly — don't mix steps,
don't skip ahead — and record in your write-up which one you needed:

1. `ts-jest`, using its documented TypeScript 7 side-by-side setup.
2. Pin TypeScript 6 for the test toolchain only (the rest of the project stays on TypeScript 7).
3. Compile the project as CommonJS by dropping `"type": "module"`.

> **Known hazard (not part of the ladder):** if imports *into* the generated client fail to
> resolve, check the generator's `importFileExtension` option in `schema.prisma` first — the
> generated code's import extensions must match your project's `.ts` convention.

Also confirm the type gate still runs clean over the new files:

```bash
npm run typecheck
```

Nothing printed — silence is success.

**What this walkthrough showed you:** Jest 30 runs your TypeScript ESM project through `@swc/jest`
while `tsc --noEmit` stays the type gate; the app imports cleanly under Jest with no port and no
`listen()` — the `app.ts`/`server.ts` split from M05 paying off exactly as promised.

### Walkthrough 2: The isolated test database — `test.db`, `globalSetup`, safe cleanup

Three moving parts: an env file that points tests at their own database file, a `globalSetup` that
migrates it before any test runs, and a `beforeEach` that empties it between tests.

First the env file — **never committed** (`.env.test` is git-ignored; `.env.example` is committed):

```bash
cat > .env.test << 'EOF'
NODE_ENV=test
DATABASE_URL="file:./test.db"
EOF
grep -q '^.env.test$' .gitignore || cat >> .gitignore << 'EOF'
.env.test
*.db
EOF
```

`tests/setup-env.ts` loads it, with defaults that still work when the file is absent (in CI it is —
`.env.test` is deliberately not in the repository):

```bash
cat > tests/setup-env.ts << 'EOF'
import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test.db';
EOF
```

`tests/global-setup.ts` migrates `test.db` once per run. Note the explicit `env`: the spawned
`prisma migrate deploy` inherits `DATABASE_URL=file:./test.db`, and because `prisma7.config.ts`
imports `dotenv/config` (which never overrides variables that are already set), your dev `.env`
cannot leak its `dev.db` URL into this run:

```bash
cat > tests/global-setup.ts << 'EOF'
import { execSync } from 'node:child_process';
import { config } from 'dotenv';

export default async function globalSetup(): Promise<void> {
  config({ path: '.env.test' });

  execSync('npx prisma@7 migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL ?? 'file:./test.db',
    },
  });
}
EOF
```

> If Jest reports that it cannot load `global-setup.ts`, rename it to `global-setup.mjs` and strip
> the type annotations — same logic, plain ESM JavaScript.

Now the cleanup helper. Order matters: `task_tags` references `tasks` and `tags`, and `tasks`
references `users` — delete children before parents, in one transaction:

```bash
mkdir -p tests/helpers
cat > tests/helpers/db.ts << 'EOF'
import { prisma } from '../../src/lib/prisma.ts';

export async function resetDb(): Promise<void> {
  await prisma.$transaction([
    prisma.taskTag.deleteMany(),
    prisma.task.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
EOF
```

And factories — random emails so a unique constraint never trips across runs:

```bash
cat > tests/factories.ts << 'EOF'
import { prisma } from '../src/lib/prisma.ts';

export async function createUser(overrides: { email?: string } = {}) {
  return prisma.user.create({
    data: {
      name: 'Test User',
      email: overrides.email ?? `user-${crypto.randomUUID()}@example.com`,
    },
  });
}

export async function createTask(userId: number, overrides: Record<string, unknown> = {}) {
  return prisma.task.create({
    data: {
      title: 'Test task',
      status: 'todo',
      userId,
      ...overrides,
    },
  });
}

export async function seedTasks(userId: number, count: number) {
  const tasks = [];
  for (let i = 0; i < count; i += 1) {
    tasks.push(await createTask(userId, { title: `Task ${String(i).padStart(2, '0')}` }));
  }
  return tasks;
}
EOF
```

Run the suite — `globalSetup` should print Prisma's migrate output before the smoke test runs, and
`test.db` should appear:

```bash
npm test
ls -la test.db
```

**Why each piece exists, or what breaks without it:**

- **No `test.db` (shared `dev.db`):** tests eat your development data, and a leftover row from last
  week's run changes `total` in a pagination assertion.
- **No cleanup in `beforeEach`:** the second run of the suite fails on the first run's rows —
  duplicate counts, unique violations. Shared state is the number-one cause of flaky suites.
- **No `--runInBand`:** several workers, one SQLite file, one writer → `SQLITE_BUSY` and
  nondeterministic failures. (Or give each worker its own file with `JEST_WORKER_ID` — Exercise 6.)
- **No `afterAll(() => prisma.$disconnect())`:** Jest warns it did not exit; the open connection
  keeps the process alive. Every test file that touches the database disconnects in `afterAll` —
  you'll see this in each file below.

**What this walkthrough showed you:** tests get their own migrated database, emptied in
foreign-key order before each test — deterministic regardless of what ran before, which is exactly
what `--randomize` will demand of you.

### Walkthrough 3: Happy paths — Arrange-Act-Assert against the real app

The pattern, once, carefully: **Arrange** (build state), **Act** (one request), **Assert** (status,
shape — not the whole row). Create the file:

```bash
cat > tests/tasks.test.ts << 'EOF'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';
import { disconnectDb, resetDb } from './helpers/db.ts';
import { createTask, createUser } from './factories.ts';

describe('GET/POST /api/v1/tasks happy paths', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('GET /api/v1/tasks returns an empty list with meta', async () => {
    // Arrange — the database is empty after resetDb()

    // Act
    const res = await request(app).get('/api/v1/tasks');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toMatchObject({ page: 1, total: 0 });
  });

  it('GET /api/v1/tasks returns seeded tasks', async () => {
    // Arrange
    const user = await createUser();
    await createTask(user.id, { title: 'Ship the brownbag' });

    // Act
    const res = await request(app).get('/api/v1/tasks');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ title: 'Ship the brownbag', status: 'todo' });
  });

  it('POST /api/v1/tasks creates a task (201)', async () => {
    // Arrange
    const user = await createUser();

    // Act
    const res = await request(app).post('/api/v1/tasks').send({
      title: 'Write M09 tests',
      userId: user.id,
    });

    // Assert
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'Write M09 tests',
      status: 'todo',
      userId: user.id,
    });
    expect(typeof res.body.data.id).toBe('number');
  });

  it('POST defaults status to todo and allows the full M07 body', async () => {
    const user = await createUser();

    const res = await request(app).post('/api/v1/tasks').send({
      title: 'With everything',
      description: 'optional description',
      status: 'in_progress',
      userId: user.id,
      tagIds: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      status: 'in_progress',
      description: 'optional description',
    });
  });

  it('GET /api/v1/tasks/:id returns one task', async () => {
    const user = await createUser();
    const task = await createTask(user.id);

    const res = await request(app).get(`/api/v1/tasks/${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: task.id, title: task.title });
  });

  it('PATCH /api/v1/tasks/:id updates the task', async () => {
    const user = await createUser();
    const task = await createTask(user.id);

    const res = await request(app)
      .patch(`/api/v1/tasks/${task.id}`)
      .send({ title: 'Renamed', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: task.id, title: 'Renamed', status: 'done' });
  });

  it('DELETE /api/v1/tasks/:id returns 204 and the task is gone', async () => {
    const user = await createUser();
    const task = await createTask(user.id);

    const del = await request(app).delete(`/api/v1/tasks/${task.id}`);
    const get = await request(app).get(`/api/v1/tasks/${task.id}`);

    expect(del.status).toBe(204);
    expect(get.status).toBe(404);
  });
});
EOF
```

```bash
npm test
```

A note on **agents**: `request(app)` creates a fresh client per call; `request.agent(app)` keeps
cookies (and `Set-Cookie` handling) across requests — the tool you'll want the day you add session
or API-key auth to this API. Nothing here needs it yet, but know it exists.

**What this walkthrough showed you:** every request goes through the real middleware chain —
request-ID, JSON parsing, Zod validation, routes, Prisma, error handler — and back out as the
`{ data }` / `{ data, meta }` envelope. `beforeEach(resetDb)` makes each test independent; that
independence is what makes random order safe.

### Walkthrough 4: Error paths — 400 with `details`, 404, 409, and `rejects`

**First, close the contract gap.** M08's example schema only knew about `title`/`description`/
`status`, but the M07 API contract also takes `userId` (required) and `tagIds`, and the list route
accepts `page`/`pageSize`/`sortBy`/`sortOrder`. With `.strict()` schemas, a valid request carrying
`userId` would be rejected — so update `schemas/tasks.schema.ts` to cover the full contract before
testing validation:

```bash
cat > schemas/tasks.schema.ts << 'EOF'
import { z } from "zod";

export const TaskStatusEnum = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a positive integer"),
});
export type TaskIdParams = z.infer<typeof TaskIdParamsSchema>;

export const CreateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "title is required").max(255),
    description: z.string().trim().max(1000).optional().nullable(),
    status: TaskStatusEnum.optional().default("todo"),
    userId: z.number().int().positive("userId is required and must be a positive integer"),
    tagIds: z.array(z.number().int().positive()).optional(),
  })
  .strict();
export type CreateTaskBody = z.infer<typeof CreateTaskBodySchema>;

export const UpdateTaskBodySchema = CreateTaskBodySchema
  .partial()
  .omit({ userId: true, tagIds: true })
  .strict();
export type UpdateTaskBody = z.infer<typeof UpdateTaskBodySchema>;

export const ListTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: TaskStatusEnum.optional(),
  q: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "id"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;
EOF
```

Run the gate after any schema edit:

```bash
npm run typecheck
```

> **One honest wrinkle.** M05's `ValidationError` class carries status **422**; M08's `ZodError`
> branch returns **400**. The M09 brief pins validation failures at **400 with `details`** — which
> is what you get when every request-validation failure passes through Zod. If a test reports 422,
> a hand-written `ValidationError` path is still reachable; route request validation through Zod so
> the status is uniformly 400. Assert the status your app actually returns for the path under test
> — and make it consistent.

Now the error-path tests:

```bash
cat > tests/errors.test.ts << 'EOF'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';
import { disconnectDb, resetDb } from './helpers/db.ts';
import { createTask, createUser } from './factories.ts';

describe('Validation failures: 400 with details', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('POST with an empty title returns 400 VALIDATION_ERROR with details', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: '   ', userId: user.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details[0]).toMatchObject({ path: 'title' });
    expect(typeof res.body.error.requestId).toBe('string');
  });

  it('POST without userId returns 400 with details naming userId', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'No owner' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'userId' })]),
    );
  });

  it('an invalid status filter returns 400, not a Prisma error', async () => {
    const res = await request(app).get('/api/v1/tasks').query({ status: 'not_a_status' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it.each([
    ['GET', (id: number) => `/api/v1/tasks/${id}`],
    ['PATCH', (id: number) => `/api/v1/tasks/${id}`],
    ['DELETE', (id: number) => `/api/v1/tasks/${id}`],
  ])('%s on a missing id returns 404 NOT_FOUND', async (method, pathFor) => {
    const res =
      method === 'GET'
        ? await request(app).get(pathFor(999_999))
        : method === 'PATCH'
          ? await request(app).patch(pathFor(999_999)).send({ title: 'x' })
          : await request(app).delete(pathFor(999_999));

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
    expect(typeof res.body.error.requestId).toBe('string');
  });
});

describe('Conflict: 409 on constraint violations', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('POST with a userId that does not exist returns 409 (P2003 -> CONFLICT)', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Orphan task', userId: 999_999 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'CONFLICT' });
  });

  it('the service itself rejects with the Prisma error (rejects)', async () => {
    const { createTask: create } = await import('../src/services/task.service.ts');

    await expect(
      create({
        title: 'Orphan',
        user: { connect: { id: 999_999 } },
      }),
    ).rejects.toThrow();
  });
});
EOF
```

```bash
npm test
```

Two things worth pausing on:

- **`it.each`** turned three near-identical 404 checks into one table-driven test — the pattern the
  brief asks for. The rows share the assertion; only method and path vary.
- **`rejects.toThrow()`** shows the layer underneath: the service call itself fails with a Prisma
  error, and the M07 error mapping turns `P2003` into the 409 you asserted above. You never mocked
  the database to prove it.

**What this walkthrough showed you:** every failure path speaks the M05 envelope — `code`,
  `message`, `requestId`, and `details` only on 400s — and the 409 on a unique/foreign-key
violation is real database behavior, not a hand-stubbed response.

### Walkthrough 5: Pagination, filter, sort — and middleware behaviour

A dedicated file, seeded fresh before each test so the counts are deterministic:

```bash
cat > tests/list.test.ts << 'EOF'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';
import { disconnectDb, resetDb } from './helpers/db.ts';
import { createTask, createUser, seedTasks } from './factories.ts';

describe('GET /api/v1/tasks pagination, filter, sort', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('pages through seeded tasks with correct meta', async () => {
    const user = await createUser();
    await seedTasks(user.id, 25);

    const res = await request(app)
      .get('/api/v1/tasks')
      .query({ page: 2, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta).toEqual(
      expect.objectContaining({ page: 2, pageSize: 10, total: 25, totalPages: 3 }),
    );
  });

  it('filters by status', async () => {
    const user = await createUser();
    await createTask(user.id, { title: 'Doing', status: 'in_progress' });
    await createTask(user.id, { title: 'Todo', status: 'todo' });

    const res = await request(app).get('/api/v1/tasks').query({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ title: 'Doing' });
  });

  it('filters by free-text q across title and description', async () => {
    const user = await createUser();
    await createTask(user.id, { title: 'Write release notes' });
    await createTask(user.id, { title: 'Unrelated', description: 'mentions release somewhere' });

    const res = await request(app).get('/api/v1/tasks').query({ q: 'release' });

    expect(res.body.data).toHaveLength(2);
  });

  it('sorts by title ascending', async () => {
    const user = await createUser();
    await createTask(user.id, { title: 'Charlie' });
    await createTask(user.id, { title: 'Alpha' });
    await createTask(user.id, { title: 'Bravo' });

    const res = await request(app)
      .get('/api/v1/tasks')
      .query({ sortBy: 'title', sortOrder: 'asc' });

    expect(res.body.data.map((t: { title: string }) => t.title)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  it('an unknown sortBy value falls back to the default instead of 500ing', async () => {
    const user = await createUser();
    await createTask(user.id);

    const res = await request(app).get('/api/v1/tasks').query({ sortBy: 'bogus' });

    expect(res.status).toBe(200);
  });
});
EOF
```

Now middleware behaviour, in `tests/middleware.test.ts`. Two of these need a small error-handler
fix first: **malformed JSON**. Express's body parser throws a `SyntaxError` with
`status === 400`, but M05's fallback branch turns unknown errors into a 500. Write the test, watch
it fail, then fix the handler — a mini red/green inside the walkthrough:

```bash
cat > tests/middleware.test.ts << 'EOF'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';
import { disconnectDb, resetDb } from './helpers/db.ts';
import { createUser } from './factories.ts';

describe('Middleware behaviour', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('echoes a client-provided X-Request-ID', async () => {
    const res = await request(app)
      .get('/healthz')
      .set('X-Request-ID', 'm09-test-id');

    expect(res.headers['x-request-id']).toBe('m09-test-id');
  });

  it('generates an X-Request-ID when none is provided', async () => {
    const res = await request(app).get('/healthz');

    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('an unknown route returns the 404 envelope', async () => {
    const res = await request(app).get('/api/v1/no-such-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
    expect(typeof res.body.error.requestId).toBe('string');
  });

  it('the error envelope never leaks a stack trace', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: '   ', userId: user.id });

    expect(res.status).toBe(400);
    const raw = JSON.stringify(res.body);
    expect(res.body.error).not.toHaveProperty('stack');
    expect(raw).not.toMatch(/\bat\s+\S+\s+\(.*\.ts:\d+:\d+\)/);
  });

  it('malformed JSON returns 400 with the envelope, not 500', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: expect.any(String) });
    expect(res.body.error).not.toHaveProperty('stack');
  });
});
EOF
```

```bash
npm test
```

The malformed-JSON test fails if your M05 handler falls through to its 500 branch (which is the
expected first run). Teach the handler about body-parser errors — in `src/middlewares/errorHandler.ts`,
before the generic fallback:

```bash
cat > /tmp/errorhandler-snippet.txt << 'EOF'
  // express.json() parse failures: SyntaxError with status 400
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON body',
        requestId,
      },
    });
  }
EOF
echo "Paste the block above into src/middlewares/errorHandler.ts before the generic fallback, then delete /tmp/errorhandler-snippet.txt"
```

(In your editor, place that block after the `AppError`/`ZodError`/Prisma branches and before the
final `INTERNAL_SERVER_ERROR` return.) Re-run:

```bash
npm test
```

Green. **What this walkthrough showed you:** pagination, filtering, and sorting are asserted
against real rows in a real database (25 seeded tasks, exact `meta` math); middleware —
request-ID echo and generation, the 404 handler, stack-trace hygiene, and malformed JSON — is
testable behaviour, not plumbing you have to trust.

### Walkthrough 6: TDD mini-cycle — add `PATCH /tasks/:id/complete` red → green → refactor

The contract: `PATCH /api/v1/tasks/:id/complete` marks a task `done` and returns
`{ data: task }`; a missing id returns the usual 404 envelope; calling it twice stays 200 (it's
idempotent). **The route does not exist yet.**

**RED** — write the test first and watch it fail:

```bash
cat > tests/complete.test.ts << 'EOF'
import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.ts';
import { disconnectDb, resetDb } from './helpers/db.ts';
import { createTask, createUser } from './factories.ts';

describe('PATCH /api/v1/tasks/:id/complete (added test-first)', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('marks the task done', async () => {
    const user = await createUser();
    const task = await createTask(user.id, { status: 'in_progress' });

    const res = await request(app).patch(`/api/v1/tasks/${task.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: task.id, status: 'done' });
  });

  it('returns 404 for a missing id', async () => {
    const res = await request(app).patch('/api/v1/tasks/999999/complete');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('is idempotent: completing twice still returns 200 done', async () => {
    const user = await createUser();
    const task = await createTask(user.id);

    await request(app).patch(`/api/v1/tasks/${task.id}/complete`);
    const second = await request(app).patch(`/api/v1/tasks/${task.id}/complete`);

    expect(second.status).toBe(200);
    expect(second.body.data).toMatchObject({ status: 'done' });
  });
});
EOF
```

```bash
npm test -- tests/complete.test.ts
```

Expected red: the "marks the task done" test fails (the route doesn't exist, so the request falls
through to the 404 handler — expected 200, got 404). Interesting nuance: the "missing id → 404"
test *passes right now, for the wrong reason* — it's getting the not-found handler, not your future
handler. Note that in your write-up; it's the kind of distinction TDD trains you to see.

**GREEN** — the minimum code that makes the tests pass. Add the route to
`src/routes/tasks.routes.ts` (anywhere above `export default router`):

```bash
cat > /tmp/complete-route.txt << 'EOF'
router.patch(
  '/:id/complete',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const task = await updateTask(parseId(req.params.id), { status: 'done' });
      res.json({ data: task });
    } catch (err) {
      next(err);
    }
  },
);
EOF
echo "Paste the route above into src/routes/tasks.routes.ts, then delete /tmp/complete-route.txt"
```

(Paste it after the existing `router.patch('/:id', …)` handler, and make sure `parseId` and
`updateTask` are already imported — they are, from M07.)

```bash
npm test -- tests/complete.test.ts
```

All three green: `updateTask` throws `P2025` for the missing id, M07's mapping turns that into the
404 envelope, and a second completion just writes `status: 'done'` again.

**REFACTOR** — with the safety net green, pull the intent into the service so the route stays a
translation layer. In `src/services/task.service.ts`, add:

```bash
cat > /tmp/complete-service.txt << 'EOF'
export async function completeTask(id: number) {
  return prisma.task.update({ where: { id }, data: { status: 'done' } });
}
EOF
echo "Paste completeTask into src/services/task.service.ts, then point the route's handler at it, then delete /tmp/complete-service.txt"
```

Change the route body to `const task = await completeTask(parseId(req.params.id));`, then:

```bash
npm run typecheck
npm test
```

Still green — that's the whole cycle: the test named the contract before the code existed, the
implementation grew only enough to satisfy it, and the refactor changed structure without changing
behavior. Notice what test-first changed: you wrote the *404* and *idempotency* expectations
before deciding how the handler would work, so those cases were designed in, not bolted on.

**What this walkthrough showed you:** red → green → refactor is a loop you can finish in minutes;
the failing test forced the contract (status codes, envelope, idempotency) to be decided up front.

### Walkthrough 7: Mocking at boundaries — `jest.fn`, and `jest.unstable_mockModule` in ESM

Most tests in this module mock **nothing** — that's the point of integration tests. You mock at
one place only: the boundary you can't (or don't want to) drive for real. Two ESM facts:

- `jest.spyOn(obj, 'method')` works on plain objects and class instances — but **not** on ES module
  namespace objects (they're read-only). `jest.mock` hoisting doesn't exist in ESM either: there is
  no transform hoisting pass, so you register the mock with `jest.unstable_mockModule(...)` and
  then load the module under test with a **dynamic `import()`** after registration.
- Injecting a `jest.fn()` where a collaborator is passed in (dependency injection) is the simplest
  boundary mock of all — no module mocking required.

The tasks API gives us one case that can't be provoked through HTTP naturally: `P2002` (unique
constraint) — the tasks endpoints don't write a unique column. Mock the **service boundary** and
assert the handler still produces the 409 envelope:

```bash
cat > tests/unique-conflict.test.ts << 'EOF'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Prisma } from '../generated/prisma/client.ts';

const createTaskMock = jest.fn<() => Promise<never>>();

jest.unstable_mockModule('../src/services/task.service.ts', () => ({
  listTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: createTaskMock,
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

const { default: app } = await import('../src/app.ts');
const { default: request } = await import('supertest');

describe('P2002 unique violation maps to 409 (boundary mock)', () => {
  beforeAll(() => {
    createTaskMock.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('returns the CONFLICT envelope when the service hits a unique violation', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Anything', userId: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'CONFLICT' });
  });
});
EOF
```

```bash
npm test -- tests/unique-conflict.test.ts
```

Read the top of that file slowly: the mock is registered **before** the dynamic import of the app,
so the routes pick up the mocked service; `Prisma.PrismaClientKnownRequestError` comes from your
real generated client, so the handler's `instanceof`/`err.code` check is exercised for real. (If
your generated client's constructor wants different fields, match its type — run
`npm run typecheck` and follow the error.)

**What this walkthrough showed you:** mocking is an ESM-specific skill — register with
`jest.unstable_mockModule`, import dynamically, mock only the boundary, and keep the error objects
real so the mapping you assert is the mapping you ship.

### Walkthrough 8: Coverage, `--randomize`, and GitHub Actions CI

**Coverage.** Extend `jest.config.js` (rewrite it — everything from Walkthrough 1 plus coverage):

```bash
cat > jest.config.js << 'EOF'
/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' } }],
  },
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  collectCoverageFrom: [
    'src/routes/**/*.ts',
    'src/services/**/*.ts',
    'src/middlewares/**/*.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    './src/routes/**/*.ts': { statements: 80, branches: 80, functions: 80, lines: 80 },
    './src/services/**/*.ts': { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
};
EOF
```

```bash
npm run test:coverage
```

You get a per-file table for routes, services, and middlewares plus a totals row. The thresholds
make the build **fail** when routes or services drop below 80 — coverage you can't regress is the
only coverage worth having. When a threshold fails, read the report's low-branch lines and add the
missing case (Exercise 1). And remember what the number means: lines executed, not bugs found.

**Random order.** The final gate — if the suite passes shuffled, no test secretly depends on
another's leftovers:

```bash
npm test -- --randomize
```

Run it two or three times. If it fails, something in your setup leaks between tests: rows that
aren't cleaned (fix `resetDb` order), a module-level variable, or an assumption like "the list is
empty" that only holds first. **Fix the dependency; never drop the flag.**

**CI.** One workflow file, four steps:

```bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx prisma@7 generate
      - run: npm run typecheck
      - run: npm test
EOF
```

Why each step: `npm ci` installs from the lockfile (deterministic; requires `package-lock.json`
committed); `npx prisma@7 generate` rebuilds the git-ignored generated client; `typecheck` is the
type gate Jest's transform deliberately skips; `npm test` runs the suite. `globalSetup` handles the
migrations — note that CI never has `.env.test`, which is why `setup-env.ts` defaults
`DATABASE_URL` to `file:./test.db`: the fallback you wrote in Walkthrough 2 earns its keep here.

Commit on a branch, open a PR, and watch it go green:

```bash
git checkout -b test/m09-integration-suite
git add . ':!.env.test' ':!test.db'
git status
git commit -m "test: add M09 integration suite and CI workflow"
git push -u origin test/m09-integration-suite
```

(`.env.test` and `test.db` are git-ignored — the `git add` pathspecs are belt-and-braces; confirm
with `git status` that no `.env.test` or `*.db` is staged.) Open the PR on GitHub, then add the
badge to your README, replacing `<owner>`/`<repo>`:

```markdown
[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)
```

**What this walkthrough showed you:** coverage thresholds turn a report into a gate;
`--randomize` proves your tests are independent; and CI runs exactly the local sequence
(`npm ci → generate → typecheck → test`) so "works on my machine" and "green on the PR" mean the
same thing.

## "What This Walkthrough Showed You"

- Integration tests against the **real app + real `test.db`** catch what mocks can't: SQL,
  migrations, validation wiring, and error mapping in one pass.
- The test database strategy is three files: `.env.test` (point at `test.db`),
  `global-setup.ts` (`prisma migrate deploy` once per run), and `resetDb()` in `beforeEach` in
  foreign-key-safe order — plus `--runInBand` because SQLite has one writer.
- The M05 error envelope is the assertion contract: 400 with `details`, 404, 409 (real `P2003`
  errors and a boundary-mocked `P2002`), malformed JSON as 400, and no stack traces, ever.
- Jest runs your ESM TypeScript project via `@swc/jest` while `tsc --noEmit` stays the type gate;
  the fallback ladder exists but you only climb it if the Prisma client misbehaves.
- `jest.spyOn` doesn't patch ES module namespaces; ESM module mocking is
  `jest.unstable_mockModule` + dynamic `import()`, registered **before** the module under test
  loads.
- Test-first changes the design conversation: `PATCH /tasks/:id/complete` got its 404 and
  idempotency requirements from the failing test, before any handler code existed.
- CI (`npm ci → prisma generate → typecheck → test`) plus a README badge makes the gate visible;
  `--randomize` and coverage thresholds keep it honest.

## Numbered EXERCISEs

### Exercise 1: Earn the 80% threshold
Run `npm run test:coverage`, find the routes/services lines or branches below 80%, and write the
tests that cover them (likely: `sortOrder=asc` on more fields, `description`-only updates, an
out-of-range `pageSize`). Re-run until the threshold passes — no threshold edits to make it green.

### Exercise 2: A `test.each` table for create-validation
Replace the individual POST-validation tests with one `it.each` table over invalid bodies (missing
`title`, whitespace `title`, non-string `title`, missing `userId`, non-integer `userId`, invalid
`status`), each row asserting 400 + `details[].path`.

### Exercise 3: The flaky-test drill
Deliberately write a test that depends on execution order (e.g. assert `total === 25` using rows
seeded by another test file without resetting). Run `npm test -- --randomize` until it fails, read
the failure, then fix it with `resetDb()` — and write down what the failure looked like for your
write-up's "What tripped me up".

### Exercise 4: Bad ids at the boundary
`GET /api/v1/tasks/abc` should return 400 (`parseId`/`TaskIdParamsSchema` reject non-numeric ids).
Write the test first; watch which layer catches it (Zod or `parseId`); assert the envelope.

### Exercise 5: Extend the TDD cycle
Test-first again: make `PATCH /tasks/:id/complete` also bump `updatedAt` meaningfully, and add a
`PATCH /api/v1/tasks/:id/reopen` endpoint (status back to `todo`) — red, green, refactor, in that
order, with `npm test -- --randomize` at the end.

### Exercise 6: One database file per worker
Remove `--runInBand` from the `test` script and give each worker its own database
(`file:./test.${process.env.JEST_WORKER_ID}.db` in `setup-env.ts`, migrate in `globalSetup` for
each worker). Run the suite in parallel and write one paragraph on the trade-off vs `--runInBand`.

## Self-Check

1. Why do these integration tests use a real SQLite database instead of mocking Prisma? What
   specific bug class would a mock let through?
2. What breaks if you run the suite without `beforeEach` cleanup? Without `--runInBand`?
3. Where does the type checking happen in this setup — the Jest transform or `tsc --noEmit` — and
   why are both there?
4. What is the difference between `request(app)` and `request.agent(app)`? When would you need the
   agent?
5. Your validation test expects 400 with `details`. Name everything that must be true for that
   response to happen (middleware order, error handler mapping, envelope shape).
6. Why does `jest.spyOn(someEsmModule, 'fn')` fail, and what is the ESM alternative?
7. The suite passes alone but fails with `--randomize`. What are the three classic causes of that,
   and which one does randomization expose?
8. What does an 80% coverage threshold *not* tell you about your API's correctness?

## Module Deliverable

Task API v4: **25+ integration tests covering every endpoint and error path, a passing GitHub
Actions workflow, and an 80%+ coverage report on routes and services.** The walkthroughs above
define **30 example tests** (1 smoke + 7 happy paths + 8 error paths + 10 list/middleware + 3
test-first `complete` tests + 1 boundary mock); your own suite must reach at least 25 across
endpoints *and* error paths. Verification: green CI on a PR; `npm run test:coverage` shows routes
and services at 80%+; `npm test -- --randomize` passes several runs in a row; and
`PATCH /tasks/:id/complete` exists because of a test that failed first.

## Appendix (Self-Check answers)

1. **Real DB vs mocks:** a mocked Prisma client only proves your code agrees with your mock. The
   real database is where migrations, `where` clauses, constraints (`P2002`/`P2003`), and SQLite's
   actual behaviour live — a mock would happily accept a query that fails at the SQL layer, or a
   filter that matches the wrong rows.

2. **Without cleanup / without `--runInBand`:** no `beforeEach` reset means yesterday's (and this
   run's earlier) rows leak into assertions — count and sort tests fail nondeterministically.
   Without `--runInBand`, several Jest workers write to one SQLite file; SQLite allows a single
   writer, so you get `SQLITE_BUSY` and cross-worker interference. (The alternative is one
   database file per worker via `JEST_WORKER_ID`.)

3. **Where types are checked:** `@swc/jest` only *strips* types to make the files runnable — it
   performs no checking. `tsc --noEmit` (the `typecheck` script, run locally and in CI) is the
   gate. Both exist because a fast test runner and a strict type checker are different jobs;
   conflating them either slows tests to a crawl or weakens the type checking.

4. **`request` vs `request.agent`:** `request(app)` is stateless — no cookies carried between
   calls. `request.agent(app)` keeps a cookie jar across requests, which you need as soon as the
   API has session or API-key auth (login once, then call endpoints as that identity).

5. **The 400-with-details chain:** `express.json()` parsed the body → the Zod `validate`
   middleware ran on that route (so the failure is a `ZodError`, not a hand-thrown error) → the
   central error handler mapped `ZodError.issues` to `details`, set `code: 'VALIDATION_ERROR'`,
   included the `requestId` from the request-ID middleware, and returned status 400 — with
   `details` present *only* on this validation error class.

6. **`spyOn` on ESM:** ES module namespace objects are read-only bindings — there's no mutable
   property to replace, so `jest.spyOn` throws. The ESM route is `jest.unstable_mockModule(specifier,
   factory)` called **before** a dynamic `import()` of the module under test, so it receives the
   mocked bindings.

7. **Three causes:** shared state (uncleaned rows/variables), time (tests that depend on "now"),
   and ordering (test B assumes test A's leftovers or empty slate). `--randomize` specifically
   shuffles execution order, so it exposes the ordering class immediately — and often shared state
   that only happened to be masked by the default order.

8. **What 80% doesn't tell you:** it counts lines executed, not assertions meaningful — a line
   covered by a test that asserts nothing still counts. It says nothing about edge cases never
   imagined (concurrent writes, huge payloads), about security, or about whether the right branch
   was taken. It's a gap-detector: read *which* lines are uncovered, don't worship the number.
