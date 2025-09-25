import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryStock, products, suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq, and, or, like, asc, desc, sql, getTableColumns } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InventoryStockGetResponse } from "@/apis/inventory";

const inventoryUpdateSchema = z.object({
  supplierId: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const productColumns = getTableColumns(products);

  const query = db.select({
    productId: inventoryStock.productId,
    totalQuantity: sql<number>`SUM(${inventoryStock.quantity})`,
    latestUpdated: sql<Date>`MAX(${inventoryStock.lastUpdatedAt})`,
    firstCreated: sql<Date>`MIN(${inventoryStock.createdAt})`,
    products: products
  })
    .from(inventoryStock)
    .leftJoin(products, eq(inventoryStock.productId, products.id))

  const result = await query.groupBy(
    inventoryStock.productId,
    ...Object.values(productColumns)
  )

  const createDefaultProduct = () => ({
    id: "",
    name: "",
    barcode: "",
    unit: "",
    sellingPrice: "0",
    createdBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    categoryId: "0"
  });

  const transformProduct = (product: typeof result[0]['products']) => {
    //hm,this is to make ts error go away 
    // i think it is better to return null or undefined then handle in the front or filter it out
    if (!product) return createDefaultProduct();

    return {
      ...product,
      categoryId: product.categoryId.toString(),
      description: product.description ?? undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  };

  const transformInventoryStock = (row: typeof result[0]) => {
    return {
      id: row.productId,
      productId: row.productId,
      quantity: row.totalQuantity,
      lastUpdatedAt: new Date(row.latestUpdated).toISOString(),
      createdAt: new Date(row.firstCreated).toISOString()
    }
  }

  const transformedQuery: InventoryStockGetResponse[] = result.map(row => ({
    inventory_stock: transformInventoryStock(row),
    products: transformProduct(row.products)
  }));

  return NextResponse.json(transformedQuery);
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // if there is a missmatch between the the stock level it coun be ajusted to the correct amount without adding a purchase or a sells
  return NextResponse.json({ message: "Functionality not clear" }, { status: 501 });
}


const inventoryPostBodySchema = z.object({
  productId: z.string().uuid(),
  purchaseId: z.string().uuid(),
  quantity: z.number().min(1),
});

type InventoryPostBody = z.infer<typeof inventoryPostBodySchema>;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: InventoryPostBody = await req.json();

  inventoryPostBodySchema.parse(body);

  const { productId, purchaseId, quantity } = body;

  const newInventory = await db
    .insert(inventoryStock)
    .values({
      productId,
      purchaseId,
      quantity,
      lastUpdatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(newInventory[0]);
}