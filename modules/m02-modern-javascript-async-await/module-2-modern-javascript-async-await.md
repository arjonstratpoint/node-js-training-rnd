# STRATPOINT ENGINEERING TRAINING

## Node.js Foundations — Self-Paced

**Module 2 — Modern JavaScript & Async/Await**

**Time estimate: 10 hours**

**Part 1 of the Node.js Engineering Program**

**Prepares you for Part 2: AI-Assisted Engineering (FlowBoard)**

---

## Module 2: Modern JavaScript & Async/Await

**Time estimate: 10 hours**

### Learning Goals

- Write idiomatic modern JavaScript: `const`/`let`, closures, arrow functions and `this`, template
  literals.
- Use destructuring, spread/rest, default parameters, optional chaining `?.`, nullish coalescing
  `??`/`??=`, and avoid the truthy/falsy and equality traps.
- Work with the array methods `map`, `filter`, `reduce`, `find`, `some`, `every`, `flatMap`, the
  non-mutating helpers `toSorted`/`toReversed`/`with`, `structuredClone`, and
  `Object.groupBy`/`Map.groupBy`.
- Use `Map` and `Set` (including the newer `Set` methods), classes with `#private` fields, and
  getters/setters.
- Handle errors with `try`/`catch`/`finally`, custom error classes, and the `Error` `cause` option.
- Split code into ES modules with named and default exports.
- Explain the event loop at a conceptual level: the call stack, the task queue, and the microtask
  queue — and use it to **predict the output order** of mixed `setTimeout`/promise/`await` code.
- Move from callbacks to Promises (`then`/`catch`/`finally`, chaining) to `async`/`await`, and handle
  errors in async code.
- Run async work sequentially versus in parallel with `Promise.all`, `allSettled`, `race`, and `any`.
- Use `Promise.withResolvers`, `Promise.try`, and async iteration (`for await…of`,
  `Array.fromAsync`).
- Cancel or bound async work with `AbortController` and `AbortSignal.timeout`.
- Fetch JSON with `fetch`.
- Recognise the common async pitfalls: a forgotten `await`, `await` inside loops, `forEach(async …)`,
  unhandled rejections, and swallowed errors.

### Concept

JavaScript ran for years as a single-threaded language that could only do one thing at a time. The
reason it could still feel responsive — and the reason Node.js can serve many requests on one thread
— is the **event loop**. Before you write async code, you need the mental model of how that loop
schedules your work.

**Modern JavaScript is the vocabulary you write that async code in.** Nothing here is exotic: it is
the set of language features you will use on every line of the toolkit you are about to build.
Module 4 ports the same code to TypeScript, so this stage is where the JavaScript is learned clean.

#### The event loop in one screen

Think of three places work can be:

- **The call stack** — the function currently running. It runs to completion, synchronously. Nothing
  can interrupt it.
- **The task queue** (a.k.a. macrotask queue) — deferred work such as `setTimeout`, `setInterval`,
  and I/O callbacks.
- **The microtask queue** — promise callbacks (`.then`, `.catch`, `.finally`) and the code after an
  `await`.

The loop is:

1. Run the current synchronous script to completion.
2. Drain the **entire microtask queue** — and any microtasks that microtasks add — before moving on.
3. Take **one** task from the macro task queue, run it, then go back to step 2.

That ordering — *sync first, then all microtasks, then one macrotask* — is the whole game. It is why
a `Promise.resolve().then(...)` always runs before a `setTimeout(..., 0)`, no matter which line comes
first in the file. Keep it in mind for the output-order drill in Walkthrough Part 2.

#### Callbacks → Promises → `async`/`await`

A **callback** is a function you hand to another function to be called later. Callbacks are how Node
started (`fs.readFile(path, cb)`), but nesting them to sequence async steps produces "callback hell":

```js
step1((err, a) => {
  if (err) return done(err);
  step2(a, (err, b) => {
    if (err) return done(err);
    step3(b, (err, c) => { /* ... */ });
  });
});
```

A **Promise** is an object representing a future value. It is either *pending*, *fulfilled*, or
*rejected*, and you attach handlers with `then`/`catch`/`finally`:

