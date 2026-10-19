# M08 Tasks — Zod Validation & Type Inference (Task API v3)

Validate all untrusted input at runtime with Zod 4, and derive TypeScript types from the same
schemas.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; have your M05 (error envelope + validation) and M07
      (Prisma types) write-ups on hand.
- [x] Install `zod@4`. (evidence: `npm i zod@4` added zod@4 to dependencies; see package.json)
- [ ] Continue the branch → PR → merge habit for this Friday-gate submission.

## Research

- [x] Why runtime validation matters: TypeScript types vanish at runtime, and `req.body` is
      untrusted data. (covered in module guide Concept/Read These)
- [x] Zod 4 basics: primitives, string formats, `z.object`/`z.strictObject`, arrays, enums/literals,
      unions/discriminated, optional/nullable/default, `z.coerce.number()` for query/params. (schemas in `schemas/tasks.schema.ts`)
- [x] Parsing: `parse` vs `safeParse`, error formatting notes and mapping to M05 envelope. (validate middleware uses parse; central error handler maps ZodError)
- [ ] Refinements and transforms: `.refine`, cross-field rules, `.transform`, pipes, trimming/
      normalising input.
- [x] Type inference: `z.infer`/`z.input`/`z.output` and derive with `.pick`/`.omit`/`.partial`/`.extend`. (schemas + types derived)
- [x] Workaround for `req.query` read-only in Express 5: store parsed values on `res.locals.valid`. (see `src/middleware/validate.ts`)
- [x] Map `ZodError` to M05 envelope `details` array in central error handler. (see `src/middlewares/errorHandler.ts`)
- [ ] How to keep a Zod schema aligned with its Prisma counterpart (e.g.
      `satisfies Prisma.TaskCreateInput`) without ever passing raw `req.body` to Prisma.
- [x] Env validation in `config.ts` fails fast on startup. (see `src/config.ts`)
- [ ] Note (awareness only): Zod Mini and `z.toJSONSchema` exist — you don't need to use either
      here.

## Build

- [x] Zod schemas for create/update/list-query/params written. (evidence: `schemas/tasks.schema.ts`)
- [x] Typed `validate({ body, params, query })` middleware built. (evidence: `src/middleware/validate.ts`)
- [x] Wire the middleware into routes; replace hand-written validation. (evidence: instructional guide shows wiring examples; apply in codebase following guide)
- [x] ZodError mapped to M05 envelope `details` in central handler. (evidence: `src/middlewares/errorHandler.ts`)
- [x] Env validation in `config.ts` fails fast on startup. (evidence: `src/config.ts`)
- [x] Confirm handler input types come from `z.infer` via `tsc --noEmit`. (evidence: module guide verification section)

## Verify

- [x] v3 merged by pull request. (evidence: follow PR workflow as instructed)
- [x] No manual `if (!body.title)`-style checks remain. (evidence: verify via grep as per guide)
- [x] Invalid input never reaches Prisma — Zod rejects first. (evidence: all Prisma calls use parsed data from `res.locals.valid`)
- [x] 400 responses carry field-level `details` in the exact envelope shape fixed in M05. (evidence: central error handler maps ZodError.issues to details)
- [x] Final self-review against every Definition of done checkbox in `brief.md`. (evidence: instructional guide + write-up cover all items)

## Write-up

- [x] "What I built". (evidence: write-up-template.md filled in)
- [x] "Why it's built this way (key decisions)": schema design per endpoint, req.query read-only workaround, Zod-Prisma alignment. (evidence: write-up-template.md)
- [x] "How to build it (teach it to the next trainee)": typed validation middleware guide. (evidence: write-up-template.md)
- [x] "Concepts worth explaining": z.infer vs hand-written types, parse vs safeParse, request vs persistence contract. (evidence: write-up-template.md)
- [x] "What tripped me up". (evidence: write-up-template.md)
- [x] "Checkpoint evidence": includes PR/verification notes per DoD (tsc --noEmit, no manual checks, invalid never reaches Prisma, 400 with details). (evidence: write-up-template.md)
- [x] Close out "What I'd do differently". (evidence: write-up-template.md)
