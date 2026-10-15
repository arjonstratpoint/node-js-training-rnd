# STRATPOINT ENGINEERING TRAINING

## Node.js Foundations — Self-Paced

**Module 4 — TypeScript Basics & TypeScript on Node.js**

**Time estimate: 8 hours**

**Part 1 of the Node.js Engineering Program**

**Prepares you for Part 2: AI-Assisted Engineering (FlowBoard)**

---

## Module 4: TypeScript Basics & TypeScript on Node.js

**Time estimate: 8 hours**

### Learning Goals

- Explain **why TypeScript exists**, what **structural typing** means, and when to let inference work
  versus when to annotate.
- Model data with primitives, arrays, **tuples**, unions, intersections, **literal types**, and
  `as const`.
- Choose between `type` and `interface`, use optional and `readonly` properties, and understand why
  this course uses **union types instead of `enum`**.
- Write **generics** on functions, with constraints and defaults.
- **Narrow** a value safely: `typeof`, `in`, equality checks, discriminated unions, and user-defined
  type guards.
- Tell **`unknown` from `any` from `never`**, and reach for the right one.
- Apply the utility types `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`,
  and `Awaited`.
- Use `satisfies` and `import type`.
- Set up a TypeScript project: **TypeScript 7**, `@types/node` matching your Node major, and a
  `tsconfig.json` with `strict`, `module`/`moduleResolution: nodenext`, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `noEmit`, and `skipLibCheck`.
