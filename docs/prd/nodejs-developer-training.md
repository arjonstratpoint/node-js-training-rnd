# Node.js Developer Training: Beginner to Intermediate

| | |
|---|---|
| **Duration** | 4 weeks · 10 modules · ~80 hours (about 4 hrs/day, 5 days/week) |
| **Audience** | Developers new to Node.js who already know basic programming concepts |
| **Final outcome** | Build, validate, test, and version-control a typed REST API with Express, Prisma, SQLite, Zod, Jest, and Supertest, using a GitHub pull-request workflow |
| **Versions verified** | 2 October 2026. Re-check before each cohort (see Appendix A) |

---

## 1. Ground rules

- **Free tools only.** No paid licences and **no Docker**.
- **SQLite is the only database used hands-on.** PostgreSQL and MongoDB are covered conceptually in Module 7 (no labs).
- **Bruno** for manual API testing. Collections are plain-text files committed to the repo.
- **JavaScript first, TypeScript from Week 2.** Week 1 is plain modern JavaScript; everything after Module 4 is TypeScript.
- **One running project.** The **Task API** is built in Module 5 and extended in Modules 7, 8, and 9. The capstone (Module 10) is a different domain, built independently.
- **Daily rhythm (suggested):** 1.5 hrs guided instruction, 2 hrs lab, 0.5 hr review and Q&A.

---

## 2. Program at a glance

| Week | Theme | Modules | Hours | Friday checkpoint |
|---|---|---|---|---|
| 1 | Foundations | M1 Dev Environment, Git & GitHub · M2 Modern JavaScript & Async/Await · M3 Node.js Runtime & npm | 4 + 10 + 6 | Node CLI + bare HTTP server, merged via pull request |
| 2 | Typed API | M4 TypeScript Basics & TypeScript on Node.js · M5 Express: Routing, Middleware & Error Handling | 8 + 12 | Task API v1 (in-memory) with Bruno collection |
| 3 | Data & validation | M6 SQL Fundamentals with SQLite · M7 Prisma ORM & Migrations · M8 Zod Validation & Type Inference | 6 + 8 + 6 | Task API v3 (Prisma + Zod) |
| 4 | Testing & capstone | M9 Integration Testing with Jest + Supertest · M10 Capstone Project | 8 + 12 | Tested capstone demo |

---

## 3. Tech stack and versions (as of 2 October 2026)

| Technology | Version to teach | Notes |
|---|---|---|
| JavaScript | Modern ECMAScript (ES2023–ES2025 features) | All features taught run natively on Node 24+ |
| Node.js | **24 LTS** today; **26** once promoted to LTS (October 2026) | Pick one for the whole cohort and pin it in `.nvmrc`. Node 26 adds stable TypeScript type stripping and Temporal on by default |
| Express | **5.x** | `npm i express@5`. Express 5 is the npm `latest` release |
| TypeScript | **7.0** (native Go compiler, GA 8 July 2026) | 6.0 was the last JavaScript-based release. TS 7 has no stable programmatic API yet, so tools that embed the compiler need workarounds (see M9) |
| Prisma ORM | **7.x** (7.10 at time of writing), **pinned** | Do **not** use Prisma 8 for this curriculum (see warning below) |
| SQLite | Bundled via `better-sqlite3` through the Prisma driver adapter | Free; single-file database |
| Zod | **4.x** | `npm i zod@4` |
| Jest | **30.x** | |
| Supertest | **7.x** | |
| Git + GitHub | Current Git 2.x; free GitHub account | |

**Supporting tools (all free):** VS Code, a Node version manager (nvm / fnm / nvm-windows / Volta), `tsx` (TypeScript dev runner), `@swc/jest` + `@swc/core` (Jest transform), Bruno, Prisma Studio, and optionally DB Browser for SQLite.

