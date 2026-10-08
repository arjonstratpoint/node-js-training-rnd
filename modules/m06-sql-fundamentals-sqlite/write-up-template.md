# M06 Write-Up — SQL Fundamentals with SQLite

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. Your M07 self needs this schema and ERD, so write it like you'll need it again.

## What I built

The schema (with the `task_tags` junction table), your seed data, your 20+ exercises, the Mermaid
ERD, and the injection demo.

## Why it's built this way (key decisions)

- Why this junction-table design for `task_tags`, specifically?
- What did you index, and what would change in your queries if you hadn't?
- Which of your 20+ exercises taught you something you didn't expect going in?

## How to build it (teach it to the next trainee)

Write a guide to designing a junction table for a many-to-many relationship, using your own example
to show the reasoning, not just the SQL.

## Concepts worth explaining

Pick 1-2 ideas — 1:N vs M:N modeling, what an index is for, or why parameterised queries stop
injection — and explain each in your own words.

## What tripped me up

The SQL injection demo, any constraint or join surprises.

## Checkpoint evidence

Show your 20+ query exercises, the Mermaid ERD matching your schema, and the injection demo
succeeding against the vulnerable query then failing against the fixed one.

## What I'd do differently

If you started this module over, what would you do differently?
