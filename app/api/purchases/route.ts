import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const purchaseSchema = z.object({
  supplierId: z.string().uuid().optional(),
  totalAmount: z.number().positive(),
  paidAmount: z.number().positive(),
  paymentStatus: z.enum(["PAID", "PARTIAL", "CREDIT"]),
  status: z.enum(["DRAFT", "RECEIVED", "CANCELLED"]),
  receivedAt: z.string().datetime().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    costPrice: z.number().positive(),
  })).min(1),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allPurchases = await db.select().from(purchases).leftJoin(suppliers, eq(purchases.supplierId, suppliers.id));
  console.log("All Purchases with Suppliers:", allPurchases);
  return NextResponse.json(allPurchases);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = purchaseSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { items, ...purchaseData } = validation.data;

  const newPurchase = await db
    .insert(purchases)
    .values({
      ...purchaseData,
      createdBy: session.user.id,
    })
    .returning();

  const purchaseId = newPurchase[0].id;

  const newPurchaseItems = items.map((item) => ({
    ...item,
    purchaseId,
  }));

  await db.insert(purchaseItems).values(newPurchaseItems);

  return NextResponse.json(newPurchase[0]);
}
