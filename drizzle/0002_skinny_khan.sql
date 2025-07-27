CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "suppliers" RENAME COLUMN "tin" TO "tin_number";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "tin_number" varchar(20);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "tax_amount" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "include_tax" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "tin";