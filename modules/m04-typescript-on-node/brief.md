# M04 — TypeScript Basics & TypeScript on Node.js

**Week 2 · Days 1-2 · 8 hours**

## Builds on

[m02-modern-javascript-async-await](../m02-modern-javascript-async-await/write-up-template.md) and
[m03-nodejs-runtime-npm](../m03-nodejs-runtime-npm/write-up-template.md) — you're porting the M02
toolkit, so have that code and write-up on hand.

## Objective

Read and write strict TypeScript, and set up a TypeScript project that runs and type-checks on
Node.js.

## Scope

**Core TypeScript**

- Why TypeScript; structural typing; inference vs annotation.
- Primitives, arrays, tuples, unions, intersections, literal types, `as const`.
- `type` vs `interface`; optional and `readonly` properties; union types instead of `enum`.
- Functions, generics (functions, constraints, defaults).
- Narrowing: `typeof`, `in`, equality, discriminated unions, user-defined type guards.
- `unknown` vs `any` vs `never`.
- Utility types: `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`, `Awaited`.
- `satisfies`, `import type`.

**TypeScript on Node.js**

- Project setup: TypeScript 7, `@types/node` matching your Node major version.
- `tsconfig.json` essentials: `strict`, `module` / `moduleResolution: nodenext`,
  `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `noEmit`, `skipLibCheck`.
- Three ways to run TypeScript: `tsx` (this course's dev runner), Node's native type stripping
  (erasable syntax only), and a `tsc` build (awareness only).
- `tsc --noEmit` as the type-check gate (`npm run typecheck`).
- Typing async code (`Promise<T>`), errors (`catch (e: unknown)`), and `process.env`; `@types/*`
  packages and `.d.ts` files.
- TypeScript 6 → 7: strict by default, legacy options removed, native-compiler speed, and what the
  missing programmatic API means for tooling you'll meet again in M09.
- Reading compiler errors without panic.

## Stack constraints

- TypeScript 7.0.
- **Resolved: this cohort runs Node 24 LTS**, pinned in `.nvmrc`, with `@types/node@24`. Node 26
  (which makes native TypeScript type stripping fully stable) is only adopted for a future cohort
  after every lab has been dry-run against it — not mid-program.
- Everything from this module onward is TypeScript. This is the last module with a plain-JS
  deliverable behind you, not ahead of you.

## Deliverable

Port the M02 "Async toolkit" to TypeScript with generics (`retry<T>`, `mapLimit<T, R>`). Model the
Task domain: `Task`, `CreateTaskInput`, and `UpdateTaskInput` derived with utility types, plus a
discriminated-union `Result<T, E>`. Run it with `tsx`, and attempt it with Node's native type
stripping as well.

## Definition of done

- [ ] Zero errors from `tsc --noEmit` on a strict config.
- [ ] You can explain `unknown` vs `any`, and `type` vs `interface`, in your own words.
- [ ] The toolkit runs successfully via `tsx`.
- [ ] You've attempted native type stripping on Node 24 and documented what happened in your
      write-up — on 24 this is awareness-level, not a hard requirement, since full stability arrives
      only with Node 26.