- Know the **three ways to run TypeScript** — `tsx` (this course's dev runner), Node's native type
  stripping (erasable syntax only), and a `tsc` build (awareness only) — and what each is for.
- Use **`tsc --noEmit`** as the type-check gate (`npm run typecheck`).
- Type async code (`Promise<T>`), caught errors (`catch (e: unknown)`), and `process.env`; know what
  `@types/*` packages and `.d.ts` files are for.
- Describe what changed from **TypeScript 6 to 7** — strict by default, legacy options removed,
  native-compiler speed, and what the missing programmatic API means for tooling you meet again in
  M09.
- Read compiler errors **without panic**.

### Concept

Module 2 gave you the JavaScript. This module gives you the **type system on top of it** — and, just
as important, the toolchain that makes TypeScript run and type-check on Node. Everything from here on
in the program is TypeScript: the Task API in M05, Prisma's generated client in M07, Zod's inferred
types in M08, and the tests in M09 all assume you can read and write it.

TypeScript is **JavaScript plus a static type layer that is erased before your code runs.** There is
no TypeScript runtime. The types are checked by a compiler and then stripped away; what Node executes
is plain JavaScript. That single sentence explains almost every rule in this module.

#### Why TypeScript exists

JavaScript is dynamically typed: a value's type is whatever it happens to be when you run it. That
flexibility is why the language is pleasant for small scripts and painful for large systems. In a
500-line file you can hold every shape in your head. In a 50,000-line service you cannot, and the
compiler cannot help you because it never knew the shapes in the first place. A typo in a property
name, a `null` you forgot to handle, a function called with the arguments in the wrong order — all of
these become runtime failures that might not surface until production.

TypeScript moves those failures **left**, to the editor and the CI run, where they are cheap. It also
makes code self-documenting: a function signature is a contract, and the compiler enforces it. You
get autocompletion that actually knows your data, refactors that rename every usage safely, and
errors at the call site instead of the crash site.

The cost is a build/check step and some syntax. The trade — catching whole classes of bugs before
they ship — is why the entire industry, and this program from here on, writes typed JavaScript.

#### Structural typing

TypeScript is **structurally typed**: two types are compatible when their *shapes* match, regardless
of what they are named. You do not declare that a thing "implements" an interface to satisfy it; if
it has the right members, it fits.

```ts
interface Point {
  x: number;
  y: number;
}

const p = { x: 1, y: 2, z: 3 };
const q: Point = p; // OK — p has at least x and y
```

`p` was never declared as a `Point`, but it has everything `Point` requires, so it is assignable. The
extra property `z` is allowed when assigning a variable that already exists (this is not the same as
object-literal excess-property checks, which are stricter). This "duck typing, checked at compile
time" is what lets you type data from a JSON API or a database without wrapping it in classes.

#### Inference vs annotation

TypeScript infers types from values, so you annotate far less than you might expect:

```ts
let count = 0;                 // inferred: number
const name = 'Ada';            // inferred: "Ada" (a literal type, because const)
const ids = [1, 2, 3];         // inferred: number[]
const user = { id: 1, name: 'Ada' }; // inferred: { id: number; name: string }
```

Annotate when inference is **not enough or not obvious**: function parameters (there is nothing to
infer from), exports that form a public contract, and any spot where you want to pin a wider type
than inference would pick. Do not annotate everything by reflex — redundant annotations are noise,
and sometimes worse, because they hide inference mistakes. The habit to build: *let inference do its
job, annotate the boundaries.*

#### `type` vs `interface`

Both describe an object's shape, and for many cases they are interchangeable:

```ts
interface User {
  id: string;
  name: string;
}

type UserT = {
  id: string;
  name: string;
};
```

The differences that actually matter:

- **Interfaces can be reopened (declaration merging); type aliases cannot.** Two `interface User`
  blocks merge. This is occasionally useful (augmenting a library) and occasionally a footgun.
- **Type aliases can name anything** — unions, tuples, primitives, functions — not just object
  shapes. `type Id = string | number` has no interface equivalent.
- **Interfaces extend more naturally** (`interface Admin extends User {}`); type aliases compose with
  intersections (`type Admin = User & { role: string }`).

This course's rule: **use `type` for unions, tuples, and anything non-object; use `interface` for
object shapes you might extend.** When it does not matter, either is fine — reach for `type` so you
keep one idea for "a name for a type".

#### Union types instead of `enum`

TypeScript has `enum`, but this course does not use it. `enum` emits runtime code, which means
**Node's native type stripping cannot run it** (see the `erasableSyntaxOnly` walkthrough below), and
it has surprising behaviors around numeric enums and const-enum inlining. The modern replacement is a
**union of string literals**:

```ts
type Status = 'todo' | 'in-progress' | 'done';
```

Compared to `enum Status { Todo, InProgress, Done }`, this union is what you actually want: it is
erasable, it serializes to plain strings (so it matches JSON, the database, and the API), and it
narrows perfectly with a discriminated union. Constants go in a `readonly` array, not an enum:

```ts
const STATUSES = ['todo', 'in-progress', 'done'] as const;
type Status = (typeof STATUSES)[number]; // 'todo' | 'in-progress' | 'done'
```

#### `unknown` vs `any` vs `never`

These three are the ones people mix up most, and the distinction is the difference between safe and
unsafe code.

- **`any`** switches the type checker off for that value. Everything is allowed, nothing is caught.
  It spreads: assign an `any` into a variable and that variable is now unchecked too. Treat `any` as
  a temporary escape hatch you intend to remove, never as a design choice.
- **`unknown`** is the type-safe top type: *any* value can be assigned to it, but you can do
  **nothing** with it until you narrow it. This is what you use for values you do not control —
  parsed JSON, `catch` clauses, network responses. It forces the check instead of letting you skip
  it.
- **`never`** is the bottom type: a value that can never occur. A function that always throws returns
  `never`; the unreachable branch of an exhaustively-narrowed union is `never`. It is how the
  compiler proves you handled every case.

```ts
function parse(json: string): unknown {
  return JSON.parse(json); // the caller must narrow before using it
}

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

#### Narrowing

Narrowing is how you turn a wide type (`unknown`, a union) into a specific one. TypeScript follows
your runtime checks and refines the type inside the branch:

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius ** 2;
    case 'square':    return shape.side ** 2;
    case 'rectangle': return shape.width * shape.height;
    default:          return assertNever(shape); // proves all cases are handled
  }
}
```

The tools: `typeof` for primitives, `in` for "does this object have this key", `instanceof` for
classes, equality against literal values, and **discriminated unions** — a shared literal field (like
`kind`) that the compiler can switch on. When none of those fit, write a **user-defined type guard**:

```ts
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
```

The `value is string[]` return annotation is the part the compiler reads; the body is an ordinary
boolean expression you write correctly. This is exactly how Zod (M08) will generate validators.

#### `satisfies` and `import type`

`satisfies T` checks that a value matches `T` **without widening the value's type**. Compare:

```ts
const roles = ['admin', 'editor'] as const; // readonly ['admin', 'editor']

const config = {
  port: 3000,
  host: 'localhost',
} satisfies Record<string, string | number>;
// config.port is still number; config.host is still "localhost"
```

With `: Record<string, string | number>` instead, `config.port` would widen to `string | number` and
you would lose the literal. `satisfies` gives you checking *and* precision.

`import type` imports a symbol **for types only**, guaranteeing it is erased and never becomes a
runtime import. With `verbatimModuleSyntax` on (this module's config), type-only imports **must**
use it:

```ts
import { ok, err } from './domain.ts';
import type { Result, Task } from './domain.ts';
```

#### TypeScript 6 → 7

TypeScript 7 is the **native compiler** (GA July 2026) — the same type checker rewritten in a
native language for a large speed-up. Three consequences you should know:

- **Strict-by-default leaning.** Legacy options that existed only to keep old code compiling are
  removed; new projects are expected to run strict. This course sets `strict` explicitly anyway.
- **It is fast enough to be a habit.** `tsc --noEmit` used to be slow enough that teams skipped it.
  In 7 it is quick, so it runs on save and in CI with no excuses.
- **No stable programmatic API yet.** Tools that *embed* the compiler — including some test
  transformers — have to work around this. You will meet that friction head-on in **M09**, where the
  Jest transform (`@swc/jest`) strips types and `tsc --noEmit` stays the gate.

#### Three ways to run TypeScript

| Way | Command | What it does | Use it for |
| --- | --- | --- | --- |
| **`tsx`** | `tsx src/main.ts` | Fast, type-stripping runner; resolves imports, handles all TS syntax | Development — this course's `dev` script |
| **Native type stripping** | `node src/main.ts` | Node itself strips types (erasable syntax only) | Zero-dependency awareness; fully stable only in Node 26 |
| **`tsc` build** | `tsc` | Compiles `.ts` to `.js` you then run | Shipping a build (awareness) |

Notice what none of them do on their own: **type-check**. `tsx` and Node's stripper *remove* types;
they do not verify them. That job belongs to `tsc --noEmit`, run as `npm run typecheck`, which is the
gate for this module and every module after it.

### Read These

- 🔗 TypeScript Handbook — the basics: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
- 🔗 TypeScript Handbook — Everyday Types:
  https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- 🔗 TypeScript Handbook — Narrowing:
  https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- 🔗 TypeScript Handbook — Generics:
  https://www.typescriptlang.org/docs/handbook/2/generics.html
- 🔗 TypeScript Handbook — Utility Types:
  https://www.typescriptlang.org/docs/handbook/utility-types.html
- 🔗 TypeScript — `tsconfig.json` reference: https://www.typescriptlang.org/tsconfig
- 🔗 TypeScript — `erasableSyntaxOnly`:
  https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly
- 🔗 TypeScript — `verbatimModuleSyntax`:
  https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax
- 🔗 Node.js — TypeScript (type stripping, `--experimental-strip-types`):
  https://nodejs.org/docs/latest-v24.x/api/typescript.html
- 🔗 tsx — the TypeScript runner: https://github.com/privatenumber/tsx

### Walkthrough: The TypeScript Workspace

Everything in this module lives in one project, `typescript-lab/`, that takes your Module 2 async
toolkit and ports it to TypeScript. Create the folder and the three config files first — **before you
port any code**, so the compiler is already watching.

```bash
mkdir -p typescript-lab/src
cd typescript-lab
```

```bash
cat > package.json << 'EOF'
{
  "name": "typescript-lab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "tsx src/main.ts",
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  }
}
EOF
```

```bash
cat > .gitignore << 'EOF'
# .gitignore
node_modules/
.env
dist/
coverage/
EOF
```

Install the toolchain. `typescript@7` is the native compiler; `tsx` is the dev runner; `@types/node`
provides the type declarations for Node's built-in modules (`node:fs`, `node:path`, `process`, …) and
**must match your Node major** — this cohort runs Node 24, so `@types/node@24`.

```bash
npm install -D typescript@7 tsx @types/node@24
npx tsc --version
node --version
```

The `tsconfig.json` is where the module's discipline lives. Read every option:

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
EOF
```

Six of those options deserve a sentence each:

- **`strict: true`** turns on the whole family of safety checks (`noImplicitAny`, `strictNullChecks`,
  `strictFunctionTypes`, …) at once. Never leave it off. `strictNullChecks` in particular is what
  makes `null`/`undefined` bugs compile errors instead of runtime surprises.
- **`module`/`moduleResolution: nodenext`** tells TypeScript to match Node's own ESM resolution: you
  write `import` with explicit file extensions, exactly as Node requires at runtime.
- **`verbatimModuleSyntax`** stops TypeScript from silently eliding imports. Value imports stay
  imports, and **type-only imports must say `import type`** — which matters because native Node type
  stripping has no idea which symbols are types.
- **`erasableSyntaxOnly`** errors on any syntax that cannot be stripped (enums, namespaces with
  runtime, parameter properties). It is the option that makes your code runnable by `node file.ts`
  and by `tsx` unchanged.
- **`noUncheckedIndexedAccess`** makes `arr[i]` and `record[key]` return `T | undefined` instead of
  `T`. It is stricter than `strict` alone and catches a real bug class — a lesson you will feel in
  `mapLimit` below.
- **`noEmit: true`** means this project never produces `.js`; `tsc` is used purely as a checker. That
  is the correct default for an app run by `tsx`/Node. (It also lets us set
  `allowImportingTsExtensions`, which requires no emit.)

The three run scripts now mean: `npm run dev` runs the code through `tsx`, `npm run typecheck` checks
it with no output, and `npm run build` would emit JavaScript if we ever wanted it.

### Walkthrough Part 2: Core TypeScript

This file is a running tour of the type features the rest of the program uses. Save it, read the
comments, and run it — the point is that it **type-checks** as much as that it runs.

```bash
cat > src/core-types.ts << 'EOF'
// src/core-types.ts — a tour of core TypeScript. Run: npx tsx src/core-types.ts

// --- primitives and inference --------------------------------------------
const id: string = 't-1';
let count = 0; // inferred number
count += 1;

// --- arrays and tuples ----------------------------------------------------
const tags: string[] = ['work', 'urgent'];
type Point = [x: number, y: number]; // a fixed-length, positional tuple
const origin: Point = [0, 0];

// --- literal types + as const --------------------------------------------
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

// --- unions and intersections --------------------------------------------
type Id = string | number;
type Timestamped = { createdAt: string };
type TaskRow = Timestamped & { id: Id; title: string };

// --- optional and readonly properties ------------------------------------
interface Account {
  readonly id: string;
  name: string;
  nickname?: string; // string | undefined
}

// --- discriminated union --------------------------------------------------
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      return assertNever(shape); // compile error if a case is missing
  }
}

