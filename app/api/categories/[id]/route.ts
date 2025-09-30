
import { db } from "@/db";
import { categories } from "@/db/schema/product-schema";
import { auth } from "@/lib/auth";
import { categoryUpdateSchema } from "@/schemas/category-schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return Response.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const validation = categoryUpdateSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { message: "Validation failed", errors: validation.error.formErrors },
        { status: 400 }
      );
    }

    const [updatedCategory] = await db
      .update(categories)
      .set(validation.data)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json(updatedCategory);
  } catch (error) {
    console.error(`Error updating category ${(await params).id}:`, error);
    return Response.json(
      { message: "An error occurred while updating the category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { success } = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: {
          category: ['delete']
        }
      }
    })

    if (!success) {
      return NextResponse.json({ message: "You are not authorized to delete please contact the adminstrator" }, { status: 401 })
    }


    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return Response.json({ message: "Invalid ID" }, { status: 400 });
    }

    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(`Error deleting category ${(await params).id}:`, error);
    return Response.json(
      { message: "An error occurred while deleting the category." },
      { status: 500 }
    );
  }
}
