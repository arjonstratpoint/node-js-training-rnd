# M05 — Express: Routing, Middleware & Error Handling (Task API v1)

**Week 2 · Days 3-5 · 12 hours**

## Builds on

[m04-typescript-on-node](../m04-typescript-on-node/write-up-template.md) — this is where the Task domain types you modeled there become an actual API. This is also where the **Task API** starts: it carries forward through M07, M08 and M09 as v1 → v2 → v3 → v4.

## Learning Goals

By the end of this module, you should be able to:

- [ ] Explain RESTful routing, resource naming, `/api/v1` versioning, and common HTTP status codes.
- [ ] Explain why `app.ts` (builds/exports the app, no `listen`) is separate from `server.ts` (listens + graceful shutdown on `SIGTERM`).
- [ ] Describe Express 5 changes: automatic forwarding of rejected promises in async handlers, `/*splat`, optional segments `{}`, `req.body` undefined without body parser, `req.query` read-only getter, removed deprecated signatures.
- [ ] Implement the request pipeline with middleware (app/router/route-level), correct order, `next()` vs `next(err)`.
- [ ] Build an `AppError` hierarchy and a central 4-argument error handler that produces the fixed error envelope.
- [ ] Implement an in-memory Task API v1 (`/api/v1/tasks`) with hand-written validation.
- [ ] Add a health endpoint, CORS basics, request-ID and logging middleware.
- [ ] Create a committed Bruno collection covering endpoints and all error paths with assertions.

## Concept

- **REST & HTTP:** Methods (GET/POST/PUT/PATCH/DELETE), status codes (200,201,204,400,401,403,404,409,422,500), headers, JSON, idempotency, resource naming, `/api/v1` versioning, pagination conventions.
- **Express app bootstrap:** `app.ts` builds and exports the Express app (no `listen`). `server.ts` imports the app and calls `listen`; it must shut down gracefully on `SIGTERM` via `server.close()` (and clean up resources). This separation makes integration testing trivial (M09).
- **Routing:** `app.get/post/put/patch/delete`, `express.Router()`, route params/query strings, handlers separate from routes, `res.status().json()`, `res.sendStatus`.
- **Express 5:** Rejected promises in async handlers are forwarded to the error handler automatically (no try/catch needed). New path syntax (`/*splat`, optional segments `{}`). `req.body` is `undefined` when no body parser ran. `req.query` is a read-only getter. Removed deprecated signatures.
- **Middleware:** Pipeline order matters. `next()` passes to next middleware/route; `next(err)` skips to the 4-argument error handler. Can be app-, router-, or route-level. Built-ins: `express.json()`, `express.urlencoded()`, `express.static()`. Third-party/common: `cors`, `helmet`, `morgan` or `pino-http`. Custom: request ID, timing, simple API-key auth (optional), 404 handler.
- **Error handling:** Distinguish operational vs programmer errors. Central 4-argument error middleware `(err, req, res, next) => { ... }` produces a single consistent envelope. Custom `AppError` classes (e.g. `BadRequestError`, `NotFoundError`, `ConflictError`) carry `code`, `status`, `message`, `details`. No stack traces in production responses.
- **Operations:** Config from environment variables, graceful shutdown on `SIGTERM`, health endpoint, CORS basics. `express-rate-limit` as stretch goal.
- **Tooling (Bruno):** Collections, environments, assertions to verify endpoint behavior and error paths.

**Fixed error envelope (program-wide):**

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

Notes: `details` appears only on validation errors (absent/empty elsewhere). `code` is stable per error type. This is the wire format — you still build `AppError` hierarchy and central handler.

**Task API v1 scope (fixed):**

- Resource: `tasks` only via `/api/v1/tasks`.
- Fields: `id`, `title`, `description` (optional), `status` (`"todo" | "in_progress" | "done"`).
- Users/tags/schema-only for now (exposed as nested on tasks later in M07; not required as top-level routes in this program).

## Read These

