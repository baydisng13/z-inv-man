import { z } from "zod";

// Schema for a single supplier
export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for creating a new supplier
export const SupplierCreateSchema = SupplierSchema.pick({
  name: true,
  phone: true,
  email: true,
  address: true,
  country: true,
});

// Schema for updating a supplier
export const SupplierUpdateSchema = SupplierCreateSchema.partial();

// Type definitions inferred from schemas
export type SupplierType = z.infer<typeof SupplierSchema>;
export type SupplierCreateType = z.infer<typeof SupplierCreateSchema>;
export type SupplierUpdateType = z.infer<typeof SupplierUpdateSchema>;
