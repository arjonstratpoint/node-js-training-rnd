# M03 — Node.js Runtime & npm

**Week 1 · Days 4-5 · 6 hours**

## Builds on

[m02-modern-javascript-async-await](../m02-modern-javascript-async-await/write-up-template.md) —
the CLI lab here reuses the async patterns you just built.

## Objective

Explain what Node.js is and how it runs code, use core modules, and manage dependencies safely with
npm.

## Scope

- What Node is: V8 + libuv + core APIs; single-threaded event loop and thread pool; blocking vs
  non-blocking; when Node is (and isn't) a good fit.
- Modules: ESM vs CommonJS, `"type": "module"`, `import.meta.dirname` / `import.meta.filename`, the
  `node:` prefix.
- Core APIs: `node:fs/promises`, `node:path`, `node:os`, `node:events`, `node:stream` (why streams
  exist), `node:http` (a bare server, to feel why Express exists), `node:crypto` (`randomUUID`),
  `node:timers/promises`, `node:util` (`parseArgs`, `promisify`).
- `process`: `argv`, `env`, exit codes, signals (`SIGINT`, `SIGTERM`).
- Config and developer ergonomics: environment variables, `.env`, `node --env-file`, `node --watch`,
  `node --run`.
- Globals: `fetch`, `URL`, `AbortController`, `structuredClone`.
- npm: `package.json` anatomy, semver ranges (`^`, `~`), the lockfile, `install` vs `ci`, `update`,
  `outdated`, scripts, `npx`, dependencies vs devDependencies, `engines`, `npm audit`.
- Supply-chain hygiene: vet packages before installing, review lockfile diffs, understand lifecycle
  scripts.
- Debugging: `console` methods, `node --inspect` with the VS Code debugger, reading stack traces.
- Awareness only: the built-in `node:test` runner and `node:sqlite` exist — this course deliberately
  uses Jest and Prisma instead, so you don't need to use either.

## Stack constraints

- Still plain JavaScript — TypeScript starts in M04.
- No Express yet. The `node:http` server is meant to hurt a little; that's the point.

## Deliverable

**A `log-report` CLI that streams a large log file into a JSON report, and a bare `node:http`
server with three JSON endpoints — both merged to `main` by PR.**

## Lab

*Goal: feel why a framework like Express exists by building the things it will later remove pain
from.*

**You do.**

1. Get the synthetic log file from your trainer.
2. Build the `log-report` CLI: stream the file (don't load it fully into memory), aggregate
   counts, accept options via `parseArgs`, and write a JSON report.
3. Build the bare `node:http` server with three JSON endpoints, hand-rolling routing and body
   parsing.
4. Merge both programs to `main` by PR.

**You build and capture.** Both merged PRs, and your own explanation of what a framework like
Express would specifically remove pain from.

## Definition of done

- [ ] Both programs merged to `main` through a pull request.
- [ ] The CLI genuinely streams the file rather than loading it fully into memory first.
- [ ] You can explain, from the bare `node:http` server you just wrote, what specifically a
      framework like Express would remove pain from.

## Resolved decisions

- **Input file: a synthetic log file, roughly 100 MB, newline-delimited, one record per line**
  (e.g. an access-log-style line with a timestamp, a status code, and a path). That size is large
  enough that loading it fully into memory is noticeably wasteful, which is the point of the
  exercise. Your trainer provides a generator script or download link at the start of the session —
  generating the practice data isn't part of the lab itself.

This is the **Week 1 Friday gate.**
