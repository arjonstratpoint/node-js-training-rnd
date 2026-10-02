# Build-to-Teach Prompt Playbook

A reusable, copy-paste prompt sequence for turning any course's solution-design doc into a Build-to-Teach
`modules/` structure. Replace every `< … >` placeholder before sending. Each prompt is in its own block —
copy the whole block, fill in the placeholders, send as-is.

## What this produces

```
modules/
  README.md                          — the cycle, explained to trainees
  m01-<stage-name>/
    brief.md                         — trainer-authored curriculum handoff (no lessons, no answers)
    write-up-template.md             — blank; the trainee writes this AS they build
    tasks.md                         — generated checklist bridging the two (/trainee-task-planner)
  m02-<stage-name>/
    ...
  capstone/
    ...
```

Plus one reusable piece of repo infrastructure: `.claude/commands/trainee-task-planner.md`.

---

## Prompt 1 — Generate the brief + write-up-template structure

Run once per new course.

**Placeholders:** `<FRAMEWORK_DOC_PATH>`, `<SOURCE_DOC_PATH>`

```
Read <FRAMEWORK_DOC_PATH> and <SOURCE_DOC_PATH>. Create training modules under modules/ following the
Build-to-Teach framework: one folder per stage (from the course's own module/session breakdown), each
containing:
- brief.md — the trainer's curriculum handoff only: objective, scope, stack constraints, the
  deliverable (named, not instructed how to build), and an observable definition-of-done. No lesson
  content, no lab steps, no code, no solutions — the trainee designs and builds this themselves.
- write-up-template.md — blank, for the trainee to fill in as they build, not after: what they built,
  the key decisions and tradeoffs, a "how to build it" section they author themselves (this becomes the
  actual teaching content), concepts explained in their own words, what tripped them up, and checkpoint
  evidence.

Also add modules/README.md explaining the cycle: trainer hands over the brief -> trainee builds and
writes up the stage together -> both get reviewed together -> trainee revises -> the finished pair goes
into the content library for the next cohort.
```

---

## Prompt 2 — Create `/trainee-task-planner`

Run once per repo. **Skip this and just copy `.claude/commands/trainee-task-planner.md` into the new
repo instead** if it already exists somewhere you have access to — the command has nothing
course-specific in it.

```
Create a command, /trainee-task-planner, that reads a training stage's brief.md and produces an ordered
checklist (tasks.md) for a solo trainee to work through: build steps in the brief's scope order, the
brief's open design questions restated as tasks (never answered), one verification task per
definition-of-done check, and one write-up task per write-up-template.md section. Follow an
EVALUATE -> PLAN -> APPLY -> VALIDATE cycle, stopping for approval after EVALUATE and PLAN. The
non-negotiable rule: tasks must never leak answers — no code, no named library/API/algorithm, no design
choice that resolves a question the brief deliberately leaves open for the trainee to reason through.
VALIDATE must re-check every scope item, deliverable component, definition-of-done check, and write-up
section against the generated checklist, plus a dedicated re-read for leaked answers.
```

---

## Prompt 3 — Generate `tasks.md` for one stage

Run first, before the bulk prompt, to confirm the shape.

**Placeholder:** `<STAGE_FOLDER>` (e.g. `modules/m03-modules-and-npm`)

```
/trainee-task-planner <STAGE_FOLDER>
```

Advance through the gates it stops at with `/plan`, `/apply`, `/validate` (or "continue") at each one.

---

## Prompt 4 — Generate `tasks.md` for every remaining stage

```
run /trainee-task-planner for all remaining stages
```

Execute as one forked subagent per remaining stage, in parallel. Give each fork this prompt:

**Placeholders:** `<STAGE_FOLDER>`, `<PRECEDENT_TASKS_FILE>` (an already-generated `tasks.md` to match
the shape of), `<STAGE_SPECIFIC_SENSITIVITY>` (optional — name any open design question in this stage's
brief that must not be answered, e.g. "this stage's brief leaves a concurrency/ID-generation question
open — do not name a specific technique in any task")

```
Run `/trainee-task-planner <STAGE_FOLDER>` end to end — EVALUATE, PLAN, APPLY, VALIDATE, all four steps,
no pausing for approval (the request to run this for all remaining stages is itself the approval). Use
<PRECEDENT_TASKS_FILE> as the shape precedent: same section headings, same task granularity, same
closing self-review task. Tasks must never leak answers — no code, no named library/API/algorithm that
resolves a design question the brief leaves open for the trainee. <STAGE_SPECIFIC_SENSITIVITY>

Write <STAGE_FOLDER>/tasks.md, then run the full VALIDATE coverage check against this stage's own
brief.md and write-up-template.md. Fix any gaps found, then re-check until clean.

Report back under 200 words: task count and section breakdown, any coverage gaps found and fixed, and
confirmation the no-leaked-answers check passed.
```

---

## Prompt 5 — Spot-check the riskiest stages

No prompt needed — read the generated files yourself. For any stage whose brief leaves a genuinely open
design question (a concurrency model, an ID scheme, a topic/feature choice), re-read its `tasks.md`
directly rather than trusting a subagent's self-report. For everything else, a count check is enough:

```
grep -c '^\- \[ \]' modules/*/tasks.md
```

---

## Prompt 6 — Raise the bar for a stage later

A three-step sequence, not a single prompt — `tasks.md` gets regenerated from an updated brief, not
hand-patched.

**Placeholders:** `<STAGE_FOLDER>`, `<HARDER_REQUIREMENT>` (describe what's raising the bar, e.g. "a
more challenging task, since the developer will use ai-assisted development")

**6a — trigger the update:**

```
update <STAGE_FOLDER> to <HARDER_REQUIREMENT>
```

This should result in `brief.md` being edited first (the curriculum document — raised scope, any new
policy, an updated rubric), then `write-up-template.md` edited to match (a reflection section for
whatever the new policy requires evidence of).

**6b — regenerate the task list against the updated brief:**

```
/trainee-task-planner re-plan <STAGE_FOLDER>
```

Go through its EVALUATE/PLAN/APPLY/VALIDATE gates as a full rewrite of `tasks.md`.

---

## Minimum reusable assets for a brand-new course or repo

1. The Build-to-Teach framework doc itself, unchanged.
2. `.claude/commands/trainee-task-planner.md` — copy as-is.
3. This playbook, for the prompts.

Everything else (`modules/` itself, each stage's `brief.md` / `write-up-template.md` / `tasks.md`) is
generated fresh per course from that course's own solution-design/architecture doc via Prompts 1–4.
