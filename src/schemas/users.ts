import z, { email } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
});

export const AddressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().optional(),
  city: z.string(),
  country: z.string(),
  zipcode: z.string(),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  defaultShippingAddressId: z.number().optional(),
  defaultBillingAddressId: z.number().optional(),
});