- [Express 5 Migration Guide](https://expressjs.com/en/guide/migrating-5.html) — focus: automatic promise rejection forwarding, path syntax (`/*splat`, `{}`), `req.body` undefined without parser, `req.query` read-only, removed deprecated signatures.
- [Express Routing](https://expressjs.com/en/guide/routing.html) — Router, params, query, route methods.
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html) — pipeline, order, `next()` vs `next(err)`, app/router/route levels.
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html) — 4-argument error middleware, async errors in Express 5.
- [TypeScript + Express](https://expressjs.com/en/5x/api.html) — handler typing with `Request<Params, ResBody, ReqBody, Query>` (see Request generics).
- [CORS](https://github.com/expressjs/cors), [Helmet](https://github.com/helmetjs/helmet), [morgan](https://github.com/expressjs/morgan), [pino-http](https://github.com/pinojs/pino-http).
- [Bruno Docs](https://docs.usebruno.com/) — collections, environments, assertions.

## Walkthrough(s)

### Walkthrough 1: Project structure & bootstrap (app.ts vs server.ts)

Create the module's instructional source layout. In the walkthrough we show creating files under `src/` — the learner can copy/paste these exact commands.

```bash
mkdir -p src/routes src/middlewares src/errors src/utils src/types
touch src/app.ts src/server.ts src/routes/tasks.routes.ts src/middlewares/requestId.ts src/middlewares/logger.ts src/middlewares/errorHandler.ts src/middlewares/notFound.ts src/middlewares/cors.ts src/errors/AppError.ts src/utils/env.ts
```

**src/utils/env.ts (sample):**
```ts
export function getPort(defaultPort = 3000): number {
  const v = process.env.PORT;
  const n = v ? parseInt(v, 10) : defaultPort;
  return Number.isNaN(n) ? defaultPort : n;
}
```

**src/app.ts (builds and exports app, no listen):**
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'express';
import tasksRouter from './routes/tasks.routes';
import { requestId } from './middlewares/requestId';
import { logger } from './middlewares/logger';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware order matters
app.use(helmet());
app.use(cors());
app.use(json());
app.use(requestId);
app.use(logger);

// Routes
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/tasks', tasksRouter);

// 404 then error handler
app.use(notFound);
app.use(errorHandler);

export default app;
```

**src/server.ts (listens + graceful shutdown on SIGTERM):**
```ts
import app from './app';
import { getPort } from './utils/env';

const port = getPort();
const server = app.listen(port, () => {
  console.log(`Task API v1 listening on :${port}`);
});

function gracefulShutdown(signal: NodeJS.Signals) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force exit after timeout if still closing
  setTimeout(() => {
    console.log('Forceful shutdown');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { server };
```

Notes: `app.ts` never calls `listen`. `server.ts` is the only file that does. This separation is what makes M09 testing trivial.

### Walkthrough 2: Error model (fixed envelope)

**src/errors/AppError.ts:**
```ts
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR';

export interface ValidationDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: ValidationDetail[];

  constructor(code: ErrorCode, status: number, message: string, details?: ValidationDetail[]) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super('BAD_REQUEST', 400, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request validation failed', details: ValidationDetail[] = []) {
    super('VALIDATION_ERROR', 422, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', 404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super('CONFLICT', 409, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', 403, message);
  }
}
```

**src/middlewares/requestId.ts:**
```ts
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.requestId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}
```

**src/middlewares/errorHandler.ts (central 4-arg handler, no stack traces in prod):**
```ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    const body: any = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    };
    // details only for validation errors
    if (err.code === 'VALIDATION_ERROR' && err.details && err.details.length > 0) {
      body.error.details = err.details;
    }
    return res.status(err.status).json(body);
  }

  // Programmer/unknown errors
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProd ? 'Internal server error' : (err as any)?.message || 'Internal server error',
      requestId,
    },
  });
}
```

Key points:
- Every error path returns this envelope. `details` appears only on validation errors.
- No stack traces in production responses.
- `requestId` comes from request-ID middleware.

### Walkthrough 3: Middleware stack details

**src/middlewares/logger.ts (simple instructional logger):**
```ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  // Hook into finish to log; keep simple for instructional purposes
  _res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${_res.statusCode} ${ms}ms reqId=${req.requestId}`);
  });
  next();
}
```

**src/middlewares/cors.ts (basics, optional wrapper):**
```ts
import cors from 'cors';
export const corsMiddleware = cors();
```

**src/middlewares/notFound.ts:**
```ts
import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/AppError';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError('Route not found'));
}
```

Order: helmet/cors/json first → requestId → logger → routes → notFound → errorHandler (last). Remember: `next(err)` goes directly to error handler.

### Walkthrough 4: In-memory store + routes (hand-written validation)

**src/types/task.ts:**
```ts
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
```

