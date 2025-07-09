import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stockMovements } from "@/db/schema/product-schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(["IN", "OUT", "TRANSFER", "ADJUST"]),
  quantity: z.number().int().positive(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allStockMovements = await db.select().from(stockMovements);
  return NextResponse.json(allStockMovements);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  })
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = stockMovementSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const newStockMovement = await db
    .insert(stockMovements)
    .values({
      ...validation.data,
      createdBy: session.user.id,
    })
    .returning();

  return NextResponse.json(newStockMovement[0]);
}
