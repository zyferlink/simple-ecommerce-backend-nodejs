import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { Router } from "express";
import { cancelOrder, createOrder, getOrderById, listOrders } from "../controllers/orders";


const orderRouters: Router = Router();

orderRouters.post("/", [authMiddleware], errorHandler(createOrder));
orderRouters.get("/", [authMiddleware], errorHandler(listOrders));
orderRouters.put("/:id/cancel", [authMiddleware], errorHandler(cancelOrder));
orderRouters.get("/:id", [authMiddleware], errorHandler(getOrderById));

export default orderRouters;
