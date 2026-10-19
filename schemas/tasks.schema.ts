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
