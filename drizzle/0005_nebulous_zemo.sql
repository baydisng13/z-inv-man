CREATE TABLE "sale_item_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"inventory_stock_id" uuid NOT NULL,
	"quantity_used" integer NOT NULL,
	"cost_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_inventory_stock_id_inventory_stock_id_fk";
--> statement-breakpoint
ALTER TABLE "sale_item_inventory" ADD CONSTRAINT "sale_item_inventory_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_inventory" ADD CONSTRAINT "sale_item_inventory_inventory_stock_id_inventory_stock_id_fk" FOREIGN KEY ("inventory_stock_id") REFERENCES "public"."inventory_stock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "inventory_stock_id";