**src/routes/tasks.routes.ts (handlers + routes, separated):**
```ts
import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { Task, CreateTaskBody, UpdateTaskBody, TaskStatus } from '../types/task';
import { BadRequestError, NotFoundError, ValidationError } from '../errors/AppError';

const router = Router();

// In-memory store
const tasks: Task[] = [];

function isTaskStatus(s: unknown): s is TaskStatus {
  return s === 'todo' || s === 'in_progress' || s === 'done';
}

// Hand-written validation
function validateCreate(body: any): asserts body is CreateTaskBody {
  const errors: Array<{ path: string; message: string }> = [];
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be an object');
  }
  if (!('title' in body) || typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push({ path: 'title', message: 'Required and must be non-empty string' });
  }
  if ('description' in body && body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ path: 'description', message: 'Must be a string if provided' });
  }
  if ('status' in body && body.status !== undefined && !isTaskStatus(body.status)) {
    errors.push({ path: 'status', message: 'Must be one of todo|in_progress|done' });
  }
  if (errors.length > 0) {
    throw new ValidationError('Request validation failed', errors);
  }
}

function validateUpdate(body: any): asserts body is UpdateTaskBody {
  const errors: Array<{ path: string; message: string }> = [];
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be an object');
  }
  if ('title' in body && body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push({ path: 'title', message: 'Must be non-empty string if provided' });
    }
  }
  if ('description' in body && body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ path: 'description', message: 'Must be a string if provided' });
  }
  if ('status' in body && body.status !== undefined && !isTaskStatus(body.status)) {
    errors.push({ path: 'status', message: 'Must be one of todo|in_progress|done' });
  }
  if (errors.length > 0) {
    throw new ValidationError('Request validation failed', errors);
  }
}

// GET /api/v1/tasks
router.get('/', (_req: Request, res: Response) => {
  res.json({ data: tasks });
});

// POST /api/v1/tasks
router.post('/', (req: Request<{}, {}, any>, res: Response, next: NextFunction) => {
  try {
    validateCreate(req.body);
    const { title, description, status = 'todo' } = req.body;
    const task: Task = {
      id: randomUUID(),
      title,
      description,
      status,
    };
    tasks.push(task);
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks/:id
router.get('/:id', (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) return next(new BadRequestError('id is required'));
  const task = tasks.find((t) => t.id === id);
  if (!task) return next(new NotFoundError('Task not found'));
  res.json({ data: task });
});

// PATCH /api/v1/tasks/:id
router.patch('/:id', (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('id is required');
    validateUpdate(req.body);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundError('Task not found');
    tasks[idx] = { ...tasks[idx], ...req.body };
    res.json({ data: tasks[idx] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) return next(new BadRequestError('id is required'));
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return next(new NotFoundError('Task not found'));
  tasks.splice(idx, 1);
  res.sendStatus(204);
});

export default router;
```

Notes: Hand-written validation is deliberate (M08 is Zod payoff). Express 5 auto-forwards rejected promises in async handlers; we also use try/catch with `next(err)` where convenient. The store is in-memory as required.

### Walkthrough 5: Health endpoint & ops

- Health: `GET /healthz` returns `{ status: 'ok' }` (added in app.ts above).
- Config: use env vars (PORT). Graceful shutdown on `SIGTERM`/`SIGINT` (server.ts). 
- CORS basics: `app.use(cors())`. 
- `express-rate-limit` (stretch): can be added as router/app middleware if time allows (e.g. apply to write endpoints). Not required.

### Walkthrough 6: Bruno collection

Create a committed Bruno collection covering every endpoint and every error path with assertions.

```bash
mkdir -p bruno/environments
touch bruno/collection.bru bruno/environments/local.bru \
  bruno/tasks-list.bru bruno/tasks-create.bru bruno/tasks-get.bru bruno/tasks-patch.bru bruno/tasks-delete.bru \
  bruno/tasks-create-invalid.bru bruno/tasks-get-notfound.bru bruno/tasks-patch-notfound.bru bruno/tasks-patch-invalid.bru bruno/tasks-delete-notfound.bru bruno/health.bru
```

**bruno/collection.bru (sample):**
```plaintext
vars:pre-request {
  baseUrl: http://localhost:3000
}
```

**bruno/environments/local.bru:**
```plaintext
vars {
  baseUrl: http://localhost:3000
}
```

**bruno/health.bru:**
```plaintext
get {
  url: {{baseUrl}}/healthz
}
tests {
  test("status 200", function() { expect(res.status).to.equal(200); });
  test("ok", function() { expect(res.body.status).to.equal('ok'); });
}
```

**bruno/tasks-list.bru:**
```plaintext
get {
  url: {{baseUrl}}/api/v1/tasks
}
tests {
  test("status 200", function() { expect(res.status).to.equal(200); });
  test("has data array", function() { expect(res.body.data).to.be.an('array'); });
}
```

