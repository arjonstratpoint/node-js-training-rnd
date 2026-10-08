# M06 — SQL Fundamentals with SQLite

**Week 3 · Days 1-2 · 6 hours**

## Builds on

[m05-express-task-api-v1](../m05-express-task-api-v1/write-up-template.md) — the in-memory store
from v1 gets replaced by a real schema here, then by Prisma on top of it in M07.

## Objective

Design a small relational schema and write the SQL needed to query it, before an ORM hides it.

## Scope

- The relational model: tables, rows, primary and foreign keys.
- SQLite specifics: single-file database, dynamic typing and type affinity, `PRAGMA foreign_keys`.
- DDL: `CREATE` / `ALTER` / `DROP`; constraints (`PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`,
  `DEFAULT`, `FOREIGN KEY … ON DELETE`).
- DML: `INSERT`, `SELECT`, `UPDATE`, `DELETE`; filtering, sorting, `LIMIT`/`OFFSET`, and the idea of
  keyset pagination.
- Aggregates with `GROUP BY` / `HAVING`; `INNER` and `LEFT` joins; subqueries.
- Relationships: 1:1, 1:N, M:N with a junction table; normalisation basics (1NF-3NF).
- Indexes and `EXPLAIN QUERY PLAN`; transactions and ACID (`BEGIN` / `COMMIT` / `ROLLBACK`).
- SQL injection and parameterised queries.
- Documenting an ERD with Mermaid in a GitHub README.

## Stack constraints

- SQLite only — this is the one database you touch hands-on in this program.
- Tools: the `sqlite3` CLI or DB Browser for SQLite (both free, either is fine).

## Deliverable

**A `users`/`tasks`/`tags`/`task_tags` schema, created and seeded with SQL, with 20+ graded query
exercises, a Mermaid ERD, and a working SQL-injection demo and fix.**

## Lab

*Goal: design and query a real relational schema by hand, before an ORM hides the SQL.*

**You do.**

1. Design the schema, including the `task_tags` junction table.
2. Write the DDL and seed the database with SQL.
3. Write and run 20+ of your own graded query exercises, covering filtering/sorting/pagination,
   joins, aggregates, and at least one subquery.
4. Write at least one query inside an explicit transaction.
5. Demonstrate a SQL-injection attack against a vulnerable, string-concatenated query, then fix it
   with parameters.
6. Draw the ERD in Mermaid, matching the schema you actually built.

**You build and capture.** The schema and seed SQL, your 20+ exercises, the Mermaid ERD, and the
before/after of the injection demo.

## Definition of done

- [ ] At least 20 of your own graded query exercises written and run against your own schema,
      covering: filtering, sorting and pagination, `INNER`/`LEFT` joins, aggregates with
      `GROUP BY`/`HAVING`, and at least one subquery.
- [ ] You can explain primary vs foreign keys, what an index is for, and how to model 1:N vs M:N.
- [ ] The SQL-injection demo actually succeeds against the vulnerable query, and the parameterised
      fix actually blocks it — don't just assert this, show it.
- [ ] A Mermaid ERD exists in your README and matches the schema you actually built.

## Resolved decisions

- **Exercise source: you write your own.** There's no shared exercise bank in this program, so the
  20-plus query exercises are written by you against your own `users`/`tasks`/`tags`/`task_tags`
  schema. Your trainer verifies coverage and correctness at the checkpoint by picking a few at random
  and asking you to run and explain them.
- **Transactions note:** this module teaches `BEGIN`/`COMMIT`/`ROLLBACK`, but no exercise here forces
  you to use one. You will need a real transaction for the capstone's business-rule requirement — a
  capstone provided separately by the trainer, in a separate repo — so don't let M06 be the only
  time you touch one before then; try writing at least one here anyway.
