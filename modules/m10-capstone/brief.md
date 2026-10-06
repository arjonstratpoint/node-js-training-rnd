# M10 — Capstone Project

**Week 4 · Days 3-5 · 12 hours**

## Builds on

Everything, m01 through m09. There is no reference solution for this stage — your own
`write-up-template.md` files from M05, M07, M08 and M09 are your material now. Re-read them before
you start.

## Objective

Independently build, test, and present a complete API in a new domain, using the whole stack, with
no reference solution to copy from.

## Domain — choose one

Each domain needs a natural fit for two user roles (see Security & Authorization below) — some
examples, though you're not limited to these:

- Library / Bookshelf (books, authors, loans) — member vs librarian
- Expense Tracker (users, categories, expenses) — regular user vs admin
- Event RSVP (events, attendees, registrations) — attendee vs organizer
- Support Tickets (tickets, comments, labels) — requester vs agent
- Recipe Book (recipes, ingredients, tags) — contributor vs admin

## Scope

Mostly no new topics — this stage is the whole program (environment, Git workflow, async JS,
TypeScript, Express, SQL design, Prisma, Zod, and Jest/Supertest) applied once, start to finish, by
you, in a domain you haven't built before. Two things genuinely go beyond what M01-M09 taught, and
you'll need to research them yourself the same way you would on a real team:

- **Real authentication and authorization.** Every prior module used, at most, a simple API-key
  middleware. Here you're building actual user accounts, password hashing, token-based auth, and
  role-based access control — see Security & Authorization below.
- **Proving a transaction actually prevents a race**, not just that one exists in the code — see
  the Functionality row in the rubric below.

This reflects a deliberate shift from the rest of the program: AI coding assistants make the
CRUD-plus-Prisma-plus-Zod-plus-tests work you did in M05-M09 fast to produce. What's harder to
shortcut — and what this capstone now weights more heavily — is the judgment behind an auth design
and a correctness claim you can actually demonstrate under load, not just assert.

## Security & Authorization (new for the capstone)

- Registration and login endpoints, with passwords hashed (bcrypt or argon2 — your choice, and be
  ready to explain why).
- A JWT or signed session cookie required on protected routes.
- At least two roles, with at least one endpoint whose behavior genuinely differs by role (not just
  a cosmetic flag — an actual authorization check that blocks the wrong role).
- Rate-limiting specifically on the login/registration endpoints.
- The signing secret (and any other credential) goes through the same `config.ts`
  validate-at-startup pattern from M08 — never hard-coded, never committed.

## Stack constraints

Identical to every prior stage: Node (cohort-pinned version), Express 5, TypeScript 7 strict,
Prisma 7 on SQLite, Zod 4, Jest 30 + Supertest 7, free tools only, no Docker. Password hashing and
JWT/session libraries are additions you'll need to research and pick yourself — there's no pin for
them in the program's stack table, so note your choice and version in your write-up.

## Schedule

- **Day 3:** plan as GitHub Issues, schema and ERD, first migrations, project skeleton.
- **Day 4:** routes, validation, error handling, tests.
- **Day 5:** polish, peer review, 10-minute demo plus Q&A.

## Deliverable

**A complete, independently built REST API in a new domain, scoring 70+ on the 100-point rubric,
version-controlled from the start.**

## Lab

*Goal: build, secure, test, and ship a complete API alone, in a domain you've never touched before,
with nothing to copy from.*

**You do.**

1. Day 3 — plan as GitHub Issues, design the schema and ERD, create the first migrations, set up
   the project skeleton.
2. Day 4 — build the routes, validation, error handling, authentication/authorization, and the
   concurrency-proof business rule; write the tests.
3. Day 5 — polish, get a peer review, and deliver the 10-minute demo plus Q&A.

**You build and capture.** Every rubric must-have, your rubric self-score, and the evidence for the
concurrency proof (the before/after of the race condition).

## Rubric (100 points, 70+ passes)

| Criterion | Points | Must-have evidence |
| --- | --- | --- |
| Functionality and business rule | 15 | At least 3 models including a 1:N and an M:N relation. Full CRUD for at least 2 resources. One list endpoint with filtering, sorting and pagination. One business rule enforced in a service, inside a transaction (for example, cannot loan an unavailable book) — **demonstrated under concurrent load** (a small script firing parallel requests at the contested resource), proving the transaction actually prevents the race, not just that it exists in the code |
| Testing quality and coverage | 15 | At least 25 integration tests including error paths and at least one test for the role-gated endpoint. 80% or more coverage on routes and services |
| Validation and error handling | 10 | Zod validation for body, params, query and env. A central error handler with one consistent error shape |
| **Security & Authorization** | **15** | **Registration/login with hashed passwords. JWT or signed session required on protected routes. At least 2 roles with at least one endpoint whose behavior differs by role. Rate-limiting on the auth endpoints** |
| Data layer and migrations | 15 | At least 3 committed Prisma migrations and a seed script |
| TypeScript quality | 10 | Strict mode, zero `tsc --noEmit` errors |
| Git/GitHub workflow and CI | 10 | Issues, then feature branches, then at least 8 pull requests. Conventional Commits. At least one peer review given and one received. GitHub Actions CI passing |
| Documentation and demo | 10 | README with setup steps, scripts, a Mermaid ERD, an endpoint list, and a committed Bruno collection. 10-minute demo plus Q&A |

## Resolved: Bruno collection and the pass rule

- **Bruno collection is scored under Documentation and demo** (folded into that 10-point row above),
  not as a separate line.
- **The must-have evidence column is a gate, in addition to the 70-point threshold.** Scoring 70+
  overall does not pass if a must-have (e.g. the required transaction, the 25+ tests, the 3+
  migrations) is simply missing — fix the gap first, then the score stands.

## Resolved: remediation (default policy — your program owner can override this)

- **A failed Friday gate (end of M03, M05, or M08):** you get one business day to close the specific
  gap your trainer identified, with trainer support available, then re-demonstrate just that gap
  before the next module starts. This does not block you from attending the next module's sessions
  in parallel.
- **A capstone score under 70:** you get up to 3 additional business days after Week 4 to address the
  specific rubric gaps called out at your Day 5 review, then one re-grade against the same rubric.
  There is no second re-grade beyond that without your program owner's sign-off.

## Definition of done

- [ ] Rubric score of 70 or more out of 100, with every must-have present (see the gate rule above).
- [ ] A 10-minute demo delivered, followed by Q&A.
- [ ] At least one peer review given and one received during the capstone, in addition to any given
      earlier in the program.

This is the final **Week 4 Friday gate.**
