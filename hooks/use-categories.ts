
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/apis/categories";
import { Category, CategorySchema } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>(
    ["categories"],
    getCategories
  );

  const createMutation = useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast({ title: "Category created successfully" });
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: CategorySchema }) =>
      updateCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        toast({ title: "Category updated successfully" });
      },
    }
  );

  const deleteMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast({ title: "Category deleted successfully" });
    },
  });

  return {
    categories,
    isLoading,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
  };
};
