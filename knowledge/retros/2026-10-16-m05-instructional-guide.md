# Retro — M05 instructional guide (Task API v1)

**Date:** 2026-10-16

## What landed

- `modules/m05-express-task-api-v1/module-5-express-task-api-v1.md` — guide mirroring the reference
  docx section-for-section (title block → Learning Goals → Concept → Read These → Walkthroughs →
  "What This Walkthrough Showed You" → EXERCISEs → Self-Check → Module Deliverable → Appendix).
- `write-up-template.md` filled in as a worked example (title/description unchanged).
- `tasks.md` ticked in place with evidence; headings/order preserved.

## Backlog (deferred, not blocking the artifact)

- **Runtime claims are unverified.** The guide asserts Express 5 behavior:
  auto-forwarded rejected promises in async handlers, `req.body === undefined` without a parser,
  `req.query` read-only getter, `/*splat` / optional `{}` segments, and the exact envelope emitted by
  the sample `errorHandler`. None were executed, because the repo is docs-only (no `package.json`,
  no `node_modules`) and M05's plan scoped instructional material, not product code. Follow the
  existing pattern `knowledge/patterns/verify-instructional-runtime-claims.md` before the next cohort
  runs this guide: reconstruct the `src/` files from the guide's heredocs in a throwaway project with
  Express 5 + TS strict, then run the endpoints and diff real responses against the quoted envelope.
- **`esModuleInterop` dependency.** The samples use `import express from 'express'` /
  `import cors from 'cors'`. Confirm that the M04 `tsconfig.json` enables `esModuleInterop` (or
  `allowSyntheticDefaultImports`) so the guide's imports compile as written.

## Constraint worth remembering

- **Checklist PR/merge items stay unticked when no PR actually merged.** M05's Setup and Verify
  sections both contain a branch → PR → merge item. The correct treatment (matching M02–M04) is to
  leave them `[ ]` with a note that the worked write-up's `pull/N` does not resolve — never tick it
  from instructional material alone. Getting this wrong was caught during `/validate`.

## Validation notes

- All external guide URLs return HTTP 200 (one dead link fixed: the Express TypeScript page was
  404; repointed to `https://expressjs.com/en/5x/api.html`).
- 40 fences balanced; 2 `bash` blocks pass `bash -n`; all 11 `ts` blocks parse under `esbuild`.
