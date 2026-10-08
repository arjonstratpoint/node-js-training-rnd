# M08 Tasks — Zod Validation & Type Inference (Task API v3)

Validate all untrusted input at runtime with Zod 4, and derive TypeScript types from the same
schemas.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; have your M05 (error envelope + validation) and M07
      (Prisma types) write-ups on hand.
- [ ] Install `zod@4`.
- [ ] Continue the branch → PR → peer review → merge habit for this Friday-gate submission.

## Research

- [ ] Why runtime validation matters: TypeScript types vanish at runtime, and `req.body` is
      untrusted data.
- [ ] Zod 4 basics: primitives, the top-level string formats (`z.email()`, `z.uuid()`, `z.url()`),
      `z.object`/`z.strictObject`, arrays, enums and literals, unions and discriminated unions,
      optional/nullable/default, and `z.coerce.number()` for query strings and params.
- [ ] Parsing: `parse` vs `safeParse`, and error formatting with `z.flattenError`, `z.treeifyError`,
      `z.prettifyError`, plus custom messages via the `error` parameter.
- [ ] Refinements and transforms: `.refine`, cross-field rules, `.transform`, pipes, trimming/
      normalising input.
- [ ] Type inference: `z.infer`, `z.input`, `z.output` — and deriving create/update/query schemas
      with `.pick`, `.omit`, `.partial`, `.extend` instead of writing them by hand.
- [ ] How to work around `req.query` being read-only in Express 5 when building a typed `validate`
      middleware.
- [ ] How a `ZodError` should map into the fixed M05 error envelope's `details` array.
- [ ] How to keep a Zod schema aligned with its Prisma counterpart (e.g.
      `satisfies Prisma.TaskCreateInput`) without ever passing raw `req.body` to Prisma.
- [ ] How to validate `process.env` once at startup in `config.ts` and fail fast.
- [ ] Note (awareness only): Zod Mini and `z.toJSONSchema` exist — you don't need to use either
      here.

## Build

- [ ] Write Zod schemas for create, update, list query, and params.
- [ ] Build the typed `validate({ body, params, query })` middleware.
- [ ] Wire the middleware into every v2 route, removing the hand-written validation from v1/v2 as
      you go — not leaving it alongside the new Zod layer.
- [ ] Map `ZodError` output into the fixed M05 envelope's `details` array in your central handler.
- [ ] Add env validation in `config.ts` that fails fast on startup.
- [ ] Confirm, with `tsc --noEmit`, that your handler input types actually come from `z.infer`, not
      from any hand-written interface left over.

## Verify

- [ ] v3 merged by pull request.
- [ ] No manual `if (!body.title)`-style checks remain anywhere in the codebase — grep for them if
      you're not sure.
- [ ] Invalid input never reaches Prisma — a Zod schema rejects it first, every time.
- [ ] 400 responses carry field-level `details` in the exact envelope shape fixed in M05.
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "What I built".
- [ ] "Why it's built this way (key decisions)": schema design per endpoint, how you handled
      `req.query` being read-only, how you kept Zod and Prisma types aligned.
- [ ] "How to build it (teach it to the next trainee)": write the typed-validation-middleware
      guide.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "What tripped me up".
- [ ] "Checkpoint evidence": v3 merged by PR, `tsc --noEmit` proving handler types come from
      `z.infer`, confirmation no manual checks remain, invalid input never reaching Prisma, and a
      400 response carrying `details` in the exact envelope shape fixed in M05.
- [ ] Close out "What I'd do differently".
