# M03 Write-Up — Node.js Runtime & npm

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

- Public training repo: https://github.com/arjonstratpoint/node-js-training-rnd
- The **`log-report` CLI** at `node-runtime-lab/log-report.js` — streams a newline-delimited access
  log with `createReadStream` + `node:readline`, aggregates counts (by method, status, status class,
  top paths), takes `--file`/`--top`/`--out` via `node:util` `parseArgs`, and writes a JSON report.
- The **bare `node:http` server** at `node-runtime-lab/server.js` — three JSON endpoints
  (`GET /health`, `GET /api/tasks`, `POST /api/tasks`) with **hand-rolled routing, body parsing, and
  error responses** (400/404/405), plus `SIGINT`/`SIGTERM` graceful shutdown.
- Supporting files: `node-runtime-lab/scripts/generate-log.js` (deterministic sample log),
  `node-runtime-lab/buffer-vs-stream.js` (the memory proof), `node-runtime-lab/core-tour.js` (the
  runtime tour), `package.json`, `.gitignore`, `.env.example`.
- Merged PR (branch → PR → merge commit):
  https://github.com/arjonstratpoint/node-js-training-rnd/pull/3

## Why it's built this way (key decisions)

- **Why this streaming approach for the log file, specifically?** The file is newline-delimited and I
  only ever need per-line aggregates, so I used `createReadStream(path, { encoding: 'utf8' })` piped
  into `readline.createInterface({ input, crlfDelay: Infinity })` and consumed it with
  `for await (const line of rl)`. That keeps exactly one line in memory at a time and lets the loop
  yield between chunks, so the process stays responsive while it reads. The report object is the only
  thing that grows, and it grows with the number of *distinct* paths/statuses, not the file size.
- **What would have changed — and broken — if you'd loaded the file fully into memory instead of
  streaming it?** `await readFile(file)` returns one giant string that is the whole file. On the
  generator's 48 MB file that is ≈+53 MB of resident memory before I can look at a single line, and
  it scales linearly — the trainer's 100 MB log would add ≈+100 MB, and a real production log a few
  GB would simply crash the process. `buffer-vs-stream.js` makes it concrete: `buffer` grows with the
  file, `stream` stays flat. Streaming also means the CLI starts emitting counts before the read
  finishes; `readFile` cannot return anything until the last byte arrives.
- **How did you hand-roll routing and body parsing, and which design did you pick where more than one
  way was possible?** I built one route key, `` `${req.method} ${pathname}` ``, from `req.method` and
  the pathname of `new URL(req.url, base)`, and dispatched with a chain of `if` comparisons — a design
  I chose over a `Map` of handlers specifically because the point of the exercise is to feel the
  tedium, and a `Map` would have hidden it. Response writing is centralised in `send()`/`sendError()`
  so every path sets `content-type` and `content-length` the same way. Body parsing is an async
  collector (`for await (const chunk of req)`) plus `JSON.parse` in a `try`, rethrowing a tagged error
  on invalid JSON. Where I had a real choice — `405` vs swallowing an unknown method — I returned an
  explicit `405` with an `allow` header, because "the route exists but not for this method" is
  genuinely different from "no such route" and I wanted the server to say which.

## How to build it (teach it to the next trainee)

**Building the streaming CLI — reasoning, not syntax.**

1. **Name the constraint first: the file may not fit in memory.** That single sentence decides every
   later choice. If the file fits, `readFile` is fine; because it may not, you stream.
2. **Create a line reader over a byte stream.** `createReadStream(file)` gives bytes; `readline`'s
   `createInterface({ input })` turns those bytes into lines. `crlfDelay: Infinity` makes `\r\n` count
   as one line break so Windows-generated logs do not produce phantom blank lines.
3. **Consume it with `for await…of`.** This is the same async-iteration you learned in Module 2. The
   loop pauses on each chunk while the file is being read from disk and resumes when data arrives —
   the event loop is free in between.
