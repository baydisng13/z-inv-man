import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { CustomerCreateSchema, CustomerSchema } from "@/schemas/customer-schema";
import { eq } from "drizzle-orm";
import { customers } from "@/db/schema/product-schema";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
  const data = await db.query.customers.findMany({
    with: {
      createdByUser: true,
    },
  });
  return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ message: "Error fetching customers" , error}, { status: 500 });
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
  const validatedData = CustomerCreateSchema.parse(body);
  const data = await db.insert(customers).values({
    ...validatedData,
    createdAt: new Date(),
    createdBy: session.user.id,
  }).returning();
  return NextResponse.json(data[0]);
}