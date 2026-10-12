# Retro — M02 Instructional Guide (2026-10-12)

## Outcome
- Created `modules/m02-modern-javascript-async-await/module-2-modern-javascript-async-await.md`,
  mirroring `docs/reference/module-6-express-basics.docx` section-for-section (title block →
  Learning Goals → Concept → Read These → Walkthroughs → "What This Walkthrough Showed You" →
  numbered EXERCISEs → Self-Check → Deliverable → Appendix answers).
- Content grounded in the M02 `brief.md` (Async toolkit: `sleep`, `retry`, `withTimeout`,
  `mapLimit`), `tasks.md`, and the Solution Design M2 row. Verified end to end: all shell/JS blocks
  extracted and run under Node 24.21; event-loop output order matches the guide exactly;
  `node:assert` self-checks pass; parallel fetch beats sequential (~60x in practice).

## Backlog
- README Stages table does not yet link the new guide. Add a one-line link when the guide is
  accepted into the content library (same deferral as M01).
- Reference docx numbering differs from this repo's scheme; this guide was authored directly in the
  repo scheme (Module 2, M02). Any future reference reuse must repeat that mapping.

## Lessons
- **Extract-and-run every heredoc sample before shipping.** Two bugs were caught only by writing the
  `cat > … << 'EOF'` payloads to disk and running them: (1) an arrow function at ESM top level has
  `this === undefined`, so `` `${this.name}` `` throws — use `` this?.name ``; (2) a hard-coded
  "read N characters" comment drifted once `package.json` gained an `engines` field. Eyeballing the
  markdown would have missed both.
- **URL-check regex catches JS string literals.** `grep -oE 'https?://…'` on a guide that contains
  `fetch('https://…')` yields false-positive "URLs" with trailing `',`/`;` and a spurious non-2xx.
  Strip trailing punctuation before calling a URL dead, and re-check transient `000` results.
- **The reference's "What This Walkthrough Showed You" recap is content-agnostic** — it maps cleanly
  onto event-loop/async concepts, not just Express middleware.
