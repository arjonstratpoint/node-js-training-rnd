# M05 Write-Up — Express: Routing, Middleware & Error Handling (Task API v1)

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own. This write-up is also your own reference for M07-M09 — write it like you'll
> need it again, because you will.

## What I built

Task API v1 — an in-memory REST API at `/api/v1/tasks` with:

- `app.ts` (exports app, no `listen`) and `server.ts` (listens + graceful shutdown on `SIGTERM`).
- `AppError` hierarchy (`BadRequestError`, `ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`).
- Central 4-argument error handler producing the fixed error envelope with `requestId`; `details` only for validation errors; no stack traces in production.
- Request-ID middleware (accepts `x-request-id` or generates UUID) and logging middleware.
- Five endpoints (GET list, POST create, GET by id, PATCH by id, DELETE by id) with hand-written validation.
- Health endpoint (`GET /healthz`), CORS basics, 404 handler, helmet/json wired in correct order.
- Committed Bruno collection covering all endpoints and error paths with assertions.

Repo links (as appropriate): see M05 module doc and `bruno/` collection in this module.

## Why it's built this way (key decisions)

- **Fixed error envelope:** Implemented by central error handler that maps `AppError` instances to `{ error: { code, message, requestId, ...(details only if VALIDATION_ERROR) } }`. `AppError` carries `code`, `status`, `details` so envelope is consistent across all paths.
- **`AppError` hierarchy:** Separate classes per error type (400/401/403/404/409/422) keep status and stable codes explicit. `ValidationError` stores structured `details` (`path`, `message`) for field-level feedback.
- **Middleware order:** `helmet()`, `cors()`, `express.json()` → `requestId` → `logger` → routes → `notFound` → `errorHandler` (last). Swapping `notFound` after `errorHandler` would mean unmatched routes never reach the intended 404 path; putting parsers after routes means `req.body` unavailable. `next(err)` must reach 4-arg handler at end.
- **Hand-written validation:** Deliberate before Zod (M08). Writing validators forces understanding of envelope shape (`details`), error propagation, and where validation belongs. This makes the Zod payoff clearer later while keeping the contract fixed.

## How to build it (teach it to the next trainee)

**Central error handler (step-by-step):**

1. Create `AppError` base + subclasses with `code`, `status`, `details` (optional). Use `Object.setPrototypeOf` for proper `instanceof`.
2. Add request-ID middleware to attach `req.requestId` (from header or UUID) and set `X-Request-ID` response header.
3. Implement 4-argument error middleware: `function errorHandler(err, req, res, _next)`. 
4. If `err instanceof AppError`: build `{ error: { code, message, requestId } }`; if `code === 'VALIDATION_ERROR'` and `details.length>0`, attach `details`. Return `res.status(err.status).json(body)`.
5. Else: unknown error → 500; in production return generic message, in dev include message (no stack traces in production responses).
6. Register `notFound` (calls `next(new NotFoundError(...))`) before error handler; register `errorHandler` last in middleware stack.
7. Throw `ValidationError` with structured `details` from hand-written validators; other errors from route logic.
8. Verify every error path produces the exact envelope shape (Bruno assertions).

Example (envelope for validation): `{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","details":[{"path":"title","message":"Required and must be non-empty string"}],"requestId":"..."}}`.

## Concepts worth explaining

- **Middleware pipeline & order:** Each middleware can pass control (`next()`) or error (`next(err)`). Order determines what runs before/after routes and ensures 404 hits before generic error handling. Body parsers must run before handlers read `req.body`.
- **Express 5 async behavior:** Rejected promises in async handlers are forwarded to the error handler automatically — no try/catch wrapper required around async route handlers. (We still use try/catch with `next(err)` where explicit control is useful.)

## What tripped me up

- Express 5 migration nuances: remembering `req.query` is read-only and path syntax changes (`/*splat`, `{}`) while structuring routes.
- Middleware ordering: placing `notFound` or `errorHandler` in wrong order causes wrong status codes or envelope not produced.
- Keeping envelope strictly to spec: ensuring `details` only appear for validation errors and never leak stack traces in production.

## Checkpoint evidence

- v1 merged by PR (per brief deliverable).
- Every error path returns the exact envelope shape from the brief (verified via Bruno collection assertions).
- Bruno collection passes covering all endpoints and all error paths; collection committed in `bruno/`.

## What I'd do differently

If starting over: add Bruno environment/config earlier, keep validators tiny and test error paths as I build (rather than batching at end), and document envelope examples alongside each error type to avoid drift. The fixed envelope/contract was clear and not a source of friction.
