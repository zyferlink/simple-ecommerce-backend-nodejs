import { Request, Response, NextFunction } from "express";
import { ErrorCode, HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";

export const errorHandler = (method: Function) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      await method(request, response, next);
    } catch (error: any) {
      let exception: HttpException;

      if (error instanceof HttpException) {
        exception = error;
      } else {
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
