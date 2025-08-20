import { errorHandler } from "../lib/error-handler";
import { getCurrentUser, logIn, signUp } from "../controllers/auth";
import { Router } from "express";
import authMiddleware from "../middlewares/auth";

const authRouters: Router = Router();

authRouters.post("/signup", errorHandler(signUp));
authRouters.post("/login", errorHandler(logIn));
authRouters.get("/current-user",[authMiddleware], errorHandler(getCurrentUser));

export default authRouters;
