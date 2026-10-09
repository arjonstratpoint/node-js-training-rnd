# Retro — M01 Instructional Guide (2026-10-09)

## Outcome
- Created `modules/m01-dev-environment-git-github/module-1-dev-environment-git-github.md`,
  mirroring `docs/reference/module-6-express-basics.docx` section-for-section (title block →
  Learning Goals → Concept → Read These → Walkthroughs → recap → numbered Exercises → Self-Check →
  Deliverable → Appendix answers).
- Grounded in the real repo (Node 24 `.nvmrc`, `scripts/hello-node.js`, merge commit `3500592`,
  conflict commit `21e2473`) and in `knowledge/patterns/dod-preserving-pr-merges.md`.

## Backlog
- README Stages table does not yet link the new guide (plan step 4 deferred). Add a one-line link
  when the guide is accepted into the content library.
- Reference docx uses a different module numbering (its "Module 6/8") than this repo (M01–M09);
  the guide was mapped to the repo scheme. Any future reference reuse must repeat that mapping.

## Lessons
- **Sequencing a walkthrough matters as much as its content.** An early draft merged the PR in
  Walkthrough Part 2, then reused the same branch in Part 3 for the conflict drill — a learner
  following literally would branch off merged history. Content-authoring pattern: when a drill
  reuses a branch, the merge must come *after* all branch work, or the drill must fork fresh.
- The reference format's "What This Walkthrough Showed You" recap maps cleanly onto Git concepts,
  not just middleware — the section template is content-agnostic.
