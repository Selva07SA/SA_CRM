import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction): void => {
  const parsed = schema.parse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  req.body = parsed.body;
  req.query = parsed.query;
  req.params = parsed.params;
  next();
};
