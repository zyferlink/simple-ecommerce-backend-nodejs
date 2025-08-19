import { ErrorCode } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { NextFunction, Request, Response } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET } from "../config/secrets";
import { prismaCilent } from "../lib/prisma";

const authMiddleware= async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token = request.headers.authorization;

  if (!token) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
    return;
  }

  try {
    const payload = jsonwebtoken.verify(token, JWT_SECRET) as any;

    const user = await prismaCilent.user.findFirst({
      where: { id: payload.userId },
    });

    if (!user) {
      next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
      return;
    }

    request.user = user;
    next()
  } catch (error) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};

export default authMiddleware;
