import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  purchases,
  purchaseItems,
  suppliers,
  products,
  inventoryStock,
  stockMovements,
} from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { PurchaseCreateSchema } from "@/schemas/purchase-schema";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allPurchases = await db.query.purchases.findMany({
    with: {
      createdByUser: true,
      supplier: true,
    },
  });

  console.log("All Purchases with Suppliers:", allPurchases);
  return NextResponse.json(allPurchases);
}

// export async function POST(req: NextRequest) {
//   const session = await auth.api.getSession({
//     headers: await headers(), // you need to pass the headers object.
//   });

//   if (!session) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const validation = PurchaseCreateSchema.safeParse(body);

//   if (!validation.success) {
//     return NextResponse.json(validation.error.errors, { status: 400 });
//   }

//   const { items, ...purchaseData } = validation.data;

//   const newPurchase = await db
//     .insert(purchases)
//     .values({
//       ...purchaseData,
//       totalAmount: purchaseData.totalAmount.toString(),
//       paidAmount: purchaseData.paidAmount.toString(),
//       receivedAt: new Date(),
//       supplierId: purchaseData.supplierId || null,
//       status: purchaseData.status,
//       createdBy: session.user.id,
//     })
//     .returning();

//   const purchaseId = newPurchase[0].id;

//   const newPurchaseItems = items.map((item) => ({
//     ...item,
//     purchaseId,
//     costPrice: item.costPrice.toString(), // Convert decimal to string
//   }));

//   await db.insert(purchaseItems).values(newPurchaseItems);

//   return NextResponse.json(newPurchase[0]);
// }






export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = PurchaseCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { items, ...purchaseData } = validation.data;

  try {
    const result = await db.transaction(async (tx) => {
      // Step 1: Insert the main purchase record.
      // We use array destructuring to get the first (and only) result.
      const [newPurchase] = await tx
        .insert(purchases)
        .values({
          ...purchaseData,
          createdBy: session.user.id,
          createdAt: new Date(),
          totalAmount: purchaseData.totalAmount.toString(),
          paidAmount: purchaseData.paidAmount.toString(),
          // Only set the 'receivedAt' timestamp if the status confirms receipt.
          receivedAt: purchaseData.status === "RECEIVED" ? new Date() : null,
        })
        .returning();

      // Step 2: Prepare and insert all purchase items in a single batch.
      const purchaseItemsValues = items.map((item) => ({
        ...item,
        purchaseId: newPurchase.id,
        costPrice: item.costPrice.toString(), // Convert decimal to string
      }));
      await tx.insert(purchaseItems).values(purchaseItemsValues);

      // Step 3: Only update inventory if the purchase status is 'RECEIVED'.
      // This prevents draft or pending purchases from affecting stock levels.
      if (purchaseData.status === "RECEIVED") {
        
        // 3a. Atomically Update Inventory Stock (UPSERT)
        // Using a for...of loop is more reliable for sequential operations within a transaction.
// This sequential loop is the correct and reliable solution
for (const item of items) {
  await tx.insert(inventoryStock).values({
    productId: item.productId,
    quantity: item.quantity,
  }).onConflictDoUpdate({
    target: inventoryStock.productId,
    set: {
      quantity: sql`${inventoryStock.quantity} + ${item.quantity}`,
      lastUpdatedAt: new Date(),
    }
  });
}
        
        // 3b. Create all stock movement records in a single batch operation.
        const stockMovementValues = items.map((item) => ({
          productId: item.productId,
          type: "IN" as const,
          quantity: item.quantity,
          referenceType: "PURCHASE" as const,
          referenceId: newPurchase.id,
          createdBy: session.user.id,
        }));
        await tx.insert(stockMovements).values(stockMovementValues);
      }

      // Return the newly created purchase record.
      return newPurchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Purchase creation failed:", error);
    return NextResponse.json(
      { message: "Failed to create purchase", error: String(error) },
      { status: 500 }
    );
  }
}