```js
step1()
  .then((a) => step2(a))
  .then((b) => step3(b))
  .catch((err) => console.error(err))
  .finally(() => console.log('done'));
```

`async`/`await` is sugar over promises that makes async code read top-to-bottom like sync code. An
`async` function always returns a promise, and `await` pauses *that function* (not the whole program)
until the promise settles:

```js
async function run() {
  try {
    const a = await step1();
    const b = await step2(a);
    return await step3(b);
  } catch (err) {
    console.error(err);
  } finally {
    console.log('done');
  }
}
```

**Sequential vs parallel** is the single most important performance decision in async code. Awaiting
one thing after another inside a loop runs them **one at a time**. Starting them all first and then
awaiting the group runs them **at the same time**:

```js
// Sequential — total time = the sum of every call.
for (const id of ids) results.push(await get(id));

// Parallel — total time ≈ the slowest single call.
const results = await Promise.all(ids.map((id) => get(id)));
```

The four combinators differ in what they do with failure:

- `Promise.all` — rejects as soon as **any** input rejects; fastest, all-or-nothing.
- `Promise.allSettled` — never rejects; resolves to a list of `{ status, value|reason }`.
- `Promise.race` — settles with the **first** input to settle (fulfil or reject).
- `Promise.any` — resolves with the **first fulfilment**; rejects only if **all** reject.

### Read These

- 🔗 MDN — `let` and `const`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
- 🔗 MDN — Closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
- 🔗 MDN — Arrow functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
- 🔗 MDN — Destructuring assignment: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
- 🔗 MDN — Optional chaining (`?.`): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
- 🔗 MDN — Nullish coalescing (`??`) and assignment (`??=`): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
- 🔗 MDN — Array: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
- 🔗 MDN — `structuredClone()`: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
- 🔗 MDN — `Object.groupBy()` / `Map.groupBy()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
- 🔗 MDN — `Map` and `Set`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- 🔗 MDN — Private class fields (`#`): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
- 🔗 MDN — `Error` and the `cause` option: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
- 🔗 MDN — JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- 🔗 MDN — The event loop: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
- 🔗 MDN — Using promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
- 🔗 MDN — `async function` / `await`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- 🔗 MDN — `Promise.all()` / `allSettled()` / `race()` / `any()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
- 🔗 MDN — `Promise.withResolvers()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
- 🔗 MDN — `Promise.try()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
- 🔗 MDN — `for await…of` and async iteration: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
- 🔗 MDN — `AbortController` and `AbortSignal.timeout()`: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
- 🔗 MDN — Using `fetch`: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- 🔗 Awareness only — Temporal (the future replacement for `Date`):
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal

### Walkthrough: Language Essentials

Set up a single ES-module workspace. Everything in this module lives in **one** Node project using
ES modules (not CommonJS), because that is the style the rest of the program uses. Node 24 (pinned in
`.nvmrc`) runs this with no build step.

```bash
mkdir -p async-toolkit
cd async-toolkit
```

```bash
cat > package.json << 'EOF'
{
  "name": "async-toolkit",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24"
  }
}
EOF
```

```bash
cat > .gitignore << 'EOF'
# .gitignore
node_modules/
.env
*.db
dist/
coverage/
EOF
```

Now create `essentials.js`. This is a tour you run once — every line is a feature you will reuse when
you build the toolkit. Read the comments; the values on the right are what each line produces.

```bash
cat > essentials.js << 'EOF'
// essentials.js — run: node essentials.js

// --- const / let and block scope -------------------------------------
const PI = 3.14;      // const: cannot be rebound
let counter = 0;      // let: can be rebound
counter += 1;         // 1

{
  let hidden = 'inside the block';
  console.log(hidden);
}
// console.log(hidden); // ReferenceError — `let`/`const` are block-scoped

// --- Closures ---------------------------------------------------------
function makeCounter() {
  let count = 0;              // captured by the function we return
  return () => ++count;
}
const next = makeCounter();
console.log('closure:', next(), next()); // closure: 1 2

