# M08 — Zod Validation & Type Inference

**Week 3 · Days 4-5 · 6 hours**

## Builds on

[m07-prisma-orm-migrations](../m07-prisma-orm-migrations/write-up-template.md) — you're replacing
the hand-written validation that M05 deliberately left in place.

## Objective

Validate all untrusted input at runtime with Zod 4, and derive TypeScript types from the same
schemas.

## Scope

- Why runtime validation: TypeScript types vanish at runtime, and `req.body` is untrusted data.
- Zod 4 basics: `import { z } from "zod"`; primitives; top-level string formats (`z.email()`,
  `z.uuid()`, `z.url()`); `z.object` and `z.strictObject`; arrays; enums and literals; unions and
  discriminated unions; optional, nullable, default; `z.coerce.number()` for query strings and
  params.
- Parsing: `parse` vs `safeParse`; error formatting with `z.flattenError`, `z.treeifyError`,
  `z.prettifyError`; custom messages via the unified `error` parameter.
- Refinements and transforms: `.refine`, cross-field rules, `.transform`, pipes, trimming and
  normalising input.
- **Type inference:** `z.infer`, `z.input`, `z.output`. Schemas first, types derived. Derive
  create/update/query schemas with `.pick`, `.omit`, `.partial`, `.extend`.
- **Zod + Express:** a typed `validate({ body, params, query })` middleware. Because `req.query` is
  read-only in Express 5, store parsed values on `res.locals` or a typed `req.valid`. A `ZodError`
  becomes a 400 with field-level `details` via the central handler you already have.
- **Zod + Prisma:** Zod is the request contract; Prisma types are the persistence contract. Keep them
  aligned (for example `satisfies Prisma.TaskCreateInput`). Never pass raw `req.body` to Prisma. Use
  Zod to shape responses and strip internal fields.
- Validate `process.env` once at startup in `config.ts` and fail fast.
- Awareness only: Zod Mini and JSON Schema export (`z.toJSONSchema`).

## Stack constraints

- Zod 4.x.
- Every piece of hand-written validation from v1 needs to actually disappear, not just gain a Zod
  layer alongside it.

## Deliverable: Task API v3

Replace all hand-written validation with Zod: schemas for create, update, list query, and params;
the typed `validate` middleware; env validation; consistent 400 payloads using the error envelope
fixed in M05. Use `tsc --noEmit` to show that handler input types come from `z.infer`, not
from hand-written interfaces.

## Definition of done

- [ ] v3 merged by pull request.
- [ ] No manual `if (!body.title)`-style checks remain anywhere in the codebase.
- [ ] Invalid input never reaches Prisma — a Zod schema rejects it first, every time.
- [ ] 400 responses carry field-level `details` in the exact envelope shape fixed in M05 — Zod's
      error output just needs mapping into that `details` array, the shape itself doesn't change.

This is the **Week 3 Friday gate.**
