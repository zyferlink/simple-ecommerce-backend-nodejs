import { Request, Response } from "express";
import { prismaCilent } from "..";
import { ProductSchema } from "../schemas/products";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createProduct = async (request: Request, response: Response) => {
  ProductSchema.parse(request.body);

  const product = await prismaCilent.product.create({
    data: {
      ...request.body,
      tags: request.body.tags.join(","),
    },
  });

  response.json(product);
};

export const updateProduct = async (request: Request, response: Response) => {
  try {
    const product = request.body;
    if (product.tags) {
      product.tags = product.tags.join(",");
    }
    const updatedProduct = await prismaCilent.product.update({
      where: {
        id: +request.params.id,
      },
      data: product,
    });
    response.json(updatedProduct);
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProduct = async (request: Request, response: Response) => {
  try {
    const deletedProduct = await prismaCilent.product.delete({
      where: {
        id: +request.params.id,
      },
    });
    response.json(deletedProduct);
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const listProduct = async (request: Request, response: Response) => {
  try {
    const count = await prismaCilent.product.count();

    const products = await prismaCilent.product.findMany({
      skip: +request.query.skip! || 0,
      take: 5,
    });

    response.json({
      count,
      data: products,
    });
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const getProductById = async (request: Request, response: Response) => {
  try {
    const product = await prismaCilent.product.findFirstOrThrow({
      where: {
        id: +request.params.id,
      },
    });

    response.json(product);
  } catch (error) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const searchProducts = async (request: Request, response: Response) => {
  const { q } = request.query;

  if (!q || q.toString().trim().length < 2) {
    return response.json([]);
  }

  const query = q.toString();

  const products = await prismaCilent.product.findMany({
    where: {
      OR: [
        { name: { search: query } },
        { description: { search: query } },
        { tags: { search: query } },
      ],
    },
  });

  response.json(products);
};