// --- Arrow functions and `this` --------------------------------------
const person = {
  name: 'Ada',
  greetMethod() { return `Hi, ${this.name}`; },        // `this` is person
  greetArrow: () => `Hi, ${this?.name ?? 'undefined'}`, // arrow inherits enclosing `this`
};
console.log('method:', person.greetMethod()); // method: Hi, Ada
console.log('arrow: ', person.greetArrow());  // arrow:  Hi, undefined

// --- Template literals ------------------------------------------------
const who = 'Grace';
console.log(`literal: Hello, ${who}!`); // literal: Hello, Grace!

// --- Destructuring ----------------------------------------------------
const point = { x: 1, y: 2, z: 3 };
const { x, y = 0 } = point;             // object destructuring + default
const { z: depth } = point;             // rename z -> depth
const [first, ...tail] = [10, 20, 30];  // array destructuring + rest
console.log({ x, y, depth, first, tail }); // { x: 1, y: 2, depth: 3, first: 10, tail: [20, 30] }

// --- Spread / rest / default parameters -------------------------------
const merged = { ...point, z: 9 };               // shallow merge
const max = (...nums) => Math.max(...nums);      // rest in, spread out
function greet(name = 'world') { return `Hello, ${name}`; }
console.log('spread:', merged.z, max(3, 7, 2), greet()); // spread: 9 7 Hello, world

// --- Optional chaining and nullish coalescing -------------------------
const config = undefined;
const user = { profile: { email: 'a@b.co' } };
console.log('optional:', user.profile?.email, user.address?.city); // optional: a@b.co undefined
console.log('nullish :', config?.port ?? 3000); // nullish : 3000
let retries;
retries ??= 5;                                    // assign only if null/undefined
console.log('??=     :', retries);                // ??=     : 5

// --- Array methods ----------------------------------------------------
const nums = [1, 2, 3, 4, 5, 6];
console.log(nums.map((n) => n * 2));            // [2,4,6,8,10,12]
console.log(nums.filter((n) => n % 2 === 0));   // [2,4,6]
console.log(nums.reduce((sum, n) => sum + n, 0)); // 21
console.log(nums.find((n) => n > 4));           // 5
console.log(nums.some((n) => n > 5), nums.every((n) => n > 0)); // true true
console.log([[1, 2], [3, 4]].flatMap((a) => a)); // [1,2,3,4]

// --- Non-mutating helpers (Node 24) -----------------------------------
console.log(nums.toSorted((a, b) => b - a)); // [6,5,4,3,2,1] — `nums` unchanged
console.log(nums.toReversed());              // [6,5,4,3,2,1]
console.log(nums.with(0, 99));               // [99,2,3,4,5,6]
console.log('original nums:', nums);         // still [1,2,3,4,5,6]

// --- structuredClone --------------------------------------------------
const original = { nested: { list: [1, 2] }, when: new Date() };
const clone = structuredClone(original);
clone.nested.list.push(3);
console.log('clone :', clone.nested.list);        // [1,2,3]
console.log('origin:', original.nested.list);     // [1,2] — deep copy, not shared

// --- Grouping ---------------------------------------------------------
const people = [
  { name: 'Ada', team: 'core' },
  { name: 'Grace', team: 'core' },
  { name: 'Alan', team: 'research' },
];
const byTeam = Object.groupBy(people, (p) => p.team);
console.log(Object.keys(byTeam)); // [ 'core', 'research' ]

// --- Map and Set ------------------------------------------------------
const seen = new Set([1, 2, 2, 3]);
seen.add(4);
console.log('set:', seen.size, seen.has(2)); // set: 4 true

const a = new Set([1, 2, 3]);
const b = new Set([3, 4]);
console.log([...a.intersection(b)]); // [3]
console.log([...a.union(b)]);        // [1,2,3,4]
console.log([...a.difference(b)]);   // [1,2]

const cache = new Map();
cache.set('a', 1);
console.log('map:', cache.get('a'), cache.has('a')); // map: 1 true

// --- Classes with #private fields and getters/setters -----------------
class Account {
  #balance = 0;
  #owner;

  constructor(owner) {
    this.#owner = owner;
  }

