import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const supplierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supplier = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, params.id));

  if (supplier.length === 0) {
    return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
  }

  return NextResponse.json(supplier[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = supplierUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const updatedSupplier = await db
    .update(suppliers)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(eq(suppliers.id, params.id))
    .returning();

  if (updatedSupplier.length === 0) {
    return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
  }

  return NextResponse.json(updatedSupplier[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const deletedSupplier = await db
    .delete(suppliers)
    .where(eq(suppliers.id, params.id))
    .returning();

  if (deletedSupplier.length === 0) {
    return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Supplier deleted successfully" });
}
