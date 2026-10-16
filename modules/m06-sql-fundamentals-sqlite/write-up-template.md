# M06 Write-Up — SQL Fundamentals with SQLite

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. Your M07 self needs this schema and ERD, so write it like you'll need it again.

## What I built

A hand-written relational database for the Task API, built from the guide
[`module-6-sql-fundamentals-sqlite.md`](module-6-sql-fundamentals-sqlite.md) (Walkthroughs 1–8):

- **`module-6-sql/schema.sql`** — DDL for `users`, `tasks`, `tags` and the `task_tags` junction
  table, with `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT` and `FOREIGN KEY … ON DELETE CASCADE`
  constraints, plus indexes on `tasks.user_id` and `task_tags.tag_id`.
- **`module-6-sql/seed.sql`** — 3 users, 4 tags, 7 tasks and 9 tag links, chosen so every query
  category has something to bite on (multi-tag tasks, an untagged task, two owners with equal counts).
- **28 graded query exercises** (guide §Numbered EXERCISEs) covering filtering/sorting/pagination,
  `INNER`/`LEFT` joins, `GROUP BY`/`HAVING` aggregates and `IN`/`EXISTS`/correlated subqueries.
- **A transaction demo** — insert-then-`ROLLBACK` versus insert-then-`COMMIT` (Walkthrough 6).
- **An ERD in `module-6-sql/README.md`** as a Mermaid `erDiagram` (Walkthrough 8) matching the built
  schema: `tasks.user_id` is the 1:N key, `task_tags` carries the M:N junction.
- **An injection demo** — the vulnerable concatenated query returning all 7 rows, then the
  parameterised query returning none (Walkthrough 7).

Full schema reference (with the actual DDL and seed data):
[`module-6-sql-fundamentals-sqlite.md`](module-6-sql-fundamentals-sqlite.md) §Walkthrough 1.

## Why it's built this way (key decisions)

- **Why this junction-table design for `task_tags`, specifically?** A task has many tags and a tag
  applies to many tasks, so neither table can hold the link without repeating rows — that is a
  many-to-many by definition, and the normalised answer is a table whose rows *are* the links. I gave
  it two foreign keys (`task_id`, `tag_id`) and made the **pair** the primary key, so the same tag
  cannot be attached to the same task twice. Both FKs use `ON DELETE CASCADE`, so deleting a task or a
  tag cleans up its links automatically instead of leaving orphan rows. This is also why the seed has
  9 `task_tags` rows for 7 tasks — links are their own data.
- **What did you index, and what would change in your queries if you hadn't?** I indexed
  `tasks.user_id` (used by the 1:N join and "tasks for a user") and `task_tags.tag_id` (used to find
  tasks by tag). Without `idx_tasks_user_id`, joining users to tasks — or filtering a user's tasks —
  becomes a full `SCAN tasks` that reads every row each time. Walkthrough 5 shows the same effect for
  `status`: `SCAN tasks` becomes `SEARCH tasks USING INDEX idx_tasks_status (status=?)` once the index
  exists. Note I did not index `tags.name`; `UNIQUE` already creates an implicit index for it, which
  is why unique columns rarely need a second `CREATE INDEX`.
- **Which exercise taught you something you didn't expect?** Exercise 12 (tags with task counts
  *including tags used by zero tasks*). Reaching for `INNER JOIN` silently drops tags with no tasks,
  so the count never shows 0. To keep them you must start from `tags` and `LEFT JOIN` through
  `task_tags`, then count the non-null side. That made the `INNER` vs `LEFT` distinction concrete
  rather than theoretical.

## How to build it (teach it to the next trainee)

A guide to designing a junction table for a many-to-many relationship, using the tag example:

1. **Name the relationship.** "A task has many tags, and a tag applies to many tasks." When *both*
   sides are "many", you cannot store the link as a column on either table.
2. **Create the two parent tables first** (`tasks`, `tags`), each with its own `id` primary key. The
   junction depends on them, so it comes last in `schema.sql`.
3. **Create the junction with one row per link.** Each column is a foreign key to a parent:
   `task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE` and the same for `tag_id`.
4. **Make the pair the primary key:** `PRIMARY KEY (task_id, tag_id)`. This is the whole trick — it
   forbids duplicates (`task 1 + tag 2` can exist once) without needing a separate surrogate id.
5. **Index the non-leading column.** The composite primary key already indexes `(task_id, tag_id)`,
   so lookups "by task" are fast; lookups "by tag" are not, which is why you add
   `CREATE INDEX idx_task_tags_tag ON task_tags(tag_id)`.