// --- narrowing: typeof, in, user-defined guard ----------------------------
function describe(value: unknown): string {
  if (typeof value === 'string') return `string(${value.length})`;
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value !== null && typeof value === 'object' && 'kind' in value) {
    return `object with kind=${String((value as { kind: unknown }).kind)}`;
  }
  return 'something else';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// --- satisfies: check a value without widening it -------------------------
const serverConfig = {
  port: 3000,
  host: 'localhost',
} satisfies Record<string, string | number>;

console.log('roles      :', ROLES.join(', '));
console.log('area square:', area({ kind: 'square', side: 3 }));
console.log('describe   :', describe(ROLES));
console.log('isStrings  :', isStringArray(tags));
console.log('config     :', serverConfig.host, serverConfig.port);
console.log('tuple      :', origin.join(','), '| role:', 'admin' as Role);
EOF
```

```bash
npx tsx src/core-types.ts
npm run typecheck
```

Output:

```
roles      : admin, editor, viewer
area square: 9
describe   : array(3)
isStrings  : true
config     : localhost 3000
tuple      : 0,0 | role: admin
```

Now **prove the checker is real**. Delete a `case` from `area`, or change `serverConfig.port` to a
boolean, and run `npm run typecheck`. You get an error and a line number — that is the entire value
proposition of this module, felt in one command. Put the line back.

Three things worth naming:

- **`as const`** turns `ROLES` into a readonly tuple of literal types, and `(typeof ROLES)[number]`
  extracts the union. That two-line pattern replaces `enum` completely.
- **`assertNever`** is how a discriminated union becomes *exhaustive*: if you add `{ kind: 'line' }`
  to `Shape` and forget to handle it, the `default` branch passes `line` to a `never` parameter and
  fails to compile.
- **`unknown` + narrowing** is the safe path for untyped data. `describe` accepts anything and must
  prove what it has before using it.

### Walkthrough Part 3: Generics — Porting the Toolkit

Open your Module 2 toolkit (`async-toolkit/toolkit.js`). Here is its TypeScript port, in `src/`:
`sleep` gains no generics, but `retry`, `withTimeout`, and `mapLimit` all become generic so they
preserve whatever type you feed them.

```bash
cat > src/toolkit.ts << 'EOF'
// src/toolkit.ts — the M02 async toolkit, ported to TypeScript with generics.

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  retries: number;
  delayMs: number;
}

