import z from "zod";

export const ProductSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  tags: z.array(z.string()).nullable(),
});
