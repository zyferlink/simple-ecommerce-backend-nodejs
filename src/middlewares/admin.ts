import { ErrorCode } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { NextFunction, Request, Response } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { prismaCilent } from "..";

const adminMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = request.user;

    if (user.role == "ADMIN") {
      next();
    } else {
      next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
    }
  } catch (error) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};

export default adminMiddleware;
