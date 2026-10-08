# M04 Write-Up — TypeScript Basics & TypeScript on Node.js

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The M02 toolkit ported to TypeScript, the Task domain types, and your `tsc --noEmit` output.

## Why it's built this way (key decisions)

- Which utility types did you use for `CreateTaskInput`/`UpdateTaskInput`, and why those over
  writing them by hand?
- How did you model `Result<T, E>`, and what would change if you'd modeled it differently?
- What specifically happened when you attempted native type stripping on Node 24?

## How to build it (teach it to the next trainee)

Write a guide to deriving input types from a domain type with utility types, using your own
example to show the reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — `unknown` vs `any` vs `never`, `type` vs `interface`, or discriminated unions —
and explain each in your own words.

## What tripped me up

Compiler errors that confused you at first, and the difference between `tsx` and native type
stripping on Node 24.

## Checkpoint evidence

Show zero `tsc --noEmit` errors on your strict config, the toolkit running via `tsx`, and what
happened when you attempted native type stripping on Node 24.

## What I'd do differently

If you started this module over, what would you do differently?