4. **Aggregate into an object, never an array of lines.** Every distinct key costs a little; the
   numbers cost nothing. This is what keeps memory independent of file size.

   ```js
   for await (const line of rl) {
     const m = LINE.exec(line);
     if (!m) { report.malformedLines += 1; continue; }
     const [, , method, path, status] = m;
     report.byMethod[method] = (report.byMethod[method] ?? 0) + 1;
     report.byStatus[status] = (report.byStatus[status] ?? 0) + 1;
   }
   ```

   `?? 0` handles the first sighting of a key without a separate `has` check.
5. **Sample memory inside the loop to prove the claim.** Every 1000 lines I read
   `process.memoryUsage().rss` and keep the max in `report.peakRssMb`. That is the number that makes
   "it streams" a fact rather than an assertion.
6. **Make it a real CLI with `parseArgs`.** `--file`/`--top`/`--out` (with `-f`/`-t`/`-o` short
   forms) keep the tool usable by hand and by the `npm run report` / `node --run report` scripts, and
   `--out` decouples "compute" from "where the report goes".
7. **Sort and slice, do not store ranks.** `topPaths` sorts the aggregated entries and takes the top
   N *once*, at the end. Sorting per line would be O(n²) work on a big file.

The reasoning generalises: **stream → aggregate into scalars → prove with RSS → expose via args.**

## Concepts worth explaining

### Streams (my own words)

A stream is a way to handle data you cannot or should not hold all at once. Instead of one `readFile`
that returns the whole file, you get a `Readable` that emits small **chunks** as they become
available. Two properties matter. First, **bounded memory**: the amount you hold at any instant is
the chunk size, not the file size — the 48 MB file and a 10 GB file use the same few megabytes.
Second, **pipeline latency**: you can start working on chunk one before chunk two exists, which is why
a stream can report counts before the read finishes. Streams also compose: `readable.pipe(writable)`
or a `Transform` lets you chain stages (read → parse → gzip → write) where back-pressure from the slow
stage slows the fast one automatically. The rule I keep: **if the data can be bigger than comfortable
to hold, it is a stream.**

### The event loop and the thread pool (my own words)

Your JavaScript runs on one thread, so it can never truly wait — if it did, nothing else could run.
Node solves this by splitting work. Synchronous code runs to completion on the **call stack**. When
you request I/O, Node hands it to **libuv** and keeps going; libuv returns a result later and Node
queues a callback on the **event loop**. The loop cycles: run a batch of callbacks, then check for
more, forever.

libuv has two ways to do that I/O. Network sockets use OS-level async notifications, so many
connections share the loop cheaply. Work with no async OS interface — file-system calls, DNS lookups,
`zlib`, `crypto` — goes to a small **thread pool** (four threads by default). That pool is why a
`readFile` does not block your loop, but it is also finite: four slow `crypto` calls can saturate it
and make the next file read wait. The loop is for scheduling callbacks; the pool is for work that
needs a real OS thread. Neither of them makes CPU-bound JavaScript faster — that still needs a worker
thread or another process.

## What tripped me up

- **The bare `node:http` server was the deliberate pain, and it delivered.** To add one endpoint I
  touched three places — the `if` chain, the `known` array for `405`, and the `send` call. There is no
  path parameters, no middleware, no built-in body parser, and no error handler: I wrote a
  `JSON.stringify` + header + `content-length` + `end` sequence by hand in `send`, and the same
  branching in `sendError`. That repeated plumbing, at three endpoints, is exactly what a framework
  collapses into a router and middleware — which is the whole reason Module 5 exists.
- **`405` is not `404`, and I nearly collapsed them.** My first version returned `404` for
  `DELETE /api/tasks`. That is wrong: the path *does* exist, the method does not. Returning `405` with
  an `allow` header is the correct signal, and building it forced me to keep a list of known paths
  separate from the dispatch chain.
