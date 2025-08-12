import { Address, User } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { AddressSchema, UpdateUserSchema } from "../schemas/users";
import { Request, Response } from "express";
import { prismaCilent } from "..";
import { BadRequestException } from "../exceptions/bad-request";

export const addAddress = async (request: Request, response: Response) => {
  AddressSchema.parse(request.body);

  const address = await prismaCilent.address.create({
    data: {
      ...request.body,
      userId: request.user.id,
    },
  });

  response.json(address);
};

export const deleteAddress = async (request: Request, response: Response) => {
  try {
    await prismaCilent.address.delete({
      where: {
        id: parseInt(request.params.id),
      },
    });
    response.json({ success: true });
  } catch (error) {
    throw new NotFoundException(
      "Address not found!",
      ErrorCode.ADDRESS_NOT_FOUND
    );
  }
};

export const listAddress = async (request: Request, response: Response) => {
  const addresses = await prismaCilent.address.findMany({
    where: {
      userId: request.user.id,
    },
  });
  response.json(addresses);
};

export const updateUser = async (request: Request, response: Response) => {
  const validatedData = UpdateUserSchema.parse(request.body);

  let shippingAddress: Address;
  let billingAddress: Address;

  if (validatedData.defaultShippingAddressId) {
    try {
      shippingAddress = await prismaCilent.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultShippingAddressId!,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Shipping Address not found!",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    if (shippingAddress.userId != request.user.id) {
      throw new BadRequestException(
        "Address does not belong to user!",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
  }

  if (validatedData.defaultBillingAddressId) {
    try {
      billingAddress = await prismaCilent.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultBillingAddressId!,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Billing Address not found!",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    if (billingAddress.userId != request.user.id) {
      throw new BadRequestException(
        "Address does not belong to user!",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
  }

  const updatedUser = await prismaCilent.user.update({
    where: {
      id: request.user.id,
    },
    data: {
      name:
        validatedData.name !== null ? validatedData.name : request.user.name,
      defaultShippingAddressId:
        validatedData.defaultShippingAddressId !== null
          ? validatedData.defaultShippingAddressId
          : request.user.defaultShippingAddressId,
      defaultBillingAddressId:
        validatedData.defaultBillingAddressId !== null
          ? validatedData.defaultBillingAddressId
          : request.user.defaultBillingAddressId,
    },
  });
  response.json(updatedUser);
};
