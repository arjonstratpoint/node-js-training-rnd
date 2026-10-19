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
