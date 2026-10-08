# M08 Write-Up — Zod Validation & Type Inference (Task API v3)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Task API v3 — the Zod schemas, the typed `validate` middleware, and your env validation.

## Why it's built this way (key decisions)

- Why this schema shape for create vs update, specifically — what did `.partial`/`.pick`/`.omit`
  let you avoid repeating?
- How did you work around `req.query` being read-only in Express 5?
- How did you keep your Zod schema and your Prisma type aligned, and what would drift if you
  hadn't?

## How to build it (teach it to the next trainee)

Write a guide to deriving a typed validation middleware from a single schema, using your own
example to show the reasoning, not just the syntax.

## Concepts worth explaining

Pick 1-2 ideas — `z.infer` vs hand-written types, `parse` vs `safeParse`, or why Zod is the request
contract and Prisma is the persistence contract — and explain each in your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time.

## Checkpoint evidence

Show v3 merged by PR, `tsc --noEmit` proving your handler types come from `z.infer`, confirmation
no manual `if (!body.title)` checks remain, invalid input never reaching Prisma, and a 400 response
carrying `details` in the exact envelope shape fixed in M05.

## What I'd do differently

If you started this module over, what would you do differently?