6. **Query *through* the junction with two joins.** To list a task's tags:
   `tasks JOIN task_tags ON task_tags.task_id = tasks.id JOIN tags ON tags.id = task_tags.tag_id`.
   To keep parents that have *no* links, use `LEFT JOIN` from the parent side.
7. **Use `ON DELETE CASCADE` deliberately.** Deleting a parent should delete its links; otherwise you
   accumulate orphan rows that nothing references. Only omit cascade when the link must outlive the
   parent, which is almost never the right choice for a pure junction table.

The same recipe applies to any M:N pair: students↔courses, orders↔products, posts↔tags.

## Concepts worth explaining

**1:N vs M:N modelling.** A 1:N relationship is a foreign key on the "many" side: one `users` row,
many `tasks` rows, so `tasks.user_id` points back at `users.id`. A M:N relationship cannot be a single
column, because either side can have several of the other; you add a junction table whose rows are the
pairs. Practically: if you can say "this row belongs to exactly one of those", it is 1:N (FK on the
many side); if you can say "this row can relate to many of those, and vice versa", it is M:N (junction
table).

**Why parameterised queries stop injection.** String concatenation builds the SQL *and* the data into
one string, so the database cannot tell where the query ends and the value begins — an attacker who
supplies `' OR '1'='1` closes the quote and injects syntax, turning a filter into "always true". A
parameterised query sends the SQL text with a placeholder (`:title` or `?`) and the values on the
side. The text is fixed before the values arrive, so the attacker's string is only ever compared as a
value; it can never be parsed as SQL. That is why the vulnerable query returns all 7 rows and the
parameterised one returns none.

## What tripped me up

- **SQL injection is easy to *say* and surprisingly easy to get subtly wrong.** My first attempt at
  the "safe" demo passed the value as an extra CLI argument, which SQLite treated as another SQL
  string to execute — the fix only worked once I bound it with `.parameter set`. It is a good reminder
  that parameterisation means *binding*, not merely "passing the value nearby".
- **`LEFT JOIN` vs `INNER JOIN` on the junction.** Listing tasks with tags with an `INNER JOIN` makes
  `Set up CI` disappear, because it has no tags. It is the join that decides whether unmatched rows
  survive, and it is the easiest way to accidentally hide data.
- **`PRAGMA foreign_keys` is per connection and off by default.** Until I set it at the top of each
  script and connection, the `CHECK`/`FOREIGN KEY` constraints looked present but were not enforced.
- **The empty-string `NULL` trap.** `LEFT JOIN` fills unmatched columns with `NULL`, so filtering the
  "no tags" case needs `WHERE tg.id IS NULL`, not `= ''`.

## Checkpoint evidence

- **20+ query exercises:** 28 graded exercises in the guide (§Numbered EXERCISEs), each to be run
  against `tasks.db` with the query and its output pasted as evidence. Categories covered: filtering,
  sorting and pagination (1–7), `INNER`/`LEFT` joins (8–13), aggregates with `GROUP BY`/`HAVING`
  (14–19), subqueries (20–24), indexes/transactions/constraints (25–28).
- **Mermaid ERD matching the schema:** `module-6-sql/README.md` (Walkthrough 8), showing `users`,
  `tasks`, `tags` and `task_tags` with PK/FK markers identical to `schema.sql`.
- **Injection demo:** Walkthrough 7 shows the vulnerable concatenated query returning all 7 rows for
  the input `' OR '1'='1`, and the parameterised query returning no rows for the same input.
- **Transaction:** Walkthrough 6 shows `COUNT(*)` going 7 → 8 inside the transaction → 7 after
  `ROLLBACK`, then 8 after a committed insert.

## What I'd do differently

- **Start the ERD from the schema, not by hand.** It is easy to draw the "intended" model and let it
  drift from the DDL. Generating the diagram mentally from `schema.sql` keeps the two honest.
- **Add the `status` index in `schema.sql` from the start** rather than dropping and re-adding it for
  the `EXPLAIN QUERY PLAN` demo — the demo is worth doing once, but the committed schema should ship
  with the index it proved it needs.
- **Write the injection demo as a tiny script**, not ad-hoc shell, so the before/after is reproducible
  by the next trainee with one command.
- **Decide cascade behaviour deliberately.** `ON DELETE CASCADE` on both junction columns is right
  here, but I would leave a comment in `schema.sql` explaining why, so M07's Prisma migration does not
  quietly change it.
