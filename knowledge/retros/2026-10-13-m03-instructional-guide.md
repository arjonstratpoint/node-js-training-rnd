# Retro — M03 Instructional Guide (2026-10-13)

## Outcome
- Created `modules/m03-nodejs-runtime-npm/module-3-nodejs-runtime-npm.md`, mirroring
  `docs/reference/module-6-express-basics.docx` section-for-section (title block → Learning Goals →
  Concept → Read These → Walkthroughs → "What This Walkthrough Showed You" → numbered EXERCISEs →
  Self-Check → Module Deliverable → Appendix answers), and matching the m02 guide's styling.
- Filled in `modules/m03-nodejs-runtime-npm/write-up-template.md` as a worked example (title and
  description unchanged; answers in place; no separate `write-up.md`).
- Content grounded in the M03 `brief.md` and `tasks.md`: the streaming `log-report` CLI
  (`createReadStream` + `node:readline` + `parseArgs`), the bare `node:http` server with three JSON
  endpoints and hand-rolled routing/body parsing/errors, the runtime tour, npm/config drills, and
  debugging. Verified end to end under Node 24.21.

## Backlog
- **Worked-example PR links 404.** The write-up's "Merged PR" link
  (`github.com/arjonstratpoint/node-js-training-rnd/pull/3`) does not resolve — only PR #1 exists on
  that remote. This matches the m02 precedent (`.../pull/2`, also 404). Deferred as a convention
  issue: at cohort time, link the trainee's real PR (or use the `pull/new/<branch>` URL m01 teaches),
  or these example links will keep pointing at PRs that were never opened on this remote.
- README Stages table still does not link the m01/m02/m03 guides. Same deferral as m01 and m02.

## Lessons
- **Extract-and-run caught one real bug and confirmed several false positives.** The guide's
  `buffer-vs-stream.js` was first written importing `readFile` from `node:fs` (callback) rather than
  `node:fs/promises`; it only failed at run time with `ERR_INVALID_ARG_TYPE`. Eyeballing the markdown
  would not have caught it.
- **The URL-check regex flags JS string literals, as the m02 retro warned.**
  `https://example.com/api/tasks?done=false` (a `new URL(...)` demo in `core-tour.js`) reports 404 and
  `http://${req.headers.host}` / `http://localhost:${PORT}` report 000 — all code, not links. Strip
  trailing punctuation and read the context before calling a URL dead.
- **Blockquote-embedded bash fences need special handling.** The optional `cjs-tour.cjs` block sits
  inside a `>` blockquote, so a naive `^```bash` extractor skips it and a naive heredoc extractor
  captures the `> ` prefixes. Test such blocks by hand.
- **Non-JS heredocs inflate syntax-failure counts.** `package.json`, `.gitignore` and `.env.example`
  payloads legitimately fail `node --check`; classify by file type before treating as a defect.
