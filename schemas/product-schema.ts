import { z } from "zod";

// Schema for a single product, used for validation and type inference
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  barcode: z.string().min(1, "Barcode is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  sellingPrice: z.string(), // Stored as decimal in DB, comes as string
  createdBy: z.string(),
  createdAt: z.string(), // Comes as string from DB
  updatedAt: z.string(), // Comes as string from DB
  isArchived: z.boolean(),
});

// Schema for creating a new product
export const ProductCreateSchema = ProductSchema.pick({
  name: true,
  barcode: true,
  description: true,
  unit: true,
}).extend({
  sellingPrice: z.coerce.number().positive("Price must be a positive number"),
});

// Schema for updating a product
export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

// Type definitions inferred from schemas
export type ProductType = z.infer<typeof ProductSchema>;
export type ProductCreateType = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;
