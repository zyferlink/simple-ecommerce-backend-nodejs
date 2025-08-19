import authMiddleware from "../middlewares/auth";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProduct,
  searchProducts,
  updateProduct,
} from "../controllers/products";
import { errorHandler } from "../error-handler";
import { Router } from "express";
import adminMiddleware from "../middlewares/admin";

const productsRouters: Router = Router();

productsRouters.post(
  "/",
  [authMiddleware, adminMiddleware],
  errorHandler(createProduct)
);

productsRouters.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(updateProduct)
);

productsRouters.delete(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(deleteProduct)
);

productsRouters.get(
  "/",
  [authMiddleware, adminMiddleware],
  errorHandler(listProduct)
);

productsRouters.get(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(getProductById)
);


productsRouters.get("/search", errorHandler(searchProducts));

export default productsRouters;
