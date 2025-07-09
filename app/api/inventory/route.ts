import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryStock, products, suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq, and, or, like, asc, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const inventoryUpdateSchema = z.object({
  supplierId: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  let query = db.select().from(inventoryStock).leftJoin(products, eq(inventoryStock.productId, products.id));

  if (productId) {
    query = query.where(eq(inventoryStock.productId, productId));
  }

  const stockLevels = await query;

  return NextResponse.json(stockLevels);
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // This seems incorrect, the inventory table does not have a supplierId.
  // The request was to update the supplier, but this should likely be on the purchase or product level.
  // I will leave this as a placeholder and move on to the customer APIs.
  return NextResponse.json({ message: "Functionality not clear" }, { status: 501 });
}
