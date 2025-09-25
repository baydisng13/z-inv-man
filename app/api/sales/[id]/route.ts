import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  sales,
  saleItems,
  customers,
  products,
} from "@/db/schema/product-schema";
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate that id is not undefined
  if (!id || id === 'undefined') {
    return NextResponse.json({ message: "Invalid sale ID" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sale = await db.query.sales.findMany({
    where: (sales, { eq }) => eq(sales.id, id),
    with: {
      customer: true,
      saleItems: {
        with: {
          product: true,
        },
      },
    },
  });

  if (sale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  const items = await db
    .select({
      id: saleItems.id,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
      saleId: saleItems.saleId,
      productId: saleItems.productId,
      total: saleItems.total,
      productName: products.name,
    })
    .from(saleItems)
    .where(eq(saleItems.saleId, id))
    .leftJoin(products, eq(saleItems.productId, products.id));

  console.dir(items, { depth: Infinity })

  return NextResponse.json({ ...sale[0], saleItems: items });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === 'undefined') {
    return NextResponse.json({ message: "Invalid sale ID" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

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
  .set({
    ...validation.data,
    subtotal: validation.data.subtotal?.toString(),
    discount: validation.data.discount?.toString(),
    totalAmount: validation.data.totalAmount?.toString(),
    paidAmount: validation.data.paidAmount?.toString(),
    taxAmount: "00.00",
    updatedAt: new Date(),
  })
  .where(eq(sales.id, id))
  .returning();


  if (updatedSale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json(updatedSale[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Delete sale items first
  await db.delete(saleItems).where(eq(saleItems.saleId, (await params).id));

  const deletedSale = await db
    .delete(sales)
    .where(eq(sales.id, (await params).id))
    .returning();

  if (deletedSale.length === 0) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Sale deleted successfully" });
}
