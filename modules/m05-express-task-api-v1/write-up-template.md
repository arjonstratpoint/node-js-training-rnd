# M05 Write-Up — Express: Routing, Middleware & Error Handling (Task API v1)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. This write-up is also your own reference for M07-M09 — write it like you'll
> need it again, because you will.

## What I built

Task API v1 — the endpoints, the middleware stack, your `AppError` hierarchy, and the Bruno
collection.

## Why it's built this way (key decisions)

- How did you implement the fixed error envelope, and what's the actual `AppError` hierarchy you
  designed?
- What's your middleware order, and what would break if two of your middleware swapped places?
- Why hand-write validation here instead of reaching for a library, given M08 is coming?

## How to build it (teach it to the next trainee)

Write a guide to building a central error handler that produces one consistent shape, using your
own example to show the reasoning, not just the code.

## Concepts worth explaining

Pick 1-2 ideas — the middleware pipeline, operational vs programmer errors, or Express 5's
auto-forwarded rejected promises — and explain each in your own words.

## What tripped me up

Express 5 migration surprises, middleware ordering bugs, etc.

## Checkpoint evidence

Show v1 merged by PR, every error path returning the fixed envelope, and the Bruno collection
passing.

## What I'd do differently

If you started this module over, what would you do differently?
