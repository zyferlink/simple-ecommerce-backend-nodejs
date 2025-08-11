import { express } from "express";
import { User } from "@prisma/client";

declare module "express" {
  export interface Request {
    user: User;
  }
}