- **`process.env` values are strings.** `process.env.PORT` is `"3000"`, not `3000`, so arithmetic
  needs `Number(...)`. I hit this when deciding the default port — `Number(process.env.PORT ?? 3000)`
  converts on purpose.
- **ESM has no `__dirname`.** Coming from the CommonJS tour, referencing `__dirname` in a `.js` ESM
  file is a `ReferenceError`. The replacement is `import.meta.dirname` / `import.meta.filename`.
- **I forgot `.end()` would leave the stream open.** The generator writes with `createWriteStream` and
  I needed `out.end()` **and** to `await once(out, 'finish')` before the process would exit cleanly;
  writing without closing left the script hanging on an open file handle.

## Checkpoint evidence

- **Both programs merged to `main` by PR:**
  https://github.com/arjonstratpoint/node-js-training-rnd/pull/3 (merge commit; branch → PR → merge).
- **The CLI genuinely streams — memory behavior.** `buffer-vs-stream.js` on the 1,000,000-line
  (47.5 MB) file:
  - `buffer: 1000000 lines, file is 47.5 MB, RSS +53.4 MB`
  - `stream: 1000000 lines, RSS +-16.5 MB` (effectively flat; the negative number is GC reclaiming
    earlier allocations)
  The buffer grows with the file; the stream does not. `log-report.js` on the same file reported
  `lines 1000000, bytes 49847616, elapsedMs 381, peakRssMb 71.7` — bounded, not 100+ MB.
- **The bare server's three endpoints responding** (`PORT=3000 node server.js`, exercised with
  `curl`):

  ```
  GET /health        → {"status":"ok","uptimeSeconds":1}
  GET /api/tasks     → {"count":2,"tasks":[ ... ]}
  POST /api/tasks    → {"id":"a8fb...","title":"Ship M03","done":false}   (201)
  POST invalid title → {"error":{"code":"VALIDATION_ERROR","message":"title is required"}}
  POST bad JSON      → {"error":{"code":"INVALID_JSON","message":"Request body is not valid JSON"}}
  GET /nope          → {"error":{"code":"NOT_FOUND","message":"No route for GET /nope"}}
  DELETE /api/tasks  → {"error":{"code":"METHOD_NOT_ALLOWED","message":"DELETE not allowed on /api/tasks"}}
  ```

- **What Express would remove pain from (my written explanation).** Everything above the business
  logic. Express gives me a router so I stop writing `method + pathname` chains and stop updating a
  `known` list by hand; middleware so request logging, request IDs, and body parsing are reusable
  functions instead of copied boilerplate; a real error handler so every thrown error lands in one
  place with one JSON shape instead of the `try/catch` + `sendError` I threaded through the request
  handler; and path parameters so `/api/tasks/:id` is one route, not a string compare per id. The bare
  server is the honest baseline: I can now say exactly what the framework is buying.

## What I'd do differently

- **Test the CLI against a file that actually exceeds memory.** My proof used 48 MB; the phenomenon is
  real but the numbers are modest. A 1–2 GB generated file would make the difference undeniable (and
  would have shown the stream's RSS staying flat while the buffer run simply fails).
- **Extract the routing into a small table from the start of the *second* endpoint.** Keeping the `if`
  chain was deliberate for the first server, but I would now keep the "known paths" list and the
  dispatch in one data structure so exercising `405` did not mean editing two places.
- **Validate `--top` as a number.** `parseArgs` gives strings; `--top abc` currently flows into
  `slice(0, NaN)`. A tiny guard that exits with a usage message would make the CLI honest about bad
  input.
- **Wrap the whole CLI body in `try/catch` and set an exit code.** A missing `--file` currently throws
  a raw stack trace. A clean `console.error` and `process.exitCode = 1` is friendlier and matters once
  the CLI runs in a script.
- **Read the trainer's real 100 MB file, not just my sample.** The deterministic generator was great
  for iteration, but the brief's memory point is strongest on the real data.
