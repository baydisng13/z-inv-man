import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const saleUpdateSchema = z.object({
  customerId: z.string().uuid().optional(),
  subtotal: z.number().positive().optional(),
  discount: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  paidAmount: z.number().positive().optional(),
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]).optional(),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sale = await db
    .select()
    .from(sales)
    .where(eq(sales.id, params.id));

  if (sale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, params.id));

  return NextResponse.json({ ...sale[0], items });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = saleUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const updatedSale = await db
    .update(sales)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(eq(sales.id, params.id))
    .returning();

  if (updatedSale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json(updatedSale[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Delete sale items first
  await db.delete(saleItems).where(eq(saleItems.saleId, params.id));

  const deletedSale = await db
    .delete(sales)
    .where(eq(sales.id, params.id))
    .returning();

  if (deletedSale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Sale deleted successfully" });
}
