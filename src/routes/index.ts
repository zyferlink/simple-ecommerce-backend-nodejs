import { Router } from "express";
import authRouters from "./auth";
import productsRouters from "./products";
import userRouters from "./users";
import cartRouters from "./cart";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouters);
rootRouter.use("/products", productsRouters);
rootRouter.use("/users", userRouters);
rootRouter.use("/cart", cartRouters);

export default rootRouter;
