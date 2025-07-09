import { z } from "zod";

// Enums for Purchase Order status and payment status
export const PurchaseStatusEnum = z.enum(["DRAFT", "RECEIVED", "CANCELLED"]);
export const PaymentStatusEnum = z.enum(["PAID", "PARTIAL", "CREDIT"]);

// Schema for a single purchase item
export const PurchaseItemSchema = z.object({
  id: z.string().uuid(),
  purchaseId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  costPrice: z.string(), // Stored as decimal in DB, comes as string
});

// Schema for a single purchase order
export const PurchaseSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid().nullable().optional(),
  supplierName: z.string().nullable().optional(), // Added supplierName
  totalAmount: z.string(), // Stored as decimal in DB, comes as string
  paidAmount: z.string(), // Stored as decimal in DB, comes as string
  paymentStatus: PaymentStatusEnum,
  status: PurchaseStatusEnum,
  receivedAt: z.string().datetime().nullable().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  items: z.array(PurchaseItemSchema).optional(), // Items are included when fetching a single purchase
});

// Schema for creating a new purchase order
export const PurchaseCreateSchema = z.object({
  supplierId: z.string().uuid().optional(),
  totalAmount: z.number().positive(),
  paidAmount: z.number().positive(),
  paymentStatus: PaymentStatusEnum,
  status: PurchaseStatusEnum,
  receivedAt: z.string().datetime().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string().optional(), // Added for convenience in creation
    quantity: z.number().int().positive(),
    costPrice: z.number().positive(),
  })).min(1, "At least one item is required"),
});

// Schema for updating a purchase order
export const PurchaseUpdateSchema = z.object({
  supplierId: z.string().uuid().optional(),
  totalAmount: z.number().positive().optional(),
  paidAmount: z.number().positive().optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  status: PurchaseStatusEnum.optional(),
  receivedAt: z.string().datetime().optional().nullable(),
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    productId: z.string().uuid(),
    productName: z.string().optional(),
    quantity: z.number().int().positive(),
    costPrice: z.number().positive(),
  })).optional(),
});

// Type definitions inferred from schemas
export type PurchaseType = z.infer<typeof PurchaseSchema>;
export type PurchaseItemType = z.infer<typeof PurchaseItemSchema>;
export type PurchaseCreateType = z.infer<typeof PurchaseCreateSchema>;
export type PurchaseUpdateType = z.infer<typeof PurchaseUpdateSchema>;

// Extended PurchaseItemSchema for receipt view
export const PurchaseItemWithProductSchema = PurchaseItemSchema.extend({
  productName: z.string(),
  productBarcode: z.string(),
  productUnit: z.string(),
  productSellingPrice: z.string(),
});

export type PurchaseItemWithProductType = z.infer<typeof PurchaseItemWithProductSchema>;
