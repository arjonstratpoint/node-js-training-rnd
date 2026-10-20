# M09 Write-Up — Integration Testing with Jest + Supertest (Task API v4)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. The M10 capstone has no reference material except what you write here, so be
> thorough.

_Worked example below — commands and file names are real; replace the `<owner>/<repo>` and
`<PR-url>` placeholders with your own evidence when you run this stage._

## What I built

Task API v4 — the test suite, the test-database machinery, the TDD'd new endpoint, and the CI
workflow:

- [Module guide](./module-9-integration-testing.md) — the walkthroughs I followed (Jest/Supertest
  setup, test DB, happy paths, error paths, list/middleware, TDD, mocking, CI).
- `jest.config.js` — ESM config: `@swc/jest` transform, `extensionsToTreatAsEsm: ['.ts']`,
  `setupFiles`/`globalSetup`, coverage collection and thresholds.
- `tests/setup-env.ts`, `tests/global-setup.ts` — load `.env.test`, run
  `npx prisma@7 migrate deploy` against `test.db` once per run (with a CI-safe default of
  `file:./test.db` when the env file is absent).
- `tests/helpers/db.ts` — `resetDb()` deleting `task_tags → tasks → tags → users` in one
  transaction, plus `disconnectDb()`.
- `tests/factories.ts` — `createUser` / `createTask` / `seedTasks` with random unique emails.
- `tests/smoke.test.ts`, `tests/tasks.test.ts`, `tests/errors.test.ts`, `tests/list.test.ts`,
  `tests/middleware.test.ts`, `tests/complete.test.ts`, `tests/unique-conflict.test.ts` — 30 tests
  covering every endpoint and error path.
- `PATCH /api/v1/tasks/:id/complete` — added red → green → refactor (tests in
  `tests/complete.test.ts`, `completeTask` in `src/services/task.service.ts`).
- `.github/workflows/ci.yml` — `npm ci → npx prisma@7 generate → npm run typecheck → npm test`,
  with the status badge in the README.

Repo links to swap in for your run: PR `<PR-url>`; Actions runs under
`https://github.com/<owner>/<repo>/actions/workflows/ci.yml`.

## Why it's built this way (key decisions)

- **Why this test-database strategy — what would break without cleanup.** Tests share one process
  (`--runInBand`) and one `test.db`. Without `beforeEach` cleanup, rows from earlier tests — and
  from earlier *runs* — leak into assertions: a pagination test asserting `total: 25` sees 26 rows,
  a unique email collides, a "list is empty" assertion lies. Cleanup must run child-first
  (`task_tags` before `tasks`/`tags`, `tasks` before `users`) or SQLite's foreign keys reject the
  deletes. `prisma migrate deploy` in `globalSetup` (not `migrate dev`) because the test database
  should apply committed migrations exactly as production would — never regenerate them. The
  spawned command gets `DATABASE_URL` passed explicitly, so `dotenv/config` in `prisma7.config.ts`
  can't leak the dev `dev.db` URL into a test run.
- **Which toolchain fallback did I need?** None — `@swc/jest` worked out of the box on Node 24 with
  TypeScript 7 and the Prisma-generated client, *because* the `tests/smoke.test.ts` smoke test
  proved the whole import chain before I wrote real tests. That ordering is the lesson: don't write
  25 tests on top of an unverified transform. (If `@swc/jest` had failed, the brief's ladder is
  fixed: `ts-jest` → TypeScript 6 for tests only → CommonJS — one step at a time, recorded here.)
- **What test-first changed about the handler.** Writing `PATCH …/complete` red first forced the
  contract to be decided before any code: 200 + `{ data }` on success, 404 through the existing
  `P2025` mapping for missing ids, 200 (not an error) on a second completion. The "missing id →
  404" test passed for the *wrong* reason while red (the route didn't exist, so the not-found
  handler answered) — noticing that made me check the envelope, not just the status. By refactor
  time the handler was a one-line translation over `completeTask(id)`, and I never wrote a
  speculative branch I couldn't point at a test for.

## How to build it (teach it to the next trainee)

**Setting up an isolated test database — with the reasoning, not just the config.**

1. **Give tests their own file.** `.env.test` with `DATABASE_URL="file:./test.db"`. Git-ignore it
   (and `*.db`); never point tests at `dev.db` — they *will* destroy your development data.
2. **Load it before anything imports the app.** `tests/setup-env.ts` calls
   `dotenv.config({ path: '.env.test' })` and then applies defaults
   (`NODE_ENV=test`, `DATABASE_URL=file:./test.db`). Jest runs it via `setupFiles`, which executes
   before each test file's imports — so by the time `src/app.ts` (and its `config.ts` validation,
   and the Prisma singleton) is evaluated, the environment is already correct. The defaults exist
   for CI, which deliberately has no `.env.test` in the repository.
3. **Migrate once per run, deterministically.** `tests/global-setup.ts` default-exports a function
   that `execSync`s `npx prisma@7 migrate deploy` with `DATABASE_URL` forced to the test URL.
   `migrate deploy` applies the committed `prisma/migrations/` folder — the same SQL production
   gets. (If Jest can't load the TS global setup on your machine, rename it to `.mjs` and strip
   the types.)
4. **Empty the tables between tests, children first.** `resetDb()` runs
   `taskTag.deleteMany → task.deleteMany → tag.deleteMany → user.deleteMany` inside
   `prisma.$transaction`. Order is not cosmetic: SQLite enforces the foreign keys, and deleting a
   parent before its children fails the transaction.
