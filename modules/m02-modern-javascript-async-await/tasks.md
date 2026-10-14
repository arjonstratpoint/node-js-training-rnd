# M02 Tasks — Modern JavaScript & Async/Await

Write idiomatic modern JavaScript, explain the event loop at a conceptual level, and write reliable
asynchronous code.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully (and skim your m01 write-up) before starting.
- [ ] Continue the branch → PR → merge habit from M01 for this lab's checkpoint. *(No PR merged for
      this module on the remote — the worked write-up's `pull/2` does not resolve; see
      `knowledge/retros/2026-10-13-m03-instructional-guide.md`.)*

## Research (do before or alongside the build, not after)

- [x] `const`/`let`, scope, closures, arrow functions & `this`, template literals. *(guide
      §Concept; the ESM `this === undefined` arrow trap is captured in the write-up.)*
- [x] Destructuring, spread/rest, default parameters, optional chaining `?.`, nullish coalescing
      `??`/`??=`, and the truthy/falsy/equality pitfalls. *(guide §Concept.)*
- [x] `map`/`filter`/`reduce`/`find`/`some`/`every`/`flatMap`, the non-mutating helpers
      `toSorted`/`toReversed`/`with`, `structuredClone`, and `Object.groupBy`/`Map.groupBy`. *(guide
      §Concept.)*
- [x] `Map` and `Set` (including the newer `Set` methods), classes with `#private` fields,
      getters/setters. *(guide §Concept.)*
- [x] `try/catch/finally`, writing custom error classes, and the `Error` `cause` option. *(guide
      §Concept; the toolkit's `TimeoutError`.)*
- [x] ES module named vs default exports — decide which you'll use in the toolkit. *(named exports
      chosen — write-up "What I built".)*
- [x] The call stack, the event loop, and the task-queue vs microtask-queue distinction — you'll
      need this to explain output ordering later. *(guide §Concept; write-up "The event loop and the
      microtask queue".)*
- [x] Callbacks → Promises (`then`/`catch`/`finally`, chaining) → `async`/`await`, and how error
      handling differs in async code. *(guide §Concept; `read-callback.js` → `read-async.js`
      refactor.)*
- [x] `Promise.all`, `allSettled`, `race`, and `any` — and when each fits. *(guide §Concept; write-up
      "`Promise.all` vs `allSettled`/`race`/`any`".)*
- [x] `Promise.withResolvers`, `Promise.try`, and async iteration (`for await…of`,
      `Array.fromAsync`). *(guide §Concept.)*
- [x] `AbortController` and `AbortSignal.timeout` for cancellation and timeouts. *(guide §Concept;
      `withTimeout`.)*
- [x] `fetch` and working with JSON responses. *(guide §Concept; `timing.js`.)*
- [x] The common async pitfalls: forgotten `await`, `await` inside loops, `forEach(async …)`,
      unhandled rejections, swallowed errors — know what each looks like before you build. *(guide
      §Concept; write-up "What tripped me up".)*
- [x] Note (awareness only): Temporal exists as the future replacement for `Date` — you don't need
      to use it here. *(guide §Concept.)*

## Build

- [x] Build `sleep`, with its own `node:assert` self-check. *(guide Walkthrough Part 3; toolkit
      `self-check.js`.)*
- [x] Build `retry(fn, { retries, delayMs })`, with its own self-check. *(guide Walkthrough Part 3;
      write-up "Why it's built this way".)*
- [x] Build `withTimeout(promise, ms)`, with its own self-check, using what you researched on
      `AbortController`/timeouts. *(guide Walkthrough Part 3; `TimeoutError`.)*
- [x] Build `mapLimit(items, limit, fn)`, with its own self-check. *(guide Walkthrough Part 3;
      write-up "Building `mapLimit`".)*
- [x] Fetch from JSONPlaceholder sequentially, then in parallel, and compare the timings. *(guide
      Walkthrough Part 4; `timing.js` — 2697 ms vs 45 ms.)*
- [x] Refactor a piece of callback-style `node:fs` code to promises/async-await. *(guide Walkthrough
      Part 5; `read-callback.js` → `read-async.js`.)*

## Verify

- [x] All `node:assert` self-checks pass. *(guide verified end to end under Node 24.21 — retro
      `2026-10-12-m02-instructional-guide`; write-up "Checkpoint evidence".)*
- [x] You can predict and explain, unaided, the output order of a `setTimeout`/promise/`await`
      snippet. *(write-up "The event loop and the microtask queue"; order `1, 4, 6, 3, 5, 2`.)*
- [x] The timing comparison shows parallel beating sequential, and you can explain why. *(write-up
      "Checkpoint evidence": 59.7x, with the why.)*
- [x] Final self-review against every Definition of done checkbox in `brief.md`. *(guide + worked
      write-up complete.)*

## Write-up

- [x] "What I built": log each toolkit function as you finish it, not all at the end. *(write-up
      "What I built".)*
- [x] "Why it's built this way (key decisions)": how you implemented `retry`/`mapLimit`, what
      would change if you'd fetched the other way (sequential vs parallel), and which async
      pitfall you specifically designed around. *(write-up "Why it's built this way".)*
- [x] "How to build it (teach it to the next trainee)": write the guide for one utility of your
      choice. *(write-up: the `mapLimit` walkthrough.)*
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. *(write-up:
      the event loop + the Promise combinators.)*
- [x] "What tripped me up": note forgotten-`await` or race-condition surprises as they happen.
      *(write-up "What tripped me up".)*
- [x] "Checkpoint evidence": your self-checks passing, your actual timing numbers, and your
      explanation of the `setTimeout`/promise/`await` output order. *(write-up "Checkpoint
      evidence".)*
- [x] Close out "What I'd do differently". *(write-up "What I'd do differently".)*
