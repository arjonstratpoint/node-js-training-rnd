# M03 Tasks — Node.js Runtime & npm

Explain what Node.js is and how it runs code, use core modules, and manage dependencies safely
with npm.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.

## Setup

- [ ] Read this stage's `brief.md` fully; skim your m02 write-up (you'll reuse those async
      patterns).
- [ ] Get the synthetic ~100MB log file from your trainer (generator script or download link)
      before starting the CLI lab.
- [ ] Continue the branch → PR → peer review → merge habit for this module's Friday-gate
      submission.

## Research (do before or alongside the build, not after)

- [ ] What Node is: V8 + libuv + core APIs, the single-threaded event loop and thread pool,
      blocking vs non-blocking, when Node is (and isn't) a good fit.
- [ ] Modules: ESM vs CommonJS, `"type": "module"`, `import.meta.dirname`/`import.meta.filename`,
      the `node:` prefix.
- [ ] Core APIs you'll need: `node:fs/promises`, `node:path`, `node:os`, `node:events`,
      `node:stream` (why streams exist), `node:crypto` (`randomUUID`), `node:timers/promises`,
      `node:util` (`parseArgs`, `promisify`).
- [ ] `node:http` basics — enough to write a bare server with manual routing and body parsing.
- [ ] `process`: `argv`, `env`, exit codes, and the `SIGINT`/`SIGTERM` signals.
- [ ] Config and ergonomics: environment variables, `.env`, `node --env-file`, `node --watch`,
      `node --run`.
- [ ] Globals: `fetch`, `URL`, `AbortController`, `structuredClone`.
- [ ] npm: `package.json` anatomy, semver ranges (`^`/`~`), the lockfile, `install` vs `ci`,
      `update`, `outdated`, scripts, `npx`, dependencies vs devDependencies, `engines`, `npm audit`.
- [ ] Supply-chain hygiene: how to vet a package before installing, review lockfile diffs, and
      understand lifecycle scripts.
- [ ] Debugging: `console` methods, `node --inspect` with the VS Code debugger, reading stack
      traces.
- [ ] Note (awareness only): `node:test` and `node:sqlite` exist — this course uses Jest and Prisma
      instead, so you don't need to use either.

## Build

- [ ] Build the `log-report` CLI: stream the log file (don't load it fully into memory), aggregate
      counts, accept options via `parseArgs`.
- [ ] Have the CLI write its aggregated counts out as a JSON report.
- [ ] Build the bare `node:http` server with three JSON endpoints, writing the routing and body
      parsing by hand (no framework).

## Verify

- [ ] Both programs merged to `main` through a pull request.
- [ ] The CLI genuinely streams the file — check its memory behavior on the full ~100MB file, not
      just correctness on a tiny sample.
- [ ] You can explain, specifically, what a framework like Express would remove pain from, based on
      what hurt while writing the bare `node:http` server.
- [ ] Final self-review against every Definition of done checkbox in `brief.md`.

## Write-up

- [ ] "What I built": the CLI and the bare server, as you finish each.
- [ ] "Decisions and why": how you structured the streaming parse, and how you hand-rolled the
      routing/body parsing.
- [ ] "Problems I hit and how I solved them".
- [ ] Close out "What I'd tell the next trainee" (especially what made the bare server painful) and
      "Open questions for my trainer".
