# M10 Tasks — Capstone Project

Independently build, test, and present a complete API in a new domain, using the whole stack, with
no reference solution to copy from.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it —
> your own M05/M07/M08/M09 write-ups are the only reference material you have.

## Setup

- [ ] Read this stage's `brief.md` fully; re-read your own M05, M07, M08, and M09 write-ups before
      you start.
- [ ] Choose one domain from the five listed, and record your choice and reasoning.

## Day 3 — plan, schema, skeleton

- [ ] Create GitHub Issues for your planned work before writing any code.
- [ ] Design your schema: at least 3 models including a 1:N and an M:N relation, matching your
      chosen domain — include a users/accounts model with a role field, since two roles are
      required.
- [ ] Decide your two roles for this domain and what genuinely differs between them (not a
      cosmetic label — an actual authorization boundary).
- [ ] Research and pick a password-hashing library (bcrypt or argon2) and a token strategy (JWT or
      signed session cookie); note your choice and why in the write-up as you decide, not after.
- [ ] Draw the ERD in Mermaid.
- [ ] Set up the project skeleton using the pinned stack from every prior module (Node, TypeScript,
      Express, Prisma, Zod, Jest/Supertest config).
- [ ] Create your first Prisma migration(s) from the schema.

## Day 4 — routes, validation, error handling, auth, tests

- [ ] Build full CRUD for at least 2 resources.
- [ ] Build one list endpoint with filtering, sorting, and pagination.
- [ ] Build registration and login endpoints, hashing passwords with the library you picked.
- [ ] Build the auth middleware that requires a valid JWT/session on protected routes.
- [ ] Build the role check on at least one endpoint whose behavior must differ by role, and verify
      the wrong role is actually blocked, not just that the right role is allowed through.
- [ ] Add rate-limiting specifically on the login/registration endpoints.
- [ ] Route your JWT/session signing secret (and any other credential) through the `config.ts`
      validate-at-startup pattern from M08 — never hard-code it, never commit it.
- [ ] Identify one business rule for your domain and enforce it in a service, inside a transaction
      (e.g. cannot loan an unavailable book).
- [ ] Write a small script that fires parallel requests at the contested resource, and use it to
      prove your transaction actually prevents the race — run it before you're sure the transaction
      is correct too, so you have a genuine before/after to show.
- [ ] Add Zod validation for body, params, query, and env.
- [ ] Build a central error handler with one consistent error shape.
- [ ] Write at least 25 integration tests, including error paths and at least one test for the
      role-gated endpoint, targeting 80%+ coverage on routes and services.
- [ ] Commit a Bruno collection for the API.

## Day 5 — polish, peer review, demo

- [ ] Confirm you have at least 3 committed Prisma migrations total and a seed script.
- [ ] Confirm strict TypeScript mode and zero `tsc --noEmit` errors.
- [ ] Confirm your Git/GitHub workflow: Issues → feature branches → at least 8 pull requests,
      Conventional Commits, at least one peer review given and one received.
- [ ] Set up GitHub Actions CI and confirm it's passing.
- [ ] Write the README: setup steps, scripts, the Mermaid ERD, and an endpoint list.
- [ ] Prepare and deliver your 10-minute demo plus Q&A.

## Verify

- [ ] Confirm registration/login work, passwords are hashed (never stored or logged in plaintext),
      and the signing secret is never hard-coded or committed.
- [ ] Confirm a request to a role-gated endpoint from the wrong role is actually rejected, not just
      that the right role succeeds.
- [ ] Confirm rate-limiting actually triggers on the login/registration endpoints under repeated
      requests.
- [ ] Confirm the concurrency script shows a genuine before/after: the race was reproducible before
      the transaction was correct, and prevented after.
- [ ] Score yourself against every rubric row in `brief.md`, and confirm every must-have evidence
      item is actually present — not just the points total.
- [ ] Confirm the gate rule: a missing must-have blocks passing even at 70+, so fix any gap before
      calling this done.
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "Domain chosen, and why": fill this in before you start building, not after.
- [ ] "What I built".
- [ ] "Why it's built this way (key decisions)": which business rule you chose and why it needed a
      transaction, which two roles you designed and what genuinely differs between them, and which
      password-hashing library and token strategy you picked and why.
- [ ] "How to build it (teach it to the next trainee)": write the concurrency-proof guide.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "Security & Authorization": your hashing library and why, JWT vs signed session and why, how
      your two roles differ in practice, where rate-limiting is applied.
- [ ] "Proving the concurrency fix": how you generated concurrent load, what happened before the
      transaction was correct, what happened after — the actual evidence, not just a description.
- [ ] "What tripped me up".
- [ ] "Checkpoint evidence": the concurrency script's before/after, the demo you gave, and the peer
      review you gave and received.
- [ ] "Rubric self-score": fill in your estimate and evidence for every row, matching the Verify
      step above.
- [ ] Close out "What I'd do differently".
