# node-js-training-rnd

This repo is two things at once:

1. **The Node.js Developer Training Program** — a 4-week, 10-module, ~80-hour curriculum that takes
   developers who already know basic programming to building, validating, testing, and
   version-controlling a typed REST API (Express, Prisma, SQLite, Zod, Jest, Supertest) through a
   GitHub pull-request workflow.
2. **A working reference implementation of the Build-to-Teach framework** — trainer hands over a
   stage brief, trainee builds the deliverable *and* writes up how they built it, both get reviewed
   together at each checkpoint. `docs/build-to-teach-playbook.md` documents the exact prompt
   sequence used to generate this repo's `modules/`, so the same process can be replayed against a
   different course's solution-design doc.

No cohort has run yet — this repo is still in the authoring/R&D stage (hence `-rnd`).

## Repo layout

```
docs/
  prd/nodejs-developer-training.md                       — original product requirements doc
  arch-docs/Node.js Developer Training Program —
    Solution Design.md                                   — PRD turned into a buildable plan
  build-to-teach-framework.md                             — the EM/trainee build-and-write-up cycle
  build-to-teach-playbook.md                              — reusable prompt sequence to replay this
                                                             process for a different course
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
- **Adapting this for a different course** — read
  [`docs/build-to-teach-playbook.md`](docs/build-to-teach-playbook.md). It's a copy-paste prompt
  sequence, not prose documentation.

## Tooling this repo runs on

- **`.claude/commands/`** — custom skills, including the E→P→A→V cycle (`/evaluate` → `/plan` →
  `/apply` → `/validate`), `/trainee-task-planner` (turns a stage's `brief.md` into an ordered
  `tasks.md`), `/create-cohort-handover`, `/create-rubric`, and the Moodle-materials generators
  (`/create-moodle-page`, `/create-moodle-quiz`, `/create-moodle-materials`).
- **`graphify-out/`** — a generated knowledge-graph cache over this repo (gitignored, regenerate
  with `/graphify .`).
- **`.mcp.json`** — the `nexus-jev` MCP server this project connects to.
- **`.vscode/settings.json`** — Markdown files open straight into Preview by default.

## Pinned stack (this cohort)

Node.js 24 LTS · Express 5.x · TypeScript 7.0 · Prisma ORM 7.x (always `@7`, never unversioned) ·
SQLite via `better-sqlite3` · Zod 4.x · Jest 30.x · Supertest 7.x · Bruno · Git/GitHub Actions. Free
tools only — no Docker, no paid licences. Full detail and the reasoning behind each pin is in the
Solution Design and the consolidated curriculum doc linked above.
