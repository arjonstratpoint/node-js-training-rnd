# Pattern — Match every command to the shell the learner is actually in

**Discovered:** 2026-10-16, building/validating the M06 instructional guide.

## The pattern

A runnable step is only runnable if its **shell context is the one the learner is standing in**.
Guides that mix an interactive REPL (the `sqlite3` shell, `python`, `node -i`, a debugger) with
ordinary shell steps must keep the two contexts straight, or a copy-pasted command fails.

Concretely, when a guide opens an interactive session with `sqlite3 tasks.db` and then narrates
walkthroughs "at the `sqlite>` prompt":

- **Do** put SQL and sqlite dot-commands (`.headers on`, `.mode column`, `PRAGMA`, `EXPLAIN QUERY
  PLAN`, `BEGIN`/`COMMIT`/`ROLLBACK`) in those steps.
- **Don't** drop a `cat > file << 'EOF'` / `git …` / `sqlite3 db < file.sql` block in the middle of
  the interactive stretch — pasted at `sqlite>`, it is parsed as SQL and errors.
- **Do** give an explicit exit (`.quit`) at the boundary and say so ("you are back at the shell
  now"), then place shell steps after it.
- If a file edit belongs conceptually to an earlier interactive step (e.g. "append this index to
  `schema.sql`"), either move it to the next shell-context step and reference it, or label it
  clearly as "do this in a second terminal".

Related: an outer fenced block whose input is a heredoc that **itself contains a triple-backtick
fence** (e.g. writing a `README.md` with a ```mermaid block via `cat > README.md << 'EOF'`) must use a
**four-backtick** outer fence, otherwise the inner fence closes the outer block early and the rest of
the guide renders as prose.

## How to check it (validation hook)

Reconstruct the learner's session and execute it in order, tracking the current shell:

1. Walk the artifact's fenced blocks top to bottom.
2. Maintain a `context` flag toggled by commands that enter/exit a REPL.
3. If a `bash`-tagged block is encountered while `context == REPL`, that is a BLOCKER.
4. Run all `bash` blocks with `bash -n`, and run the happy-path ones end to end in a throwaway dir.
5. Re-run the *whole* sequence after any edit, not just the block you changed.

## Verified facts captured during M06 (sqlite3 3.51.0)

- **The naive fence count `grep -c '^```'` is not a balance check.** A four-backtick block
  containing a three-backtick fence makes the count unreliable; parse runs of backticks instead.
  `Module 6`'s guide reports even at 88 with a naive count but only a real parser proves closure.
- **CLI parameter binding needs `.parameter set`.** Passing an extra argument after the SQL
  (`sqlite3 db "…=?1" "$val"`) is **not** bound — the CLI treats the trailing argument as more SQL.
  The bound form that blocks injection is:
  `sqlite3 db << 'EOF'` / `.parameter set :title "' OR '1'='1"` /
  `SELECT … WHERE title = :title;` / `EOF`.
- **`PRAGMA foreign_keys` is per connection**; a `FOREIGN KEY` violation surfaces as
  `Error: stepping, FOREIGN KEY constraint failed (19)` only when the pragma is on.
- **`EXPLAIN QUERY PLAN`** reads `SCAN <table>` without an index and
  ``SEARCH <table> USING INDEX <name> (col=?)`` with one — a stable before/after to quote.
