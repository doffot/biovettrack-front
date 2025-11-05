// src/types/owner.ts
import { z } from "zod";

export const ownerSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().min(1),
  address: z.string(),
});

export const ownersListSchema = z.array(
  ownerSchema.pick({
    _id: true,
    name: true,
    contact: true,
    email: true,
    address: true,
  })
);

export type Owner = z.infer<typeof ownerSchema>;
export type OwnerFormData = Pick<
  Owner,
  "name" | "contact" | "email" | "address"
>;