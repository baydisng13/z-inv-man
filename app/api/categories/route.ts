
import { db } from "@/db";
import { categories } from "@/db/schema/product-schema";
import { CategoryCreateSchema } from "@/schemas/category-schema";

export async function GET(request: Request) {
  try {
    const data = await db.select().from(categories);
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { message: "An error occurred while fetching categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = CategoryCreateSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { message: "Validation failed", errors: validation.error.formErrors },
        { status: 400 }
      );
    }

    const [newCategory] = await db
      .insert(categories)
      .values(validation.data)
      .returning();

    return Response.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      { message: "An error occurred while creating the category." },
      { status: 500 }
    );
  }
}
