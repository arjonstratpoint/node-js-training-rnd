# M06 Tasks — SQL Fundamentals with SQLite

Design a small relational schema and write the SQL needed to query it, before an ORM hides it.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; have your M05 write-up on hand (you're replacing its
      in-memory store with this schema, then with Prisma in M07).
- [ ] Install the `sqlite3` CLI or DB Browser for SQLite.
- [ ] Continue the branch → PR → peer review → merge habit for this module's checkpoint.

## Research

- [ ] The relational model: tables, rows, primary and foreign keys.
- [ ] SQLite specifics: single-file database, dynamic typing and type affinity, `PRAGMA
      foreign_keys`.
- [ ] DDL: `CREATE`/`ALTER`/`DROP` and the constraints `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`,
      `DEFAULT`, `FOREIGN KEY … ON DELETE`.
- [ ] DML: `INSERT`/`SELECT`/`UPDATE`/`DELETE`, filtering, sorting, `LIMIT`/`OFFSET`, and the idea
      of keyset pagination.
- [ ] Aggregates with `GROUP BY`/`HAVING`, `INNER` and `LEFT` joins, and subqueries.
- [ ] Modeling relationships: 1:1, 1:N, M:N with a junction table, and normalisation basics
      (1NF-3NF).
- [ ] Indexes, `EXPLAIN QUERY PLAN`, and transactions/ACID (`BEGIN`/`COMMIT`/`ROLLBACK`).
- [ ] SQL injection and parameterised queries.
- [ ] How to document an ERD with Mermaid in a GitHub README.

## Build

- [ ] Design the Task API schema: `users`, `tasks`, `tags`, `task_tags` — including the
      junction-table design for `task_tags`.
- [ ] Write the DDL to create the schema, with appropriate constraints and foreign keys.
- [ ] Seed the schema with SQL.
- [ ] Write and run at least 20 of your own graded query exercises against your schema, covering
      filtering/sorting/pagination, `INNER`/`LEFT` joins, aggregates with `GROUP BY`/`HAVING`, and
      at least one subquery.
- [ ] Write at least one query inside an explicit transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) — no
      exercise strictly forces this, but you'll need the skill for real in the capstone (provided
      separately by the trainer, in a separate repo).
- [ ] Write a vulnerable, string-concatenated query and demonstrate a successful SQL injection
      against it.
- [ ] Fix that same query with parameters and demonstrate the injection now fails.
- [ ] Draw the ERD in Mermaid in your README, matching the schema you actually built.

## Verify

- [ ] 20+ exercises complete, covering every required category.
- [ ] You can explain primary vs foreign keys, what an index is for, and how to model 1:N vs M:N,
      unaided.
- [ ] The injection demo actually succeeds against the vulnerable query, and the parameterised fix
      actually blocks it.
- [ ] The Mermaid ERD matches the schema you actually built.
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "What I built".
- [ ] "Why it's built this way (key decisions)": your junction-table design for `task_tags`, what
      you indexed and why, and which of your 20+ exercises taught you something you didn't expect.
- [ ] "How to build it (teach it to the next trainee)": write the junction-table guide.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "What tripped me up": the SQL injection demo, any constraint or join surprises.
- [ ] "Checkpoint evidence": your 20+ query exercises, the Mermaid ERD matching your schema, and
      the injection demo succeeding against the vulnerable query then failing against the fixed
      one.
- [ ] Close out "What I'd do differently".