5. **One writer.** `--runInBand` keeps all tests in one process against one SQLite file. Parallel
   workers and a single SQLite file fight each other; if you ever want parallelism, give each
   worker its own database file via `JEST_WORKER_ID`.
6. **Disconnect or Jest hangs.** Every file that touches the database ends with
   `afterAll(async () => { await disconnectDb(); })`. Skip it and Jest warns it "did not exit" —
   the Prisma connection is still holding the process open.

## Concepts worth explaining

**Why a real database instead of mocks, in my own words.** A mock is a stand-in you write
yourself — which means the test only proves your code agrees with your own assumptions. When I
mock `prisma.task.findMany`, my test passes even if my `where` clause has a typo the real engine
would reject, even if last month's migration renamed a column, and even if my filter matches the
wrong rows — the mock returns whatever I told it to return. Running against `test.db` means every
request goes through the actual stack: Zod validates it, the route translates it, Prisma compiles
it to SQL, SQLite executes it with real constraints, and the error mapping turns real
`P2002`/`P2025`/`P2003` exceptions into the envelope. The bugs those layers catch (constraint
violations, migration drift, mis-ordered cleanup) are exactly the bugs mocks are blind to. The
price is setup discipline — isolation, cleanup, one writer — which is real work, but it's the kind
that pays for itself the first time a suite fails on someone else's machine for a real reason.

**Red-green-refactor, as actually experienced.** Red is not "start a timer" — it's writing down
the contract as an executable sentence and watching it fail for the reason you expect. When I wrote
the `PATCH …/complete` test, the failure taught me the route didn't exist yet, and the *accidental*
pass of my 404 test taught me that a green test can be green for the wrong reason. Green is the
minimum code that satisfies the sentence — I added a one-line route handler, nothing more. Refactor
is only safe *because* the net is green: I then moved the intent into `completeTask()` in the
service and the tests didn't notice — which is the whole point. The cycle changed what got built:
idempotency and the 404 case were in the design because the tests demanded them first.

## What tripped me up

- **`jest.spyOn` on the service module threw** — ES module namespace objects are read-only; there
  is no property to replace. The ESM answer is `jest.unstable_mockModule(specifier, factory)` plus
  a dynamic `await import(...)` of the app *after* registering the mock. Getting the order wrong
  (importing the app first) silently gives you the real module — a fun two-hour hunt.
- **Env loading order.** My first run read `DATABASE_URL` from the dev `.env` because I imported
  the app before the env file was loaded. `setupFiles` fixed it; that's why `tests/setup-env.ts`
  is the first line of defence, not an afterthought in a test file.
- **`--randomize` caught a hidden dependency.** A list test seeded with `seedTasks` in `beforeAll`
  was then wiped by `beforeEach(resetDb)` in another describe — and a `total` assertion only held
  when its file happened to run first. The fix was seeding per-test, not disabling the flag.
- **Malformed JSON came back as 500.** The M05 handler's fallback branch turned the body parser's
  `SyntaxError` into `INTERNAL_SERVER_ERROR`. The test made it visible; a small branch mapping
  parse errors to 400 `BAD_REQUEST` fixed it.
- **A `.strict()` Zod schema rejected the real POST body.** M08's example schema didn't know about
  `userId`; the M07 contract requires it. Extending the schema to the full contract (and testing
  the 400-with-`details` shape) closed the gap.

## Checkpoint evidence

_Placeholders below stand in for your live links — replace them, don't ship them._

- **Green CI on a PR:** PR `<PR-url>` → the `test` job shows ✅ on `npm ci`, `npx prisma@7
  generate`, `npm run typecheck`, `npm test`. Locally the same sequence is:
  `npm ci && npx prisma@7 generate && npm run typecheck && npm test` — `typecheck` silent, suite
  green.
- **`--randomize`:** `npm test -- --randomize` — run three times, green each time (e.g.
  `Tests: 29 passed, 29 total` per run). Any red run means an ordering dependency; fix the setup,
  never the flag.
- **Coverage:** `npm run test:coverage` — `src/routes/` and `src/services/` each at or above the
  80% threshold (the build fails below it, so a green run *is* the evidence).
- **Test-first `PATCH …/complete`:** the red run of `npm test -- tests/complete.test.ts` failed
  with the expected 200-vs-404 on "marks the task done" *before* any `/:id/complete` route
  existed; green followed the minimal handler; the refactor to `completeTask()` kept it green.

## What I'd do differently

(M10: this section is your capstone's manual — write it carefully.)

- **Write `tests/helpers/envelope.ts` on day one.** I retyped the same `error.code` /
  `error.details` / `requestId` assertions a dozen times; a `expectErrorEnvelope(res, code)` helper
  before the first error test would have cut the suite's size by a fifth and made the envelope
  contract one edit instead of twelve.
- **Seed through factories only.** My one `beforeAll` seeding experiment caused the `--randomize`
  failure. Factories + `beforeEach` everywhere is boring and unbreakable — choose boring.
- **Budget the toolchain proof first.** The smoke test took ten minutes and de-risked the most
  dangerous hour. In the capstone I'd run it before writing any route code, not after.
- **Pin the Prisma error constructor details early.** Constructing
  `Prisma.PrismaClientKnownRequestError` for the boundary mock required matching my generated
  client's exact option bag; checking its `.d.ts` before writing the test would have saved a
  typecheck round-trip.
- **Consider per-worker databases before `--runInBand` is load-bearing.** Single-writer is right
  for this cohort's SQLite setup, but for the capstone's larger suite I'd prototype the
  `JEST_WORKER_ID` file-per-worker approach and compare wall-clock time before committing.
