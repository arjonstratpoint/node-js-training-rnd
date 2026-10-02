# Node.js Developer Training Program — Detailed Curriculum

Consolidated from `docs/arch-docs/Node.js Developer Training Program — Solution Design.md`,
`docs/prd/nodejs-developer-training.md`, `docs/build-to-teach-framework.md`, and the ten stage
briefs under `modules/`. Where `modules/` and the Solution Design diverge, `modules/` wins — it
reflects decisions resolved after the Solution Design was written (Node version, the error
envelope, the capstone's Security & Authorization requirement, remediation policy). This document
is a reference for trainers and program owners; it is not the trainee-facing guide — that's
`modules/README.md` and each stage's `brief.md`, which deliberately omit solutions.

## 1. Program overview

| | |
| --- | --- |
| Duration | 4 weeks · 10 modules · ~80 hours |
| Pace | ~4 hours/day, 5 days/week. Suggested daily rhythm: 1.5 hrs guided instruction, 2 hrs lab, 0.5 hr review and Q&A |
| Format | Trainer-led cohort, pair work, peer review |
| Final outcome | Build, validate, test, and version-control a typed REST API — Express, Prisma, SQLite, Zod, Jest, Supertest — via a GitHub pull-request workflow |
| Cadence | A pass/fail Friday gate at the end of M3, M5, M8, and the M10 capstone demo |
| Framework | Build-to-Teach: the trainee builds each stage's deliverable *and* writes it up as they go — no solutions are provided. The trainer reviews the build and the write-up together at each checkpoint, not just the finished product |

One running project — the **Task API** — is built in M5 and extended through M7, M8, and M9 (v1 →
v4). The capstone (M10) repeats the whole pattern alone, in a new domain, with no reference
solution to copy from.

## 2. Audience and prerequisites

Developers who already know basic programming concepts but are new to Node.js. The program assumes
nothing more than that: Git, modern JavaScript, TypeScript, and SQL are all taught from first
principles, in M1, M2, M4, and M6 respectively.

- A free GitHub account.
- A machine (Windows, macOS, or Linux) able to install native developer build tools.
- A cohort of at least two trainees — the M1 lab and the capstone both require pairing or peer
  review.

## 3. Learning outcomes (competencies)

By the end of the program, a trainee can evidence all ten of these:

| # | Competency | Taught in | Evidenced by |
| --- | --- | --- | --- |
| 1 | Explain the event loop and write correct async/await, including parallel work and error handling | M2 | M2 checkpoint |
| 2 | Structure a Node.js project with ES modules and manage dependencies with npm safely | M3 | M3 checkpoint (Week 1 Friday gate) |
| 3 | Build a REST API in Express 5 with routers, middleware, and a central error handler | M5 | M5 checkpoint (Week 2 Friday gate) |
| 4 | Write strict TypeScript and derive types from Zod schemas and Prisma models | M4, M7, M8 | M4/M8 checkpoints |
| 5 | Design a small relational schema and write joins, aggregates, and transactions in SQL | M6 | M6 checkpoint |
| 6 | Create, edit, and apply Prisma migrations, and explain `migrate dev` vs `migrate deploy` | M7 | M7 checkpoint |
| 7 | Validate all untrusted input with Zod and return consistent 400 responses | M8 | M8 checkpoint (Week 3 Friday gate) |
| 8 | Write isolated integration tests with Jest and Supertest against a real test database | M9 | M9 checkpoint |
| 9 | Work in a GitHub pull-request workflow with CI | M1, M9, M10 | PR history throughout; green CI in M9/M10 |
| 10 | Explain what changes when moving from SQLite to PostgreSQL or MongoDB | M7 (concept only) | No dedicated checkpoint — concept-level only |

## 4. Technology stack (pinned for the whole cohort)

| Layer | Technology | Notes |
| --- | --- | --- |
| Runtime | **Node.js 24 LTS** | Resolved over Node 26 — see M04. `.nvmrc` pinned; `@types/node@24` |
| Language | JavaScript (ES2023–ES2025), then TypeScript 7.0 | Plain JS in Week 1; TypeScript from M4 onward |
| Web framework | Express 5.x | Rejected promises in async handlers auto-forward to the error handler |
| Data access | Prisma ORM, **always `@7`**, never unversioned | An unversioned `prisma`/`npx prisma` install may resolve to Prisma 8, which does not read `schema.prisma` for this stack |
| Database | SQLite via `better-sqlite3` + the Prisma driver adapter | The only database touched hands-on. PostgreSQL/MongoDB are concept-only (M7) |
| Validation | Zod 4.x | Request contract; Prisma types are the persistence contract |
| Test runner | Jest 30.x, `@swc/jest` | ESM mode; fallback order defined in M09 if `@swc/jest` fails |
| HTTP testing | Supertest 7.x | Calls the exported app directly — no port needed |
| Dev runner | `tsx` | Used by `dev`/`start` scripts |
| API client | Bruno | Plain-text collections, committed to `bruno/` |
| Source control | Git, GitHub, GitHub Actions | Public training repos (resolved — see M01) |

**Ground rules:** free tools only, no Docker, no paid licences.

## 5. Program structure

| Week | Theme | Modules | Hours | Friday gate |
| --- | --- | --- | --- | --- |
| 1 | Foundations | M1 · M2 · M3 | 4 + 10 + 6 = 20 | End of M3 |
| 2 | Typed API | M4 · M5 | 8 + 12 = 20 | End of M5 |
| 3 | Data & validation | M6 · M7 · M8 | 6 + 8 + 6 = 20 | End of M8 |
| 4 | Testing & capstone | M9 · M10 | 8 + 12 = 20 | End of M10 (final) |

Total: 80 hours across 10 modules.

## 6. Module-by-module curriculum

Each module below mirrors its `brief.md` (the trainee-facing source of truth) — objective, full
topic scope, stack constraints, lab deliverable, and definition of done. "Resolved" items are
decisions this program has fixed program-wide (not left to trainee or trainer discretion).

### M01 — Dev Environment, Git & GitHub
**Week 1 · Day 1 · 4 hrs · Builds on:** none (first stage)

- **Objective:** Set up the toolchain, use the everyday Git workflow, and collaborate through
  GitHub pull requests.
- **Scope:** Toolchain (VS Code, Git, Node version manager, `.nvmrc`, Bruno, terminal basics); the
  Git mental model (`init`/`clone`/`status`/`add`/`commit`/`log`/`diff`/`restore`/`stash`, `revert`
  vs `reset`); branching/merging/conflict resolution, merge vs rebase (conceptual); `.gitignore`
  conventions and `.env.example` instead of committing secrets; GitHub (remotes, auth, Issues, PRs,
  review comments, GitHub Flow, Conventional Commits, README basics).
- **Deliverable:** Public repo with a `hello-node` script; branch → PR → peer review → merge; pair
  up to resolve a deliberately created merge conflict.
- **Definition of done:** Merged PR with 3+ Conventional Commits; `.gitignore` and `.env.example`
  present; can narrate `git revert` vs `git reset` unaided.
- **Resolved:** Public training repos, program-wide (avoids branch-protection-plan dependency).

### M02 — Modern JavaScript & Async/Await
**Week 1 · Days 2-4 · 10 hrs · Builds on:** M01

- **Objective:** Write idiomatic modern JavaScript, explain the event loop conceptually, and write
  reliable asynchronous code.
- **Scope — language essentials:** `const`/`let`/closures/arrow functions/`this`/template literals;
  destructuring, spread/rest, default params, `?.`, `??`/`??=`, truthy/falsy/equality pitfalls;
  array methods (`map`/`filter`/`reduce`/`find`/`some`/`every`/`flatMap`, `toSorted`/`toReversed`/
  `with`, `structuredClone`, `Object.groupBy`/`Map.groupBy`); `Map`/`Set` incl. newer `Set` methods,
  classes with `#private` fields; `try/catch/finally`, custom error classes, `Error` `cause`; ES
  module named vs default exports.
- **Scope — async:** call stack/event loop/task vs microtask queue; callbacks → Promises →
  async/await; `Promise.all`/`allSettled`/`race`/`any`; `Promise.withResolvers`, `Promise.try`,
  async iteration; `AbortController`/`AbortSignal.timeout`; `fetch`+JSON; pitfalls (forgotten
  `await`, `await` in loops, `forEach(async …)`, unhandled rejections); Temporal (awareness only).
- **Deliverable:** "Async toolkit" ES module — `sleep`, `retry(fn, {retries, delayMs})`,
  `withTimeout(promise, ms)`, `mapLimit(items, limit, fn)`, each with `node:assert` self-checks.
  Fetch sequentially vs in parallel and compare timings; refactor callback-style `node:fs` to
  promises/async-await.
- **Definition of done:** All self-checks pass; can predict/explain `setTimeout`/promise/`await`
  output ordering; timing comparison shows parallel beating sequential, with explanation.
- **Resolved:** Public API for the timing exercise is [JSONPlaceholder](https://jsonplaceholder.typicode.com).

### M03 — Node.js Runtime & npm
**Week 1 · Days 4-5 · 6 hrs · Builds on:** M02 · **Week 1 Friday gate**

- **Objective:** Explain what Node.js is and how it runs code, use core modules, and manage
  dependencies safely with npm.
- **Scope:** V8+libuv+core APIs, event loop/thread pool, blocking vs non-blocking; ESM vs CommonJS,
  `"type": "module"`, `import.meta.*`, `node:` prefix; core APIs (`node:fs/promises`, `node:path`,
  `node:os`, `node:events`, `node:stream`, `node:http`, `node:crypto`, `node:timers/promises`,
  `node:util`); `process` (argv/env/exit codes/signals); env vars, `.env`, `node --env-file`/
  `--watch`/`--run`; globals (`fetch`/`URL`/`AbortController`/`structuredClone`); npm fundamentals
  (`package.json`, semver, lockfile, `install` vs `ci`, scripts, `npx`, `engines`, `npm audit`);
  supply-chain hygiene; debugging (`console`, `node --inspect`, stack traces); awareness only:
  `node:test`/`node:sqlite` exist but aren't used (this course uses Jest/Prisma).
- **Deliverable:** A `log-report` CLI streaming a large log file, aggregating counts via `parseArgs`,
  writing a JSON report; a bare `node:http` server with 3 JSON endpoints, manual routing/body
  parsing (deliberately painful, to motivate Express).
- **Definition of done:** Both programs merged via PR; CLI genuinely streams (no full in-memory
  load); can explain what Express specifically removes pain from.
- **Resolved:** Input file is a synthetic ~100MB newline-delimited log file, trainer-provided.

### M04 — TypeScript Basics & TypeScript on Node.js
**Week 2 · Days 1-2 · 8 hrs · Builds on:** M02, M03

- **Objective:** Read and write strict TypeScript, and set up a TypeScript project that runs and
  type-checks on Node.js.
- **Scope — core TypeScript:** why TypeScript, structural typing, inference vs annotation;
  primitives/arrays/tuples/unions/intersections/literal types/`as const`; `type` vs `interface`,
  optional/`readonly`, unions instead of `enum`; functions and generics; narrowing (`typeof`/`in`/
  discriminated unions/type guards); `unknown` vs `any` vs `never`; utility types (`Partial`,
  `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`, `Awaited`); `satisfies`,
  `import type`.
- **Scope — TypeScript on Node.js:** project setup (TS7, `@types/node`); `tsconfig.json`
  essentials (`strict`, `nodenext`, `verbatimModuleSyntax`, `erasableSyntaxOnly`,
  `noUncheckedIndexedAccess`); three ways to run TS (`tsx`, native type stripping, `tsc` build);
  `tsc --noEmit` as the type-check gate; typing async code/errors/`process.env`; TS 6→7 changes.
- **Deliverable:** Port the M02 toolkit to TypeScript with generics (`retry<T>`, `mapLimit<T, R>`);
  model the Task domain (`Task`, `CreateTaskInput`, `UpdateTaskInput` via utility types) plus a
  discriminated-union `Result<T, E>`; run via `tsx`, attempt via native type stripping.
- **Definition of done:** Zero `tsc --noEmit` errors on strict config; can explain `unknown` vs
  `any` and `type` vs `interface`; toolkit runs via `tsx`; native type stripping attempted on Node 24
  and documented (awareness-level, not a hard requirement at this Node version).
- **Resolved:** **This cohort runs Node 24 LTS**, not 26 — native type stripping is only fully
  stable on 26; moving to 26 happens only after a full dry run in a future cohort.

### M05 — Express: Routing, Middleware & Error Handling
**Week 2 · Days 3-5 · 12 hrs · Builds on:** M04 · **Week 2 Friday gate** · *Task API v1 starts here*

- **Objective:** Build a well-structured REST API with Express 5 in TypeScript, with a consistent
  error model.
- **Scope:** HTTP/REST refresher (methods, status codes, idempotency, `/api/v1` versioning,
  pagination); TS setup (`app.ts` exports the app with no `listen`, separate `server.ts`; typed
  handlers); routing (`Router()`, route params/query, route modules); Express 5 breaking changes
  (auto-forwarded rejected promises, new path syntax, `req.body` undefined without a parser,
  read-only `req.query`); middleware (pipeline order, `next()`/`next(err)`, built-ins, third-party —
  `cors`/`helmet`/`morgan`); error handling (operational vs programmer errors, 4-arg error
  middleware, `AppError` hierarchy, one central handler, no stack traces in prod); operations
  (env config, graceful shutdown, health endpoint, CORS); Bruno collections/environments/assertions.
- **Deliverable (Task API v1):** In-memory store; `GET/POST /api/v1/tasks`,
  `GET/PATCH/DELETE /api/v1/tasks/:id`; request-ID + logging middleware; central error handler;
  **hand-written validation** (deliberately, so M08's Zod payoff lands); committed Bruno collection.
- **Definition of done:** v1 merged by PR; every error path returns the fixed envelope (below);
  Bruno collection passes; can explain why Express 5 needs no try/catch wrapper on async handlers.
- **Resolved — the Task API contract (fixed for the whole program, M05 through the capstone):**
  - **Error envelope**, used by every endpoint:
    ```json
    { "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed",
      "details": [{ "path": "title", "message": "Required" }], "requestId": "<from request-ID middleware>" } }
    ```
    `details` appears only on validation errors; `code` is a stable per-error-type string the
    trainee defines.
  - **Task fields/API scope:** `tasks` is the only resource exposed through the API (v1-v4):
    `id`, `title`, `description` (optional), `status` (`"todo" | "in_progress" | "done"`). `users`
    and `tags`/`task_tags` exist in the relational schema (M06, for real 1:N/M:N practice) but are
    **not** given their own routes — tags are a nested field on the task endpoints once Prisma
    lands (M07); exposing them as full resources is an optional stretch goal only.

### M06 — SQL Fundamentals with SQLite
**Week 3 · Days 1-2 · 6 hrs · Builds on:** M05

- **Objective:** Design a small relational schema and write the SQL to query it, before an ORM
  hides it.
- **Scope:** relational model (tables/rows/PK/FK); SQLite specifics (single-file, dynamic typing,
  `PRAGMA foreign_keys`); DDL (`CREATE`/`ALTER`/`DROP`, constraints); DML (`INSERT`/`SELECT`/
  `UPDATE`/`DELETE`, filtering/sorting/`LIMIT`/`OFFSET`, keyset pagination); aggregates
  (`GROUP BY`/`HAVING`), `INNER`/`LEFT` joins, subqueries; relationships (1:1/1:N/M:N + junction
  table), normalisation (1NF-3NF); indexes, `EXPLAIN QUERY PLAN`, transactions/ACID; SQL injection
  and parameterised queries; documenting an ERD with Mermaid.
- **Deliverable:** Design the Task API schema (`users`, `tasks`, `tags`, `task_tags`); create+seed
  with SQL; 20+ graded query exercises; Mermaid ERD; SQL-injection demo then fix with parameters.
- **Definition of done:** 20+ exercises covering filtering/sorting/pagination, joins, aggregates,
  ≥1 subquery; can explain PK vs FK, what an index is for, 1:N vs M:N; injection demo succeeds then
  is blocked; ERD matches the real schema.
- **Resolved:** No shared exercise bank exists — trainees write their own 20+ exercises against
  their own schema; trainer spot-checks at the checkpoint. (SQL transactions are taught here but
  not forced by an exercise — they're required for real in the M10 capstone's business rule.)

### M07 — Prisma ORM & Migrations
**Week 3 · Days 2-4 · 8 hrs · Builds on:** M05, M06 · *Task API v2*

- **Objective:** Model data with Prisma 7, evolve the schema safely with migrations, and use the
  typed client in the Express API.
- **Scope:** what an ORM is and its trade-offs; setup (`prisma@7`, `@prisma/client@7`,
  `better-sqlite3` driver adapter, `prisma init`, generated client git-ignored → `prisma generate`
  explicit); schema language (models, `@id`/`@default`/`@unique`/`@@index`/`@updatedAt`, relations,
  `onDelete`); migrations (`migrate dev`/`--create-only`/`migrate status`/`migrate deploy`/
  `migrate reset`/`db push`, never editing an applied migration); Prisma Client (singleton, CRUD,
  `where` operators, `orderBy`, `skip`/`take`, `select`/`include`, nested writes, `$transaction`,
  `$queryRaw`); error codes `P2002`/`P2025`/`P2003` mapped to 409/404/409-or-400; TypeScript with
  Prisma (generated types, `satisfies`); seeding, Prisma Studio; concept-only: PostgreSQL/MongoDB/
  Prisma 8 differences.
- **Deliverable (Task API v2):** Translate the M06 schema into Prisma; ≥2 migrations (initial +
  an added column) plus one hand-edited via `--create-only`; service layer replacing the in-memory
  store; list endpoint with `status`/`q` filters, sorting, `page`/`pageSize` pagination returning
  `{ data, meta }`; seed script; Prisma errors mapped into the existing M05 error handler.
- **Definition of done:** `migrate reset` + seed rebuilds the DB every time; Bruno collection still
  green; can explain `migrate dev` vs `migrate deploy`; `P2002`/`P2025`/`P2003` map correctly;
  `package.json` locks `prisma`/`@prisma/client` to `^7`, every one-off command uses `npx prisma@7`.

### M08 — Zod Validation & Type Inference
**Week 3 · Days 4-5 · 6 hrs · Builds on:** M07 · **Week 3 Friday gate** · *Task API v3*

- **Objective:** Validate all untrusted input at runtime with Zod 4, and derive TypeScript types
  from the same schemas.
- **Scope:** why runtime validation (types vanish at runtime); Zod 4 basics (primitives, string
  formats, `z.object`/`z.strictObject`, unions/discriminated unions, `z.coerce.number()`); parsing
  (`parse` vs `safeParse`, `z.flattenError`/`z.treeifyError`/`z.prettifyError`); refinements/
  transforms (`.refine`, `.transform`); type inference (`z.infer`/`z.input`/`z.output`, deriving
  schemas with `.pick`/`.omit`/`.partial`/`.extend`); Zod+Express (typed `validate` middleware,
  working around read-only `req.query`, `ZodError` → 400 with `details`); Zod+Prisma (Zod is the
  request contract, Prisma is the persistence contract, never pass raw `req.body` to Prisma);
  validating `process.env` at startup; awareness only: Zod Mini, `z.toJSONSchema`.
  - **Deliverable (Task API v3):** Replace all hand-written validation with Zod — schemas for
  create/update/list query/params; typed `validate` middleware; env validation; 400 payloads using
  the M05 error envelope; `tsc --noEmit` proves handler types come from `z.infer`.
- **Definition of done:** v3 merged by PR; no manual `if (!body.title)` checks remain; invalid
  input never reaches Prisma; 400 responses carry `details` in the exact M05 envelope shape (the
  shape itself never changes, Zod's output just maps into it).

### M09 — Integration Testing with Jest + Supertest
**Week 4 · Days 1-2 · 8 hrs · Builds on:** M08 · *Task API v4*

- **Objective:** Write reliable, isolated integration tests exercising the real Express app and a
  real SQLite database.
- **Scope:** testing strategy (pyramid, why real DB not mocks); Jest 30 basics (`describe`/`it`/
  `expect`, `beforeAll`/`afterEach`, `test.each`, matchers, Arrange-Act-Assert); setup for TS7+ESM
  (`@swc/jest` transform + `tsc --noEmit` separately, ESM-mode Jest invocation); Supertest
  (`request(app)`, no port needed); test database strategy (separate `test.db`, `globalSetup` runs
  `prisma migrate deploy`, FK-safe `beforeEach` cleanup, `--runInBand`); coverage, flaky tests,
  mocking only at boundaries; TDD mini-cycle adding `PATCH /tasks/:id/complete`; CI (GitHub Actions:
  `npm ci` → `prisma generate` → `typecheck` → `test`).
- **Deliverable (Task API v4):** ≥25 integration tests covering all endpoints/error paths; passing
  GitHub Actions workflow; coverage report.
- **Definition of done:** Green CI on a PR; ≥80% coverage on routes/services; suite passes with
  `--randomize`; `PATCH /tasks/:id/complete` added test-first (red → green → refactor).
- **Resolved — toolchain fallback order** if `@swc/jest` doesn't cooperate with the Prisma-generated
  client in ESM mode: (1) `ts-jest` with its TS7 side-by-side setup, (2) pin TypeScript 6 for the
  test toolchain only, (3) compile as CommonJS by dropping `"type": "module"`.

### M10 — Capstone Project
**Week 4 · Days 3-5 · 12 hrs · Builds on:** M01-M09 · **Final Friday gate**

- **Objective:** Independently build, test, and present a complete API in a new domain, using the
  whole stack, with no reference solution to copy from.
- **Domain (choose one), each with a suggested role pairing:** Library/Bookshelf (member vs
  librarian) · Expense Tracker (regular user vs admin) · Event RSVP (attendee vs organizer) ·
  Support Tickets (requester vs agent) · Recipe Book (contributor vs admin).
- **Scope — mostly a synthesis of M01-M09, plus two things that genuinely go beyond them:**
  - **Real authentication and authorization** (every prior module used, at most, a simple API-key
    middleware): registration/login with hashed passwords (bcrypt or argon2, trainee's choice,
    justified); JWT or signed session required on protected routes; ≥2 roles with ≥1 endpoint whose
    behavior genuinely differs by role; rate-limiting on the login/registration endpoints; the
    signing secret validated via the M08 `config.ts` fail-fast pattern, never hard-coded/committed.
  - **Proving a transaction actually prevents a race** — the required business-rule transaction must
    be demonstrated under concurrent load (a script firing parallel requests at the contested
    resource), not just shown to exist in the code.
  - *Rationale:* AI coding assistants make the CRUD+Prisma+Zod+tests work from M05-M09 fast to
    produce; the auth design and a correctness claim provable under load are what's harder to
    shortcut, so the capstone now weights those more heavily.
- **Schedule:** Day 3 — Issues, schema/ERD, first migrations, skeleton. Day 4 — routes, validation,
  error handling, auth, tests. Day 5 — polish, peer review, 10-minute demo + Q&A.
- **Rubric (100 points, 70+ passes):**

  | Criterion | Points | Must-have evidence |
  | --- | --- | --- |
  | Functionality and business rule | 15 | ≥3 models incl. 1:N and M:N. Full CRUD for ≥2 resources. One filtered/sorted/paginated list endpoint. One business rule enforced in a service, inside a transaction, **demonstrated under concurrent load** |
  | Testing quality and coverage | 15 | ≥25 integration tests incl. error paths and ≥1 test for the role-gated endpoint. ≥80% coverage on routes/services |
  | Validation and error handling | 10 | Zod for body/params/query/env. Central error handler, one consistent shape |
  | **Security & Authorization** | **15** | Hashed-password registration/login. JWT/session on protected routes. ≥2 roles with ≥1 differing endpoint. Rate-limiting on auth endpoints |
  | Data layer and migrations | 15 | ≥3 committed Prisma migrations and a seed script |
  | TypeScript quality | 10 | Strict mode, zero `tsc --noEmit` errors |
  | Git/GitHub workflow and CI | 10 | Issues → branches → ≥8 PRs. Conventional Commits. ≥1 peer review given and received. CI passing |
  | Documentation and demo | 10 | README (setup, scripts, Mermaid ERD, endpoint list) + committed Bruno collection. 10-minute demo + Q&A |

- **Resolved — pass rule:** the must-have evidence column is a gate *in addition to* the 70-point
  threshold — a 70+ score does not pass if a must-have (e.g. the transaction proof, the 25+ tests,
  the 3+ migrations) is simply missing.
- **Resolved — remediation (default policy, program owner may override):** a failed Friday gate
  (M03/M05/M08) gets one business day to close the specific gap, then a re-demo of just that gap,
  without blocking attendance at the next module. A capstone under 70 gets up to 3 additional
  business days to address the Day-5-review gaps, then **one** re-grade — no second re-grade without
  program-owner sign-off.

## 7. Assessment model

Three layers:

1. **Module checkpoint** — end of every module, against that module's own Definition of done.
2. **Weekly Friday gate** — pass/fail at the end of M3, M5, M8, and the M10 capstone demo.
3. **Capstone rubric** — 100 points, 70+ passes, with the must-have gate above.

A gate not yet passed is raised with the trainer before moving on — trainees do not self-advance
past one.

## 8. Environment and tooling setup

**Learner toolchain:** VS Code, Git, Bruno, terminal basics; Node via a version manager (nvm/fnm/
nvm-windows/Volta), pinned by `.nvmrc`; GitHub auth (CLI, credential manager, or SSH); `sqlite3` CLI
or DB Browser for SQLite (optional); Prisma Studio.

**Repository conventions:** public training repos; `.gitignore` covers `node_modules`, `.env`,
`*.db`, the generated Prisma client, `dist`, `coverage`; commit `.env.example`, never `.env`/
`.env.test`; validate env vars once at startup in `config.ts` and fail fast.

**Known environment hazards:**

| Hazard | Mitigation |
| --- | --- |
| `better-sqlite3` is a native module and fails to install without build tools | Install build tools first (Windows build tools / Xcode CLT / build-essential). Fallback: `@prisma/adapter-libsql` |
| The generated Prisma client is git-ignored project code | Run `prisma generate` after install, after every schema change, and in CI |
| An unversioned `npx prisma` installs the Prisma 8 CLI, which doesn't read `schema.prisma` | Lock `prisma`/`@prisma/client` to `^7`, use `npx prisma@7`, hand out `/v7/` docs |
| Generated Prisma imports may not match the chosen import-extension convention | Set the generator's `importFileExtension` to match |

**Standard npm scripts:** `dev` (`tsx watch src/server.ts`), `start` (`tsx src/server.ts`),
`typecheck` (`tsc --noEmit`), `db:migrate`/`db:deploy`/`db:generate`/`db:seed`, `test`
(`node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand`).

## 9. Delivery model and roles

| Role | Responsibilities |
| --- | --- |
| Trainer | Pre-flight checklist before every cohort; ~1.5 hrs/day guided instruction; supports labs and review/Q&A |
| Trainee | Completes labs and PRs, gives/receives peer reviews, builds the capstone independently, presents the demo |
| Peer reviewer | Reviews another trainee's PR — pair review in M1, ≥1 given/received in the capstone |
| Program owner | Signs off open decisions, approves version pins per cohort, owns the pass/remediation policy |

**Trainer pre-flight (before every cohort):** check version drift against the pinned stack table;
confirm Prisma stays on `^7`; test `better-sqlite3` installs on every OS in the cohort; decide
Node 24 vs 26 and run every lab on it; confirm the `@swc/jest` + Prisma-generated-client ESM setup
works (or note which fallback is needed); check lab solutions for removed Express 4 patterns.

## 10. Sources

- `docs/arch-docs/Node.js Developer Training Program — Solution Design.md`
- `docs/prd/nodejs-developer-training.md`
- `docs/build-to-teach-framework.md`
- `modules/README.md` and each `modules/m0X-*/brief.md`

Official references (from the Solution Design's Appendix D / Sources): [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) · [Node.js API docs](https://nodejs.org/docs/latest/api/) · [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5.html) · [TypeScript docs](https://www.typescriptlang.org/docs/) · [SQLite SQL reference](https://www.sqlite.org/lang.html) · [Prisma ORM 7 docs](https://www.prisma.io/docs/orm/v7) · [Zod](https://zod.dev) · [Jest](https://jestjs.io/docs/getting-started) · [Supertest](https://www.npmjs.com/package/supertest) · [Bruno](https://docs.usebruno.com) · [Pro Git](https://git-scm.com/book) · [GitHub Docs](https://docs.github.com/en/get-started)
