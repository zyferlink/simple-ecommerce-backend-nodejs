import { Request, Response } from "express";
import { prismaCilent } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

export const signUp = async (request: Request, response: Response) => {
  const { name, email, password } = request.body;

  let user = await prismaCilent.user.findFirst({ where: { email } });

  if (user) {
    throw Error("User already exists!");
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
  const { name, email, password } = request.body;

  let user = await prismaCilent.user.findFirst({ where: { email } });

  if (!user) {
    throw Error("User does not exists!");
  }

  if (!compareSync(password, user.password)) {
    throw Error("Incorrect password!");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  response.json({user,token});
};