> **Prisma warning.** Prisma ORM 8 is currently a release candidate (GA expected October 2026), its SQLite library is experimental, and an unversioned `npm install prisma` / `npx prisma` now installs the Prisma 8 CLI, which does **not** read `schema.prisma`. Always install `prisma@7` and `@prisma/client@7`, lock both to `^7` in `package.json`, and use `npx prisma@7` for one-off commands. The Prisma docs now default to version 8, so give trainees the `/v7/` documentation URLs (Appendix D).

---

## 4. Coverage map: requested topic → module

| Requested topic | Module(s) |
|---|---|
| Modern JavaScript and async/await | M2 |
| Node.js runtime and npm | M3 |
| Express routing, middleware, error handling | M5 |
| SQL and Prisma ORM with migrations | M6, M7 |
| Integration testing with Jest + Supertest | M9 |
| TypeScript basics | M4 |
| TypeScript for Node.js | M4, M5 |
| TypeScript with Prisma | M7 |
| TypeScript with Zod; Zod validation with type inference | M8 |
| Git + GitHub | M1 (used in every module; formalised in M9 CI and M10) |

---

## 5. Modules

### Module 1: Dev Environment, Git & GitHub
**Week 1 · Day 1 · 4 hours**

**Objectives.** Set up the toolchain, use the everyday Git workflow, and collaborate through GitHub pull requests.

**Topics**
- Toolchain: VS Code, Git, Node via a version manager, `.nvmrc`, Bruno, terminal basics.
- Git mental model: working tree → staging → commits. `init`, `clone`, `status`, `add`, `commit`, `log`, `diff`, `restore`, `stash`; `revert` vs `reset`.
- Branching and merging, resolving conflicts, merge vs rebase (conceptual).
- `.gitignore` for Node projects (`node_modules`, `.env`, `*.db`, generated Prisma client, `dist`, `coverage`). Never commit secrets; commit a `.env.example` instead.
- GitHub: remotes, authentication (GitHub CLI, credential manager, or SSH), Issues, pull requests, review comments, GitHub Flow, Conventional Commits, README basics.

**Lab.** Create a public repo, add a `hello-node` script, then branch → PR → peer review → merge. Pair up and resolve a deliberately created merge conflict.

**Checkpoint.** A merged PR with at least 3 conventional commits; `.gitignore` and `.env.example` present.

> Branch protection availability on private repos depends on the GitHub plan. Use public training repos or agree on a "no direct pushes to `main`" convention.

---

### Module 2: Modern JavaScript & Async/Await
**Week 1 · Days 2–4 · 10 hours**

**Objectives.** Write idiomatic modern JavaScript, explain the event loop at a conceptual level, and write reliable asynchronous code.

**Topics: language essentials (4 hrs)**
- `const`/`let`, scope, closures, arrow functions and `this`, template literals.
- Destructuring, spread/rest, default parameters, optional chaining `?.`, nullish coalescing `??` and `??=`, truthy/falsy and equality pitfalls.
- Array methods: `map`, `filter`, `reduce`, `find`, `some`, `every`, `flatMap`; non-mutating helpers `toSorted`, `toReversed`, `with`; `structuredClone`; `Object.groupBy` / `Map.groupBy`.
- `Map` and `Set` (including the newer Set methods), classes with `#private` fields, getters/setters.
- Errors: `try/catch/finally`, custom error classes, `Error` `cause`.
- ES modules: named vs default exports.

**Topics: asynchronous JavaScript (6 hrs)**
- Call stack, event loop, task queue vs microtask queue.
- Callbacks and "callback hell" → Promises (`then`/`catch`/`finally`, chaining) → `async`/`await`.
- Error handling in async code. Sequential vs parallel execution: `Promise.all`, `allSettled`, `race`, `any`.
- `Promise.withResolvers`, `Promise.try`, async iteration (`for await…of`, `Array.fromAsync`).
- Timeouts and cancellation: `AbortController`, `AbortSignal.timeout`.
- `fetch` and JSON.
- Pitfalls: forgotten `await`, `await` inside loops, `forEach(async …)`, unhandled rejections, swallowed errors.
- Awareness only: Temporal as the future replacement for `Date`.