// retry<T> preserves the resolved type of fn.
export async function retry<T>(
  fn: () => Promise<T>,
  { retries, delayMs }: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt <= retries) await sleep(delayMs * attempt);
    }
  }
  throw lastError;
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// withTimeout<T> resolves to T, or rejects with TimeoutError.
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// mapLimit<T, R> runs fn over items with at most `limit` in flight,
// preserving the output type R for each input T.
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      const item = items[index]!; // noUncheckedIndexedAccess: assert it exists
      results[index] = await fn(item, index);
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
EOF
```

Three generic ideas are at work:

- **`retry<T>(fn: () => Promise<T>): Promise<T>`** — `T` is inferred from the callback. Call
  `retry(() => fetchTitle(), …)` and the result is `Promise<string>`; call it with a function
  returning a `Task` and you get `Promise<Task>`. Without the generic you would have to return
  `Promise<unknown>` and cast.
- **`withTimeout<T>(promise: Promise<T>): Promise<T>`** — the timeout path rejects, so its type is
  `Promise<never>`, and `never` absorbs into the `Promise.race` union to leave `Promise<T>`.
- **`mapLimit<T, R>(items, limit, fn)`** — two parameters so input and output types can differ.
  `mapLimit(tasks, 3, (t) => fetchTitle(t))` maps `Task` → `string` with the correct result type.

Note `const item = items[index]!`. With `noUncheckedIndexedAccess`, `items[index]` is `T | undefined`
because the compiler cannot prove `index` is in range even though the loop guarantees it. The `!` is a
deliberate, local assertion — the right tool here, and a deliberate improvement over a blanket
`any`.

### Walkthrough Part 4: The Task Domain & `Result<T, E>`

The deliverable's second half is the **Task domain**: a `Task` type, its input types **derived with
utility types**, and a discriminated-union `Result<T, E>`.

```bash
cat > src/domain.ts << 'EOF'
// src/domain.ts — the Task domain, derived input types, and Result<T, E>.

