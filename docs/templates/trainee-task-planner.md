# /trainee-task-planner

Generates `tasks.md` for a single Build-to-Teach stage (a module folder under `modules/`), turning its
`brief.md` into an ordered, actionable checklist a trainee can work through solo — from reading the
brief to a finished build and a filled-in `write-up-template.md`. Use this instead of hand-writing a
checklist — it's easy to forget to cover every scope item, every definition-of-done check, and every
write-up section otherwise.

This is the trainee-facing counterpart to `/dev-tasks-planner`, not a replacement for it. That command
reconciles a Jira-style BE/FE backlog against product code someone has already partially built; this
one plans one trainee's solo path through a stage that doesn't exist yet. **Never point
`/dev-tasks-planner` at a `modules/` stage** (there's no BE/FE split, no existing code to reconcile
STATUS against, and no Day-0-mock/Day-1-real-API swap to track — every row would trivially be `To Do`),
**and never point this command at a product epic** — the two commands don't share a model.

Follows the same EVALUATE → PLAN → APPLY → VALIDATE cycle as `/evaluate` `/plan` `/apply` `/validate`,
self-contained in this one command (the same shape `/dev-tasks-planner` and `/scaffold` use) since
checklist generation is one continuous task. **Stop at the end of EVALUATE and PLAN and wait for
explicit approval before continuing** — do not run straight through to APPLY.

## Arguments

`/trainee-task-planner <stage-folder>`

Example: `/trainee-task-planner modules/m07-building-a-rest-api`

Also accepts:
- `/trainee-task-planner all` — generate (or refresh) `tasks.md` for every stage listed in
  `modules/README.md`, one at a time, same cycle per stage.
- `/trainee-task-planner re-plan modules/<stage>` — regenerate an existing `tasks.md` after its
  `brief.md` changed. Same cycle; APPLY overwrites the existing file instead of creating a new one.

## Prerequisites — MANDATORY, check before doing anything else

Verify both with an actual read, not an assumption:

1. **`<stage-folder>/brief.md` must exist.** No brief, nothing to plan from.
2. **Unless this is the first stage, the previous stage's `write-up-template.md` should show real,
   filled-in content** — not just the blank template. Each brief's "Builds on" line means the trainee
   is expected to have a working prior-stage artifact before starting this one. Check by reading the
   file's actual content, not just its existence — a copied-but-unfilled template has the same headings
   as a completed one.

If #1 fails, stop immediately:

```
⚠ /trainee-task-planner cannot run for <stage> yet.

Missing: <stage>/brief.md

Have your trainer provide the stage brief before planning tasks against it.
```

If #2 fails, don't hard-stop — flag it and ask whether the trainee is intentionally working ahead or
revisiting a stage out of order, then continue once confirmed. Planning a stage without its prerequisite
filled in isn't invalid, just worth surfacing before tasks get written against an assumption that isn't
true yet.

---

## EVALUATE — Read the brief and what it builds on

Read `<stage>/brief.md` end to end — Objective, Scope, Stack constraints, Deliverable, Definition of
done, Still open. Read `<stage>/write-up-template.md` end to end — every section heading in it is
something the task list must eventually produce evidence for. If a previous stage exists, read its
`write-up-template.md` to know what's already built and can be assumed as a starting point — don't
re-plan work that stage already covers.

### Output — EVALUATE SUMMARY

```
EVALUATE SUMMARY
────────────────
Stage:              <folder>
Objective:          <from brief>
Builds on:          <previous stage's artifact, or "none — first stage">
Scope items:        <bulleted list from brief>
Stack constraints:  <from brief>
Deliverable:        <from brief>
Definition of done: <bulleted checks from brief>
Write-up sections:  <section headings from write-up-template.md>
Still open:         <items the trainee needs to confirm with the trainer, if any>
```

Do NOT draft task wording yet. End with:

