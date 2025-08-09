import { Router } from "express";
import authRouters from "./auth";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouters);

export default rootRouter;
