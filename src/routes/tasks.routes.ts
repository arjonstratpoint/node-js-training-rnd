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
