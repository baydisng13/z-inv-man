import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  barcode: z.string().min(1).optional(),
  description: z.string().optional(),
  unit: z.string().min(1).optional(),
  sellingPrice: z.number().positive().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id));

  if (product.length === 0) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = productUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const updatedProduct = await db
    .update(products)
    .set({
      ...(() => {
        const { sellingPrice, ...rest } = validation.data;
        return rest;
      })(),
      ...(validation.data.sellingPrice !== undefined
        ? { sellingPrice: String(validation.data.sellingPrice) }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(products.id, params.id))
    .returning();

  if (updatedProduct.length === 0) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updatedProduct[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = z.object({ isArchived: z.boolean() }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const archivedProduct = await db
    .update(products)
    .set({ isArchived: validation.data.isArchived, updatedAt: new Date() })
    .where(eq(products.id, params.id))
    .returning();

  if (archivedProduct.length === 0) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(archivedProduct[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const deletedProduct = await db
    .delete(products)
    .where(eq(products.id, params.id))
    .returning();

  if (deletedProduct.length === 0) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(deletedProduct[0]);
}
