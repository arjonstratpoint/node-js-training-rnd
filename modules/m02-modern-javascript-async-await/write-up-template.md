# M02 Write-Up — Modern JavaScript & Async/Await

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

- Public training repo: https://github.com/arjonstratpoint/node-js-training-rnd
- The **Async toolkit ES module** at `async-toolkit/toolkit.js`, with **named exports**:
  `sleep(ms)`, `retry(fn, { retries, delayMs })`, `withTimeout(promise, ms)` (plus a
  `TimeoutError`), and `mapLimit(items, limit, fn)`.
- `async-toolkit/self-check.js` — `node:assert` self-checks, one block per utility. `node self-check.js`
  prints `All self-checks passed`.
- `async-toolkit/event-loop.js` — the prediction drill for `setTimeout`/promise/`await` order.
- `async-toolkit/timing.js` — sequential vs parallel fetch against JSONPlaceholder, with the numbers
  below.
- Callback → async refactor: `async-toolkit/read-callback.js` (old `node:fs`) and
  `async-toolkit/read-async.js` (`node:fs/promises` + `await`), both printing the same result.
- Merged PR (merge commit, not squash):
  https://github.com/arjonstratpoint/node-js-training-rnd/pull/2

## Why it's built this way (key decisions)

- **Why did you implement `retry` and `mapLimit` the way you did?** `retry` loops `attempt` from `0`
  to `retries`, `await fn(attempt)` inside a `try`, and on failure records the error, `await sleep(delayMs)`,
  and retries. When attempts run out it rethrows the *last* error — the real failure the caller cares
  about — rather than a generic "retries exhausted". `retries` is the number of *additional* attempts
  after the first, so `retries: 2` means up to 3 calls. `mapLimit` keeps a single cursor (`next`) and
  starts `Math.min(limit, items.length)` async workers; each worker loops `while (next < items.length)`
  and writes `results[index] = await fn(...)`. That gives two properties for free: results stay in
  **input order** (written by index, not by completion time) and no more than `limit` calls are ever
  in flight.
- **What would have changed if you'd fetched sequentially instead of in parallel, or vice versa?**
  Sequential `await`s each request inside a `for…of`, so total time is the **sum** of every round-trip
  (~2.7s for 10 posts). Parallel starts them all with `ids.map(...)` and awaits the group via
  `Promise.all`, so total time is roughly the **slowest single** request (~45ms) — about **60x**
  faster. Same data, same API; the only difference is *when* the requests are started.
- **Which of the brief's pitfalls did you specifically design around?** `await` inside loops. My first
  `timing.js` awaited each fetch in the loop (correct but slow); for the parallel version I reached
  for `mapLimit`/`Promise.all` instead of `forEach(async …)`. I also made `withTimeout` clear its
  timer in `.finally` so a promise that resolves in time can't leave a dangling timer keeping the
  process alive.

## How to build it (teach it to the next trainee)

**Building `mapLimit` — reasoning, not syntax.**

1. **State the contract first.** `mapLimit(items, limit, fn)` returns a promise of an array, in the
   same order as `items`. Say that out loud before typing.
2. **Preallocate the output.** `const results = new Array(items.length)`. Preallocating is a hint: I
   will write each result *by index*, so ordering can't depend on which call finishes first.
3. **Share a cursor, not a queue.** A single `let next = 0` is the whole scheduler. Each worker claims
   work with `const index = next++` — safe because JavaScript runs that read-and-increment
   synchronously to completion, even while workers interleave their `await`s.
4. **Make a worker that drains the cursor.**

   ```js
   async function worker() {
     while (next < items.length) {
       const index = next++;
       results[index] = await fn(items[index], index);
     }
   }
   ```

   The worker stops only when the cursor runs past the end, so the pool self-balances: a fast worker
   simply picks up more items.
5. **Start exactly `limit` workers and await them all.**
   `Array.from({ length: Math.min(limit, items.length) }, () => worker())` — the `Math.min` avoids
   starting idle workers when there are fewer items than the limit, and `Promise.all(workers)`
   resolves when every worker has drained the cursor.
6. **Prove the two properties.** Track peak in-flight and assert `peak <= limit`; assert the output
   deep-equals the input mapped in order. Both are in `self-check.js`.

