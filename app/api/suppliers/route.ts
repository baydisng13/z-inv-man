import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const supplierSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allSuppliers = await db.select().from(suppliers);
  return NextResponse.json(allSuppliers);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = supplierSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const newSupplier = await db
    .insert(suppliers)
    .values({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      country: body.country,  
      createdBy: session.user.id,
      tin_number: body.tin_number,
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json(newSupplier[0]);
}
