import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryStock } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq, and, or, like, asc, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const productSchema = z.object({
  name: z.string().min(1),
  barcode: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().min(1),
  sellingPrice: z.number().positive(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isArchivedParam = searchParams.get("isArchived");

  // By default, show non-archived products
  const showArchived = isArchivedParam === "true";

  let query = await db.select().from(products);

  if (!showArchived) {
    query = query.filter((q) => q.isArchived === false);
  }

  const allProducts = await query;
  return NextResponse.json(allProducts);
}

export async function POST(req: NextRequest) {

  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { name, barcode, description, unit, sellingPrice } = validation.data;

  const newProduct = await db
    .insert(products)
    .values({
      name,
      barcode,
      description,
      unit,
      sellingPrice: sellingPrice.toString(),
      createdBy: session.user.id,
    })
    .returning();

  const newInventory = await db.insert(inventoryStock).values({
    productId: newProduct[0].id,
    quantity: 0,
  }).returning();
  console.log("New Inventory Record:", newInventory);

  return NextResponse.json(newProduct[0]);
}
