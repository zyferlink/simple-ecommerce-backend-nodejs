import { Router } from "express";
import authRouters from "./auth";
import productsRouters from "./products";
import userRouters from "./users";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouters);
rootRouter.use("/products", productsRouters);
rootRouter.use("/users", userRouters);

export default rootRouter;
