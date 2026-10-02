# M05 — Express: Routing, Middleware & Error Handling

**Week 2 · Days 3-5 · 12 hours**

## Builds on

[m04-typescript-on-node](../m04-typescript-on-node/write-up-template.md) — this is where the Task
domain types you modeled there become an actual API. This is also where the **Task API** starts: it
carries forward through M07, M08 and M09 as v1 → v2 → v3 → v4.

## Objective

Build a well-structured REST API with Express 5 in TypeScript, with a consistent error model.

## Scope

- **HTTP and REST refresher:** methods, status codes (200, 201, 204, 400, 401, 403, 404, 409, 422,
  500), headers, JSON, idempotency, resource naming, `/api/v1` versioning, pagination conventions.
- **Setup in TypeScript:** `@types/express`; an `app.ts` that builds and exports the app, separate
  from a `server.ts` that calls `listen` (this separation is what makes M09's testing trivial);
  `express.json()`; typing handlers with `Request<Params, ResBody, ReqBody, Query>`.
- **Routing:** `app.get/post/put/patch/delete`, `express.Router()`, route params and query strings,
  route modules, separating handlers from routes, `res.status().json()`, `res.sendStatus`.
- **Express 5 changes to learn explicitly:** rejected promises in async handlers are forwarded to
  the error handler automatically; new path syntax (`/*splat`, optional segments with `{}`);
  `req.body` is `undefined` when no body parser ran; `req.query` is a read-only getter; removed
  deprecated signatures. Read the official migration guide for this one.
- **Middleware:** the request pipeline, why order matters, `next()` vs `next(err)`; app-, router-,
  and route-level middleware; built-ins (`express.json`, `express.urlencoded`, `express.static`);
  third-party (`cors`, `helmet`, `morgan` or `pino-http`); custom (request ID, timing, a simple
  API-key auth, a 404 handler).
- **Error handling:** operational vs programmer errors; the 4-argument error middleware; custom
  `AppError` classes (e.g. `BadRequestError`, `NotFoundError`, `ConflictError`); one central handler
  that returns a single consistent JSON error shape; no stack traces in production responses.
- **Operations:** config from environment variables, graceful shutdown (`SIGTERM`, `server.close`),
  a health endpoint, CORS basics; `express-rate-limit` as a stretch goal if time allows.
- **Bruno:** collections, environments, assertions; commit the `bruno/` folder.

## Stack constraints

- Express 5.x, TypeScript 7 (strict), the pinned Node version from M04.
- `app.ts` never calls `listen`. `server.ts` is the only file that does, and it shuts down gracefully
  on `SIGTERM`.

## Resolved: the Task API contract

These were open design questions; they're now fixed for the whole program so that M07-M09 build on
a stable contract instead of each trainee improvising a different one.

**Error envelope.** Every error response, from every endpoint, uses this shape — you still build the
`AppError` hierarchy and the central handler yourself, this is the wire format they must produce, not
the implementation:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "path": "title", "message": "Required" }],
    "requestId": "<from your request-ID middleware>"
  }
}
```

`details` appears only on validation errors (it stays empty/absent elsewhere). `code` is a stable,
machine-readable string per error type (`NOT_FOUND`, `CONFLICT`, `VALIDATION_ERROR`, etc.) — you
choose the exact set of codes you need.

**Task fields and API scope.** `tasks` is the only resource exposed through the API in v1-v4:
`id`, `title`, `description` (optional), `status` (one of `"todo" | "in_progress" | "done"`). `users`
and `tags`/`task_tags` exist in the relational schema you design in M06 (so you get real practice
with 1:N and M:N relationships) but are **not** given their own `/api/v1/users` or `/api/v1/tags`
routes in this program — they're schema-only until Prisma lands in M07, where tags can be read and
written as a nested field on the task endpoints rather than as separate top-level routes. Treat
exposing them as full resources as an optional stretch goal, not a requirement.

## Deliverable: Task API v1

In-memory store. `GET/POST /api/v1/tasks`, `GET/PATCH/DELETE /api/v1/tasks/:id`. Request-ID and
logging middleware, a central error handler producing the envelope above, and **hand-written
validation** — deliberately, so M08's Zod payoff actually lands. A Bruno collection with assertions,
committed.

## Definition of done

- [ ] v1 merged by pull request.
- [ ] Every error path returns the exact envelope shape above.
- [ ] The Bruno collection passes.
- [ ] You can explain why Express 5 no longer needs a try/catch wrapper around async handlers.

This is the **Week 2 Friday gate.**
