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

  const query = (await db.select().from(inventoryStock).leftJoin(products, eq(inventoryStock.productId, products.id)));


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

  // if there is a missmatch between the the stock level it coun be ajusted to the correct amount without adding a purchase or a sells
  return NextResponse.json({ message: "Functionality not clear" }, { status: 501 });
}


const inventoryPostBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
});

type InventoryPostBody = z.infer<typeof inventoryPostBodySchema>;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body : InventoryPostBody = await req.json();

  inventoryPostBodySchema.parse(body);
  
  const { productId, quantity } = body;

  const newInventory = await db
    .insert(inventoryStock)
    .values({
      productId,
      quantity,
      lastUpdatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(newInventory[0]);
}