The reasoning generalises: **bounded concurrency = a shared cursor + a fixed pool + index-keyed
output.**

## Concepts worth explaining

### The event loop and the microtask queue (my own words)

The call stack runs the current function to completion — nothing interrupts it. Everything deferred
goes to one of two queues: **macrotasks** (`setTimeout`, I/O callbacks) and **microtasks** (promise
callbacks and the code after an `await`). The loop's rule is: finish the synchronous script, then
**drain the entire microtask queue** (including microtasks that microtasks add), and only then run
**one** macrotask. That rule explains the drill: the `console.log` calls run first (`1`, `4`, `6`),
then the promise microtasks in the order they were queued (`3` then `5`), and the `setTimeout`
callback (`2`) comes last — even though it was written first. It isn't about which line is first; it's
about which queue the callback lands in.

### `Promise.all` vs `allSettled`/`race`/`any`

- `all` — waits for **all**, rejects on the **first** rejection (all-or-nothing). I used it for the
  parallel fetch because a missing post should fail the batch.
- `allSettled` — waits for all and **never rejects**; returns `{ status, value | reason }` per item.
  Use it when partial success is acceptable — my run showed `post 1: ok`, `post 2: ok`, `post 3: ok`,
  `post 9999: failed — HTTP 404` from one batch.
- `race` — settles with the **first to settle**, fulfilment or rejection.
- `any` — resolves with the **first fulfilment** and ignores rejections until **all** reject (then an
  `AggregateError`).

## What tripped me up

- **A forgotten `await` looks like a typo and behaves like a bug.** `const data = fetchJson('/posts/1'); console.log(data.title)`
  printed `undefined` — `data` is a pending Promise, not the object — and the rejection later surfaced
  as an `UnhandledPromiseRejection`, nowhere near the mistake. Now every async call is either
  `await`ed or deliberately `.catch`ed.
- **I predicted the event-loop order wrong the first time**, expecting `setTimeout(..., 0)` to run
  before the promise `.then`. Re-reading the rule — microtasks drain before any macrotask — fixed it:
  the order is `1, 4, 6, 3, 5, 2`, which is exactly what `node event-loop.js` printed.
- **The `this` trap bit me in my own tour.** An arrow function in an object literal with
  `` `${this.name}` `` threw `TypeError: Cannot read properties of undefined` because, at ESM top
  level, `this` is `undefined`. The fix is `` this?.name `` — an arrow inherits the *enclosing* `this`.
- **`mapLimit` order worried me.** I assumed results would come back in completion order; they don't,
  because writing `results[index]` fixes the order regardless of which promise settles first.

## Checkpoint evidence

- **Self-checks:** `node self-check.js` → `All self-checks passed` (covers `sleep`, `retry` success
  and exhaustion, `withTimeout` success and timeout, and `mapLimit` order + concurrency cap).
- **Timing numbers** (`node timing.js`, 10 JSONPlaceholder posts):
  - `sequential: 10 posts in 2697ms`
  - `parallel:   10 posts in 45ms`
  - `speedup:    59.7x`
- **Event-loop order** (`node event-loop.js`): `1, 4, 6, 3, 5, 2` — sync body, then microtasks in
  queue order, then the macrotask. My written explanation is above.
- **Merged PR:** https://github.com/arjonstratpoint/node-js-training-rnd/pull/2 (merge commit;
  branch → PR → merge, the M01 habit).

## What I'd do differently

- **Take the timing as a median of several runs.** A single run is noisy; my 60x will move between
  runs. I'd run each mode 3–5 times and report the median so the claim is defensible.
- **Write the `mapLimit` self-check before the implementation.** The order-and-limit properties were
  the whole risk; a failing assertion first would have pinned the design before I wrote it.
- **Reach for `mapLimit` sooner.** I only added bounded concurrency because the exercise asked; a real
  API would have rate-limited the unbounded `Promise.all` long before it finished.
- **Keep `withTimeout`'s documentation honest.** It bounds *how long I wait*, not the underlying work
  — actually cancelling needs `AbortSignal` threaded through. I'd note that next to the function.