  get balance() { return this.#balance; }

  set balance(value) {
    if (value < 0) throw new RangeError('balance cannot be negative');
    this.#balance = value;
  }

  deposit(amount) { this.#balance += amount; return this; }
}

const acct = new Account('Ada');
acct.deposit(50).deposit(25);
console.log('account:', acct.balance); // account: 75
// console.log(acct.#balance);         // SyntaxError — #balance is truly private

// --- Custom errors and `cause` ---------------------------------------
class ValidationError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

try {
  throw new ValidationError('title is required', { cause: new TypeError('missing field') });
} catch (err) {
  console.log('error:', err.name, '-', err.message); // error: ValidationError - title is required
  console.log('cause:', err.cause?.message);         // cause: missing field
}
EOF
```

```bash
node essentials.js
```

Every line printed what its comment said — that is the whole language surface this module expects you
to be fluent in.

> **Named vs default exports.** `essentials.js` is a script you *run*. The toolkit you build next is
> a **module** you *import*. This module uses **named exports** (`export function sleep() {}`) so that
> every utility is imported by name (`import { sleep } from './toolkit.js'`). Named exports are
> preferred here because they are explicit, refactor-safe, and there is no ambiguity about what a
> file offers. A default export (`export default sleep`) is a single unnamed value per file; use it
> only when a file has one obvious thing. Decide this now: the toolkit uses named exports.

### Walkthrough Part 2: The Event Loop by Output Order

Before you write a single async helper, prove the event-loop model to yourself. **Predict the output
order first, out loud or on paper** — then run it and check. The brief requires you to be able to
explain this unaided.

```bash
cat > event-loop.js << 'EOF'
// event-loop.js — predict the order, then run: node event-loop.js

console.log('1: sync start');

setTimeout(() => console.log('2: setTimeout (macrotask)'), 0);

Promise.resolve().then(() => console.log('3: promise.then (microtask)'));

(async () => {
  console.log('4: async body up to the first await (sync)');
  await null;
  console.log('5: after await (microtask)');
})();

console.log('6: sync end');
EOF
```

```bash
node event-loop.js
```

The output is:

```
1: sync start
4: async body up to the first await (sync)
6: sync end
3: promise.then (microtask)
5: after await (microtask)
2: setTimeout (macrotask)
```

Why it is that order:

1. The script runs synchronously, so **1**, then the async function body runs up to its first `await`
   (**4**), then **6**. The `await null` pauses the function and queues **5** as a microtask; the
   `.then` on line 5 already queued **3**.
2. The call stack is now empty. The loop drains the **microtask queue** in order — **3**, then **5**.
3. Only then does it run **one** macrotask: the `setTimeout` callback, **2**.

The rule to remember: **synchronous code first, then all microtasks, then macrotasks.**

### Walkthrough Part 3: Building the Async Toolkit

This is the deliverable: four small utilities, each easy to get subtly wrong, with `node:assert`
self-checks. They live in a single toolkit module so they can be reused and ported to TypeScript in
Module 4.

```bash
cat > toolkit.js << 'EOF'
// toolkit.js — the Async toolkit. Named exports.

/**
 * Resolve after `ms` milliseconds.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call `fn` until it succeeds or the retries run out.
 * `retries` is the number of *additional* attempts after the first.
 * If every attempt fails, the last error is rethrown.
 */
export async function retry(fn, { retries = 3, delayMs = 100 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await sleep(delayMs);
    }
  }
  throw lastError;
}

export class TimeoutError extends Error {
  constructor(ms) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Reject if `promise` does not settle within `ms`.
 * Note: this bounds how long *you wait*; it does not stop the underlying work.
 * To actually cancel the work, pass an AbortSignal into it (see Walkthrough Part 4).
 */
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Map over `items` calling `fn`, running at most `limit` at a time.
 * Order of the returned array matches the input order.
 */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
EOF
```

Now the self-checks. `node:assert` is the only testing tool in this stage — no framework until
Module 9.

```bash
cat > self-check.js << 'EOF'
// self-check.js — run: node self-check.js
import assert from 'node:assert/strict';
import { sleep, retry, withTimeout, TimeoutError, mapLimit } from './toolkit.js';

// --- sleep --------------------------------------------------------
{
  const start = Date.now();
  await sleep(50);
  const elapsed = Date.now() - start;
  assert.ok(elapsed >= 45, `sleep waited ~50ms (got ${elapsed}ms)`);
}

// --- retry: succeeds on the third attempt -------------------------
{
  let attempts = 0;
  const value = await retry(
    async () => {
      attempts++;
      if (attempts < 3) throw new Error('flaky');
      return 'ok';
    },
    { retries: 5, delayMs: 5 },
  );
  assert.equal(value, 'ok');
  assert.equal(attempts, 3, 'stopped retrying once it succeeded');
}

// --- retry: exhausts and rethrows the last error ------------------
{
  await assert.rejects(
    () => retry(async () => { throw new Error('always fails'); }, { retries: 2, delayMs: 1 }),
    /always fails/,
  );
}

// --- withTimeout: resolves when it finishes in time ---------------
{
  const value = await withTimeout(sleep(10).then(() => 'done'), 100);
  assert.equal(value, 'done');
}

// --- withTimeout: rejects when it is too slow ---------------------
{
  await assert.rejects(() => withTimeout(sleep(100), 10), TimeoutError);
}

// --- mapLimit: correct results, bounded concurrency ---------------
{
  let inFlight = 0;
  let peak = 0;

  const mapped = await mapLimit([1, 2, 3, 4, 5], 2, async (n) => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await sleep(5);
    inFlight--;
    return n * n;
  });

