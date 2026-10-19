# M08 — Zod Validation & Type Inference (Task API v3)

**Week 3 · Days 4-5 · 6 hours**

## Builds on

[m07-prisma-orm-migrations](../m07-prisma-orm-migrations/write-up-template.md) — you're replacing the hand-written validation that M05 deliberately left in place.

## Learning Goals

By the end of this module, you should be able to:

- [ ] Explain why runtime validation matters: TypeScript types vanish at runtime, and `req.body` is untrusted data.
- [ ] Use Zod 4 basics: primitives, string formats (`z.email()`, `z.uuid()`, `z.url()`), `z.object`/`z.strictObject`, arrays, enums/literals, unions/discriminated unions, optional/nullable/default, and `z.coerce.number()` for query strings and params.
- [ ] Choose correctly between `parse` vs `safeParse`, and format errors with `z.flattenError`, `z.treeifyError`, and `z.prettifyError` while adding custom messages via the `error` parameter.
- [ ] Apply refinements and transforms: `.refine`, cross-field rules, `.transform`, pipes, trimming and normalising input.
- [ ] Derive TypeScript types from schemas with `z.infer`, `z.input`, and `z.output`, and derive create/update/query schemas with `.pick`, `.omit`, `.partial`, and `.extend` to avoid repetition.
- [ ] Build a typed `validate({ body, params, query })` middleware that works around `req.query` being read-only in Express 5.
- [ ] Map a `ZodError` into the fixed M05 error envelope's `details` array so that invalid input produces 400 responses with field-level details.
- [ ] Validate `process.env` once at startup in `config.ts` and fail fast.
- [ ] Prove that handler input types come from `z.infer` and that no manual `if (!body.title)` checks remain in the codebase.
- [ ] Ensure invalid input never reaches Prisma — a Zod schema rejects it first, every time.

## Concept

- **Runtime validation is non-negotiable.** TypeScript gives compile-time guarantees, but after transpilation those types disappear. HTTP request bodies, query strings, and route params come from untrusted clients — they must be validated at runtime before reaching business logic or database.
- **Schemas as a single source of truth.** With Zod, define a schema once and derive types from it (`z.infer<typeof schema>`). This keeps request contract and TypeScript types in sync and avoids drift.
- **Request contract vs. persistence contract.** Zod is the **request contract** (what the API accepts). Prisma types are the **persistence contract** (what the database expects). These are related but not identical. Never pass raw `req.body` to Prisma.
- **Parsing strategies.** `schema.parse(data)` throws on failure (bubbles to central error handler). `schema.safeParse(data)` returns `{ success, data, error }`. For HTTP middleware, `parse` pairs cleanly with central error handling.
- **Express 5 constraints.** In Express 5, `req.query` is a read-only getter. Store parsed values elsewhere (e.g. `res.locals.valid`) rather than mutating `req.query`.
- **Fail fast on configuration.** Validate `process.env` once in `config.ts` with Zod and exit immediately if invalid.
- **Zod errors map to your error envelope.** Transform `ZodError` issues into `{ path, message }` in the central error handler to match M05's fixed envelope with `details`.

## Read These

