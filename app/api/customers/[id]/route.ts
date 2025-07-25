import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { CustomerUpdateSchema } from "@/schemas/customer-schema";
import { eq } from "drizzle-orm";
import { customers } from "@/db/schema/product-schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await db
    .select()
    .from(customers)
    .where(eq(customers.id, params.id));
  if (data.length === 0) {
    return NextResponse.json({ message: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(data[0]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const validatedData = CustomerUpdateSchema.parse(body);
  const data = await db
    .update(customers)
    .set(validatedData)
    .where(eq(customers.id, params.id))
    .returning();
  return NextResponse.json(data[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.delete(customers).where(eq(customers.id, params.id));
  return NextResponse.json({ message: "Customer deleted" });
}