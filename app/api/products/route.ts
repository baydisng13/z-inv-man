import { NextRequest, NextResponse } from "next/server";
import { products, inventoryStock } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq, and, or, like, asc, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { ProductWithCategoryType } from "@/schemas/product-schema";

const productSchema = z.object({
  name: z.string().min(1),
  barcode: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().min(1),
  sellingPrice: z.number().positive(),
});


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const showArchived = searchParams.get("isArchived") === "true";

  const sortBy = searchParams.get("sortBy");
  const sortField = sortBy === "price" ? "price" : "name";

  try {
    const allProducts = await db.query.products.findMany({
      ...(showArchived ? {} : { where: eq(products.isArchived, false) }),
      with: {
        createdByUser: true,
        category: true,
        inventoryRecords: true
      },
      orderBy: (table) => {
        return sortField === "price"
          ? desc(table.sellingPrice)
          : asc(table.name);
      },
    });

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const { name, barcode, description, unit, sellingPrice } = validation.data;

  const newProduct = await db
    .insert(products)
    .values({
      name,
      barcode,
      description,
      unit,
      sellingPrice: sellingPrice.toString(),
      categoryId: body.categoryId,
      createdBy: session.user.id,
    })
    .returning();


  // hmm, i guess we don't need this right ? 
  // const newInventory = await db
  //   .insert(inventoryStock)
  //   .values({
  //     productId: newProduct[0].id,
  //     quantity: 0,
  //   })
  //   .returning();
  // console.log("New Inventory Record:", newInventory);

  return NextResponse.json(newProduct[0]);
}
