import { z } from "zod";

// Schema for a single customer
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  tin_number: z.string().min(1, "TIN Number is required").optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for creating a new customer
export const CustomerCreateSchema = CustomerSchema.pick({
  name: true,
  tin_number: true,
  phone: true,
  email: true,
  address: true,
  country: true,
});

// Schema for updating a customer
export const CustomerUpdateSchema = CustomerCreateSchema.partial();

// Type definitions inferred from schemas
export type CustomerType = z.infer<typeof CustomerSchema>;
export type CustomerCreateType = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdateType = z.infer<typeof CustomerUpdateSchema>;