  assert.deepEqual(mapped, [1, 4, 9, 16, 25], 'results keep input order');
  assert.ok(peak <= 2, `never exceeded limit (peak ${peak})`);
}

console.log('All self-checks passed');
EOF
```

```bash
node self-check.js
# All self-checks passed
```

All four utilities pass. Notice how `mapLimit` proves two things at once: the results are in input
order, and no more than `limit` calls were ever in flight. If you had used
`Promise.all(items.map(fn))` instead, `peak` would have climbed to 5.

### Walkthrough Part 4: Sequential vs Parallel Fetch

Now measure the difference. The program uses **JSONPlaceholder**
(`https://jsonplaceholder.typicode.com`) — free, no key, predictable. The point is that timing
differences come from your code, not the API.

```bash
cat > timing.js << 'EOF'
// timing.js — run: node timing.js
const BASE = 'https://jsonplaceholder.typicode.com';
const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function fetchJson(path, signal) {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function sequential() {
  const start = performance.now();
  const posts = [];
  for (const id of ids) {
    posts.push(await fetchJson(`/posts/${id}`)); // one at a time
  }
  return { ms: performance.now() - start, count: posts.length };
}

async function parallel() {
  const start = performance.now();
  const posts = await Promise.all(ids.map((id) => fetchJson(`/posts/${id}`)));
  return { ms: performance.now() - start, count: posts.length };
}

const seq = await sequential();
const par = await parallel();

console.log(`sequential: ${seq.count} posts in ${seq.ms.toFixed(0)}ms`);
console.log(`parallel:   ${par.count} posts in ${par.ms.toFixed(0)}ms`);
console.log(`speedup:    ${(seq.ms / par.ms).toFixed(1)}x`);
EOF
```

```bash
node timing.js
# sequential: 10 posts in 3xxxms
# parallel:   10 posts in 3xxms
# speedup:    ~10x
```

**Record your actual numbers** — the brief requires them, and the parallel run should beat sequential
by roughly the number of requests, because sequential pays each round-trip one after another while
parallel pays them all at once.

`Promise.all` is all-or-nothing: one failed request rejects the whole batch. When partial results are
acceptable, use `Promise.allSettled`:

```bash
cat > all-settled.js << 'EOF'
// all-settled.js — run: node all-settled.js
const BASE = 'https://jsonplaceholder.typicode.com';
const ids = [1, 2, 3, 9999]; // 9999 does not exist -> 404

const results = await Promise.allSettled(
  ids.map(async (id) => {
    const res = await fetch(`${BASE}/posts/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }),
);

