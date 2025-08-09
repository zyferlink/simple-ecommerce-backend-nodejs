import { signUp } from "../controllers/auth";
import { Router } from "express";

const authRouters: Router = Router();

authRouters.post("/signUp", signUp);

export default authRouters;
