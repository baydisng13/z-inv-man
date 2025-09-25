import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  decimal,
  text,
  primaryKey,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

///////////////////////
// PRODUCTS
///////////////////////
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  barcode: varchar("barcode", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 20 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).notNull(),
  createdBy: text("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
});

export const productRelations = relations(products, ({ one, many }) => ({
  createdByUser: one(user, {
    fields: [products.createdBy],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventoryRecords: many(inventoryStock),
}));

///////////////////////
// CATEGORIES
///////////////////////
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

///////////////////////
// INVENTORY STOCK (cache)
///////////////////////
export const inventoryStock = pgTable("inventory_stock", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  purchaseId: uuid("purchase_id")
    .references(() => purchases.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastUpdatedAt: timestamp("last_updated_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const inventoryStockRelations = relations(inventoryStock, ({ one, many }) => ({
  product: one(products, {
    fields: [inventoryStock.productId],
    references: [products.id],
  }),
  purchase: one(purchases, {
    fields: [inventoryStock.purchaseId],
    references: [purchases.id],
  }),
  saleAllocations: many(saleItemInventory),
}));

///////////////////////
// STOCK MOVEMENTS
///////////////////////
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // IN, OUT, TRANSFER, ADJUST
  quantity: integer("quantity").notNull(),
  referenceType: varchar("reference_type", { length: 50 }), // PURCHASE, SALE
  referenceId: uuid("reference_id"), // Purchase or Sale ID
  createdBy: text("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  createdByUser: one(user, {
    fields: [stockMovements.createdBy],
    references: [user.id],
  }),
}));

///////////////////////
// PURCHASES
///////////////////////
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(), // PAID, PARTIAL, CREDIT
  status: varchar("status", { length: 20 }).notNull(), // DRAFT, RECEIVED, CANCELLED
  receivedAt: timestamp("received_at", { withTimezone: true }),
  createdBy: text("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),
  createdByUser: one(user, {
    fields: [purchases.createdBy],
    references: [user.id],
  }),
  items: many(purchaseItems),
}));

export const purchaseItems = pgTable("purchase_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .references(() => purchases.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }).notNull(),
});

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),
  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id],
  }),
}));

///////////////////////
// SALES
///////////////////////
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(), // <-- This is correct
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(), // PAID, PARTIAL, CREDIT
  status: varchar("status", { length: 20 }).notNull(), // DRAFT, RECEIVED, CANCELLED
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull(),
  includeTax: boolean("include_tax").default(false).notNull(),
  createdBy: text("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  createdByUser: one(user, {
    fields: [sales.createdBy],
    references: [user.id],
  }),
  saleItems: many(saleItems),
}));

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .references(() => sales.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
});

export const saleItemsRelations = relations(saleItems, ({ one, many }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
  inventoryAllocations: many(saleItemInventory),
}));

export const saleItemInventory = pgTable("sale_item_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleItemId: uuid("sale_item_id")
    .references(() => saleItems.id)
    .notNull(),
  inventoryStockId: uuid("inventory_stock_id")
    .references(() => inventoryStock.id)
    .notNull(),
  quantityUsed: integer("quantity_used").notNull(),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const saleItemInventoryRelations = relations(saleItemInventory, ({ one }) => ({
  saleItem: one(saleItems, {
    fields: [saleItemInventory.saleItemId],
    references: [saleItems.id],
  }),
  inventoryStock: one(inventoryStock, {
    fields: [saleItemInventory.inventoryStockId],
    references: [inventoryStock.id],
  }),
}));

///////////////////////
// SUPPLIERS
///////////////////////
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  tin_number: varchar("tin_number", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  country: varchar("country", { length: 50 }),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  createdByUser: one(user, {
    fields: [suppliers.createdBy],
    references: [user.id],
  }),
}));

///////////////////////
// CUSTOMERS
///////////////////////
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  tin_number: varchar("tin_number", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  country: varchar("country", { length: 50 }),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const customersRelations = relations(customers, ({ one }) => ({
  createdByUser: one(user, {
    fields: [customers.createdBy],
    references: [user.id],
  }),
}));
