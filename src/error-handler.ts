import { Request, Response, NextFunction, RequestHandler } from "express";
import { ErrorCode, HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";
import { ZodError } from "zod";
import { BadRequestException } from "./exceptions/bad-request";

type AsyncRequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

export const errorHandler = (method: RequestHandler) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      await method(request, response, next);
    } catch (error: any) {
      let exception: HttpException;

      if (error instanceof HttpException) {
        exception = error;
      } 
      else if (error instanceof ZodError) {
        exception = new BadRequestException(
          "Unprocessable entity!",
          ErrorCode.UNPROCESSABLE_ENTITY
        );
      } 
      else {
        exception = new InternalException(
          "Server error!",
          ErrorCode.INTERNAL_EXCEPTION,
          error?.issues
        );
      }
      next(exception);
    }
  };
};
