# M04 Tasks — TypeScript Basics & TypeScript on Node.js

Read and write strict TypeScript, and set up a TypeScript project that runs and type-checks on
Node.js.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; have your M02 toolkit code and write-up, plus your M03
      write-up, on hand.
- [ ] Confirm your local Node version matches the cohort's pinned Node 24 LTS (`.nvmrc`) and install
      `@types/node@24`.
- [ ] Continue the branch → PR → peer review → merge habit for this module.

## Research — core TypeScript

- [ ] Why TypeScript exists, structural typing, and inference vs explicit annotation.
- [ ] Primitives, arrays, tuples, unions, intersections, literal types, and `as const`.
- [ ] `type` vs `interface`, optional and `readonly` properties, and why this course uses union
      types instead of `enum`.
- [ ] Functions and generics (function generics, constraints, defaults).
- [ ] Narrowing techniques: `typeof`, `in`, equality checks, discriminated unions, user-defined type
      guards.
- [ ] `unknown` vs `any` vs `never`.
- [ ] The utility types `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`,
      `Awaited`.
- [ ] `satisfies` and `import type`.

## Research — TypeScript on Node.js

- [ ] Project setup: installing TypeScript 7 and matching `@types/node` to Node 24.
- [ ] `tsconfig.json` essentials: `strict`, `module`/`moduleResolution: nodenext`,
      `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `noEmit`,
      `skipLibCheck`.
- [ ] The three ways to run TypeScript — `tsx`, Node's native type stripping, and a `tsc` build
      (awareness only) — and what each is for.
- [ ] `tsc --noEmit` as the type-check gate, wired up as an `npm run typecheck` script.
- [ ] Typing async code (`Promise<T>`), typing caught errors (`catch (e: unknown)`), typing
      `process.env`, and what `@types/*` packages and `.d.ts` files are for.
- [ ] What changed from TypeScript 6 to 7 (strict by default, legacy options removed,
      native-compiler speed) and what the missing programmatic API means for tooling — you'll meet
      this again in M09.
- [ ] Practice reading a few real compiler errors without panicking, before you need to under lab
      pressure.

## Build

- [ ] Set up the TypeScript project (`tsconfig.json`, scripts) before porting any code.
- [ ] Port the M02 toolkit's `retry` to TypeScript as `retry<T>`.
- [ ] Port `mapLimit` to TypeScript as `mapLimit<T, R>`; port `sleep` and `withTimeout` too.
- [ ] Model the Task domain: a `Task` type, then derive `CreateTaskInput` and `UpdateTaskInput` from
      it using utility types rather than writing them by hand.
- [ ] Model a discriminated-union `Result<T, E>`.
- [ ] Run the ported toolkit with `tsx`.
- [ ] Attempt running it with Node's native type stripping, and note what actually happens on
      Node 24.

## Verify

- [ ] Zero errors from `tsc --noEmit` on a strict config.
- [ ] You can explain `unknown` vs `any`, and `type` vs `interface`, unaided.
- [ ] The toolkit runs successfully via `tsx`.
- [ ] You've attempted native type stripping on Node 24 and documented what actually happened
      (awareness-level on this Node version, not a hard pass/fail requirement).
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "What I built".
- [ ] "Why it's built this way (key decisions)": which utility types you used for
      `CreateTaskInput`/`UpdateTaskInput` and why, how you modeled `Result<T, E>`, and what
      specifically happened when you attempted native type stripping on Node 24.
- [ ] "How to build it (teach it to the next trainee)": write the utility-types guide.
- [ ] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words.
- [ ] "What tripped me up": compiler errors that confused you at first, and the difference between
      `tsx` and native type stripping on Node 24.
- [ ] "Checkpoint evidence": zero `tsc --noEmit` errors on your strict config, the toolkit running
      via `tsx`, and what happened when you attempted native type stripping on Node 24.
- [ ] Close out "What I'd do differently".
