import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, customers, products, inventoryStock, saleItemInventory } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, and, asc } from "drizzle-orm";
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
            inventoryAllocations: {
              with: {
                inventoryStock: {
                  with: {
                    purchase: true,
                  },
                },
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
        unit: item.product?.unit,
        total: parseFloat(item.total),
        category: item.product?.category?.name,
        inventoryAllocations: item.inventoryAllocations?.map(allocation => ({
          inventoryStockId: allocation.inventoryStock?.id,
          quantityUsed: allocation.quantityUsed,
          costPrice: parseFloat(allocation.costPrice),
          purchaseId: allocation.inventoryStock?.purchaseId,
        })) || [],
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
    // how many quantty we have since
    const totalQuantity = await db.select({
      total: sql<number>`COALESCE(SUM(${inventoryStock.quantity}), 0)`
    })
      .from(inventoryStock)
      .where(eq(inventoryStock.productId, item.productId));

    const availableQuantity = totalQuantity[0]?.total || 0;

    if (availableQuantity < item.quantity) {
      const product = await db.select({ name: products.name })
        .from(products)
        .where(eq(products.id, item.productId));

      return {
        productName: product[0]?.name,
        exceeded: true
      }
    }
    return {
      productName: null,
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

      const allSaleItems = [];
      const allInventoryAllocations = [];

      for (const saleItemData of saleItemsData) {
        const saleItem = {
          saleId,
          productId: saleItemData.productId,
          quantity: saleItemData.quantity,
          unitPrice: saleItemData.unitPrice.toString(),
          total: (saleItemData.quantity * saleItemData.unitPrice).toString(),
        };

        allSaleItems.push(saleItem);

        const availableInventory = await tx
          .select()
          .from(inventoryStock)
          .where(
            and(
              eq(inventoryStock.productId, saleItemData.productId),
              sql`${inventoryStock.quantity} > 0`
            )
          )
          .orderBy(asc(inventoryStock.createdAt));

        let remainingToSell = saleItemData.quantity;

        //8 items
        //first one has 6 
        // second one has 4

        //math.min(8, 6) 

        // 6

        // 8 - 6 = 2

        // math.min(2, 4)


        for (const inventoryRecord of availableInventory) {
          if (remainingToSell <= 0) break;

          const quantityToUse = Math.min(remainingToSell, inventoryRecord.quantity);

          allInventoryAllocations.push({
            saleItemId: "",
            inventoryStockId: inventoryRecord.id,
            quantityUsed: quantityToUse,
            costPrice: "0",
          });

          await tx
            .update(inventoryStock)
            .set({
              quantity: inventoryRecord.quantity - quantityToUse,
              lastUpdatedAt: new Date()
            })
            .where(eq(inventoryStock.id, inventoryRecord.id));

          remainingToSell -= quantityToUse;
        }

        if (remainingToSell > 0) {
          const product = await tx
            .select({ name: products.name })
            .from(products)
            .where(eq(products.id, saleItemData.productId));

          throw new Error(`Not enough inventory for product ${product[0]?.name || saleItemData.productId}`);
        }
      }

      const insertedSaleItems = await tx.insert(saleItems).values(allSaleItems).returning();

      let allocationIndex = 0;
      for (const saleItem of insertedSaleItems) {
        const itemAllocations = allInventoryAllocations.filter(a => a.inventoryStockId);
        for (const allocation of itemAllocations) {
          if (allocationIndex < allInventoryAllocations.length) {
            allInventoryAllocations[allocationIndex].saleItemId = saleItem.id;
            allocationIndex++;
          }
        }
      }

      if (allInventoryAllocations.length > 0) {
        await tx.insert(saleItemInventory).values(allInventoryAllocations);
      }

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