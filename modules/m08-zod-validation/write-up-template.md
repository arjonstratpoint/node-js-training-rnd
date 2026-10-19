# M08 Write-Up — Zod Validation & Type Inference (Task API v3)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

Task API v3 — the Zod schemas, the typed `validate` middleware, env validation in `config.ts`, `ZodError` mapped to the M05 error envelope details. Repo links: [modules/m08-zod-validation/module-8-zod-validation.md](./module-8-zod-validation.md), [schemas/tasks.schema.ts](../../schemas/tasks.schema.ts), [src/middleware/validate.ts](../../src/middleware/validate.ts), [src/middlewares/errorHandler.ts](../../src/middlewares/errorHandler.ts), [src/config.ts](../../src/config.ts).

## Why it's built this way (key decisions)

- Why this schema shape for create vs update, specifically — what did `.partial`/`.pick`/`.omit`
  let you avoid repeating?
- How did you work around `req.query` being read-only in Express 5?
- How did you keep your Zod schema and your Prisma type aligned, and what would drift if you
  hadn't?

## How to build it (teach it to the next trainee)

To build a typed validation middleware:

1. **Define schemas first.** Put schemas in `schemas/` and derive types with `z.infer`. Use `.partial()`/`.pick`/`.omit`/`.extend` to derive related shapes without duplication.
2. **Parse each source.** For each of `body`, `params`, `query`, call `schema.parse(...)` (or `safeParse` then forward `ZodError`). Use `z.coerce.number()` for numeric query/params values.
3. **Store parsed values safely.** Since `req.query` is read-only in Express 5, store results on `res.locals.valid` (with typed augmentation) rather than mutating `req.query`.
4. **Forward errors.** If parsing throws `ZodError`, call `next(err)` so the central error handler maps it to the M05 envelope with field-level `details`.
5. **Validate env at startup.** Use Zod to parse `process.env` in `config.ts` and `process.exit(1)` on failure.
6. **Prove correctness.** Run `tsc --noEmit` (handler types from `z.infer`), grep for manual `if (!body...)` checks (should be none), and ensure no Prisma calls take raw request data.

## Concepts worth explaining

- **`z.infer` vs hand-written types:** `z.infer<T>` derives the TypeScript type from the runtime schema — they stay in sync automatically. Hand-written interfaces are decoupled; if you change validation rules in the schema but forget to update the interface, types and runtime behavior drift. With `z.infer`, the schema is the single source of truth.
- **`parse` vs `safeParse`:** `schema.parse(data)` throws `ZodError` on failure — perfect for middleware that forwards errors to `next(err)`. `schema.safeParse(data)` returns `{ success, data?, error? }` without throwing — better when you need to handle failures explicitly in the same function.
- **Request contract vs persistence contract:** Zod defines what the API accepts (shape, optionality, coercion, trimming). Prisma defines what the database expects. For example, updates may be partial (`.partial()`) while create has required fields; API might coerce strings to numbers or trim whitespace; internal fields (timestamps, IDs set by DB) may not be part of request body. Never pass raw `req.body` to Prisma — validate with Zod first, then pass parsed data.

## What tripped me up

- **req.query is read-only in Express 5:** Initially tried to assign parsed query back to `req.query` — this doesn't work as expected in Express 5; the fix is storing on `res.locals.valid`.
- **Mapping ZodError to M05 envelope:** Need to join `issue.path` (array) correctly and ensure the `details` shape matches the envelope exactly (status 400, code `VALIDATION_ERROR`).
- **Finding all manual checks:** Easy to miss `if` checks in different forms; broad grep across `src/` was necessary to be confident none remain.

## Checkpoint evidence

- [ ] v3 merged by PR (link: TBD)
- [ ] `tsc --noEmit` passes with no type errors; handler types come from `z.infer` (verified by signatures consuming inferred types).
- [ ] No manual `if (!body.title)`-style checks remain in `src/` (confirmed via `grep -rn "if (!.*body." src`, `grep -rn "if (!.*req.body" src`).
- [ ] Invalid input never reaches Prisma (confirmed: no Prisma calls use raw `req.body`/`req.query` — e.g. `grep -rn "data: req." src` returns nothing; all data passed from `res.locals.valid`).
- [ ] 400 responses for validation errors carry field-level `details` in the exact M05 envelope shape (ZodError mapped in central error handler).

## What I'd do differently

If starting over: write schemas and the validate middleware before wiring routes (prevents mixing manual checks); add env validation in `config.ts` earlier; and run `tsc --noEmit` plus grep checks continuously while replacing manual validation to catch leftovers immediately.
