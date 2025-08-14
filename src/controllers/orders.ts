import { Request, Response } from "express";
import { prismaCilent } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createOrder = async (request: Request, response: Response) => {
  return await prismaCilent.$transaction(async (transactionObj) => {
    const cartItems = await transactionObj.cartItem.findMany({
      where: {
        userId: request.user.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length == 0) {
      return response.json({ message: "cart is empty" });
    }

    const initialValue = 0;
    const totalPrice = cartItems.reduce((prevValue, currentValue) => {
      return (
        prevValue +
        currentValue.quantity * currentValue.product.price.toNumber()
      );
    }, initialValue);

    const address = await transactionObj.address.findFirst({
      where: {
        id: request.user.defaultShippingAddressId!,
      },
    });

    const order = await transactionObj.order.create({
      data: {
        userId: request.user.id,
        netAmount: totalPrice,
        address: address?.formattedAddress!,
        products: {
          create: cartItems.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });

    const orderEvent = await transactionObj.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    await transactionObj.cartItem.deleteMany({
      where: {
        userId: request.user.id,
      },
    });

    return response.json(order);
  });
};

export const listOrders = async (request: Request, response: Response) => {
  const orders = await prismaCilent.order.findMany({
    where: {
      userId: request.user.id,
    },
  });
  response.json(orders);
};

export const cancelOrder = async (request: Request, response: Response) => {
  try {
    const order = await prismaCilent.order.update({
      where: {
        id: parseInt(request.params.id),
      },
      data: {
        status: "CANCELED",
      },
    });

    await prismaCilent.orderEvent.create({
      data: {
        orderId: order.id,
        status: "CANCELED",
      },
    });
    response.json(order);
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const getOrderById = async (request: Request, response: Response) => {
  try {
    const order = await prismaCilent.order.findFirstOrThrow({
      where: {
        id: parseInt(request.params.id),
      },
      include: {
        products: true,
        events: true,
      },
    });
    response.json(order);
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};
