# M09 Write-Up — Integration Testing with Jest + Supertest (Task API v4)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. The capstone has no reference material except what you write here, so be
> thorough.

## What I built

Task API v4 — your test suite, the test-database setup, and the green CI run.

## Why it's built this way (key decisions)

- Why this test-database strategy, specifically — what would break if tests shared one database
  file without cleanup?
- Which toolchain fallback (if any) did you actually need, and why did `@swc/jest` or its
  alternative work for your setup?
- What did adding `PATCH /tasks/:id/complete` test-first actually change about how you wrote the
  handler?

## How to build it (teach it to the next trainee)

Write a guide to setting up an isolated test database for integration tests, using your own
example to show the reasoning, not just the config.

## Concepts worth explaining

Pick 1-2 ideas — why integration tests here use a real database instead of mocks, flaky-test
causes, or the red-green-refactor cycle — and explain each in your own words.

## What tripped me up

Flaky tests, ESM/Jest friction, any ordering dependencies the `--randomize` run exposed.

## Checkpoint evidence

Show green CI on your PR, the suite passing with `--randomize`, your coverage report meeting 80%+,
and `PATCH /tasks/:id/complete` added test-first.

## What I'd do differently

If you started this module over, what would you do differently?
