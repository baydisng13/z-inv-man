import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const saleSchema = z.object({
  customerId: z.string().uuid().optional(),
  subtotal: z.number().positive(),
  discount: z.number().min(0).optional().default(0),
  totalAmount: z.number().positive(),
  paidAmount: z.number().positive(),
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    total: z.number().positive(),
  })).min(1),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allSales = await db.select().from(sales);
  return NextResponse.json(allSales);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = saleSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { items, ...saleData } = validation.data;

  const newSale = await db
    .insert(sales)
    .values({
      ...saleData,
      createdBy: session.user.id,
    })
    .returning();

  const saleId = newSale[0].id;

  const newSaleItems = items.map((item) => ({
    ...item,
    saleId,
  }));

  await db.insert(saleItems).values(newSaleItems);

  return NextResponse.json(newSale[0]);
}
