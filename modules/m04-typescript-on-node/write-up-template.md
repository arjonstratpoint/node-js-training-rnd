# M04 Write-Up — TypeScript Basics & TypeScript on Node.js

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

- Public training repo: https://github.com/arjonstratpoint/node-js-training-rnd
- The **M02 async toolkit ported to TypeScript** at `typescript-lab/src/toolkit.ts`, with generics:
  `sleep(ms): Promise<void>`, `retry<T>(fn, { retries, delayMs }): Promise<T>`,
  `withTimeout<T>(promise, ms): Promise<T>` (plus a `TimeoutError` class), and
  `mapLimit<T, R>(items, limit, fn): Promise<R[]>`.
- The **Task domain** at `typescript-lab/src/domain.ts`: a `Task` interface, `CreateTaskInput` and
  `UpdateTaskInput` **derived with utility types**, a discriminated-union `Result<T, E>` with `ok`/
  `err` constructors, and a `Record<TaskStatus, string>` label table.
- Verified core-type tour: `typescript-lab/src/core-types.ts` (tuples, unions, `as const`,
  `satisfies`, discriminated unions, user-defined type guards, `unknown` narrowing).
- Runner/entry point: `typescript-lab/src/main.ts` — runs the whole thing via `tsx`.
- `typescript-lab/tsconfig.json` (strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` +
  `erasableSyntaxOnly` + `noEmit`) and `typescript-lab/package.json` (`dev`, `typecheck`, `build`).
- `tsc --noEmit` output: **clean — no errors** (see Checkpoint evidence).
- Merged PR (branch → PR → merge commit):
  https://github.com/arjonstratpoint/node-js-training-rnd/pull/4

## Why it's built this way (key decisions)

- **Which utility types did you use for `CreateTaskInput`/`UpdateTaskInput`, and why those over
  writing them by hand?** I derived both from `Task` so they can never drift:

  ```ts
  export type CreateTaskInput = Required<Pick<Task, 'title'>> &
    Partial<Pick<Task, 'description' | 'done'>>;

  export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'done'>>;
  ```

  `Pick<Task, …>` is what makes them *derived* — they name the exact fields an endpoint accepts, and
  they inherit each field's type from `Task` automatically. `Required<…>` says a create must carry a
  title (the server owns `id`/`createdAt`/`updatedAt`, so they are simply not picked).
  `Partial<…>` says an update may carry any subset of the mutable fields, which is exactly the
  semantics of PATCH-style updates. Writing these by hand would work on day one and then silently rot
  the moment someone adds a field to `Task` or changes `description` to `string` — the derived types
  cannot. The `Record<TaskStatus, string>` label table gets the same treatment: keyed by the status
  union, so adding a status is a compile error until I add its label.
- **How did you model `Result<T, E>`, and what would change if you'd modeled it differently?** As a
  discriminated union on the literal field `ok`:

  ```ts
  export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };
  ```

  The discriminant means a caller cannot read `value` without first checking `ok` — the compiler
  rejects it. I added `ok()`/`err()` constructors so call sites read like prose and the narrowing is
  centralised. The alternative I rejected was a class-based `Result` (with `.isOk()`/`.getValue()`):
  it emits **runtime code**, which would immediately break the `erasableSyntaxOnly`/native-stripping
  path I want this module to demonstrate, and it loses the compiler's ability to exhaustively narrow.
  Another alternative — returning `T | null` and a separate error channel — is what Go-style code
  does and it is worse here: it discards the error type entirely, so `E` could never be a specific
  error union.
- **What specifically happened when you attempted native type stripping on Node 24?** Running
  `node src/main.ts` directly **worked for the erasable code** and printed the same output as `tsx`,
  with **no warning** — type stripping is on by default on Node 24 for erasable syntax. The
  experimental edge is non-erasable syntax. Two constraints showed up immediately: (1) relative
  imports had to carry their real `.ts` extension — native Node does not guess — which is why I set
  `allowImportingTsExtensions: true` in `tsconfig.json`; and (2) when I deliberately added an `enum`
  in `src/non-erasable.ts`, `node src/non-erasable.ts` failed with
  `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only
  mode`, while `node --experimental-transform-types src/non-erasable.ts` ran it (printing an
  `ExperimentalWarning: Transform Types is an experimental feature`). That is the concrete reason the
  course bans `enum` and sets `erasableSyntaxOnly`. Stable type stripping for the full language
  arrives with Node 26 — on 24 non-erasable syntax is awareness-level, which is why I documented it
  rather than making it the primary runner.

## How to build it (teach it to the next trainee)

**Deriving input types from a domain type with utility types — reasoning, not syntax.**

1. **Write the domain type first, and treat it as the source of truth.** Everything else is a view of
   it. Mine is `Task` with six fields, including two the server owns (`id`, `createdAt`) and three a
   client may set (`title`, `description`, `done`).

   ```ts
   export interface Task {
     id: string;
     title: string;
     description: string | null;
     done: boolean;
     createdAt: string;
     updatedAt: string;
   }
   ```

2. **Ask "which fields move on each operation?"** That question, not the syntax, decides the utility
   types. For *create*, the client sends `title` (required), `description` and `done` (optional) — it
   never sends `id`/timestamps. So: `Pick` those three out of `Task`, then shape them with `Required`
   and `Partial`.

   ```ts
   export type CreateTaskInput = Required<Pick<Task, 'title'>> &
     Partial<Pick<Task, 'description' | 'done'>>;
   ```

   Read it out loud: "required title, plus optionally description and done." If you can read a type
   alias as a sentence, it is the right shape.

3. **For update, reach for `Partial<Pick<…>>` and stop.** Every mutable field optional is the whole
   requirement, so one line is the whole answer.

   ```ts
   export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'done'>>;
   ```

4. **Change `Task` and watch the derived types follow — that is the reasoning made concrete.** Add a
   `priority: 'low' | 'high'` field to `Task`, then add `'priority'` to the `Pick` list in one of the
   inputs. The type updates; every call site that now omits a required field turns red. You did not
   touch the input type's field definitions because there are none — they are projections.

5. **Key lookups with the same union that keys the data.** `Record<TaskStatus, string>` for labels
   means the compiler enforces completeness: add a status to the union and `npm run typecheck` fails
   until the label exists.

6. **Generalise the pattern.** Any "shape the client sends" type is a projection of an internal
   "shape we store" type. The move is always **`Pick`/`Omit` to choose fields, `Required`/`Partial` to
   set optionality, `Readonly` to freeze** — never a hand-copied field list. When the two types must
   stay in lock-step (they must here), derivation is the only version that survives refactors.

## Concepts worth explaining

### `unknown` vs `any` vs `never` (my own words)

`any` is a hole in the type system. When a value is `any`, the compiler stops checking it and stops
checking anything you do with it — call a method that does not exist, pass it somewhere it does not
belong, it is all fine until it is not. Worse, `any` spreads: assign it into a typed variable and that
variable is tainted too. I treat `any` as a note-to-self that I will come back and fix.

`unknown` is the same "I don't know what this is" starting point, but safe. Any value can be assigned
*to* `unknown`; almost nothing can be done *with* it. You must narrow it first — `typeof x ===
'string'`, `Array.isArray(x)`, a user-defined guard — and only then does the compiler let you use it
as that narrower type. This is why `catch (e)` gives you `unknown`: the runtime hands you whatever was
thrown, and the language refuses to let you assume it is an `Error`.

`never` is the empty type — no value is ever a `never`. It appears where code cannot complete: a
function that always throws has return type `never`, and the leftover branch of a fully narrowed union
is `never`. Its real use is *proving* exhaustiveness: pass the narrowed value to a function taking
`never`, and if you forgot a union member, the compiler tells you that member is not `never` yet.

The one-liner: **`any` opts out of checking, `unknown` forces checking, `never` proves checking is
complete.**

### `type` vs `interface` (my own words)

Both name an object shape, and for a plain object you can use either. The differences that decide it:
an `interface` can be **reopened** — two declarations with the same name merge — and it extends with
`extends`; a `type` alias cannot be reopened but can name *anything*: unions, tuples, primitives,
function types, intersections. So for a shape that is a union (`Result<T, E>`), a primitive alias
(`type Id = string | number`), or a projection built from utility types (`CreateTaskInput`), a `type`
is the only option. For a domain object I might want to extend or that a library might augment
(`Task`), an `interface` is the natural fit. When it truly does not matter, I pick `type` to keep one
word for "a name for a type." The two are not competitors so much as overlapping tools with different
reach.

## What tripped me up

- **`noUncheckedIndexedAccess` turned a line I had written a hundred times into an error.** In
  `mapLimit`, `const item = items[index]` suddenly became `T | undefined` and failed to type-check.
  My first reaction was to widen the array or reach for `any`; the right fix was the local assertion
  `items[index]!`, because the loop already guarantees the index is in range. The flag was not
  wrong — it was pointing at a spot where I was trusting an invariant the compiler could not see.
- **The first compiler errors read like walls.** `TS2322: Type 'string' is not assignable to type
  'number'` meant nothing useful until I learned to read it as "what I gave" (left) versus "what was
  wanted" (right), and to fix the *first* error before reading the rest — often three "errors"
  disappeared with one fix. By the end I could predict the line number before running the check.
- **`import type` was not optional, and I learned why the hard way.** With `verbatimModuleSyntax`
  on, importing a type as a normal value import is an error. That feels pedantic until you connect it
  to native type stripping: the stripper has no type information, so a value-imported type would ask
  Node to load a runtime binding that does not exist. `import type` is not style; it is what makes
  the erasure safe.
- **The `tsx` vs native-stripping difference is real and showed up in two places.** `tsx` resolved my
  imports happily; native `node src/main.ts` did not guess extensions, so the same files only ran
  once every relative import carried `.ts`. And `tsx` ran a first draft containing an `enum` fine,
  while native Node refused it — that gap is exactly why the course sets `erasableSyntaxOnly`, so the
  compiler catches non-erasable syntax before the runtime does.

## Checkpoint evidence

- **Zero `tsc --noEmit` errors on a strict config.** `npm run typecheck` prints nothing:

  ```
  $ npm run typecheck
  > typescript-lab@1.0.0 typecheck
  > tsc --noEmit
  $
  ```

- **The toolkit runs successfully via `tsx`.** `npm run dev`:

  ```
  create input : { title: 'Port the toolkit' }
  update input : { done: true }
  retry        : Ship M04 (after 3 attempts)
  mapLimit     : [ 'Ship M04', 'Write the write-up' ]
  timeout      : TimeoutError
  results      : 42 -1
  ```

- **Native type stripping attempted on Node 24.** `node src/main.ts` ran the same code and printed the
  same output, with no warning. The deliberately non-erasable `enum` file failed under plain `node`
  with `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in
  strip-only mode`, but ran under `node --experimental-transform-types` (which warns
  `ExperimentalWarning: Transform Types is an experimental feature`). On Node 24 non-erasable syntax
  is awareness-level (full stability arrives with Node 26), and it is why `erasableSyntaxOnly` is in
  the config.

- **The ported toolkit's types are real.** `retry<Task>(…)` inferred `Task`, `mapLimit<Task, string>`
  produced `string[]`, and `withTimeout` rejected with a typed `TimeoutError` caught via
  `instanceof` in a `catch (error: unknown)` block.

- **Merged by PR:** https://github.com/arjonstratpoint/node-js-training-rnd/pull/4 (branch → PR →
  merge commit).

## What I'd do differently

- **Write the ported `toolkit.ts` from the types outward.** I translated the M02 JavaScript function
  by function and only afterwards asked what each generic should be. Starting from the signatures —
  `retry<T>(fn: () => Promise<T>): Promise<T>` first, body second — would have made the generic
  inference obvious instead of discovered.
- **Run `npm run typecheck` on a watch loop from the start.** I ran it manually after each change,
  which is fine but slow. Wiring a type-check watch would have caught errors at the keystroke and made
  the "read the first error" habit automatic.
- **Try native type stripping earlier.** I did it near the end, after the config had settled, and it
  would have been more instructive during setup — the `.ts`-extension requirement and the `enum`
  failure both explain config choices better when they arrive before you have memorised the config.
- **Type `process.env` deliberately.** I read `process.env.PORT` in passing and it is `string |
  undefined`; a tiny parsed-config object (validated once at startup) would have shown the
  `unknown`→narrow discipline applied to environment variables, which is exactly what M08's env
  validation formalises. I would add that here rather than wait for M08.
- **Lean harder on `satisfies`.** I used `satisfies` once for a config object. Applied to the label
  tables and status arrays, it would have kept literal types while still checking the shape — a better
  habit than `as const` followed by a cast.
