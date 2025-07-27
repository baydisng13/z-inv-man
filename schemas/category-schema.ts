import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
});

export type CategoryCreateType = z.infer<typeof CategoryCreateSchema>;
export const categoryUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
});
export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;

export interface CategoryType extends CategoryCreateType {
  id: number;
  createdAt: string;
}

