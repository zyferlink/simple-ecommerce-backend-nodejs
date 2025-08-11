import { ErrorCode, HttpException } from "../exceptions/root";
import { NextFunction, Request, Response, ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
    errors: error.errors,
  });
};
