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
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allSales = await db.select().from(sales);
  return NextResponse.json(allSales);
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

  // Destructure saleItemsData and the rest of saleData
  const { saleItems: saleItemsData, ...saleData } = validation.data;

  try {
    const newSale = await db.transaction(async (tx) => {
      // Insert the main sale record
      // Ensure saleData properties match the sales schema and types (especially customerId)
      const [insertedSale] = await tx
        .insert(sales)
        .values({
          // Make sure saleData.customerId is indeed a string (UUID)
          // Drizzle usually handles string for uuid correctly
          customerId: saleData.customerId,
          subtotal: saleData.subtotal.toString(), // Convert decimals to string for Drizzle
          discount: saleData.discount.toString(), // Convert decimals to string for Drizzle
          totalAmount: saleData.totalAmount.toString(), // Convert decimals to string for Drizzle
          paidAmount: saleData.paidAmount.toString(), // Convert decimals to string for Drizzle
          paymentStatus: saleData.paymentStatus,
          status: saleData.status,
          createdBy: session.user.id,
          createdAt: new Date(), // Drizzle's defaultNow() handles this if omitted, but explicit is fine
          taxAmount: saleData.taxAmount.toString(), // Convert decimals to string for Drizzle
          includeTax: saleData.includeTax,
          // updatedAt: new Date(), // If you want to explicitly set updatedAt now, though Drizzle's defaultNow() will handle it
        })
        .returning();

      const saleId = insertedSale.id;

      // Prepare sale items for insertion
      const newSaleItems = saleItemsData.map((item) => ({
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(), // Convert to string for decimal column
        total: item.total.toString(), // Convert to string for decimal column
        // IMPORTANT: Only include properties that exist in your `saleItems` Drizzle schema.
        // Remove `productCode` and `productName` if they are not in the database table.
        // For example, if your form data also contains `productCode` and `productName`,
        // you would explicitly pick the fields needed for the DB:
        // productId: item.productId,
        // quantity: item.quantity,
        // unitPrice: item.unitPrice.toString(),
        // total: item.total.toString(),
      }));

      // Insert all sale items in a batch
      await tx.insert(saleItems).values(newSaleItems);

      return insertedSale; // Return the single inserted sale object
    });

    return NextResponse.json(newSale, { status: 201 }); // Return the object directly
  } catch (error) {
    console.error("Error creating sale:", error);
    // You might want more granular error handling here
    return NextResponse.json(
      { message: "Failed to create sale", error: error },
      { status: 500 }
    );
  }
}
