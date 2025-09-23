import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, products, suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const purchaseUpdateSchema = z.object({
  supplierId: z.string().uuid().optional(),
  totalAmount: z.number().positive().optional(),
  paidAmount: z.number().positive().optional(),
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]).optional(),
  status: z.enum(["DRAFT", "RECEIVED", "CANCELLED"]).optional(),
  receivedAt: z.string().datetime().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const purchase = await db
    .select({
      id: purchases.id,
      supplierId: purchases.supplierId,
      totalAmount: purchases.totalAmount,
      paidAmount: purchases.paidAmount,
      paymentStatus: purchases.paymentStatus,
      status: purchases.status,
      receivedAt: purchases.receivedAt,
      createdBy: purchases.createdBy,
      createdAt: purchases.createdAt,
      updatedAt: purchases.updatedAt,
      supplierName: suppliers.name, // Include supplier name
    })
    .from(purchases)
    .where(eq(purchases.id, (await params).id))
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id));

  if (purchase.length === 0) {
    return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
  }

  const items = await db
    .select({
      id: purchaseItems.id,
      purchaseId: purchaseItems.purchaseId,
      productId: purchaseItems.productId,
      quantity: purchaseItems.quantity,
      costPrice: purchaseItems.costPrice,
      productName: products.name, // Include product name
      productBarcode: products.barcode, // Include product barcode
      productUnit: products.unit, // Include product unit
      productSellingPrice: products.sellingPrice, // Include product selling price
    })
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, (await params).id))
    .leftJoin(products, eq(purchaseItems.productId, products.id));

  return NextResponse.json({ ...purchase[0], items });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = purchaseUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const updatedPurchase = await db
    .update(purchases)
    .set({ ...validation.data, updatedAt: new Date(), totalAmount: validation.data.totalAmount?.toString(), paidAmount: validation.data.paidAmount?.toString(), receivedAt: validation.data.receivedAt ? new Date(validation.data.receivedAt) : null })
    .where(eq(purchases.id, (await params).id))
    .returning();

  if (updatedPurchase.length === 0) {
    return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json(updatedPurchase[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Delete purchase items first
  await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, (await params).id));

  const deletedPurchase = await db
    .delete(purchases)
    .where(eq(purchases.id, (await params).id))
    .returning();

  if (deletedPurchase.length === 0) {
    return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Purchase deleted successfully" });
}
