import z from "zod";

export const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  tags: z.array(z.string()).optional(),
});