**Lab: "Async toolkit"** (plain JS ES module; self-checks with `node:assert`). Build `sleep`, `retry(fn, { retries, delayMs })`, `withTimeout(promise, ms)`, and `mapLimit(items, limit, fn)`. Fetch from a free public API sequentially vs in parallel and compare timings. Refactor callback-style `fs` code to promises/async-await.

**Checkpoint.** All self-checks pass, and the trainee can predict and explain the output order of a snippet mixing `setTimeout`, promises, and `await`.

---

### Module 3: Node.js Runtime & npm
**Week 1 · Days 4–5 · 6 hours**

**Objectives.** Explain what Node.js is and how it runs code, use core modules, and manage dependencies safely with npm.

**Topics**
- What Node is: V8 + libuv + core APIs; single-threaded event loop and thread pool; blocking vs non-blocking; when Node is (and isn't) a good fit.
- Modules: ESM vs CommonJS, `"type": "module"`, `import.meta.dirname` / `import.meta.filename`, the `node:` prefix.
- Core APIs: `node:fs/promises`, `node:path`, `node:os`, `node:events`, `node:stream` (why streams), `node:http` (a bare server, to see why Express exists), `node:crypto` (`randomUUID`), `node:timers/promises`, `node:util` (`parseArgs`, `promisify`).
- `process`: `argv`, `env`, exit codes, signals (`SIGINT`, `SIGTERM`).
- Config and developer ergonomics: environment variables, `.env`, `node --env-file`, `node --watch`, `node --run`.
- Globals: `fetch`, `URL`, `AbortController`, `structuredClone`.
- npm: `package.json` anatomy, semver ranges (`^`, `~`), lockfile, `install` vs `ci`, `update`, `outdated`, scripts, `npx`, dependencies vs devDependencies, `engines`, `npm audit`.
- Supply-chain hygiene: vet packages before installing, review lockfile diffs, understand lifecycle scripts.
- Debugging: `console` methods, `node --inspect` with the VS Code debugger, reading stack traces.
- Awareness only: the built-in `node:test` runner and `node:sqlite` exist; this course deliberately uses Jest and Prisma.

**Lab.** (1) A `log-report` CLI that streams a large log/CSV file, aggregates counts, accepts options via `parseArgs`, and writes a JSON report. (2) A bare `node:http` server with three JSON endpoints, with manual routing and body parsing, to feel the pain Express removes.

**Checkpoint (Week 1 Friday).** Both programs merged to `main` through a pull request.

---

### Module 4: TypeScript Basics & TypeScript on Node.js
**Week 2 · Days 1–2 · 8 hours**

**Objectives.** Read and write strict TypeScript, and set up a TypeScript project that runs and type-checks on Node.js.

**Topics: core TypeScript (4 hrs)**
- Why TypeScript; structural typing; inference vs annotation.
- Primitives, arrays, tuples, unions, intersections, literal types, `as const`.
- `type` vs `interface`; optional and `readonly` properties; union types instead of `enum`.
- Functions, generics (functions, constraints, defaults).
- Narrowing: `typeof`, `in`, equality, discriminated unions, user-defined type guards.
- `unknown` vs `any` vs `never`.
- Utility types: `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`, `Awaited`.
- `satisfies`, `import type`.

**Topics: TypeScript on Node.js (4 hrs)**
- Project setup: TypeScript 7, `@types/node` matching your Node major version.
- `tsconfig.json` essentials: `strict`, `module` / `moduleResolution: nodenext`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `noEmit`, `skipLibCheck`.
- Three ways to run TypeScript: **`tsx`** (our dev runner), **Node's native type stripping** (`node file.ts`, erasable syntax only, stable in Node 26), and a **`tsc` build** (awareness).
- `tsc --noEmit` as the type-check gate (`npm run typecheck`).
- Typing async code (`Promise<T>`), errors (`catch (e: unknown)`), and `process.env`; `@types/*` packages and `.d.ts` files.
- TypeScript 6 → 7: strict by default, legacy options removed, native-compiler speed, and what the missing programmatic API means for tooling.
- Reading compiler errors without panic.

**Lab.** Port the Week 1 "Async toolkit" to TypeScript with generics (`retry<T>`, `mapLimit<T, R>`). Model the Task domain: `Task`, `CreateTaskInput`, and `UpdateTaskInput` derived with utility types, plus a discriminated-union `Result<T, E>`. Run it with `tsx` and with Node's native type stripping.

**Checkpoint.** Zero errors from `tsc --noEmit` on a strict config; the trainee can explain `unknown` vs `any` and `type` vs `interface`.

---

### Module 5: Express: Routing, Middleware & Error Handling
**Week 2 · Days 3–5 · 12 hours**

**Objectives.** Build a well-structured REST API with Express 5 in TypeScript, with a consistent error model.

**Topics**
- **HTTP and REST refresher:** methods, status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 500), headers, JSON, idempotency, resource naming, `/api/v1` versioning, pagination conventions.
- **Setup in TypeScript:** `@types/express`; an `app.ts` that builds and exports the app, separate from a `server.ts` that calls `listen` (this makes testing in M9 trivial); `express.json()`; typing handlers with `Request<Params, ResBody, ReqBody, Query>`.
- **Routing:** `app.get/post/put/patch/delete`, `express.Router()`, route params and query strings, route modules, separating handlers from routes, `res.status().json()`, `res.sendStatus`.
- **Express 5 changes to teach explicitly:** rejected promises in async handlers are forwarded to the error handler automatically; new path syntax (`/*splat`, optional segments with `{}`); `req.body` is `undefined` when no body parser ran; `req.query` is a read-only getter; removed deprecated signatures. Link the official migration guide.
- **Middleware:** the request pipeline, why order matters, `next()` vs `next(err)`; app-, router-, and route-level middleware; built-ins (`express.json`, `express.urlencoded`, `express.static`); third-party (`cors`, `helmet`, `morgan` or `pino-http`); custom (request ID, timing, simple API-key auth, 404 handler).
- **Error handling:** operational vs programmer errors; the 4-argument error middleware; custom `AppError` classes (`BadRequestError`, `NotFoundError`, `ConflictError`); one central handler that returns a single consistent JSON error shape; no stack traces in production responses.
- **Operations:** config from environment variables, graceful shutdown (`SIGTERM`, `server.close`), a health endpoint, CORS basics; `express-rate-limit` as a stretch goal.
- **Bruno:** collections, environments, assertions; commit the `bruno/` folder.

