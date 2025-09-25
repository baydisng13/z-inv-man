import { db } from "@/db";
import {
  inventoryStock,
  purchaseItems,
  purchases,
  stockMovements
} from "@/db/schema/product-schema";
import { auth } from "@/lib/auth";
import { PurchaseCreateSchema } from "@/schemas/purchase-schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function IsAuthnticated() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    return session;
  } catch (error) {
    // redirect to login page
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  const session = await IsAuthnticated();

  const allPurchases = await db.query.purchases.findMany({
    with: {
      createdByUser: true,
      supplier: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json(allPurchases);
}

// export async function POST(req: NextRequest) {
//   try {
//     // Step 1: Authentication & Authorization
//     // Uses the standard next-auth helper to get the session.
//     // This is more robust than manually handling headers.
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }
//     const userId = session.user.id;

//     // Step 2: Request Body Parsing and Validation
//     // The request body is parsed and then validated against the Zod schema.
//     const body = await req.json();
//     const validation = PurchaseCreateSchema.safeParse(body);

//     if (!validation.success) {
//       // If validation fails, return a 400 response with detailed errors.
//       return NextResponse.json(
//         {
//           message: "Invalid request data",
//           errors: validation.error.flatten().fieldErrors,
//         },
//         { status: 400 }
//       );
//     }

//     // Destructure validated data for easier access.
//     const { items, ...purchaseData } = validation.data;

//     // Step 3: Database Transaction
//     // A transaction ensures that all database operations are atomic.
//     // If any part of this block fails, all previous operations are rolled back.
//     const newPurchase = await db.transaction(async (tx) => {
//       // 3a: Insert the main purchase record.
//       const [createdPurchase] = await tx
//         .insert(purchases)
//         .values({
//           ...purchaseData,
//           // Storing monetary values as strings is a good practice to avoid float precision issues.
//           totalAmount: purchaseData.totalAmount.toString(),
//           paidAmount: purchaseData.paidAmount.toString(),
//           // Conditionally set the 'receivedAt' timestamp.
//           receivedAt: purchaseData.status === "RECEIVED" ? new Date() : null,
//           createdBy: userId,
//           // createdAt is set by default in the schema or here. Let's be explicit.
//           createdAt: new Date(),
//         })
//         .returning(); // .returning() gets the newly created record back.

//         console.log("Created purchase:", createdPurchase);

//       // 3b: Prepare and insert all purchase items in a single batch.
//       if (items.length > 0) {
//         const purchaseItemsValues = items.map((item) => ({
//           ...item,
//           purchaseId: createdPurchase.id,
//           costPrice: item.costPrice.toString(), // Convert decimal to string
//         }));
//         await tx.insert(purchaseItems).values(purchaseItemsValues);
//       }

//       console.log("Inserted purchase items");

//       // 3c: Only update inventory if the purchase status is 'RECEIVED'.
//       if (purchaseData.status === "RECEIVED" && items.length > 0) {
//         // 3c-i: Atomically update inventory for each item.
//         for (const item of items) {
//           await tx
//             .update(inventoryStock)
//             .set({
//               quantity: sql`${inventoryStock.quantity} + ${item.quantity}`,
//               lastUpdatedAt: sql`NOW()`,
//             })
//             .where(eq(inventoryStock.productId, item.productId));
//           }

//         console.log("Updated inventory stock");

//         // 3c-ii: Create all stock movement records in a single batch for auditing.
//         const stockMovementValues = items.map((item) => ({
//           productId: item.productId,
//           type: "IN" as const,
//           quantity: item.quantity,
//           referenceType: "PURCHASE" as const,
//           referenceId: createdPurchase.id,
//           createdBy: userId,
//         }));
//         await tx.insert(stockMovements).values(stockMovementValues);

//         console.log("Created stock movement records");
//       }

//       // Return the newly created purchase record from the transaction.
//       return createdPurchase;
//     });

//     // Step 4: Success Response
//     // If the transaction is successful, return the created purchase with a 201 status.
//     return NextResponse.json(newPurchase, { status: 201 });
//   } catch (error) {
//     // Step 5: Global Error Handling
//     console.error("Purchase creation failed:", error);
//     // Return a generic 500 error to avoid leaking implementation details.
//     return NextResponse.json(
//       { message: "Failed to create purchase due to a server error." },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validation = PurchaseCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, ...purchaseData } = validation.data;

    const newPurchase = await db.transaction(async (tx) => {
      const [createdPurchase] = await tx
        .insert(purchases)
        .values({
          ...purchaseData,
          totalAmount: purchaseData.totalAmount.toString(),
          paidAmount: purchaseData.paidAmount.toString(),
          receivedAt: purchaseData.status === "RECEIVED" ? new Date() : null,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      if (items.length > 0) {
        const purchaseItemsValues = items.map((item) => ({
          ...item,
          purchaseId: createdPurchase.id,
          costPrice: item.costPrice.toString(),
        }));
        await tx.insert(purchaseItems).values(purchaseItemsValues);
      }

      if (purchaseData.status === "RECEIVED" && items.length > 0) {
        for (const item of items) {
          await tx
            .insert(inventoryStock).values({
              productId: item.productId,
              purchaseId: createdPurchase.id,
              quantity: item.quantity,
            })
        }

        const stockMovementValues = items.map((item) => ({
          productId: item.productId,
          type: "IN" as const,
          quantity: item.quantity,
          referenceType: "PURCHASE" as const,
          referenceId: createdPurchase.id,
          createdBy: userId,
        }));
        await tx.insert(stockMovements).values(stockMovementValues);
      }

      return createdPurchase;
    });

    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error("Purchase creation failed:", error);
    return NextResponse.json(
      { message: "Failed to create purchase due to a server error." },
      { status: 500 }
    );
  }
}