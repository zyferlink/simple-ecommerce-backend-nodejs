import { logIn, signUp } from "../controllers/auth";
import { Router } from "express";

const authRouters: Router = Router();

authRouters.post("/signup", signUp);
authRouters.post("/login", logIn);

export default authRouters;
