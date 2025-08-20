import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../lib/error-handler";
import { Router } from "express";
import { cancelOrder, changeStatus, createOrder, getOrderById, listAllOrders, listOrders, listUserOrders } from "../controllers/orders";
import adminMiddleware from "../middlewares/admin";


const orderRouters: Router = Router();

orderRouters.post("/", [authMiddleware], errorHandler(createOrder));
orderRouters.get("/", [authMiddleware], errorHandler(listOrders));
orderRouters.put("/:id/cancel", [authMiddleware], errorHandler(cancelOrder));


orderRouters.get("/index", [authMiddleware, adminMiddleware], errorHandler(listAllOrders));
orderRouters.get("/users/:id", [authMiddleware, adminMiddleware], errorHandler(listUserOrders));
orderRouters.put("/:id/status", [authMiddleware, adminMiddleware], errorHandler(changeStatus));

orderRouters.get("/:id", [authMiddleware], errorHandler(getOrderById));


export default orderRouters;
