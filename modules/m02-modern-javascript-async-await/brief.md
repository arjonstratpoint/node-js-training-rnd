# M02 — Modern JavaScript & Async/Await

**Week 1 · Days 2-4 · 10 hours**

## Builds on

[m01-dev-environment-git-github](../m01-dev-environment-git-github/write-up-template.md) — you'll
use the same branch → PR → review → merge habit for this lab's checkpoint.

## Objective

Write idiomatic modern JavaScript, explain the event loop at a conceptual level, and write reliable
asynchronous code.

## Scope

**Language essentials**

- `const`/`let`, scope, closures, arrow functions and `this`, template literals.
- Destructuring, spread/rest, default parameters, optional chaining `?.`, nullish coalescing `??`
  and `??=`, truthy/falsy and equality pitfalls.
- Array methods: `map`, `filter`, `reduce`, `find`, `some`, `every`, `flatMap`; non-mutating helpers
  `toSorted`, `toReversed`, `with`; `structuredClone`; `Object.groupBy` / `Map.groupBy`.
- `Map` and `Set` (including the newer `Set` methods), classes with `#private` fields,
  getters/setters.
- Errors: `try/catch/finally`, custom error classes, `Error` `cause`.
- ES modules: named vs default exports.

**Asynchronous JavaScript**

- Call stack, event loop, task queue vs microtask queue.
- Callbacks and "callback hell" → Promises (`then`/`catch`/`finally`, chaining) → `async`/`await`.
- Error handling in async code. Sequential vs parallel execution: `Promise.all`, `allSettled`,
  `race`, `any`.
- `Promise.withResolvers`, `Promise.try`, async iteration (`for await…of`, `Array.fromAsync`).
- Timeouts and cancellation: `AbortController`, `AbortSignal.timeout`.
- `fetch` and JSON.
- Pitfalls: forgotten `await`, `await` inside loops, `forEach(async …)`, unhandled rejections,
  swallowed errors.
- Awareness only: Temporal as the future replacement for `Date` — you don't need to use it yet.

## Stack constraints

- Plain modern JavaScript. No TypeScript yet — that starts in M04.
- One ES module, with `node:assert` for self-checks (no test framework yet — that's M09).

## Deliverable

**An "Async toolkit" ES module — `sleep`, `retry`, `withTimeout`, `mapLimit` — each with passing
`node:assert` self-checks, plus a timing comparison and a callback-to-async refactor.**

## Lab

*Goal: prove you can write correct, idiomatic async code by building small utilities that are easy
to get subtly wrong.*

**You do.**

1. Research the language essentials and async concepts in Scope before you start building.
2. Build `sleep`, `retry(fn, { retries, delayMs })`, `withTimeout(promise, ms)`, and
   `mapLimit(items, limit, fn)`, each with its own self-check.
3. Fetch from JSONPlaceholder sequentially, then in parallel, and compare the timings.
4. Refactor a piece of callback-style `node:fs` code to promises/async-await.
5. Be ready to predict and explain the output order of a mixed `setTimeout`/promise/`await`
   snippet.

**You build and capture.** The toolkit module with all self-checks passing, and your timing
comparison's actual numbers.

## Definition of done

- [ ] All `node:assert` self-checks pass.
- [ ] You can predict and explain, out loud, the output order of a snippet mixing `setTimeout`,
      promises, and `await`.
- [ ] The timing comparison actually shows parallel beating sequential, and you can explain why.

## Resolved decisions

- **Public API: use [JSONPlaceholder](https://jsonplaceholder.typicode.com).** It's free, needs no
  auth or API key, has generous and predictable rate limits, and is widely used for exactly this kind
  of exercise — so timing differences come from your code, not from flaky third-party behavior.