for (const [i, r] of results.entries()) {
  if (r.status === 'fulfilled') {
    console.log(`post ${ids[i]}: ok`);
  } else {
    console.log(`post ${ids[i]}: failed — ${r.reason.message}`);
  }
}
EOF
```

```bash
node all-settled.js
```

Finally, **cancellation**. `withTimeout` only bounds how long *you* wait; to actually cancel an
in-flight request, hand `fetch` an `AbortSignal`. `AbortSignal.timeout(ms)` produces one that aborts
automatically:

```bash
cat > abort.js << 'EOF'
// abort.js — run: node abort.js
try {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
    signal: AbortSignal.timeout(1), // 1ms — almost guaranteed to abort
  });
  console.log('status', res.status);
} catch (err) {
  console.log('aborted:', err.name); // TimeoutError (from the signal)
}
EOF
```

```bash
node abort.js
# aborted: TimeoutError
```

### Walkthrough Part 5: Refactor Callback `node:fs` to Promises

Node's older APIs are callback-style. Here is the callback version, then the same work with
`node:fs/promises` and `async`/`await`.

```bash
cat > read-callback.js << 'EOF'
// read-callback.js — the old style. run: node read-callback.js
import { readFile } from 'node:fs';

readFile('./package.json', 'utf8', (err, data) => {
  if (err) {
    console.error('failed:', err.message);
    return;
  }
  console.log('read', data.length, 'characters');
});
EOF
```

```bash
node read-callback.js
# read 108 characters
```

The promise version is flat, gets real `try`/`catch`, and composes with everything else you have
built:

```bash
cat > read-async.js << 'EOF'
// read-async.js — the same work, promisified. run: node read-async.js
import { readFile } from 'node:fs/promises';

try {
  const data = await readFile('./package.json', 'utf8');
  console.log('read', data.length, 'characters');
} catch (err) {
  console.error('failed:', err.message);
}
EOF
```

```bash
node read-async.js
# read 108 characters
```

> If an API has no promise version (many Node core modules do), `promisify` it:
> `import { promisify } from 'node:util'; const readFile = promisify(fs.readFile);`.

### What This Walkthrough Showed You

- The event loop runs **synchronous code first, then all microtasks, then one macrotask** — which is
  why a `.then` beats a `setTimeout(..., 0)`.
- `async` functions return promises; `await` pauses the function, not the program.
- Awaiting in a loop is **sequential**; starting promises first and awaiting the group is
  **parallel** — and parallel is dramatically faster for independent I/O.
- `Promise.all` is all-or-nothing; `allSettled` reports per-item success or failure; `race`/`any`
  settle on the first.
- `AbortController` / `AbortSignal.timeout` cancel the *actual* work, not just your wait.
- `node:fs/promises` (or `promisify`) turns callback APIs into promise APIs that compose with
  `async`/`await`.
- `node:assert` is enough to prove behaviour without a test framework.

### EXERCISE 2.1 — The combinators drill

Write `combinators.js` and prove the difference between `all`, `allSettled`, `race`, and `any`
using `sleep` and thrown errors — no network needed:

```js
import { sleep } from './toolkit.js';

