# /evaluate

**EVALUATE** — Step 1 of the E→P→A→V cycle. Orient fully before writing any plan or code.

## Arguments

`/evaluate <task description, CSV path, or feature name>`

## Steps

### 1 — Orient with your knowledge graph (if one exists)

Check which backend this project has built, and use the matching query:

- `graphify-out/graph.json` exists → `graphify query "<task context from args>"`
- `.codegraph/codegraph.db` exists → `codegraph explore "<task context from args>"`
- If both exist, graphify is used by default — set `NEXUS_GRAPH_BACKEND=codegraph` to prefer codegraph instead (`nexus doctor` shows which is active).
- Neither exists → suggest `/graphify .` (or `codegraph init`) then continue without it.

Note which communities/symbols and high-degree nodes are in the blast radius.

### 2 — Load context in priority order

1. **CSV task** — if `docs/dev-tasks/` exists, load the matching row. Fields `user_story`, `description`, `acceptance_criteria`, `dependencies` are the context.
2. **AGENTS.md** — load coding standards from project root if present.
3. **Architecture doc** — scan `docs/arch-docs/` for the relevant section.
4. **knowledge/** — check `knowledge/rules/`, `knowledge/patterns/`, `knowledge/prompts/dev/` for prior patterns.

### 3 — Fix the output artifact (always this shape)

Every task in this repo produces **one Markdown file of instructional material** that a developer
can follow and test end to end. It is never code, never a plan, and never the brief or checklist.

- **Location and name:** inside the module's own folder, as
  `modules/<module-folder>/module-<module-no.>-<module-title>.md`
  — e.g. `modules/m01-dev-environment-git-github/module-1-dev-environment-git-github.md`.
  `<module-no.>` is the plain number (`1`, not `01`); `<module-title>` is the slug from the folder
  name.
- **Primary format reference:** `docs/reference/module-6-express-basics.docx`. Mirror it
  section-for-section: title block → Learning Goals → Concept → Read These →
  Walkthrough(s) → "What This Walkthrough Showed You" → numbered EXERCISEs → Self-Check →
  Module Deliverable → Appendix (Self-Check answers).
- **Secondary reference:** any existing `modules/**/module-<no.>-<title>.md` produced by this
  rule, so every guide stays consistent with the others.
- **Content:** instructional material only — real, runnable commands and code the learner
  executes and tests, plus exercises and self-checks. No solution files, no product code, no
  planning. Require that any step creating files/directories includes the exact terminal
  commands (`mkdir -p`, `touch`, `cat > ... << 'EOF' ... EOF`) with the full sample content.
- If the target file already exists, EVALUATE treats it as the artifact to review or extend — not
  a source to copy from.

### 4 — Output this summary, nothing else

```
EVALUATE SUMMARY
────────────────
Task:        <what we are building — instructional material for module M??>
Output:      modules/<folder>/module-<no.>-<title>.md  (mirrors the reference docx)
Touches:     <files / modules / graph communities or symbols>
Depends on:  <what must already exist>
Constraints: <from AGENTS.md, arch doc, acceptance criteria>
Risk:        <god nodes or high-degree nodes in blast radius>
```

### 5 — Stop

Do NOT plan. Do NOT write code. End with:

> "Ready to /plan. Type `/plan` when you want the implementation blueprint."