**Lab: Task API v1.** In-memory store. `GET/POST /api/v1/tasks`, `GET/PATCH/DELETE /api/v1/tasks/:id`. Request-ID and logging middleware, a central error handler, and **hand-written validation** (deliberately, so Module 8 has a clear payoff). Bruno collection with assertions.

**Checkpoint (Week 2 Friday).** Task API v1 merged by PR; every error path returns the same JSON shape; the Bruno collection passes.

---

### Module 6: SQL Fundamentals with SQLite
**Week 3 · Days 1–2 · 6 hours**

**Objectives.** Design a small relational schema and write the SQL needed to query it, before an ORM hides it.

**Topics**
- The relational model: tables, rows, primary and foreign keys.
- SQLite specifics: single-file database, dynamic typing and type affinity, `PRAGMA foreign_keys`.
- DDL: `CREATE` / `ALTER` / `DROP`; constraints (`PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, `FOREIGN KEY … ON DELETE`).
- DML: `INSERT`, `SELECT`, `UPDATE`, `DELETE`; filtering, sorting, `LIMIT`/`OFFSET`, and the idea of keyset pagination.
- Aggregates with `GROUP BY` / `HAVING`; `INNER` and `LEFT` joins; subqueries.
- Relationships: 1:1, 1:N, M:N with a junction table; normalisation basics (1NF–3NF).
- Indexes and `EXPLAIN QUERY PLAN`; transactions and ACID (`BEGIN` / `COMMIT` / `ROLLBACK`).
- SQL injection and parameterised queries.
- Documenting an ERD with Mermaid in a GitHub README.

**Tools.** `sqlite3` CLI or DB Browser for SQLite (both free).

**Lab.** Design the Task API schema (`users`, `tasks`, `tags`, `task_tags`); create and seed it with SQL; complete 20 graded query exercises (joins, aggregates, pagination); draw the ERD in Mermaid; demonstrate SQL injection against a string-concatenated query, then fix it with parameters.

**Checkpoint.** Exercises complete; the trainee can explain primary vs foreign keys, what an index is for, and how to model 1:N vs M:N.

---

### Module 7: Prisma ORM & Migrations
**Week 3 · Days 2–4 · 8 hours**

**Objectives.** Model data with Prisma 7, evolve the schema safely with migrations, and use the typed client in the Express API.

**Topics**
- What an ORM is, its trade-offs, and when to drop to raw SQL.
- **Setup (Prisma 7 + SQLite):** `npm i -D prisma@7`, `npm i @prisma/client@7 @prisma/adapter-better-sqlite3 dotenv`, then `npx prisma init --datasource-provider sqlite --output ../src/generated/prisma`. The datasource URL lives in the Prisma config file (`prisma7.config.ts`, or `prisma.config.ts` on versions before 7.10). `PrismaClient` requires a **driver adapter**. The generated client is project code (git-ignored), so run `prisma generate` explicitly after install, after schema changes, and in CI.
- **Schema language:** models, scalar types, `@id`, `@default`, `@unique`, `@@index`, `@updatedAt`, relations (1:N, implicit M:N), `onDelete`.
- **Migrations:** `migrate dev --name`, the anatomy of `prisma/migrations/*/migration.sql`, `--create-only` and hand-editing SQL, `migrate status`, `migrate deploy` (CI/production), `migrate reset` (dev only), `db push` (prototyping only). Never edit an applied migration. Add a required column to a table that already has data. Resolve migration conflicts in a team PR.
- **Prisma Client:** a singleton client; `create`, `createMany`, `findUnique`, `findFirst`, `findMany`, `update`, `upsert`, `delete`; `where` with `AND`/`OR`/`NOT`/`contains`/`in`/`gte`; `orderBy`; pagination with `skip`/`take`; `select` vs `include`; nested writes; `count` and `groupBy`; `$transaction` (batch and interactive); `$queryRaw` with tagged templates; query logging.
- **Error handling:** `PrismaClientKnownRequestError` codes `P2002` (unique), `P2025` (not found), `P2003` (foreign key) mapped to 409 / 404 / 409-or-400 in the central error handler.
- **TypeScript with Prisma:** generated model types, `Prisma.TaskCreateInput`, `Prisma.TaskWhereInput`, `Prisma.TaskGetPayload<{ include: … }>`, `satisfies Prisma.TaskSelect`; return types follow `select`/`include`.
- Seeding with an explicit `npm run db:seed`; inspecting data with Prisma Studio.
- **Concept only (no hands-on):** what changes with PostgreSQL (provider, `@prisma/adapter-pg`, connection pooling, richer types), how MongoDB's document model differs from relational, and what Prisma 8 changes.

**Lab: Task API v2.** Translate the M6 schema into Prisma. Create at least two migrations (initial, then an added column such as `dueDate` or `priority`) plus one hand-edited migration via `--create-only`. Replace the in-memory store with a service layer on Prisma. The list endpoint supports `status` and `q` filters, sorting, and `page`/`pageSize` pagination, returning `{ data, meta }`. Add a seed script and map Prisma errors in the central handler.

**Checkpoint.** `migrate reset` plus the seed script rebuilds the database from scratch; the Bruno collection is still green; the trainee can explain `migrate dev` vs `migrate deploy`.

---

### Module 8: Zod Validation & Type Inference
**Week 3 · Days 4–5 · 6 hours**

**Objectives.** Validate all untrusted input at runtime with Zod 4 and derive TypeScript types from the same schemas.

**Topics**
- Why runtime validation: TypeScript types vanish at runtime, and `req.body` is untrusted data.
- Zod 4 basics: `import { z } from "zod"`; primitives; top-level string formats (`z.email()`, `z.uuid()`, `z.url()`); `z.object` and `z.strictObject`; arrays; enums and literals; unions and discriminated unions; optional, nullable, default; `z.coerce.number()` for query strings and params.
- Parsing: `parse` vs `safeParse`; error formatting with `z.flattenError`, `z.treeifyError`, `z.prettifyError`; custom messages via the unified `error` parameter.
- Refinements and transforms: `.refine`, cross-field rules, `.transform`, pipes, trimming and normalising input.
- **Type inference:** `z.infer`, `z.input`, `z.output`. Schemas first, types derived. Derive create/update/query schemas with `.pick`, `.omit`, `.partial`, `.extend`.
- **Zod + Express:** a typed `validate({ body, params, query })` middleware. Because `req.query` is read-only in Express 5, store parsed values on `res.locals` or a typed `req.valid`. A `ZodError` becomes a 400 with field-level `details` via the central handler.
- **Zod + Prisma:** Zod is the request contract; Prisma types are the persistence contract. Keep them aligned (for example `satisfies Prisma.TaskCreateInput`). Never pass raw `req.body` to Prisma. Use Zod to shape responses and strip internal fields.
- Validate `process.env` once at startup in `config.ts` and fail fast.
- Awareness only: Zod Mini and JSON Schema export (`z.toJSONSchema`).

**Lab: Task API v3.** Replace all hand-written validation with Zod: schemas for create, update, list query, and params; the typed `validate` middleware; env validation; consistent 400 payloads. Use `tsc --noEmit` to show that handler input types come from `z.infer`, not from hand-written interfaces.

**Checkpoint (Week 3 Friday).** Task API v3 merged by PR; no manual `if (!body.title)` checks remain; invalid input never reaches Prisma.

---

### Module 9: Integration Testing with Jest + Supertest
**Week 4 · Days 1–2 · 8 hours**

**Objectives.** Write reliable, isolated integration tests that exercise the real Express app and a real SQLite database.

**Topics**
- Testing strategy: the pyramid, unit vs integration vs end-to-end, what to test in an API, and why integration tests use a real database rather than mocks.
- **Jest 30 basics:** `describe`/`it`/`expect` imported from `@jest/globals`; matchers; async tests; `beforeAll`/`afterAll`/`beforeEach`; `test.each`; `toMatchObject` and `expect.objectContaining`; `rejects`/`toThrow`; snapshots used sparingly; Arrange-Act-Assert.
- **Setup for this stack (TypeScript 7 + ESM):** transform with `@swc/jest` (fast, strips types) and enforce type safety with `tsc --noEmit` in the `typecheck` script and CI. Run Jest in ESM mode with a cross-platform script: `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand`.
- **Supertest:** `request(app)` against the exported app (no port needed); `.get/.post/.patch/.delete`, `.send`, `.set`, `.query`; status, header, and body assertions; async/await style; agents for cookies.
- **Test database strategy:** a separate `test.db` via `.env.test`; a Jest `globalSetup` that runs `prisma migrate deploy` against it; clean tables in `beforeEach` (in foreign-key-safe order); `--runInBand` because SQLite allows a single writer (or one DB file per worker using `JEST_WORKER_ID`); factories and seed helpers; `afterAll(() => prisma.$disconnect())`.
- **What to cover:** happy paths; validation failures (400 with details); 404; 409 on unique violations; malformed JSON; pagination, filter, and sort; middleware behaviour (request-ID header, 404 handler); the error handler never leaking stack traces.
- Coverage (`--coverage`, thresholds); flaky tests (shared state, time, ordering); mocking only at boundaries (`jest.fn`, `jest.spyOn`); note that `jest.mock` hoisting doesn't apply in ESM (`jest.unstable_mockModule`).
- **TDD mini-cycle:** red → green → refactor while adding `PATCH /tasks/:id/complete`.
- **CI:** a GitHub Actions workflow (free) running `npm ci` → `prisma generate` → `typecheck` → `test`; add a status badge to the README.

**Lab: Task API v4.** At least 25 integration tests covering all endpoints and every error path; a passing GitHub Actions workflow; a coverage report.

**Checkpoint.** Green CI on a pull request; at least 80% coverage on routes and services; the suite passes in random order (`--randomize`).

---

### Module 10: Capstone Project
**Week 4 · Days 3–5 · 12 hours**

**Objective.** Independently build, test, and present a complete API in a new domain using the whole stack.

**Choose one domain:** Library / Bookshelf (books, authors, loans) · Expense Tracker (users, categories, expenses) · Event RSVP (events, attendees, registrations) · Support Tickets (tickets, comments, labels) · Recipe Book (recipes, ingredients, tags).

**Requirements**

| Area | Must have |
|---|---|
| Functional | At least 3 models including a 1:N and an M:N relation; full CRUD for at least 2 resources; one list endpoint with filtering, sorting, and pagination; one business rule enforced in a service using a transaction (for example, cannot loan an unavailable book) |
| TypeScript | Strict mode; zero `tsc --noEmit` errors |
| Validation & errors | Zod validation for body, params, query, and env; central error handler with one consistent error shape |
| Data | At least 3 committed Prisma migrations; seed script |
| Testing | At least 25 integration tests including error paths; coverage at or above 80% on routes and services |
| Tooling | Bruno collection committed; GitHub Actions CI passing |
| Git workflow | GitHub Issues → feature branches → at least 8 pull requests; Conventional Commits; at least one peer review given and one received |
| Docs | README with setup steps, scripts, ERD (Mermaid), and endpoint list |

**Schedule**
- **Day 3:** plan (issues), schema and ERD, first migrations, project skeleton.
- **Day 4:** routes, validation, error handling, tests.
- **Day 5:** polish, peer review, 10-minute demo plus Q&A.

**Rubric (100 points)**

| Criterion | Points |
|---|---|
| Functionality and business rule | 20 |
| Testing quality and coverage | 20 |
| Validation and error handling | 15 |
| Data layer and migrations | 15 |
| TypeScript quality | 10 |
| Git/GitHub workflow and CI | 10 |
| Documentation and demo | 10 |

---

## 6. Assessment and completion

- **Weekly checkpoints** (Friday) are pass/fail against the checklist in each module.
- **Capstone** is graded with the rubric above; 70+ passes.
- **Competency checklist.** On completion, a trainee can:
  1. Explain the event loop and write correct async/await code, including parallel work and error handling.
  2. Structure a Node.js project with ES modules and manage dependencies with npm safely.
  3. Build a REST API in Express 5 with routers, middleware, and a central error handler.
  4. Write strict TypeScript and derive types from Zod schemas and Prisma models.
  5. Design a small relational schema and write joins, aggregates, and transactions in SQL.
  6. Create, edit, and apply Prisma migrations, and explain `migrate dev` vs `migrate deploy`.
  7. Validate all untrusted input with Zod and return consistent 400 responses.
  8. Write isolated integration tests with Jest and Supertest against a real test database.
  9. Work in a GitHub pull-request workflow with CI.
  10. Explain, at concept level, what changes when moving from SQLite to PostgreSQL or MongoDB.

---

## Appendix A: Trainer pre-flight checklist (do before every cohort)

These versions are new and move quickly. Dry-run the full path, Module 1 through Module 9, on each OS your trainees use.

1. **Version drift.** Run `npm view <package> dist-tags` for `express`, `typescript`, `prisma`, `@prisma/client`, `zod`, `jest`, `supertest`, and compare with Section 3.
2. **Prisma 8.** GA is expected in October 2026. SQLite is experimental in Prisma 8, so stay on Prisma 7 for this curriculum unless SQLite support is declared stable. Prisma 7 is supported for 18 months after Prisma 8 GA.
3. **Prisma pin.** Confirm `package.json` locks `prisma` and `@prisma/client` to `^7`, and that scripts and CI use `npx prisma@7` where unpinned.
4. **Docs links.** Give trainees the `/v7/` Prisma docs URLs.
5. **`better-sqlite3` install.** It is a native module. Check Windows (build tools), macOS (Xcode command-line tools), and Linux (build-essential). Fallback: `@prisma/adapter-libsql`.
6. **Node version.** Decide 24 vs 26, run every lab on it, set `.nvmrc`, and match `@types/node` to the major version.
7. **TypeScript 7 + Jest.** Confirm the `@swc/jest` ESM configuration works with the Prisma-generated client. Fallbacks, in order: `ts-jest` using its documented TypeScript 7 side-by-side setup; pin TypeScript 6 for the test toolchain only; compile the project as CommonJS (drop `"type": "module"`).
8. **Import-extension convention.** Choose one (`.ts` extensions with `allowImportingTsExtensions`, or `.js` specifiers) and check the Prisma generator's `importFileExtension` option so generated imports match.
9. **Express 5 gotchas.** Verify the lab solutions don't use removed v4 patterns (wildcard paths, `res.json(status, body)`).

---

## Appendix B: Pinned install cheat sheet

```bash
# Runtime (pick one for the whole cohort)
nvm install 24 && nvm use 24        # or Node 26 once it enters LTS
npm init -y

# App dependencies
npm install express@5 zod@4 dotenv
npm install @prisma/client@7 @prisma/adapter-better-sqlite3

# Dev dependencies
npm install -D typescript@7 tsx @types/node@24 @types/express @types/better-sqlite3
npm install -D prisma@7
npm install -D jest@30 @jest/globals supertest @types/supertest @swc/core @swc/jest

# Prisma initialisation (generates the config file, schema, and .env)
npx prisma init --datasource-provider sqlite --output ../src/generated/prisma
```

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
  }
}
```

---

## Appendix C: Reference project layout

```
task-api/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ prisma7.config.ts          # prisma.config.ts on Prisma < 7.10
├─ src/
│  ├─ app.ts                  # builds and exports the Express app (no listen)
│  ├─ server.ts               # listen + graceful shutdown
│  ├─ config.ts               # Zod-validated environment
│  ├─ db.ts                   # PrismaClient singleton (driver adapter)
│  ├─ errors.ts               # AppError hierarchy
│  ├─ generated/prisma/       # generated client (git-ignored)
│  ├─ routes/
│  ├─ services/
│  ├─ schemas/                # Zod schemas + inferred types
│  └─ middleware/             # validate.ts, error-handler.ts, request-id.ts
├─ tests/
│  ├─ global-setup.ts         # prisma migrate deploy against test.db
│  ├─ helpers/                # factories, db cleanup
│  └─ tasks.test.ts
├─ bruno/                     # Bruno collection (plain text, committed)
├─ .github/workflows/ci.yml
├─ jest.config.js
├─ tsconfig.json
├─ .nvmrc
└─ .env.example               # .env and .env.test are git-ignored
```

---

## Appendix D: Official references

- JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- Node.js API docs: https://nodejs.org/docs/latest/api/
- Express (including the v5 migration guide): https://expressjs.com/en/guide/migrating-5.html
- TypeScript: https://www.typescriptlang.org/docs/
- SQLite SQL reference: https://www.sqlite.org/lang.html
- Prisma ORM 7 docs: https://www.prisma.io/docs/orm/v7 and the SQLite quickstart at https://www.prisma.io/docs/v7/prisma-orm/quickstart/sqlite
- Zod: https://zod.dev
- Jest: https://jestjs.io/docs/getting-started
- Supertest: https://www.npmjs.com/package/supertest
- Bruno: https://docs.usebruno.com
- Pro Git (free book): https://git-scm.com/book
- GitHub Docs: https://docs.github.com/en/get-started
