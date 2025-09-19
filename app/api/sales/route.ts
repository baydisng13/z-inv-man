import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, customers, products, inventoryStock } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { salesFormSchema } from "@/schemas/sales-schema";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allSales = await db.query.sales.findMany({
      with: {
        customer: true,
        saleItems: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });

    const transformedSales = allSales.map(sale => ({
      id: sale.id,
      customerId: sale.customerId,
      subtotal: parseFloat(sale.subtotal),
      discount: parseFloat(sale.discount),
      totalAmount: parseFloat(sale.totalAmount),
      paidAmount: parseFloat(sale.paidAmount),
      paymentStatus: sale.paymentStatus,
      status: sale.status,
      taxAmount: parseFloat(sale.taxAmount),
      includeTax: sale.includeTax,
      createdBy: sale.createdBy,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      customerName: sale.customer?.name,
      saleItems: sale.saleItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        total: parseFloat(item.total),
        unit: item.product.unit,
        category: item.product.category,
      })),
    }));

    return NextResponse.json(transformedSales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ message: "Error fetching sales", error: error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = salesFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { saleItems: saleItemsData, ...saleData } = validation.data;

  const requestedQuantityExceededCheck = (await Promise.all(saleItemsData.map(async (item) => {
    const query = (await db.select().from(inventoryStock).where(eq(inventoryStock.productId, item.productId)).leftJoin(products, eq(inventoryStock.productId, products.id)))
    if (query[0].inventory_stock.quantity < item.quantity) return {
      productName: query[0].products?.name,
      exceeded: true
    }
    return {
      productName: query[0].products?.name,
      exceeded: false
    }
  }))).filter(({ exceeded }) => exceeded)

  if (requestedQuantityExceededCheck.length) {
    const exceededProducts = requestedQuantityExceededCheck.map(({ productName }) => productName).filter(Boolean);
    const message = exceededProducts.length === 1
      ? `requested quantity for "${exceededProducts[0]}" exceeds available stock.`
      : `requested quantities for the following products exceed available stock: ${exceededProducts.join(", ")}.`;
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const newSale = await db.transaction(async (tx) => {
      const [insertedSale] = await tx
        .insert(sales)
        .values({
          customerId: saleData.customerId,
          subtotal: saleData.subtotal.toString(),
          discount: saleData.discount.toString(),
          totalAmount: saleData.totalAmount.toString(),
          paidAmount: saleData.paidAmount.toString(),
          paymentStatus: saleData.paymentStatus,
          status: saleData.status,
          createdBy: session.user.id,
          createdAt: new Date(),
          taxAmount: saleData.taxAmount.toString(),
          includeTax: saleData.includeTax,
        })
        .returning();

      const saleId = insertedSale.id;

      const newSaleItems = saleItemsData.map((item) => ({
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      }));

      await Promise.all(
        newSaleItems.map((item) =>
          tx
            .update(inventoryStock)
            .set({
              quantity: sql`${inventoryStock.quantity} - ${item.quantity}`,
              lastUpdatedAt: new Date(),
            })
            .where(eq(inventoryStock.productId, item.productId))
        )
      );

      await tx.insert(saleItems).values(newSaleItems);

      return insertedSale;
    });

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { message: "Failed to create sale", error: error },
      { status: 500 }
    );
  }
}
