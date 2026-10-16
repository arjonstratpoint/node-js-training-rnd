# Retro — M07 instructional guide (Prisma ORM & Migrations, Task API v2)

**Date:** 2026-10-16

## What landed

- `modules/m07-prisma-orm-migrations/module-7-prisma-orm-migrations.md` — guide mirroring the
  reference docx section-for-section (title block → Builds on → Learning Goals → Concept → Read
  These → Walkthroughs → "What This Walkthrough Showed You" → EXERCISEs → Self-Check → Module
  Deliverable → Appendix).
- `write-up-template.md` filled in as a worked example (title/description unchanged; the guide's
  add-a-column guide written out in full).
- `tasks.md` ticked in place with evidence; headings/order preserved; all 34 item texts unchanged.

## Runtime verification

Unlike M05 (backlogged as unverified), M07's claims were verified against pinned Prisma 7.10.1 +
`@prisma/adapter-better-sqlite3` in throwaway projects: `init` output, the config-file shape, the
`--create-only` RedefineTables migration and its hand-edited backfill, the full
service/routes/handler code under `tsc --noEmit`, the `P2002`/`P2025`/`P2003` demo, the seed, and
Prisma Studio. These findings changed the guide:

- **`estimate` ordering.** The API code in Walkthrough 3–4 cannot reference `estimate` before the
  Walkthrough 6 migration introduces it. Removed it from 3–4 and added a "schema change ripples into
  code" step in 6.
- **`migrate reset` does not seed.** Prisma 7 replays migrations and stops; the seed is a separate
  step (or a `migrations.seed` command run via `prisma db seed`). The guide no longer claims reset
  auto-runs the seed.
- **Prisma Studio protocol.** Plain `studio` fails on the `file:./dev.db` URL (`… not supported for
  the "file:./dev.db" protocol`); `studio --url "file://./dev.db"` works. The `db:studio` script
  carries it.
- **`select` + `include` together** is a runtime validation error, not a type error — noted in the
  Self-Check answer.

## Backlog (deferred, not blocking the artifact)

- **Generated-client path diverges from the design of record.** The guide uses `output =
  "../generated/prisma"` (project root) and the singleton `src/lib/prisma.ts`. The architecture doc
  (`docs/arch-docs/…Solution Design.md`) reference layout and the PRD's init command
  (`npx prisma init --datasource-provider sqlite --output ../src/generated/prisma`) put the client at
  `src/generated/prisma/` and the singleton at `src/db.ts`. The guide is internally consistent and
  fully runnable (verified), and M05 already diverges from that reference layout
  (`src/middlewares/errorHandler.ts`, `src/errors/AppError.ts` vs the doc's `src/middleware/`,
  `src/errors.ts`), so this is a **program-level** layout reconciliation, not an M07 defect. Decide
  once across M05–M10 whether to adopt the reference layout, then realign.
- **`prisma init` flags.** The PRD uses `--datasource-provider sqlite --output …`; the guide's bare
  `init` + manual schema rewrite teaches the schema explicitly and is verified. Revisit if the
  program prefers the one-command setup.

## Constraint worth remembering

- **Pin Prisma doc links to `/v7/`.** The Prisma docs now default to version 8. Several unversioned
  `prisma.io/docs/orm/…` links redirect to v6 or v8 pages, which contradicts the `^7` pin. Use
  `https://www.prisma.io/docs/orm/v7/…` for ORM topics. There is no `/v7/` Studio page; the Studio
  docs are version-independent at `https://www.prisma.io/docs/studio/getting-started`.

## Validation notes

- 13 external URLs return HTTP 200; all Prisma ORM links are `/v7/`-pinned. `localhost:3000` /
  `:51212` URLs are runtime endpoints, not links.
- 128 fences balanced; 43 `bash` blocks pass `bash -n`; TypeScript heredocs typecheck as a
  reconstructed project (`tsc --noEmit` clean).
- All 16 EXERCISEs present; 12 Self-Check questions each have an Appendix answer; tasks.md PR/merge
  item left `[ ]` (no PR merged), matching M02–M06.
