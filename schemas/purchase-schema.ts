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
  supplierId: z.string().uuid().nullable(), // Nullable since it's not `.notNull()`
  totalAmount: z.coerce.number(), // Decimal coerced to number
  paidAmount: z.coerce.number(), // Decimal coerced to number
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]),
  status: z.enum(["DRAFT", "RECEIVED", "CANCELLED"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
        costPrice: z.coerce.number(),
      })
    )
    .min(1),
});

// Schema for updating a purchase order
export const PurchaseUpdateSchema = z.object({
  supplierId: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  paidAmount: z.number().positive().optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  status: PurchaseStatusEnum.optional(),
  receivedAt: z.string().datetime().optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string(),
        quantity: z.number().int().positive(),
        costPrice: z.number().positive(),
      })
    )
    .optional(),
});

// Type definitions inferred from schemas
export type PurchaseType = z.infer<typeof PurchaseSchema>;
export type PurchaseItemType = z.infer<typeof PurchaseItemSchema>;
export type PurchaseCreateType = z.infer<typeof PurchaseCreateSchema>;
export type PurchaseUpdateType = z.infer<typeof PurchaseUpdateSchema>;

// Extended PurchaseItemSchema for receipt view
export const PurchaseItemWithProductSchema = PurchaseItemSchema.extend({
  product: z.object({
    name: z.string(),
    barcode: z.string(),
    unit: z.string(),
    sellingPrice: z.string(),
  }),
});

export type PurchaseItemWithProductType = z.infer<
  typeof PurchaseItemWithProductSchema
>;