- [Zod 4 Documentation](https://zod.dev)
- [M05 — Error model (fixed envelope)](../m05-express-task-api-v1/module-5-express-task-api-v1.md)
- [M07 — Prisma ORM & Migrations](../m07-prisma-orm-migrations/module-7-prisma-orm-migrations.md)
- [M08 Brief](./brief.md)

## Walkthrough(s)

### Walkthrough 1: Install Zod 4

Run from the project root:

```bash
npm i zod@4
```

**What this walkthrough showed you:** Zod 4 is installed as a dependency (verify in `package.json` under `dependencies`).

### Walkthrough 2: Design Zod schemas for Task API v3

Create schemas in a dedicated folder.

```bash
mkdir -p schemas
```

```bash
cat > schemas/tasks.schema.ts << 'EOF'
import { z } from "zod";

export const TaskStatusEnum = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskIdParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});
export type TaskIdParams = z.infer<typeof TaskIdParamsSchema>;

export const CreateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "title is required").max(255),
    description: z.string().trim().max(1000).optional().nullable(),
    status: TaskStatusEnum.optional().default("todo"),
  })
  .strict();
export type CreateTaskBody = z.infer<typeof CreateTaskBodySchema>;

export const UpdateTaskBodySchema = CreateTaskBodySchema.partial().strict();
export type UpdateTaskBody = z.infer<typeof UpdateTaskBodySchema>;

export const ListTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: TaskStatusEnum.optional(),
  q: z.string().trim().optional(),
});
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;
EOF
```

**What this walkthrough showed you:** Schemas live in `schemas/`, types derived with `z.infer`, use `.strict()`, `.trim()`, `.coerce.number()`, `.partial()` to avoid duplication, and enums for explicit contracts.

### Walkthrough 3: Typed `validate` middleware (work around req.query read-only in Express 5)

```bash
mkdir -p src/middleware
```

```bash
cat > src/middleware/validate.ts << 'EOF'
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export interface ValidatedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body: TBody;
  query: TQuery;
  params: TParams;
}

type ValidateOptions = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

export function validate(options: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = options.body ? options.body.parse(req.body) : req.body;
      const parsedQuery = options.query ? options.query.parse(req.query) : req.query;
      const parsedParams = options.params ? options.params.parse(req.params) : req.params;

      res.locals.valid = {
        body: parsedBody,
        query: parsedQuery,
        params: parsedParams,
      } as ValidatedRequest;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
        return;
      }
      next(err);
    }
  };
}
EOF
```

```bash
mkdir -p src/types
cat > src/types/express.d.ts << 'EOF'
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface ResponseLocals {
    valid?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}
EOF
```

**What this walkthrough showed you:** Parse body/params/query with Zod and store results on `res.locals.valid` (not `req.query`) to avoid mutating the read-only getter in Express 5; forward `ZodError` to central error handler.

### Walkthrough 4: Wire validation into routes (remove hand-written checks)

```bash
mkdir -p src/routes
cat > src/routes/tasks.routes.ts << 'EOF'
import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import {
  CreateTaskBodySchema,
  UpdateTaskBodySchema,
  ListTasksQuerySchema,
  TaskIdParamsSchema,
} from "../../schemas/tasks.schema";

const router = Router();

router.get(
  "/",
  validate({ query: ListTasksQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = res.locals.valid!;
      res.json({ data: [], meta: { page: query.page, limit: query.limit } });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/",
  validate({ body: CreateTaskBodySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = res.locals.valid!;
      res.status(201).json({ data: body });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/:id",
  validate({ params: TaskIdParamsSchema, body: UpdateTaskBodySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = res.locals.valid!;
      res.json({ data: { id: params.id, ...body } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
EOF
```

**What this walkthrough showed you:** Apply `validate` per route with the appropriate schemas; consume parsed values from `res.locals.valid`. Never pass raw `req.body`/`req.query`/`req.params` to business logic or Prisma. Remove all manual `if (!body.title)`-style checks.

### Walkthrough 5: Map `ZodError` into M05's fixed error envelope

```bash
mkdir -p src/middlewares src/errors
cat > src/middlewares/errorHandler.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).requestId;

  if (err instanceof AppError) {
    const body: any = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    };
    if (err.code === "VALIDATION_ERROR" && err.details && err.details.length > 0) {
      body.error.details = err.details;
    }
    return res.status(err.status).json(body);
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join(".") || "body",
      message: issue.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        requestId,
        details,
      },
    });
  }

  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProd ? "Internal server error" : (err as any)?.message || "Internal server error",
      requestId,
    },
  });
}
EOF
```

```bash
cat > src/errors/AppError.ts << 'EOF'
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

export class ValidationError extends AppError {
  constructor(message = 'Request validation failed', details: ValidationDetail[] = []) {
    super('VALIDATION_ERROR', 422, message, details);
  }
}
EOF
```

**What this walkthrough showed you:** Detect `ZodError` in the central error handler and map `issues` to field-level `details` array in the exact M05 envelope shape (status 400, code `VALIDATION_ERROR`).

### Walkthrough 6: Validate `process.env` once at startup in `config.ts`

```bash
cat > src/config.ts << 'EOF'
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
EOF
```

**What this walkthrough showed you:** `process.env` is validated at startup and the app fails fast if misconfigured.

### Walkthrough 7: Prove types come from `z.infer` and no manual checks remain

```bash
npx tsc --noEmit
```

```bash
grep -rn "if (!.*body\." src 2>&1 | head -10
```

```bash
grep -rn "if (!.*req\.body" src 2>&1 | head -10
```

```bash
grep -rn "prisma.*data: req\." src 2>&1 | head -10
```

**What this walkthrough showed you:** Type-checking confirms handler types come from `z.infer`; grep searches confirm no manual body checks remain and no raw `req.body` is passed to Prisma.

## "What This Walkthrough Showed You"

- Zod 4 provides runtime validation with full TypeScript inference.
- Schemas are the single source of truth; derive types with `z.infer` and derive related schemas with `.pick`/`.omit`/`.partial`/`.extend`.
- `req.query` is read-only in Express 5 — store parsed values on `res.locals.valid` (or equivalent) instead of mutating it.
- `parse` throws `ZodError`; catch and transform in the central error handler to match M05's fixed envelope with field-level `details`.
- Validate `process.env` at startup and fail fast.
- Never pass raw request data to Prisma. Handler types must come from `z.infer`, and no manual validation checks should remain.

## Numbered EXERCISEs

### Exercise 1: Strengthen schemas
Add refinements and cross-field rules. For example, ensure `description` is different from `title` if both provided using `.refine()` with a clear error message.

### Exercise 2: Derive schemas with utilities
Practice deriving schemas with `.pick`, `.omit`, `.partial`, and `.extend`. Create a `TaskResponseSchema` that extends the create schema with `id`, `createdAt`, and `updatedAt` fields, then derive `TaskResponse` with `z.infer`.

### Exercise 3: Handle req.query read-only correctly
Confirm your validate middleware never assigns to `req.query`. Store parsed values on `res.locals.valid`. Add a short comment explaining why this is required in Express 5.

### Exercise 4: Map ZodError details fully
Update your central error handler to map all `ZodError.issues` to the `details` array (join `issue.path` array; default to `"body"` if empty). Test with an invalid payload to confirm the response matches M05 envelope exactly.

### Exercise 5: Env validation
Extend `EnvSchema` in `config.ts` to validate additional environment variables your app needs (e.g. `DATABASE_URL` as `z.string().url()`), and verify the app fails fast on invalid values.

### Exercise 6: Find and remove manual checks
Run the grep commands from Walkthrough 7. Remove any manual `if (!body.title)`-style checks and wire Zod validation instead. Only commit after `tsc --noEmit` passes and the searches return nothing.

## Self-Check

1. What is the difference between `z.infer<T>` and writing a hand-written interface? Why does it prevent drift?
2. When should you use `safeParse` vs `parse` in an Express middleware context?
3. Why can't you just do `req.query = parsedQuery` in Express 5? What is the correct workaround?
4. What shape must Zod errors be mapped to so they fit the M05 error envelope?
5. Why must `process.env` be validated at startup, and what should happen if it's invalid?
6. What does it mean to say "Zod is the request contract; Prisma is the persistence contract"? Give an example of when they differ.
7. How do you prove handler input types come from `z.infer` and that no manual checks remain?

## Module Deliverable

Task API v3 — the Zod schemas (create, update, list query, params), the typed `validate({ body, params, query })` middleware, env validation in `config.ts`, `ZodError` mapped to M05 envelope details, and all hand-written validation replaced. Verification: `tsc --noEmit` shows handler types from `z.infer`; no manual `if (!body.title)` checks remain; invalid input never reaches Prisma; 400 responses carry field-level `details` in the exact M05 envelope shape.

## Appendix (Self-Check answers)

1. **`z.infer<T>` vs hand-written interface:** `z.infer` derives the TypeScript type directly from the runtime schema, so they can never drift. A hand-written interface is separate and must be manually updated.

2. **`safeParse` vs `parse`:** `parse` throws on invalid input (ideal for middleware where you forward errors via `next(err)`). `safeParse` returns a result object without throwing — better when you need to handle failures explicitly.

3. **req.query read-only in Express 5:** `req.query` is a read-only getter in Express 5; assigning to it has no effect/throws. Store parsed values on `res.locals.valid` (or augment `req.valid`) and consume from there.

4. **ZodError mapping to M05 envelope:** Map `err.issues` to `details` array where each element is `{ path: issue.path.join('.') || 'body', message: issue.message }`. Return status 400 with body `{ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', requestId, details } }` matching M05's exact envelope.

5. **Env validation at startup:** Environment variables define runtime config (ports, DB URLs, secrets). If invalid/missing, the app cannot run correctly. Validate once at startup in `config.ts` using Zod and `process.exit(1)` immediately on failure.

6. **Request contract vs persistence contract:** Zod defines what API accepts (shape, optionality, coercion, trimming). Prisma defines what DB expects. They differ when updates are partial via `.partial()` while create has required fields, API normalises/coerces input, or API omits internal DB-managed fields. Never pass raw `req.body` to Prisma — validate with Zod first.

7. **Proving types from `z.infer` and no manual checks:** Run `tsc --noEmit` to confirm no type errors and handler signatures consume types derived from `z.infer`. Search `src/` for `if (!.*body\.)` and `if (!.*req\.body)` (should be none). Ensure no Prisma calls take raw `req.body`/`req.query` (e.g. `grep -rn "data: req\." src` returns nothing).
