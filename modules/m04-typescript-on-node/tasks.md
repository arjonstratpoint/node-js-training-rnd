# M04 Tasks — TypeScript Basics & TypeScript on Node.js

Read and write strict TypeScript, and set up a TypeScript project that runs and type-checks on
Node.js.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully; have your M02 toolkit code and write-up, plus your M03
      write-up, on hand. *(guide + worked write-up complete; the port sources from the M02 toolkit.)*
- [x] Confirm your local Node version matches the cohort's pinned Node 24 LTS (`.nvmrc`) and install
      `@types/node@24`. *(guide §Walkthrough installs `typescript@7 tsx @types/node@24`; `.nvmrc` pins
      24.)*
- [ ] Continue the branch → PR → merge habit for this module. *(No PR merged for this module on the
      remote — the worked write-up's `pull/4` does not resolve.)*

## Research — core TypeScript

- [x] Why TypeScript exists, structural typing, and inference vs explicit annotation. *(guide
      §Concept: "Why TypeScript exists", "Structural typing", "Inference vs annotation".)*
- [x] Primitives, arrays, tuples, unions, intersections, literal types, and `as const`. *(guide
      Walkthrough Part 2; write-up "How to build it".)*
- [x] `type` vs `interface`, optional and `readonly` properties, and why this course uses union
      types instead of `enum`. *(guide §Concept: "`type` vs `interface`", "Union types instead of
      `enum`"; write-up "`type` vs `interface`".)*
- [x] Functions and generics (function generics, constraints, defaults). *(guide Walkthrough Part 3;
      EXERCISE 4.3.)*
- [x] Narrowing techniques: `typeof`, `in`, equality checks, discriminated unions, user-defined type
      guards. *(guide §Concept: "Narrowing" + Walkthrough Part 2; EXERCISE 4.2.)*
- [x] `unknown` vs `any` vs `never`. *(guide §Concept; write-up "`unknown` vs `any` vs `never`".)*
- [x] The utility types `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`,
      `Awaited`. *(guide Walkthrough Part 4; write-up "Why it's built this way".)*
- [x] `satisfies` and `import type`. *(guide §Concept + Walkthrough Part 2; EXERCISE 4.6.)*

## Research — TypeScript on Node.js

- [x] Project setup: installing TypeScript 7 and matching `@types/node` to Node 24. *(guide
      §Walkthrough: `npm install -D typescript@7 tsx @types/node@24`.)*
- [x] `tsconfig.json` essentials: `strict`, `module`/`moduleResolution: nodenext`,
      `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `noEmit`,
      `skipLibCheck`. *(guide §Walkthrough, each option explained.)*
- [x] The three ways to run TypeScript — `tsx`, Node's native type stripping, and a `tsc` build
      (awareness only) — and what each is for. *(guide §Concept table + Walkthrough Part 5.)*
- [x] `tsc --noEmit` as the type-check gate, wired up as an `npm run typecheck` script. *(guide
      §Walkthrough `package.json` + Part 6; write-up "Checkpoint evidence".)*
- [x] Typing async code (`Promise<T>`), typing caught errors (`catch (e: unknown)`), typing
      `process.env`, and what `@types/*` packages and `.d.ts` files are for. *(guide Walkthrough
      Part 3 `Promise<T>` and `catch (error: unknown)`; `@types/node` purpose in §Walkthrough.
      `process.env` typing is flagged as a deliberate gap in the write-up's "What I'd do differently"
      — formalised in M08.)*
- [x] What changed from TypeScript 6 to 7 (strict by default, legacy options removed,
      native-compiler speed) and what the missing programmatic API means for tooling — you'll meet
      this again in M09. *(guide §Concept: "TypeScript 6 → 7".)*
- [x] Practice reading a few real compiler errors without panicking, before you need to under lab
      pressure. *(guide Walkthrough Part 6 (five error families); EXERCISE 4.6.)*

## Build

- [x] Set up the TypeScript project (`tsconfig.json`, scripts) before porting any code. *(guide
      §Walkthrough: config written first, before Part 3's port.)*
- [x] Port the M02 toolkit's `retry` to TypeScript as `retry<T>`. *(guide Walkthrough Part 3;
      `typescript-lab/src/toolkit.ts`.)*
- [x] Port `mapLimit` to TypeScript as `mapLimit<T, R>`; port `sleep` and `withTimeout` too. *(guide
      Walkthrough Part 3; EXERCISE 4.3.)*
- [x] Model the Task domain: a `Task` type, then derive `CreateTaskInput` and `UpdateTaskInput` from
      it using utility types rather than writing them by hand. *(guide Walkthrough Part 4; write-up
      "Why it's built this way".)*
- [x] Model a discriminated-union `Result<T, E>`. *(guide Walkthrough Part 4; write-up "Why it's
      built this way".)*
- [x] Run the ported toolkit with `tsx`. *(guide Walkthrough Parts 4–5; `npm run dev`.)*
- [x] Attempt running it with Node's native type stripping, and note what actually happens on
      Node 24. *(guide Walkthrough Part 5; write-up "Checkpoint evidence".)*

## Verify

- [x] Zero errors from `tsc --noEmit` on a strict config. *(write-up "Checkpoint evidence":
      `npm run typecheck` prints nothing.)*
- [x] You can explain `unknown` vs `any`, and `type` vs `interface`, unaided. *(write-up "Concepts
      worth explaining".)*
- [x] The toolkit runs successfully via `tsx`. *(write-up "Checkpoint evidence": `npm run dev`
      output.)*
- [x] You've attempted native type stripping on Node 24 and documented what actually happened
      (awareness-level on this Node version, not a hard pass/fail requirement). *(guide Walkthrough
       Part 5; write-up "Checkpoint evidence" — erasable file runs warning-free via `node src/main.ts`,
       `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` for the `enum` file.)*
- [x] Final self-review against every Definition of done checkbox in `brief.md`. *(guide + worked
      write-up complete.)*

## Write-up

- [x] "What I built". *(write-up "What I built".)*
- [x] "Why it's built this way (key decisions)": which utility types you used for
      `CreateTaskInput`/`UpdateTaskInput` and why, how you modeled `Result<T, E>`, and what
      specifically happened when you attempted native type stripping on Node 24. *(write-up "Why it's
      built this way".)*
- [x] "How to build it (teach it to the next trainee)": write the utility-types guide. *(write-up
      "How to build it".)*
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. *(write-up:
      `unknown` vs `any` vs `never`, and `type` vs `interface`.)*
- [x] "What tripped me up": compiler errors that confused you at first, and the difference between
      `tsx` and native type stripping on Node 24. *(write-up "What tripped me up".)*
- [x] "Checkpoint evidence": zero `tsc --noEmit` errors on your strict config, the toolkit running
      via `tsx`, and what happened when you attempted native type stripping on Node 24. *(write-up
      "Checkpoint evidence" — plus the merged-PR link, the unresolved worked-example `pull/4` noted
      above.)*
- [x] Close out "What I'd do differently". *(write-up "What I'd do differently".)*
