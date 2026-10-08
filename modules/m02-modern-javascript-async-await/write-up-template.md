# M02 Write-Up — Modern JavaScript & Async/Await

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The Async toolkit module (`sleep`, `retry`, `withTimeout`, `mapLimit`), its self-checks, and your
actual sequential-vs-parallel timing numbers.

## Why it's built this way (key decisions)

- Why did you implement `retry` and `mapLimit` the way you did?
- What would have changed if you'd fetched sequentially instead of in parallel, or vice versa?
- Which of the brief's pitfalls (forgotten `await`, `await` in loops, unhandled rejections) did you
  specifically design around?

## How to build it (teach it to the next trainee)

Write a guide to building one of these utilities (your choice), using your own example to show the
reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — the event loop/microtask queue, closures, or `Promise.all` vs `allSettled`/`race`/
`any` — and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

## Checkpoint evidence

Show your self-checks passing, your actual sequential-vs-parallel timing numbers, and your
explanation of the `setTimeout`/promise/`await` output order.

## What I'd do differently

If you started this module over, what would you do differently?