const ok = (ms, v) => sleep(ms).then(() => v);
const boom = (ms, m) => sleep(ms).then(() => { throw new Error(m); });
```

- `Promise.all([ok(20, 'a'), boom(10, 'bad')])` should reject (fast failure).
- `Promise.allSettled([...])` should resolve with both a `fulfilled` and a `rejected` entry.
- `Promise.race([ok(50, 'slow'), ok(10, 'fast')])` should resolve `'fast'`.
- `Promise.any([boom(10, 'x'), ok(50, 'y')])` should resolve `'y'` (first *fulfilment* wins).
- `Promise.any([boom(10, 'x'), boom(20, 'z')])` should reject with an `AggregateError`.

Assert each outcome and print `All self-checks passed`.

### EXERCISE 2.2 — `mapLimit` under a fake rate limit

Write `rate-limit.js` that fetches **all 100** JSONPlaceholder posts (`/posts`) but hits `/posts/:id`
for the first 20 of them, using `mapLimit` with a `limit` of `5`. Track and print the peak number of
in-flight requests — prove it never exceeds 5. Then change `limit` to `20` and confirm the peak
becomes 20 while the total time drops. Explain in one sentence why an unbounded
`Promise.all(items.map(fn))` is dangerous against a real API.

### EXERCISE 2.3 — Refactor a second callback API

Pick one callback-style core API — `node:dns` (`lookup`), `node:crypto` (`randomBytes`), or
`node:zlib` (`gzip`) — and write both the callback and the `async`/`await` version in one file
(`two-styles.js`). Then wrap the callback version with `promisify` and show all three produce the
same result.

### EXERCISE 2.4 — The async-pitfalls hunt

Each snippet below is subtly broken. Write `pitfalls.js`, fix one at a time, and add an assertion or
log that proves the fix. Do **not** run them expecting them to work — run them expecting to learn.

1. **Forgotten `await`** — `const data = fetchJson('/posts/1'); console.log(data.title);` prints
   `undefined` and may log an unhandled rejection.
2. **`await` inside a loop** — awaiting each of 10 fetches in a `for` loop, which is correct but
   ~10x slower than it needs to be. Rewrite it with `Promise.all`.
3. **`forEach(async …)`** — `ids.forEach(async (id) => { await save(id); });` finishes *before* any
   save completes. Rewrite it with `for…of` (sequential) or `map`+`Promise.all` (parallel).
4. **Unhandled rejection** — a promise that rejects with no `.catch`, printed by Node as
   `UnhandledPromiseRejection`.
5. **Swallowed error** — `try { … } catch {}` with an empty catch block. Fix it so the error is at
   least logged, ideally rethrown with `cause`.

### Self-Check

1. Why does `Promise.resolve().then(fn)` run before `setTimeout(fn, 0)`, even when the `setTimeout`
   is written first?
2. What is the difference between awaiting a call inside a `for` loop and awaiting
   `Promise.all(items.map(...))`? Which is faster for independent I/O, and why?
3. When would you choose `Promise.allSettled` over `Promise.all`?
4. What does `await` actually pause — the program, or the function? What does that mean for other
   work?
5. What is the difference between `withTimeout(promise, ms)` and passing
   `AbortSignal.timeout(ms)` to `fetch`?
6. Name three consequences of forgetting `await` on an async call.

### Module 2 Deliverable

Commit these inside your public training repo (link the repo from your write-up header):

- ☐ An **Async toolkit ES module** exporting `sleep`, `retry(fn, { retries, delayMs })`,
  `withTimeout(promise, ms)`, and `mapLimit(items, limit, fn)`, using **named exports**.
- ☐ A self-check file run with `node` whose **`node:assert` checks all pass** (each of the four
  utilities covered).
- ☐ A **sequential-vs-parallel timing comparison** fetching JSONPlaceholder, with the **actual
  numbers** recorded — parallel measurably beating sequential.
- ☐ A **callback-style `node:fs` snippet refactored** to promises/`async`-`await`.
- ☐ Your written **prediction and explanation** of the `setTimeout`/promise/`await` output order,
  matching what `node event-loop.js` prints.
- ☐ The lab linked from your write-up, and the work merged by **branch → PR → merge commit** (the
  M01 habit).

### Appendix: Self-Check Answers

1. Promises settle their callbacks on the **microtask queue**, which the loop drains *completely*
   after the synchronous script and before it runs a single macrotask. The `setTimeout` callback is a
   macrotask, so it waits behind every queued microtask regardless of source order.
2. Awaiting in a `for` loop runs the calls **one at a time** — total time is the sum of every call.
   `Promise.all(items.map(...))` starts them **all** before awaiting, so total time is roughly the
   slowest single call. Parallel is faster for independent I/O because the waits overlap instead of
   stacking.
3. Use `allSettled` when you want results even if some items fail — it never rejects and returns a
   `fulfilled`/`rejected` status per item. Use `all` when any failure should abort the whole batch
   immediately.
4. `await` pauses only the **async function** it appears in, returning control to the event loop so
   other work (other callbacks, other requests) can run. It does not block the whole program.
5. `withTimeout` races your promise against a timer and rejects if the timer wins — but the
   underlying operation keeps running (you only stop waiting). `AbortSignal.timeout(ms)` passed to
   `fetch` actually **aborts** the request, freeing the connection and stopping the work server-side.
6. A forgotten `await` (a) gives you a pending `Promise` instead of the value, so downstream code
   reads `undefined`; (b) lets the rest of the function continue before the work finishes, creating
   race conditions; and (c) if that promise rejects, you get an **unhandled rejection** because no
   handler was ever attached.