> "Ready to plan. Reply to proceed with PLAN, or give feedback to redo EVALUATE."

---

## PLAN — Turn the brief into an ordered task list

### Rules

Every rule below exists because it's an easy thing to silently skip when turning a brief into a
checklist quickly:

- **Tasks are actions, never answers.** A task says what to decide, build, or verify — it must never
  contain the implementation itself: no code, no "use `<specific API>`", no named algorithm or design
  pattern that resolves the brief's open design question for the trainee. Where the brief deliberately
  leaves something for the trainee to reason through (e.g. a concurrency or ID-collision question), the
  task restates the question, it does not answer it. Where a concept is genuinely something to look up
  (e.g. an ES Module global, a built-in flag), the task points at *where* to look — the API family or
  doc section — never the resolved answer.
- **One task per scope item**, in roughly the order the brief lists them. A brief's scope order is
  usually deliberate — foundational concept before the thing built on it — don't reshuffle without
  reason.
- **One task per deliverable component**, split in build order. If a deliverable bundles a sequence
  (e.g. "in-memory first, then swapped to JSON persistence"), that's two-plus sequential tasks, not one
  vague one.
- **One task per definition-of-done check**, phrased as a verification step near the end of the list —
  not folded into the build tasks where it can get skipped.
- **One task per "still open" item**, phrased as "confirm with your trainer: …", placed early (before
  it can block something downstream), not appended at the end as an afterthought.
- **A write-up task alongside each major build step**, reminding the trainee to capture that step in
  `write-up-template.md` *now*, while the reasoning is fresh — not only one task at the very end. Add
  one closing task per template section heading as a final completeness pass.
- **A closing self-review task** against the brief's own definition of done, and — for the capstone
  specifically — against the fixed rubric in its `brief.md`.

### Output — PLAN blueprint

```
PLAN
────
File: <stage>/tasks.md — <task count>, new or re-plan

Task list:
  [ ] 1. <task>
  [ ] 2. <task>
  ...

Constraints applied: <how each scope item / deliverable component / done-check / write-up section /
                       open item above maps onto a task number>
```

Output as a blueprint. No file writes yet. End with:

> "Waiting for approval. Reply to apply, or give feedback to revise the plan."

---

## APPLY — Write `tasks.md`

Write `<stage>/tasks.md` as a plain markdown checkbox list (`- [ ] ...`), grouped under headings that
mirror the brief's own structure — `## Setup`, `## Build`, `## Verify`, `## Write-up` — so progress is
visible stage by stage rather than as one flat list. Start the file with the stage name, its one-line
objective, and an explicit note that there is no solutions file for this stage — the checklist guides
the work, it doesn't contain it.

### Output — APPLY COMPLETE

```
APPLY COMPLETE
──────────────
Created/Updated: <stage>/tasks.md
Tasks written:   <count>
```

Then prompt to continue to VALIDATE.

---

## VALIDATE — Check the checklist actually covers the brief

Don't rely on an eyeball pass. Re-read `brief.md` and the written `tasks.md` side by side and confirm,
as an explicit checklist:

- Every scope bullet maps to at least one task.
- Every deliverable component maps to at least one task.
- Every definition-of-done check maps to at least one verification task.
- Every `write-up-template.md` section heading maps to at least one write-up task.
- Every "still open" item maps to a confirm-with-trainer task.
- **No task contains a leaked answer** — re-read each task line specifically for a code snippet, a named
  library/API call, or a design choice that resolves a question the brief left for the trainee. Don't
  assume PLAN already caught every instance.

Fix anything missed, then re-run the check until clean.

### Output — VALIDATE COMPLETE

```
VALIDATE COMPLETE
─────────────────
File validated: <stage>/tasks.md
Checks passed:  scope-coverage / deliverable-coverage / done-coverage / write-up-coverage /
                open-items-coverage / no-answers-leaked
Issues fixed:   <list, if any>
```

> "Task complete."
