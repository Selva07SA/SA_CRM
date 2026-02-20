import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, status = 200, meta?: Record<string, unknown>): void => {
  res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  });
};

export const sendNoContent = (res: Response): void => {
  res.status(200).json({
    success: true,
    data: null
  });
};
