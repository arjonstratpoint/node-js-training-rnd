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
