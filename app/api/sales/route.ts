import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { salesFormSchema } from "@/schemas/sales-schema";



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
  const validation = salesFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { saleItems : saleItemsData, ...saleData } = validation.data;

  const newSale = await db.transaction(async (tx) => {
    const [insertedSale] = await tx
      .insert(sales)
      .values({
        customerId: saleData.customerId,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        totalAmount: saleData.totalAmount,
        paidAmount: saleData.paidAmount,
        paymentStatus: saleData.paymentStatus,
        status: saleData.status,
        createdBy: session.user.id,
        createdAt: new Date(),
        taxAmount: saleData.taxAmount,
        includeTax: saleData.includeTax,
      })
      .returning();

    const saleId = insertedSale.id;

    const newSaleItems = saleItemsData.map((item) => ({
      ...item,
      saleId,
    }));

    await tx.insert(saleItems).values(newSaleItems);

    return insertedSale;
  });

  return NextResponse.json(newSale[0]);
}
