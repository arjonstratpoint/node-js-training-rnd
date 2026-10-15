# Pattern — Verify runtime claims against the pinned toolchain

**Discovered:** 2026-10-15, building/validating the M04 instructional guide.

## The pattern

Instructional guides make claims about *runtime behavior* ("this prints a warning", "this fails with
error TSxxxx", "this outputs N"). Those claims are the most likely part of a guide to be wrong,
because the toolchain moves. Before shipping a guide, extract the exact files it tells the learner to
create and **actually run them** against the pinned versions:

1. Reconstruct the learner's project from the guide's own heredocs (parse
   `cat > <file> << 'EOF' … EOF`), skipping deliberate-failure files.
2. `npm install` the pinned versions.
3. Run the gate the guide names (`npm run typecheck`) and the runner (`npm run dev`).
4. Run each "you should see" snippet and diff the real output against the quoted output.
5. For "you'll get error TSxxxx" claims, trigger each error and capture the exact code, line:col, and
   message.

If any output differs from the guide, the guide is wrong — fix the guide, not the claim.

## Verified facts captured during M04 (Node 24.21.0, TypeScript 7.0.2)

- **Native type stripping is on by default on Node 24 and emits no warning** for erasable syntax
  (`node src/main.ts`). The `ExperimentalWarning: Type Stripping …` claim was **wrong**; the only
  warning in this area is `ExperimentalWarning: Transform Types is an experimental feature`, emitted
  by `node --experimental-transform-types`.
- **An `enum` fails under strip-only mode** with
  `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only
  mode`, and the message does *not* suggest the transform flag.
- **`erasableSyntaxOnly: true`** makes `tsc` reject an enum with
  `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` — so the compiler,
  not the runtime, is the first line of defence.
- **`allowImportingTsExtensions` blocks `tsc` emit** with
  `error TS5096: Option 'allowImportingTsExtensions' can only be used when one of 'noEmit',
  'emitDeclarationOnly', or 'rewriteRelativeImportExtensions' is set.` (plus `TS5011` about `rootDir`).
- **Type-only import used as a value**: the code depends on the symbol.
  `TS1361: 'X' cannot be used as a value because it was imported using 'import type'` fires when `X`
  is a **class** (has a value side); a pure **interface** used as a value gives
  `TS2693: 'X' only refers to a type, but is being used as a value here.` Use a class (e.g.
  `TimeoutError`) in the guide's example or the quote is wrong.
- Verified error codes for the M04 "reading compiler errors" bank: `TS2339`, `TS18048`, `TS2322`,
  `TS1361`, `TS2305`.

## Related gotcha

- **`node --check` does not apply TypeScript stripping.** Running it on a `.ts` file fails with
  `SyntaxError: Unexpected identifier` on the first `interface`/type annotation. It is a false
  negative for TS. Syntax-check the `bash` blocks with `bash -n`; the real TS validation is
  `tsc --noEmit` on the reconstructed files.
- **Do not put `// @ts-expect-error` on a line whose error you quote to the learner** — the directive
  suppresses exactly that error, so the learner sees nothing. Reserve `@ts-expect-error` for pinning
  a deliberate wrong snippet *after* the error has been explained, and say so.
