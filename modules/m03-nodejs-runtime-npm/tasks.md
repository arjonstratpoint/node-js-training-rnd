# M03 Tasks — Node.js Runtime & npm

Explain what Node.js is and how it runs code, use core modules, and manage dependencies safely
with npm.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [x] Read this stage's `brief.md` fully; skim your m02 write-up (you'll reuse those async
      patterns).
- [ ] Get the synthetic ~100MB log file from your trainer (generator script or download link)
      before starting the CLI lab. *(Worked example used a generated 48 MB / 1,000,000-line sample
      instead — write-up "What I'd do differently".)*
- [ ] Continue the branch → PR → merge habit for this module's Friday-gate
      submission. *(No PR merged for this module on the remote — the worked write-up's `pull/3` does
      not resolve.)*

## Research (do before or alongside the build, not after)

- [x] What Node is: V8 + libuv + core APIs, the single-threaded event loop and thread pool,
      blocking vs non-blocking, when Node is (and isn't) a good fit. *(guide §Concept; write-up "The
      event loop and the thread pool".)*
- [x] Modules: ESM vs CommonJS, `"type": "module"`, `import.meta.dirname`/`import.meta.filename`,
      the `node:` prefix. *(guide §Concept; the ESM `__dirname` trap is in the write-up.)*
- [x] Core APIs you'll need: `node:fs/promises`, `node:path`, `node:os`, `node:events`,
      `node:stream` (why streams exist), `node:crypto` (`randomUUID`), `node:timers/promises`,
      `node:util` (`parseArgs`, `promisify`). *(guide §Concept + Walkthrough Part 2.)*
- [x] `node:http` basics — enough to write a bare server with manual routing and body parsing.
      *(guide Walkthrough Part 4.)*
- [x] `process`: `argv`, `env`, exit codes, and the `SIGINT`/`SIGTERM` signals. *(guide §Concept;
      the server's graceful shutdown.)*
- [x] Config and ergonomics: environment variables, `.env`, `node --env-file`, `node --watch`,
      `node --run`. *(guide Walkthrough Part 5.)*
- [x] Globals: `fetch`, `URL`, `AbortController`, `structuredClone`. *(guide §Concept.)*
- [x] npm: `package.json` anatomy, semver ranges (`^`/`~`), the lockfile, `install` vs `ci`,
      `update`, `outdated`, scripts, `npx`, dependencies vs devDependencies, `engines`, `npm audit`.
      *(guide Walkthrough Part 5.)*
- [x] Supply-chain hygiene: how to vet a package before installing, review lockfile diffs, and
      understand lifecycle scripts. *(guide Walkthrough Part 5 + EXERCISE 3.5.)*
- [x] Debugging: `console` methods, `node --inspect` with the VS Code debugger, reading stack
      traces. *(guide Walkthrough Part 6.)*
- [x] Note (awareness only): `node:test` and `node:sqlite` exist — this course uses Jest and Prisma
      instead, so you don't need to use either. *(guide §Concept.)*

## Build

- [x] Build the `log-report` CLI: stream the log file (don't load it fully into memory), aggregate
      counts, accept options via `parseArgs`. *(guide Walkthrough Part 3; `log-report.js`.)*
- [x] Have the CLI write its aggregated counts out as a JSON report. *(guide Walkthrough Part 3;
      the `--out` flag.)*
- [x] Build the bare `node:http` server with three JSON endpoints, writing the routing and body
      parsing by hand (no framework). *(guide Walkthrough Part 4; `server.js`.)*

## Verify

- [ ] Both programs merged to `main` through a pull request. *(No PR merged for this module on the
      remote — the worked write-up's `pull/3` does not resolve.)*
- [ ] The CLI genuinely streams the file — check its memory behavior on the full ~100MB file, not
      just correctness on a tiny sample. *(Streaming proven, but on the 47.5 MB generated file, not
      the full 100 MB — `buffer-vs-stream.js`: buffer +53.4 MB vs stream flat; write-up "What I'd do
      differently".)*
- [x] You can explain, specifically, what a framework like Express would remove pain from, based on
      what hurt while writing the bare `node:http` server. *(write-up "What Express would remove
      pain from".)*
- [x] Final self-review against every Definition of done checkbox in `brief.md`. *(guide + worked
      write-up complete.)*

## Write-up

- [x] "What I built": the CLI and the bare server, as you finish each. *(write-up "What I built".)*
- [x] "Why it's built this way (key decisions)": why this streaming approach specifically, what
      would break if you'd loaded the file fully into memory instead, and how you designed the
      hand-rolled routing/body parsing. *(write-up "Why it's built this way".)*
- [x] "How to build it (teach it to the next trainee)": write the streaming-CLI guide. *(write-up
      "Building the streaming CLI".)*
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. *(write-up:
      streams + the event loop/thread pool.)*
- [x] "What tripped me up" (especially what made the bare server painful — that's the point of
      this lab). *(write-up "What tripped me up".)*
- [x] "Checkpoint evidence": both programs merged to `main` by PR, the CLI's memory behavior on the
      full log file, and the bare server's three endpoints responding. *(write-up "Checkpoint
      evidence" — the CLI memory numbers and the three `curl` responses; the merged-PR link is the
      unresolved worked-example `pull/3`, noted above.)*
- [x] Close out "What I'd do differently". *(write-up "What I'd do differently".)*
