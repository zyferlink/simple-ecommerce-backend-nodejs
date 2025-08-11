import { NextFunction, Request, Response } from "express";
import { prismaCilent } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntity } from "../exceptions/validation";
import { SignUpSchema } from "../schemas/users";
import { NotFoundException } from "../exceptions/not-found";

export const signUp = async (request: Request, response: Response) => {
  SignUpSchema.parse(request.body);
  const { name, email, password } = request.body;

  let user = await prismaCilent.user.findFirst({ where: { email } });

  if (user) {
    throw new BadRequestException(
      "User already exists!",
      ErrorCode.USER_ALREADY_EXISTS
    );
  }

  user = await prismaCilent.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  response.json(user);
};

export const logIn = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  let user = await prismaCilent.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException(
      "User does not exists!",
      ErrorCode.USER_NOT_FOUND
    );
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Incorrect password!",
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  response.json({ user, token });
};