// The domain model. This is the source of truth; the input types are derived from it.
export interface Task {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

// CreateTaskInput: a title is required, description/done are optional, and the
// server owns id/createdAt/updatedAt. Derived, never hand-written.
export type CreateTaskInput = Required<Pick<Task, 'title'>> &
  Partial<Pick<Task, 'description' | 'done'>>;

// UpdateTaskInput: every mutable field optional — that is exactly Partial<Pick<...>>.
export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'done'>>;

// A readonly view, for handing tasks out without letting callers mutate them.
export type ReadonlyTask = Readonly<Task>;

// A lookup table keyed by the union of statuses.
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

// Result<T, E>: a discriminated union that models success or failure without throwing.
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ReturnType / Awaited: read the result type straight off a function.
async function loadTask(id: string): Promise<Task> {
  return {
    id,
    title: 'Ship M04',
    description: null,
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export type LoadedTask = Awaited<ReturnType<typeof loadTask>>; // Task

// Narrowing a Result is the same discriminated-union move as Shape.
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
EOF
```

The utility types are doing real work here. `CreateTaskInput` is *derived*, so if a field is added to
`Task` the inputs update automatically and can never drift out of sync. `Required<Pick<Task, 'title'>>`
reads as "just the title, and required"; `Partial<Pick<Task, 'description' | 'done'>>` reads as "just
those two, and optional". `UpdateTaskInput` is one line and self-explanatory. Compare that to
hand-writing three object types that silently rot the moment `Task` changes.

`Result<T, E>` is deliberately **not** an exception. `{ ok: true; value: T } | { ok: false; error: E }`
is a discriminated union on `ok`, so a caller must check `result.ok` before touching `result.value` —
the compiler will not let you skip it. `unwrapOr` shows the narrowing in one line.

Now wire them together and run:

```bash
cat > src/main.ts << 'EOF'
// src/main.ts — run everything: npx tsx src/main.ts
import { sleep, retry, withTimeout, mapLimit, TimeoutError } from './toolkit.ts';
import { ok, err, unwrapOr } from './domain.ts';
import type { Result, CreateTaskInput, UpdateTaskInput, Task } from './domain.ts';

const create: CreateTaskInput = { title: 'Port the toolkit' };
const update: UpdateTaskInput = { done: true };
console.log('create input :', create);
console.log('update input :', update);

// Generics preserved end to end: retry<Task> yields Task.
let attempts = 0;
const task = await retry<Task>(async () => {
  attempts += 1;
  if (attempts < 3) throw new Error('flaky network');
  return {
    id: 't-1',
    title: 'Ship M04',
    description: null,
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}, { retries: 3, delayMs: 20 });
console.log('retry        :', task.title, `(after ${attempts} attempts)`);

// mapLimit<T, R>: Task[] -> string[].
const titles = await mapLimit<Task, string>(
  [task, { ...task, id: 't-2', title: 'Write the write-up' }],
  2,
  async (t) => {
    await sleep(5);
    return t.title;
  },
);
console.log('mapLimit     :', titles);

// withTimeout rejects with a typed TimeoutError.
try {
  await withTimeout(sleep(50), 10);
} catch (error: unknown) {
  if (error instanceof TimeoutError) console.log('timeout      :', error.name);
}

// Result<T, E> narrows on `.ok`.
const good: Result<number> = ok(42);
const bad: Result<number> = err(new Error('nope'));
console.log('results      :', unwrapOr(good, -1), unwrapOr(bad, -1));
EOF
```

```bash
npm run dev
npm run typecheck
```

Output:

```
create input : { title: 'Port the toolkit' }
update input : { done: true }
retry        : Ship M04 (after 3 attempts)
mapLimit     : [ 'Ship M04', 'Write the write-up' ]
timeout      : TimeoutError
results      : 42 -1
```

And `npm run typecheck` prints **nothing** — that is success. A silent `tsc --noEmit` is the sound of
a clean build.

### Walkthrough Part 5: Three Ways to Run TypeScript

You have been running via `tsx`. Now run the **same files** two other ways and observe.

**1. `tsx` (the dev runner).** Already done: `npm run dev`. It resolves `./toolkit.ts` and executes.

**2. Node's native type stripping.** Node 24 can run `.ts` directly — type stripping is on by
default for erasable syntax, no flag required.

```bash
node src/main.ts
```

You should see the **same output** as `tsx`, with no warning on Node 24. (The stable, warning-free
story is what Node 26 finishes; the experimental edges on 24 are around syntax that *isn't*
erasable, below.) Note the two requirements this path imposes:

- **Relative imports need their real extension** (`./toolkit.ts`, not `./toolkit`). Native Node does
  not guess. Our config's `allowImportingTsExtensions` is what lets us write them.
- **Only erasable syntax runs.** Anything the stripper cannot remove — an `enum`, a namespace with
  runtime code, a constructor parameter property — throws at load time.

See it fail on purpose:

```bash
cat > src/non-erasable.ts << 'EOF'
// src/non-erasable.ts — deliberately uses a NON-erasable construct.
enum Status {
  Todo,
  Done,
}

console.log(Status.Done);
EOF
```

```bash
node src/non-erasable.ts
```

On Node 24 this fails with a `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]` whose message is
exactly `TypeScript enum is not supported in strip-only mode`. That is the stripper refusing to guess
— and it is the whole reason a union of literals is the safe choice. To run it anyway you need the
transform path, which **does** warn that it is experimental:

```bash
node --experimental-transform-types src/non-erasable.ts
```

That prints `ExperimentalWarning: Transform Types is an experimental feature` and then `1` (the value
of `Status.Done`). **This is precisely why the course bans `enum`.** If you had used a union of
literals (`type Status = 'todo' | 'done'`), the file would have stripped and run on plain `node` with
no flag and no warning at all. The awareness point is the deliverable: *native stripping is fast and
dependency-free, but it is erasable-only — non-erasable syntax needs the experimental transform path,
and full stability lands in Node 26.*

**3. A `tsc` build (awareness).** To actually ship compiled JavaScript:

```bash
npx tsc --outDir dist --noEmit false
```

Because the config sets `allowImportingTsExtensions: true`, `tsc` refuses to emit. You get a hard
error:

```
error TS5096: Option 'allowImportingTsExtensions' can only be used when one of 'noEmit',
'emitDeclarationOnly', or 'rewriteRelativeImportExtensions' is set.
```

That restriction is harmless while we only type-check (`noEmit: true`), which is exactly why it never
bit us above. To emit anyway you would add `"rewriteRelativeImportExtensions": true` (TypeScript
5.7+), which rewrites the `.ts` specifiers to `.js` on the way out, and usually set `rootDir` so the
output layout is what you expect. That friction is the lesson: **this course does not ship a `tsc`
build** — `tsx` runs it and `tsc --noEmit` checks it. Full build tooling belongs to a later cohort;
know that it exists and what it is for.

Clean up the deliberate failure:

```bash
rm src/non-erasable.ts
```

### Walkthrough Part 6: Reading Compiler Errors Without Panic

Compiler errors are not punishment; they are the compiler telling you it cannot prove something is
safe. Read them in three steps: **the file and line, the message, then the "why".** Here are five you
will meet often, and what each actually means.

**1. Property does not exist.**

```bash
cat > src/errors.ts << 'EOF'
const task = { id: 't-1', title: 'Ship' };
console.log(task.done);
EOF
```

```
src/errors.ts:2:18 - error TS2339: Property 'done' does not exist on type '{ id: string; title: string; }'.
```

You are using a property the type does not have — usually a typo, or you forgot to add the field.
(Once you have *fixed* such a line, you can pin it deliberately with `// @ts-expect-error`, which
asserts the next line is an error and itself fails if the error ever disappears. Here we want to see
the error, so we do not.)

**2. Possibly `null` or `undefined`.**

```bash
cat > src/errors.ts << 'EOF'
interface Account {
  nickname?: string;
}
const account: Account = {};
console.log(account.nickname.toUpperCase());
EOF
```

```
error TS18048: 'account.nickname' is possibly 'undefined'.
```

Optional means optional. Handle it (`account.nickname?.toUpperCase()`) or narrow first
(`if (account.nickname) …`). This error existing at all is the point of `strict`.

**3. Type is not assignable.**

```bash
cat > src/errors.ts << 'EOF'
const count: number = 'three';
EOF
```

```
error TS2322: Type 'string' is not assignable to type 'number'.
```

The most common error in the world. Read the two types in the message: left of "not assignable" is
what you provided, right is what was expected.

**4. Type-only import used as a value.** `TimeoutError` is a *class* — it has both a type and a
runtime value — but `import type` imports only the type, so using it as a value is rejected:

```bash
cat > src/errors.ts << 'EOF'
import type { TimeoutError } from './toolkit.ts';
const e = new TimeoutError('boom');
EOF
```

```
error TS1361: 'TimeoutError' cannot be used as a value because it was imported using 'import type'.
```

You imported with `import type` (or `verbatimModuleSyntax` required it) and then used the symbol where
a runtime value is needed. Drop the `type`, or import the value you actually wanted. (Using a pure
interface like `Task` as a value gives a different code, `TS2693: 'Task' only refers to a type` — the
`import type` form of the message is specific to symbols that *also* have a value side, like classes.)

**5. Not exported / cannot find module.**

```bash
cat > src/errors.ts << 'EOF'
import { missing } from './toolkit.ts';
EOF
```

```
error TS2305: Module '"./toolkit.ts"' has no exported member 'missing'.
```

The name is not exported from that file. Check the spelling against `toolkit.ts`.

Run the check after each change so you see each error in isolation:

```bash
npm run typecheck
```

```bash
rm src/errors.ts
```

The habit: **read the first error, fix it, re-run.** One fix often clears three "errors" that were
really the same root cause cascading.

### What This Walkthrough Showed You

- **TypeScript is JavaScript plus an erased type layer.** Nothing in this module exists at runtime —
  `tsx`, Node's stripper, and `tsc` all remove the types before execution.
- **`strict` is the default posture, not an extra.** `strictNullChecks` and
  `noUncheckedIndexedAccess` turn real runtime crashes into compile-time errors you can see instantly.
- **Inference carries the load; annotate the boundaries.** Function parameters and public contracts
  get annotations; locals rarely need them.
- **Union-of-literals beats `enum`** for this stack: it is erasable, serializes as plain strings, and
  narrows cleanly — which is why `erasableSyntaxOnly` is on.
- **Generics preserve types through generic functions.** `retry<T>`, `withTimeout<T>`, and
  `mapLimit<T, R>` would be `unknown`-returning without them.
- **Utility types make derived inputs impossible to drift.** `CreateTaskInput` and `UpdateTaskInput`
  are built from `Task`, so they update with it for free.
- **`Result<T, E>` is a discriminated union, not an exception** — the compiler makes callers handle
  both branches.
- **Types are checked by `tsc --noEmit`, never by the runner.** `tsx` and native stripping only strip.
  `npm run typecheck` is the gate.
- **Native type stripping runs erasable TypeScript on Node 24 with no flag and no warning, but it is
  erasable-only** — non-erasable syntax needs the experimental `--experimental-transform-types` path
  (which warns), and full stability lands in Node 26.

### EXERCISE 4.1 — `NonNullable` and narrowing a nullable field

Add a function `displayDescription(task: Task): string` to `src/domain.ts` that returns the task's
description, or the literal `'(no description)'` when it is `null`. Then add a one-line comment
naming the utility type that strips `null` from a type (`NonNullable<T>`) and use it once to produce
a `type Description = NonNullable<Task['description']>`. Run `npm run typecheck` and `npm run dev`.

### EXERCISE 4.2 — A user-defined type guard

Write `isTask(value: unknown): value is Task` in a new `src/guards.ts`. It must check that `value` is
a non-null object, that `id` and `title` are strings, and that `done` is a boolean — narrowing as it
goes, with no `any` and no casts. Then write a caller that takes an `unknown`, uses the guard, and
logs either the title or `'not a task'`. Run `npm run typecheck`.

### EXERCISE 4.3 — Constrain a generic

Add a `firstOrThrow<T>(items: readonly T[]): T` to `src/toolkit.ts` that throws if the array is
empty. Then add a **constrained** version, `firstBy<T extends { id: string }>(items: readonly T[],
id: string): T`, which finds by `id` (use `noUncheckedIndexedAccess`-safe access) and throws when
absent. Explain in a comment why the constraint `T extends { id: string }` is required to read
`item.id`.

### EXERCISE 4.4 — Model a second domain with utility types

In a new `src/project.ts`, define a `Project` interface (at least `id`, `name`, `description`,
`archived`, plus two timestamps). Derive a `CreateProjectInput` and an `UpdateProjectInput` from it
using `Pick`/`Partial`/`Required`/`Omit` — **no hand-written field lists**. Add a
`Record<ProjectStatus, string>` label table for a `ProjectStatus` union. Run `npm run typecheck`.

### EXERCISE 4.5 — Widen `Result<T, E>` with a third variant

Extend `Result<T, E>` in `src/domain.ts` to a three-way union — for example
`{ ok: true; value: T } | { ok: false; error: E } | { ok: false; error: E; partial: T }` — or design
your own third case and justify it in a comment. Update `unwrapOr` (and `assertNever` if you use it)
so the switch still compiles. If any branch is not handled, note the exact compiler error you get.

### EXERCISE 4.6 — Trigger and read five real compiler errors

In a scratch `src/errors.ts`, deliberately cause five different errors — one from each family in
Walkthrough Part 6 (`TS2339`, `TS18048`, `TS2322`, `TS1361`, `TS2305`) — and for each, write one line
under it naming the error type and the fix in your own words. Run `npm run typecheck` after each so
you see them one at a time. Delete the file when done.

### Self-Check

1. Why does this course set `strict: true`, and what specifically does `strictNullChecks` buy you?
2. Explain the difference between `unknown`, `any`, and `never` — and which one belongs in a `catch`
   clause.
3. When would you reach for an `interface` over a `type`, and vice versa? Give one case for each.
4. `tsx`, Node's native type stripping, and `tsc` are all involved in running TypeScript. Which one
   **type-checks**, and which two only strip types?
5. What does `noUncheckedIndexedAccess` change about `arr[i]`, and why did `mapLimit` need a `!`?
6. What does `verbatimModuleSyntax` force you to do, and why does native Node type stripping care?
7. Why does this course use a union of string literals instead of `enum` — what breaks with `enum`
   under `erasableSyntaxOnly`?

### Module 4 Deliverable

Commit these inside your public training repo (link the repo from your write-up header):

- ☐ The **M02 toolkit ported to TypeScript** in `typescript-lab/src/toolkit.ts`, with generics:
  `retry<T>`, `withTimeout<T>`, `mapLimit<T, R>`, plus `sleep`.
- ☐ The **Task domain** in `typescript-lab/src/domain.ts`: a `Task` type, `CreateTaskInput` and
  `UpdateTaskInput` **derived with utility types**, and a discriminated-union `Result<T, E>`.
- ☐ A `tsconfig.json` running **strict** (with `noUncheckedIndexedAccess`, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`, `noEmit`) and an `npm run typecheck` script.
- ☐ **Zero errors from `tsc --noEmit`** (`npm run typecheck` prints nothing).
- ☐ The toolkit **runs via `tsx`** (`npm run dev` prints the expected output).
- ☐ A written note in your write-up of what happened when you **attempted native type stripping** on
  Node 24 (awareness-level on this version — not a hard pass/fail).
- ☐ Your own explanation of **`unknown` vs `any`** and **`type` vs `interface`**.
- ☐ The work merged to `main` through a **pull request** (branch → PR → merge, the M01 habit).

This module is where **everything after it becomes TypeScript.** Get the config and the type-check
gate right here and the rest of the program is typed from the start.

### Appendix: Self-Check Answers

1. `strict` turns on the whole safety family at once, so you never have to opt into each check and
   never accidentally ship with one off. `strictNullChecks` specifically makes `null` and `undefined`
   distinct from every other type: a value that may be null is typed `T | null`, and you cannot use it
   as a `T` until you narrow it. That converts the single most common JavaScript crash — reading a
   property of `undefined` — into a compile-time error.
2. `any` disables the checker for that value and spreads silently; it is an escape hatch to remove,
   not a design. `unknown` is the safe top type: accept anything, use nothing until you narrow it.
   `never` is the bottom type: a value that cannot occur, used for functions that always throw and
   for exhaustiveness checks. A `catch` clause gives you `unknown` — not `any` — precisely so you must
   narrow before using the caught error (`if (error instanceof Error) …`).
3. Use `interface` for object shapes you expect to **extend** or that others might augment
   (`interface Admin extends User`; declaration merging), and `type` for everything else — unions,
   tuples, primitives, function types, intersections, and derived/utility-type aliases
   (`type Id = string | number`, `type CreateTaskInput = …`). When it genuinely does not matter, this
   course prefers `type`.
4. **`tsc` type-checks** (via `tsc --noEmit`, wired as `npm run typecheck`). `tsx` and Node's native
   type stripping only **remove** type syntax; neither verifies it. That is why the gate is a
   separate command from the runner.
5. `noUncheckedIndexedAccess` changes `arr[i]` from `T` to `T | undefined`, because the compiler
   cannot prove the index is in range. In `mapLimit` the loop guarantees `index < items.length`, but
   the compiler still sees `T | undefined`, so `const item = items[index]!` asserts the invariant the
   loop already enforces — a deliberate, local assertion rather than a project-wide `any`.
6. `verbatimModuleSyntax` stops TypeScript from rewriting or eliding imports and requires that
   type-only imports be written `import type`. Native Node type stripping has no type information, so
   if a file imported a type as a normal value import, Node would try to load a runtime binding that
   does not exist. `import type` makes the erasure explicit and safe for both `tsx` and native Node.
7. A union of string literals (`type Status = 'todo' | 'done'`) is **erasable** — it disappears
   cleanly during type stripping, serializes as a plain string for JSON/APIs/databases, and narrows
   with a discriminated union. `enum`, by contrast, **emits runtime JavaScript**, so a file using it
   cannot be run by Node's native type stripping; it fails with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`
   (or needs `--experimental-transform-types`). `erasableSyntaxOnly` makes that failure a compile
   error up front, which is why the course bans `enum`.
