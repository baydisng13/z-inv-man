ALTER TABLE "inventory_stock" ADD COLUMN "purchase_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "inventory_stock_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_inventory_stock_id_inventory_stock_id_fk" FOREIGN KEY ("inventory_stock_id") REFERENCES "public"."inventory_stock"("id") ON DELETE no action ON UPDATE no action;