# M09 — Integration Testing with Jest + Supertest

**Week 4 · Days 1-2 · 8 hours**

## Builds on

[m08-zod-validation](../m08-zod-validation/write-up-template.md) — you're writing tests against
Task API v3 and shipping it as v4.

## Objective

Write reliable, isolated integration tests that exercise the real Express app and a real SQLite
database.

## Scope

- Testing strategy: the pyramid, unit vs integration vs end-to-end, what to test in an API, and why
  integration tests here use a real database rather than mocks.
- **Jest 30 basics:** `describe`/`it`/`expect` imported from `@jest/globals`; matchers; async tests;
  `beforeAll`/`afterAll`/`beforeEach`; `test.each`; `toMatchObject` and `expect.objectContaining`;
  `rejects`/`toThrow`; snapshots used sparingly; Arrange-Act-Assert.
- **Setup for this stack (TypeScript 7 + ESM):** transform with `@swc/jest` (fast, strips types) and
  enforce type safety separately with `tsc --noEmit` in the `typecheck` script and CI. Run Jest in
  ESM mode with a cross-platform script:
  `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand`.
- **Supertest:** `request(app)` against the exported app (no port needed); `.get/.post/.patch/.delete`,
  `.send`, `.set`, `.query`; status, header, and body assertions; async/await style; agents for
  cookies.
- **Test database strategy:** a separate `test.db` via `.env.test`; a Jest `globalSetup` that runs
  `prisma migrate deploy` against it; clean tables in `beforeEach` (in foreign-key-safe order);
  `--runInBand` because SQLite allows a single writer (or one DB file per worker using
  `JEST_WORKER_ID`); factories and seed helpers; `afterAll(() => prisma.$disconnect())`.
- **What to cover:** happy paths; validation failures (400 with `details`); 404; 409 on unique
  violations; malformed JSON; pagination, filter, and sort; middleware behaviour (request-ID header,
  404 handler); the error handler never leaking stack traces.
- Coverage (`--coverage`, thresholds); flaky tests (shared state, time, ordering); mocking only at
  boundaries (`jest.fn`, `jest.spyOn`); `jest.mock` hoisting doesn't apply in ESM
  (`jest.unstable_mockModule`).
- **TDD mini-cycle:** red → green → refactor while adding `PATCH /tasks/:id/complete`.
- **CI:** a GitHub Actions workflow running `npm ci` → `prisma generate` → `typecheck` → `test`; add a
  status badge to the README.

## Stack constraints

- Jest 30.x, Supertest 7.x, `@swc/jest`.
- Tests hit the real exported Express app and a real SQLite test database — no mocking the
  database.

## Deliverable: Task API v4

At least 25 integration tests covering all endpoints and every error path; a passing GitHub Actions
workflow; a coverage report.

## Definition of done

- [ ] Green CI on a pull request.
- [ ] 80% or more coverage on routes and services.
- [ ] The suite passes in random order (`--randomize`) — if it doesn't, something in your test setup
      depends on execution order, and that's a bug to fix, not a flag to avoid.
- [ ] `PATCH /tasks/:id/complete` was added test-first (red → green → refactor), not after the fact.

## Resolved: toolchain fallback order

`@swc/jest` is the default transform for this program. If it doesn't cooperate with the
Prisma-generated client in ESM mode on your machine, apply fallbacks in this fixed order — don't mix
them, and don't skip ahead — and record in your write-up which one you ended up needing and why:

1. `ts-jest`, using its documented TypeScript 7 side-by-side setup.
2. Pin TypeScript 6 for the test toolchain only (the rest of the project stays on TypeScript 7).
3. Compile the project as CommonJS by dropping `"type": "module"`.
