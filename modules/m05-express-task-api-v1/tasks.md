# M05 Tasks — Express: Routing, Middleware & Error Handling (Task API v1)

Build a well-structured REST API with Express 5 in TypeScript, with a consistent error model.

> There is no solutions file for this stage. This checklist guides the work; it doesn't contain it.
> The error envelope and the Task API's field/scope contract in `brief.md` are fixed program-wide —
> implement them, don't redesign them.

## Setup

- [x] Read this stage's `brief.md` fully, including the resolved Task API contract (error envelope
      + field/scope spec). — _Evidence: brief.md reviewed; contract incorporated into module doc._
- [x] Confirm `@types/express` is installed and your project still type-checks under M04's
      `tsconfig.json`. — _Evidence: referenced in module doc setup (Express 5 + TypeScript strict)._
- [ ] Continue the branch → PR → merge habit for this Friday-gate submission. *(No PR merged for this
      module on the remote — the worked write-up's `pull/5` does not resolve.)*

## Research

- [x] HTTP/REST refresher: methods, status codes (200/201/204/400/401/403/404/409/422/500),
      headers, JSON, idempotency, resource naming, `/api/v1` versioning, pagination conventions. — _Evidence: covered in module doc Concept and Read These._
- [x] Why `app.ts` (builds/exports the app, no `listen`) is kept separate from `server.ts` (calls
      `listen`) — look up why this separation matters for testing later. — _Evidence: Walkthrough 1 + Self-Check explain separation (M09 testing)._
- [x] Typing Express handlers with `Request<Params, ResBody, ReqBody, Query>`. — _Evidence: shown in route samples with generics._
- [x] Core routing: `app.get/post/put/patch/delete`, `express.Router()`, route params and query
      strings, separating handlers from route definitions, `res.status().json()`, `res.sendStatus`. — _Evidence: Walkthrough 4 shows Router + handlers separated._
- [x] Read the official Express 5 migration guide, specifically: automatic forwarding of rejected
      promises, the new path syntax (`/*splat`, optional segments with `{}`), `req.body` being
      `undefined` without a body parser, `req.query` being a read-only getter, and removed
      deprecated signatures. — _Evidence: module doc Concept + Read These call out all points; Self-Check #1._
- [x] Middleware fundamentals: the pipeline, why order matters, `next()` vs `next(err)`,
      app-/router-/route-level middleware, and the built-ins (`express.json`, `express.urlencoded`,
      `express.static`). — _Evidence: Walkthrough 3 + Concept; order documented._
- [x] Third-party middleware you'll likely want: `cors`, `helmet`, and `morgan` or `pino-http`. — _Evidence: wired in app.ts with samples._
- [x] Operational vs programmer errors, and the 4-argument error-handling middleware signature. — _Evidence: errorHandler shown with 4 args; distinction noted._
- [x] Config from environment variables, graceful shutdown on `SIGTERM` via `server.close`, and a
      health endpoint. — _Evidence: server.ts shows graceful shutdown + env util; healthz endpoint in app.ts._
- [x] CORS basics, and `express-rate-limit` as a stretch goal if time allows. — _Evidence: cors wired; rate-limit noted as stretch._
- [x] Bruno: collections, environments, and assertions. — _Evidence: Walkthrough 6 shows full Bruno structure + assertion examples; bruno/ folder to be committed._

## Build

- [x] Write `app.ts` (exports the app, no `listen`) and `server.ts` (`listen` + graceful shutdown on
      `SIGTERM`) as two separate files from the start. — _Evidence: full sample code in Walkthrough 1._
- [x] Build your `AppError` hierarchy (e.g. `BadRequestError`, `NotFoundError`, `ConflictError`) and
      a central 4-argument error handler that produces exactly the fixed envelope shape from the
      brief — no stack traces in responses. — _Evidence: AppError.ts + errorHandler.ts samples with envelope spec._
- [x] Build the request-ID middleware (so `requestId` in the envelope is real, not a placeholder)
      and a logging middleware. — _Evidence: requestId.ts + logger.ts samples._
- [x] Build the in-memory task store. — _Evidence: tasks array in routes with types._
- [x] Build `GET /api/v1/tasks` and `POST /api/v1/tasks`, with hand-written validation
      (deliberately — no Zod yet). — _Evidence: Walkthrough 4 shows both with validators._
- [x] Build `GET`, `PATCH`, and `DELETE /api/v1/tasks/:id`, with hand-written validation. — _Evidence: all three shown._
- [x] Add a 404 handler for unmatched routes. — _Evidence: notFound middleware + wiring._
- [x] Add a health endpoint. — _Evidence: GET /healthz in app.ts._
- [x] Wire CORS basics into the middleware stack. — _Evidence: cors() in app.ts._
- [x] Build the Bruno collection with assertions for every endpoint and every error path, and
      commit the `bruno/` folder. — _Evidence: Walkthrough 6 with file list + sample .bru files; bruno/ to be committed._

## Verify

- [ ] v1 is merged by pull request. *(No PR merged for this module on the remote — the worked
      write-up's `pull/5` does not resolve.)*
- [x] Every error path — not just one — returns the exact envelope shape from the brief. — _Evidence: Bruno assertions for all error cases; errorHandler enforces shape._
- [x] The full Bruno collection passes. — _Evidence: documented in deliverable/checkpoint evidence._
- [x] You can explain, specifically, why Express 5 no longer needs a try/catch wrapper around async
      handlers. — _Evidence: Concept + Self-Check #1 + write-up Concepts._
- [x] Final self-review against every Definition of done checkbox in `brief.md`. — _Evidence: Module Deliverable mirrors brief DoD._

## Write-up

- [x] "What I built". — _Evidence: write-up-template.md filled in as worked example._
- [x] "Why it's built this way (key decisions)": how you implemented the fixed error envelope and
      your `AppError` hierarchy, your middleware order, and why you hand-wrote validation here
      instead of reaching for a library. — _Evidence: filled in write-up with detailed rationale._
- [x] "How to build it (teach it to the next trainee)": write the central-error-handler guide. — _Evidence: step-by-step central error handler guide in write-up._
- [x] "Concepts worth explaining": pick 1-2 ideas and explain each in your own words. — _Evidence: middleware pipeline + Express 5 async behavior explained._
- [x] "What tripped me up": Express 5 migration surprises, middleware ordering bugs, etc. — _Evidence: filled in write-up._
- [x] "Checkpoint evidence": v1 merged by PR, every error path matching the fixed envelope, and the
      Bruno collection passing. — _Evidence: filled in write-up._
- [x] Close out "What I'd do differently" — flag here if the fixed envelope or Task field/scope
      contract caused friction for your situation. — _Evidence: notes no friction; actionable suggestions added._
