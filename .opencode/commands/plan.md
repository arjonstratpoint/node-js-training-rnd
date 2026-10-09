# /plan

**PLAN** — Step 2 of the E→P→A→V cycle. Produce a blueprint. No code yet.

## Prerequisite

EVALUATE must have run first. If it hasn't, run `/evaluate <task>` before continuing.

## Steps

### 1 — Blast radius check

- `graphify-out/graph.json` exists → `graphify path "<primary file/module>" "<secondary file/module>"`
- `.codegraph/codegraph.db` exists → `codegraph impact <primary symbol>` — codegraph's `impact` takes one symbol, not a file pair, so treat it as the closest available check, not an exact equivalent to `graphify path`.
- Neither exists → note in the plan that this check was unavailable and proceed on a best-effort review.

Run for every significant file the plan will touch. State what else will be affected.

### 2 — Write the implementation blueprint

The deliverable is always the instructional-material Markdown file defined at EVALUATE:

`modules/<module-folder>/module-<module-no.>-<module-title>.md`
(e.g. `modules/m01-dev-environment-git-github/module-1-dev-environment-git-github.md`).

The blueprint MUST:

- Name that exact target path and list it under **Files created** (or **Files modified** if it
  already exists — plan to edit, never to duplicate).
- Lay out the section order to mirror `docs/reference/module-6-express-basics.docx`
  (title block → Learning Goals → Concept → Read These → Walkthrough(s) → "What This Walkthrough
  Showed You" → numbered EXERCISEs → Self-Check → Module Deliverable → Appendix answers).
- Scope every step to producing or editing that file. No product code, no solution files.
- Explicitly plan to show exact creation commands (`mkdir -p`, `touch`, `cat > ... << 'EOF' ... EOF`) with full sample content whenever files/directories are created.

Structure the plan as numbered steps:

```
PLAN
────
Output artifact: modules/<folder>/module-<no.>-<title>.md
1. <file or module> — <what changes and why>
2. <file or module> — <what changes and why>
...

Files created:   <list>
Files modified:  <list>
Files deleted:   <list>

Blast radius:    <from the active knowledge graph — what else references these>
God nodes touched: <list any with degree > 10>
```

### 3 — State constraints

List which AGENTS.md rules and architecture decisions apply to this plan.

### 4 — Stop and wait

Do NOT write code. End with:

> "Waiting for approval. Reply `/apply` to implement, or give feedback to revise the plan."
