import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { ChangeQuantitySchema, CreateCartSchema } from "../schemas/cart";
import { Request, Response } from "express";
import { Product } from "@prisma/client";
import { prismaCilent } from "..";
import { ca } from "zod/v4/locales/index.cjs";
import { success } from "zod";

export const addItemToCart = async (request: Request, response: Response) => {
  const validatedData = CreateCartSchema.parse(request.body);
  let product: Product;

  try {
    product = await prismaCilent.product.findFirstOrThrow({
      where: {
        id: validatedData.productId,
      },
    });
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
  try {
    const cartItem = await prismaCilent.cartItem.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (cartItem) {
      const cart = await prismaCilent.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: cartItem.quantity + validatedData.quantity,
        },
      });
      response.json({ cartUpdated: true, cart });
      return;
    }
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }

  const cart = await prismaCilent.cartItem.create({
    data: {
      userId: request.user.id,
      productId: product.id,
      quantity: validatedData.quantity,
    },
  });

  response.json(cart);
};

export const deleteItemFromCart = async (
  request: Request,
  response: Response
) => {
  try {
    const deletedCart = await prismaCilent.cartItem.delete({
      where: {
        id: parseInt(request.params.id),
        userId: request.user.id,
      },
    });
    response.json({ success: true, deletedCart });
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const changeQuantity = async (request: Request, response: Response) => {
  const validatedData = ChangeQuantitySchema.parse(request.body);

  const updatedCart = await prismaCilent.cartItem.update({
    where: {
      id: parseInt(request.params.id),
     userId: request.user.id,
    },
    data: {
      quantity: validatedData.quantity,
    },
  });

  response.json({ cartUpdated: true, updatedCart });
};

export const getCart = async (request: Request, response: Response) => {
  const cartItems = await prismaCilent.cartItem.findMany({
    where: {
      userId: request.user.id,
    },
    include: {
      product: true,
    },
  });
  response.json(cartItems);
};
