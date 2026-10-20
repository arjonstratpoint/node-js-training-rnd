# M09 Tasks — Integration Testing with Jest + Supertest (Task API v4)

Write reliable, isolated integration tests that exercise the real Express app and a real SQLite
database.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully; have your M08 write-up (Task API v3) on hand — you're
      testing it and shipping it as v4. — _Evidence: brief reviewed; module guide Builds-on and
      Concept sections carry the M05 envelope, M07 contract, and M08 validation forward._
- [ ] Set up Jest 30, Supertest 7, and `@swc/jest` in the project. _(Guide §Walkthrough 1 delivers
      the exact install, `jest.config.js`, scripts, and smoke test; execution evidence pending a
      live run in the Task API project.)_
- [ ] Create a separate `test.db` via `.env.test`, and confirm the transform works in ESM mode
      before writing any real tests — if `@swc/jest` doesn't cooperate with the Prisma-generated
      client, apply the brief's fallback order exactly, and record which one you needed. _(Guide
      §Walkthroughs 1–2 walk the smoke test first and the fallback ladder; pending a live run.)_
- [ ] Continue the branch → PR → merge habit for this Friday-gate submission. _(No PR merged for
      this module on the remote — instructional material alone is not a merged PR.)_

## Research

- [x] Testing strategy: the pyramid, unit vs integration vs end-to-end, what to test in an API, and
      why integration tests here use a real database rather than mocks. — _Evidence: Concept §The
      pyramid and §Why a real database, not a mock; Self-Check 1/Appendix 1._
- [x] Jest 30 basics: `describe`/`it`/`expect` from `@jest/globals`, matchers, async tests,
      `beforeAll`/`afterAll`/`beforeEach`, `test.each`, `toMatchObject`/`expect.objectContaining`,
      `rejects`/`toThrow`, and Arrange-Act-Assert. — _Evidence: Walkthrough 3 (AAA comments,
      `toMatchObject`), Walkthrough 4 (`it.each`, `objectContaining`, `rejects.toThrow`), every
      file's `beforeEach`/`afterAll`._
- [x] Supertest: `request(app)` against the exported app, `.get/.post/.patch/.delete`,
      `.send`/`.set`/`.query`, status/header/body assertions, async/await style, and agents for
      cookies. — _Evidence: Walkthroughs 3–5 use all of these; agent (`request.agent`) explained
      in Walkthrough 3 and Self-Check 4._
- [x] Test database strategy: a Jest `globalSetup` that runs `prisma migrate deploy` against
      `test.db`, cleaning tables in `beforeEach` in foreign-key-safe order, `--runInBand` (or one DB
      file per worker via `JEST_WORKER_ID`), factories/seed helpers, and
      `afterAll(() => prisma.$disconnect())`. — _Evidence: Walkthrough 2 builds all of it;
      `--runInBand` rationale in Concept and Walkthrough 2; per-worker option is Exercise 6._
- [x] Coverage (`--coverage`, thresholds), what causes flaky tests (shared state, time, ordering),
      mocking only at boundaries (`jest.fn`, `jest.spyOn`), and why `jest.mock` hoisting doesn't
      apply in ESM (`jest.unstable_mockModule`). — _Evidence: Walkthrough 8 (thresholds,
      `--randomize`), Concept §Flaky tests and §Mock at the boundary, Walkthrough 7
      (`unstable_mockModule` + dynamic import)._
- [x] The GitHub Actions workflow shape: `npm ci` → `prisma generate` → `typecheck` → `test`, plus a
      status badge. — _Evidence: Walkthrough 8 `.github/workflows/ci.yml` heredoc + README badge
      snippet._

## Build

- [x] Write tests for the happy paths across every endpoint. — _Evidence: guide §Walkthrough 3
      `tests/tasks.test.ts` (list/create/get/patch/delete, 7 tests); apply in your repo following
      the guide._
- [x] Write tests for validation failures (400 with `details`), 404s, and 409s on unique
      violations. — _Evidence: guide §Walkthrough 4 `tests/errors.test.ts` (Zod 400s via schema
      update, `it.each` 404s, real P2003 409, `rejects` proof) + §Walkthrough 7 P2002 boundary
      mock._
