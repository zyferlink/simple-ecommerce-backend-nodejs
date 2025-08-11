import { errorHandler } from "../error-handler";
import { logIn, signUp } from "../controllers/auth";
import { Router } from "express";

const authRouters: Router = Router();

authRouters.post("/signup", errorHandler(signUp));
authRouters.post("/login", errorHandler(logIn));

export default authRouters;
