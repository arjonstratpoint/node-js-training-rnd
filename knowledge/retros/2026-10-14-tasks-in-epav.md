# Retro — tasks.md in the EPAV cycle (2026-10-14)

## Outcome
- Added `modules/<module-folder>/tasks.md` as the **third artifact** of the E→P→A→V cycle, alongside
  the instructional guide and the filled `write-up-template.md`.
  - `evaluate.md` — declares the checklist artifact; step 4 summary gains a `Checklist:` line.
  - `plan.md` — scopes `tasks.md` under **Files modified**; blueprint gains a `Checklist:` line.
  - `apply.md` — ticks `[ ]` → `[x]` in place with per-item evidence; reported under **Modified**.
  - `validate.md` — treats `tasks.md` as the baseline checklist; new output-artifact criterion.
- Rule adopted: the checklist is **updated, never generated** (generation stays with
  `/dev-tasks-planner`); missing file = stop and flag. Section headings are preserved as-is
  (M03+ carry a `Research` section) — the rule is section-agnostic.
- Reconciled the m01 drift: moved the filled `write-up.md` content into `write-up-template.md`
  (title/description unchanged) and deleted the stray `write-up.md`, so m01 now matches the rule and
  every other module.

## Blast radius
- The four command files share the `Steps` community with `epav.md` and `dev-tasks-planner.md`.
  `epav.md` delegates to the four skills (no edit needed); the write-up/tasks rules stay
  single-sourced in the four files.

## Backlog
- **README command-name drift.** `README.md:70` says `tasks.md` is "Generated from `brief.md` via
  `/trainee-task-planner`", but the actual command file is `/dev-tasks-planner`
  (`.opencode/commands/dev-tasks-planner.md`). Deferred: align the README wording (or add an alias)
  so the two names do not diverge further.
- **Bundled checklist items.** m03's Write-up "Checkpoint evidence" item bundles a merged-PR claim
  (the unresolved worked-example `pull/3`) with the CLI memory numbers and the server's `curl`
  responses. It was ticked because the write-up section exists and carries the concrete evidence,
  with the broken PR link called out inline — while the standalone Verify "merged via PR" item stays
  unticked. Rule of thumb going forward: when one item bundles independent claims, tick only if the
  actionable part is satisfied and name any unresolved sub-claim inline.