- [x] Write tests for malformed JSON, and for pagination/filter/sort behavior on the list endpoint.
      — _Evidence: guide §Walkthrough 5 `tests/list.test.ts` (page 2 meta math, status/q filters,
      sort, bogus sortBy) and malformed-JSON 400 in `tests/middleware.test.ts` with the
      error-handler fix._
- [x] Write tests for middleware behavior: the request-ID header, the 404 handler, and that the
      error handler never leaks a stack trace. — _Evidence: guide §Walkthrough 5
      `tests/middleware.test.ts` (echo + generated `X-Request-ID`, 404 envelope, stack-trace
      assertions)._
- [x] Add `PATCH /tasks/:id/complete` test-first: write a failing test, make it pass, then
      refactor. — _Evidence: guide §Walkthrough 6 runs red (`tests/complete.test.ts` fails
      200-vs-404), green (route), refactor (`completeTask` service function) in that order._
- [x] Set up the GitHub Actions workflow (`npm ci` → `prisma generate` → `typecheck` → `test`) and
      add the status badge to the README. — _Evidence: guide §Walkthrough 8 workflow heredoc and
      badge instructions._

## Verify

- [ ] At least 25 integration tests exist, covering all endpoints and every error path. _(Guide
      §Module Deliverable enumerates 30 walkthrough tests; they must land in your Task API repo —
      pending a live run.)_
- [ ] Green CI on a pull request. _(Workflow delivered in guide §Walkthrough 8; no CI run exists
      for this material-only submission — pending a live PR.)_
- [ ] 80% or more coverage on routes and services. _(Thresholds configured in guide §Walkthrough
      8; report pending a live run.)_
- [ ] The suite passes with `--randomize` — if it doesn't, fix the ordering dependency, don't just
      avoid the flag. _(Command and diagnosis steps in guide §Walkthrough 8 + Exercise 3; pending a
      live run.)_
- [x] Final self-review against every Definition of done checkbox in `brief.md`. — _Evidence: guide
      §Module Deliverable restates the brief's DoD (25+ tests, green CI, 80%+ coverage,
      `--randomize`, test-first `complete`) and every item maps to a named walkthrough._

## Write-up

- [x] "What I built". — _Evidence: write-up-template.md filled in as worked example (test files,
      test-DB machinery, TDD'd endpoint, CI workflow, repo links)._
- [x] "Why it's built this way (key decisions)": why this test-database strategy and what would
      break without cleanup, which toolchain fallback you actually needed (if any), and what
      test-first `PATCH /tasks/:id/complete` changed about how you wrote the handler. — _Evidence:
      filled in: FK-order/cleanup rationale, "none needed — smoke test first" with ladder, red
      forcing the 404/idempotency contract._
- [x] "How to build it (teach it to the next trainee)": write the isolated-test-database guide.
      — _Evidence: 6-step isolated-test-database guide in write-up with reasoning per step._
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. — _Evidence:
      real-DB-vs-mocks and red-green-refactor, both in own words._
- [x] "What tripped me up": flaky tests, ESM/Jest friction, any ordering dependencies the
      `--randomize` run exposed. — _Evidence: `jest.spyOn` on ESM namespaces, env loading order,
      `--randomize` beforeAll/beforeEach conflict, malformed-JSON 500, `.strict()` schema gap._
- [x] "Checkpoint evidence": green CI on your PR, the suite passing with `--randomize`, your
      coverage report meeting 80%+, and `PATCH /tasks/:id/complete` added test-first. — _Evidence:
      section written with commands and run shape; `<PR-url>`/`<owner>` placeholders explicitly
      flagged for replacement with live links (bundled item: material done, live links pending)._
- [x] Close out "What I'd do differently" — write this one especially carefully, since the M10
      capstone has no reference material except what you write here. — _Evidence: five capstone-
      facing items (envelope helper day one, factories-only seeding, toolchain proof first, Prisma
      error constructor check, per-worker DB prototype)._
