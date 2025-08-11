import { Router } from "express";
import authRouters from "./auth";
import productsRouters from "./products";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouters);
rootRouter.use("/products", productsRouters);

export default rootRouter;
