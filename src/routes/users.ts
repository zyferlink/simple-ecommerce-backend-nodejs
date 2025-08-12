import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { Router } from "express";
import adminMiddleware from "../middlewares/admin";
import { addAddress, deleteAddress, listAddress, updateUser } from "../controllers/users";

const userRouters: Router = Router();

userRouters.post(
  "/address",
  [authMiddleware],
  errorHandler(addAddress)
);

userRouters.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);

userRouters.get(
  "/address",
  [authMiddleware],
  errorHandler(listAddress)
);

userRouters.put(
  "/",
  [authMiddleware],
  errorHandler(updateUser)
);

export default userRouters;