**bruno/tasks-create.bru:**
```plaintext
post {
  url: {{baseUrl}}/api/v1/tasks
  body: json
  json: {
    "title": "Buy milk",
    "status": "todo"
  }
}
tests {
  test("status 201", function() { expect(res.status).to.equal(201); });
  test("returns task with id", function() { expect(res.body.data).to.have.property('id'); });
  test("envelope not used on success", function() { expect(res.body).to.not.have.property('error'); });
}
```

**bruno/tasks-create-invalid.bru (validation error -> envelope):**
```plaintext
post {
  url: {{baseUrl}}/api/v1/tasks
  body: json
  json: { "title": "" }
}
tests {
  test("status 422", function() { expect(res.status).to.equal(422); });
  test("envelope shape", function() {
    expect(res.body).to.have.property('error');
    expect(res.body.error).to.have.property('code', 'VALIDATION_ERROR');
    expect(res.body.error).to.have.property('message');
    expect(res.body.error).to.have.property('requestId');
    expect(res.body.error).to.have.property('details');
    expect(res.body.error.details).to.be.an('array');
  });
}
```

**bruno/tasks-get.bru, tasks-patch.bru, tasks-delete.bru** — cover success cases (200/200/204).  
**bruno/tasks-get-notfound.bru, tasks-patch-notfound.bru, tasks-delete-notfound.bru, tasks-patch-invalid.bru** — cover 404/422 with envelope assertions (code/message/requestId present; details present only for validation where applicable).

Commit the entire `bruno/` folder.

## "What This Walkthrough Showed You"

- Why `app.ts`/`server.ts` separation matters for testability (M09).
- Middleware order is critical: body parser before routes, 404 before error handler, error handler last.
- Express 5 auto-forwards rejected promises — async handlers don’t require try/catch wrappers (though `next(err)` is fine).
- Central error handler enforces one consistent envelope; `details` only for validation.
- Hand-written validation is explicit and teaches the “why” before Zod (M08).
- Bruno assertions verify both success and error paths (including envelope shape).

## Numbered EXERCISEs

1. **Add a new error type.** Create `ConflictError` (or `ForbiddenError`) in `AppError.ts` and throw it from a route; verify envelope shape and status.
2. **Observe middleware order.** Move `errorHandler` before `notFound` and explain what breaks; fix it.
3. **Test Express 5 behavior.** Write an async route that rejects without try/catch — confirm it reaches error handler automatically.
4. **Validation edge cases.** Add hand-written checks for `description` type and invalid `status`; assert `details` contains paths.
5. **Bruno coverage.** Add a request asserting 404 envelope for GET/PATCH/DELETE unknown id.

## Self-Check

1. Why does Express 5 not require try/catch around async handlers?  
2. What is the fixed error envelope shape and when do `details` appear?  
3. Why must `app.ts` not call `listen` and `server.ts` must?  
4. What is the correct middleware order (body parsers, requestId/logger, routes, 404, error handler)?  
5. Why hand-write validation here (knowing Zod comes in M08)?

## Module Deliverable

Task API v1 (in-memory) with:
- `app.ts` (exports app, no `listen`) and `server.ts` (listens + graceful shutdown on `SIGTERM`)
- `AppError` hierarchy + central 4-argument error handler producing the fixed envelope (no stack traces in prod)
- Request-ID and logging middleware
- Five `/api/v1/tasks` endpoints with hand-written validation
- Health endpoint, CORS basics, 404 handler
- Committed Bruno collection covering every endpoint and every error path with assertions

v1 merged by PR. Every error path matches the exact envelope.

## Appendix (Self-Check answers)

1. Express 5 automatically forwards rejected promises from async route handlers/middlewares to the error handler, so `next(err)` is not required.
2. `{"error":{"code":..., "message":..., "details":[{path,message},...],"requestId":"..."}}`; `details` appear only for validation errors (e.g. `VALIDATION_ERROR`).
3. Separation enables importing the built app in tests (no port binding) and isolates server lifecycle (listen/shutdown) from app wiring (M09). `server.ts` is the only file that calls `listen`.
4. Order: security/parsers (`helmet`, `cors`, `express.json()`), then requestId, logger, then routes, then `notFound`, then `errorHandler` (last).
5. To internalize validation, error envelope construction, and error handling flow before introducing a validation library (Zod in M08) — deliberate pedagogical choice.
