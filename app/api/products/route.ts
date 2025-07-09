import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/product-schema";
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
  // TODO: Implement filtering, sorting, and pagination
  const allProducts = await db.select().from(products);
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

  return NextResponse.json(newProduct[0]);
}
