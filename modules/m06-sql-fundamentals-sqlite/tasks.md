# M06 Tasks — SQL Fundamentals with SQLite

Design a small relational schema and write the SQL needed to query it, before an ORM hides it.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully; have your M05 write-up on hand (you're replacing its
      in-memory store with this schema, then with Prisma in M07). — _Evidence: brief reviewed;
      schema in module doc Walkthrough 1 replaces M05's in-memory store._
- [x] Install the `sqlite3` CLI or DB Browser for SQLite. — _Evidence: `sqlite3 3.51.0` used to run
      every walkthrough query; outputs captured in module doc._
- [ ] Continue the branch → PR → merge habit for this module's checkpoint. *(No PR merged for this
      module on the remote — instructional material alone is not a merged PR.)*

## Research

- [x] The relational model: tables, rows, primary and foreign keys. — _Evidence: module doc Concept
      §The relational model + Walkthrough 1 DDL._
- [x] SQLite specifics: single-file database, dynamic typing and type affinity, `PRAGMA
      foreign_keys`. — _Evidence: Concept §SQLite specifics; Self-Check #2 and #10._
- [x] DDL: `CREATE`/`ALTER`/`DROP` and the constraints `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`,
      `DEFAULT`, `FOREIGN KEY … ON DELETE`. — _Evidence: `schema.sql` in Walkthrough 1 uses every
      listed constraint; Exercise 28._
- [x] DML: `INSERT`/`SELECT`/`UPDATE`/`DELETE`, filtering, sorting, `LIMIT`/`OFFSET`, and the idea
      of keyset pagination. — _Evidence: Concept §DML + Walkthrough 2 (offset vs keyset)._
- [x] Aggregates with `GROUP BY`/`HAVING`, `INNER` and `LEFT` joins, and subqueries. — _Evidence:
      Walkthrough 3 (joins + aggregates) and Walkthrough 4 (subqueries); Exercises 8–24._
- [x] Modeling relationships: 1:1, 1:N, M:N with a junction table, and normalisation basics
      (1NF-3NF). — _Evidence: Concept §Relationships and normalisation; `task_tags` junction in
      Walkthrough 1; write-up junction-table guide._
- [x] Indexes, `EXPLAIN QUERY PLAN`, and transactions/ACID (`BEGIN`/`COMMIT`/`ROLLBACK`). — _Evidence:
      Walkthrough 5 (`SCAN` → `SEARCH … USING INDEX`) and Walkthrough 6 (rollback/commit); Exercise 25–27._
- [x] SQL injection and parameterised queries. — _Evidence: Concept §SQL injection + Walkthrough 7
      (attack succeeds, parameterised fix blocks it); Exercise 29._
- [x] How to document an ERD with Mermaid in a GitHub README. — _Evidence: Walkthrough 8 Mermaid
      `erDiagram` + `README.md` creation; Exercise 30._

## Build

- [x] Design the Task API schema: `users`, `tasks`, `tags`, `task_tags` — including the
      junction-table design for `task_tags`. — _Evidence: Walkthrough 1 `schema.sql`; `task_tags`
      PK is `(task_id, tag_id)` with both FKs cascading._
- [x] Write the DDL to create the schema, with appropriate constraints and foreign keys. — _Evidence:
      `schema.sql` (NOT NULL/UNIQUE/CHECK/DEFAULT/FK `ON DELETE CASCADE`) + indexes._
- [x] Seed the schema with SQL. — _Evidence: `seed.sql` (3 users, 4 tags, 7 tasks, 9 links); verified
      counts in Walkthrough 1._
- [x] Write and run at least 20 of your own graded query exercises against your schema, covering
      filtering/sorting/pagination, `INNER`/`LEFT` joins, aggregates with `GROUP BY`/`HAVING`, and
      at least one subquery. — _Evidence: 28 graded exercises in module doc §Numbered EXERCISEs
      (filtering 1–7, joins 8–13, aggregates 14–19, subqueries 20–24)._
- [x] Write at least one query inside an explicit transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) — no
      exercise strictly forces this, but you'll need the skill for real in the M10 capstone. —
      _Evidence: Walkthrough 6 shows rollback (7→8→7) and commit (→8)._
- [x] Write a vulnerable, string-concatenated query and demonstrate a successful SQL injection
      against it. — _Evidence: Walkthrough 7 vulnerable query returns all 7 rows for `' OR '1'='1`._
- [x] Fix that same query with parameters and demonstrate the injection now fails. — _Evidence:
      Walkthrough 7 parameterised query returns no rows; legitimate lookup via `:title` still works._
- [x] Draw the ERD in Mermaid in your README, matching the schema you actually built. — _Evidence:
      Walkthrough 8 `erDiagram` for `users`/`tasks`/`tags`/`task_tags`, written to `README.md`._

## Verify

- [x] 20+ exercises complete, covering every required category. — _Evidence: 28 exercises span
      filtering/sorting/pagination, `INNER`/`LEFT` joins, `GROUP BY`/`HAVING`, and subqueries._
- [x] You can explain primary vs foreign keys, what an index is for, and how to model 1:N vs M:N,
      unaided. — _Evidence: Concept + Self-Check #1/#3/#4; write-up "Concepts worth explaining"._
- [x] The injection demo actually succeeds against the vulnerable query, and the parameterised fix
      actually blocks it. — _Evidence: Walkthrough 7 outputs (7 rows vs 0 rows), run and captured._
- [x] The Mermaid ERD matches the schema you actually built. — _Evidence: Walkthrough 8 ERD mirrors
      `schema.sql` tables/keys/relationships._
- [x] Final self-review against every Definition of done checkbox in `brief.md`. — _Evidence: module
      doc §Module Deliverable restates the brief's DoD; all four satisfied by the guide's artifacts._

## Write-up

- [x] "What I built". — _Evidence: write-up-template.md filled in as worked example (schema, seed,
      28 exercises, ERD, injection demo)._
- [x] "Why it's built this way (key decisions)": your junction-table design for `task_tags`, what
      you indexed and why, and which of your 20+ exercises taught you something you didn't expect. —
      _Evidence: filled in with junction PK rationale, index choices, and Exercise 12 surprise._
- [x] "How to build it (teach it to the next trainee)": write the junction-table guide. — _Evidence:
      7-step junction-table guide in write-up._
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. — _Evidence:
      1:N vs M:N modelling and why parameterised queries stop injection, both in own words._
- [x] "What tripped me up": the SQL injection demo, any constraint or join surprises. — _Evidence:
      parameter-binding stumble, `INNER` vs `LEFT` on junction, per-connection FK pragma, NULL filter._
- [x] "Checkpoint evidence": your 20+ query exercises, the Mermaid ERD matching your schema, and
      the injection demo succeeding against the vulnerable query then failing against the fixed
      one. — _Evidence: listed with pointers to guide exercises, Walkthrough 7/8, and Walkthrough 6._
- [x] Close out "What I'd do differently". — _Evidence: generated ERD from schema, ship the status
      index, script the injection demo, annotate cascade choice._
