# M07 Write-Up — Prisma ORM & Migrations (Task API v2)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Task API v2 — the Prisma schema, your migrations (including the hand-edited one), the service
layer, and the seed script.

## Why it's built this way (key decisions)

- Why this translation of the M06 schema into Prisma models, specifically?
- What did you have to hand-edit in the `--create-only` migration, and why couldn't
  `migrate dev` generate it for you?
- How did you map `P2002`/`P2025`/`P2003` onto your existing M05 error handler?

## How to build it (teach it to the next trainee)

Write a guide to adding a column to a table that already has data, using your own example to show
the reasoning, not just the migration commands.

## Concepts worth explaining

Pick 1-2 ideas — `migrate dev` vs `migrate deploy`, what the lock file/generated client actually
are, or `select` vs `include` — and explain each in your own words.

## What tripped me up

Migration conflicts, the hand-edited `--create-only` migration, the `better-sqlite3` install if it
gave you trouble.

## Checkpoint evidence

Show `migrate reset` plus your seed script rebuilding the database from scratch, the Bruno
collection from M05 still green against v2, `P2002`/`P2025`/`P2003` each mapping to the right
status code, your own explanation of `migrate dev` vs `migrate deploy`, and `package.json` locking
`prisma`/`@prisma/client` to `^7`.

## What I'd do differently

If you started this module over, what would you do differently?
