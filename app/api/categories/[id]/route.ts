
import { db } from "@/db";
import { categories } from "@/db/schema/product-schema";
import { categoryUpdateSchema } from "@/schemas/category-schema";
import { eq } from "drizzle-orm";

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

    return Response.json( updatedCategory );
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
