import { z } from "zod"

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  productCode: z.string(),
  productName: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  total: z.number().min(0, "Total must be positive"),
  unit: z.string().optional(),
  category: z.string().optional(),
})

export const salesFormSchema = z.object({
  // Sale items (cart)
  saleItems: z.array(saleItemSchema),
  // Customer information
  customerId: z.string().uuid(),
  // Financial calculations
  subtotal: z.coerce.number(),
  discount: z.coerce.number(),
  taxAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  paidAmount: z.coerce.number(),
  // Payment and status
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]),
  status: z.enum(["DRAFT", "RECEIVED", "CANCELLED"]),
  // Settings
  includeTax: z.boolean(),
  // UI state
  selectedCategory: z.union([z.string(), z.number()]),
  productSearch: z.string(),
  isPaymentOpen: z.boolean(),
  // Quick add product form
  quickAdd: z.object({
    productCode: z.string(),
    quantity: z.number(),
  }),
})


export const salesSchema = salesFormSchema.pick({
  saleItems: true,
  customerId: true,
  subtotal: true,
  discount: true,
  taxAmount: true,
  totalAmount: true,
  paidAmount: true,
  paymentStatus: true,
  status: true,
  includeTax: true,
  selectedCategory: true,
  isPaymentOpen: true,
}).extend({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})


export type SalesCreateType = z.infer<typeof salesFormSchema>
export type SalesUpdateType = z.infer<typeof salesFormSchema>
export type SalesType = z.infer<typeof salesSchema> & { customerName?: string, tin_number?: string }





//   SalesType,
//   SalesCreateType,
//   SalesUpdateType,