import { z } from "zod";

// Schema for a single inventory stock item
export const InventoryStockSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  lastUpdatedAt: z.string(), // ISO date string
  // Joined product data (optional, as it comes from a left join)
  products: z.object({
    id: z.string().uuid(),
    barcode: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    unit: z.string(),
    sellingPrice: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    isArchived: z.boolean(),
  }).nullable().optional(),
});

// Schema for a single stock movement
export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  type: z.string(), // e.g., "IN", "OUT", "TRANSFER", "ADJUST"
  quantity: z.number().int(),
  referenceType: z.string().nullable().optional(), // e.g., "PURCHASE", "SALE"
  referenceId: z.string().uuid().nullable().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
});

// Type definitions inferred from schemas
export type InventoryStockType = z.infer<typeof InventoryStockSchema>;
export type StockMovementType = z.infer<typeof StockMovementSchema>;
