# node-js-training-rnd

This repo is two things at once:

1. **The Node.js Developer Training Program** — a 4-week, 10-module, ~80-hour curriculum that takes
   developers who already know basic programming to building, validating, testing, and
   version-controlling a typed REST API (Express, Prisma, SQLite, Zod, Jest, Supertest) through a
   GitHub pull-request workflow.
2. **A working reference implementation of the Build-to-Teach framework** — trainer hands over a
   stage brief, trainee builds the deliverable *and* writes up how they built it, both get reviewed
   together at each checkpoint (see `docs/build-to-teach-framework.md`).

No cohort has run yet — this repo is still in the authoring/R&D stage (hence `-rnd`).

## Repo layout

```
docs/
  prd/nodejs-developer-training.md                       — original product requirements doc
  arch-docs/Node.js Developer Training Program —
    Solution Design.md                                   — PRD turned into a buildable plan
  build-to-teach-framework.md                             — the EM/trainee build-and-write-up cycle
  curriculum/node-js-developer-training-curriculum.md     — single-doc consolidated curriculum
                                                             reference (trainer/program-owner facing)
  materials/nodejs-developer-training/                    — generated Moodle-importable artifacts
                                                             (course page HTML, nuance quiz XML)
  templates/                                               — reference templates those generators
                                                             read from (not generated output)

modules/                                                   — the trainee-facing material: one folder
                                                             per stage (m01 … m10-capstone), each with
                                                             brief.md / write-up-template.md /
                                                             tasks.md. See modules/README.md.

knowledge/                                                 — reserved for patterns/rules/retros
                                                             (currently empty)
.claude/commands/, .claude/agents/                         — the custom skills this repo's workflow
                                                             runs on (see below)
```

## Modules

Ten stages, each a folder under `modules/` with `brief.md` (objective, scope, deliverable, lab,
definition of done — no solutions), `write-up-template.md` (blank, filled in by the trainee as
they build), and `tasks.md` (an ordered checklist generated from the brief via
`/trainee-task-planner`). Four modules (M05, M07, M08, M09) grow one Task API from v1 to v4; the
capstone repeats the whole pattern alone, in a new domain, with no reference solution.

| Stage | Module | Week · Day | Hours | Builds on |
| --- | --- | --- | --- | --- |
| [m01-dev-environment-git-github](modules/m01-dev-environment-git-github/brief.md) | Dev Environment, Git & GitHub | W1 · D1 | 4 | — |
| [m02-modern-javascript-async-await](modules/m02-modern-javascript-async-await/brief.md) | Modern JavaScript & Async/Await | W1 · D2-4 | 10 | m01 |
| [m03-nodejs-runtime-npm](modules/m03-nodejs-runtime-npm/brief.md) | Node.js Runtime & npm | W1 · D4-5 | 6 | m02 |
| [m04-typescript-on-node](modules/m04-typescript-on-node/brief.md) | TypeScript Basics & TypeScript on Node.js | W2 · D1-2 | 8 | m02, m03 |
| [m05-express-task-api-v1](modules/m05-express-task-api-v1/brief.md) | Express: Routing, Middleware & Error Handling | W2 · D3-5 | 12 | m04 |
| [m06-sql-fundamentals-sqlite](modules/m06-sql-fundamentals-sqlite/brief.md) | SQL Fundamentals with SQLite | W3 · D1-2 | 6 | m05 |
| [m07-prisma-orm-migrations](modules/m07-prisma-orm-migrations/brief.md) | Prisma ORM & Migrations | W3 · D2-4 | 8 | m05, m06 |
| [m08-zod-validation](modules/m08-zod-validation/brief.md) | Zod Validation & Type Inference | W3 · D4-5 | 6 | m07 |
| [m09-integration-testing](modules/m09-integration-testing/brief.md) | Integration Testing with Jest + Supertest | W4 · D1-2 | 8 | m08 |
| [m10-capstone](modules/m10-capstone/brief.md) | Capstone Project | W4 · D3-5 | 12 | m01-m09 |

Full explanation of the per-stage cycle (read brief → plan tasks → build → write up → trainer
checkpoint) lives in [`modules/README.md`](modules/README.md), along with the program's ground
rules and Friday-gate cadence.

## Where to start, depending on who you are

- **A trainee** — start at [`modules/README.md`](modules/README.md). Each stage's `brief.md` is a
  guide, not a solution: it names the objective, scope, deliverable, and definition of done, and
  leaves the implementation to you. Fill in `write-up-template.md` as you build, not after.
- **A trainer or program owner** — read
  [`docs/curriculum/node-js-developer-training-curriculum.md`](docs/curriculum/node-js-developer-training-curriculum.md)
  for the single-document view (objectives, full module-by-module scope, the capstone rubric,
  remediation policy, environment setup, delivery roles) and the
  [Solution Design](<docs/arch-docs/Node.js Developer Training Program — Solution Design.md>) for
  the reasoning behind it.
