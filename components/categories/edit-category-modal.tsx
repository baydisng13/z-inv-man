
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/apis";
import {
  CategoryType,
  categoryUpdateSchema,
  CategoryUpdateType,
} from "@/schemas/category-schema";
import { Loader } from "lucide-react";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryType;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
}: EditCategoryModalProps) {
  const form = useForm<CategoryUpdateType>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: category.name,
    },
  });

  const { mutate: updateCategory, isPending: isUpdating } = api.Category.Update.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (category) {
      form.reset(category);
    }
  }, [category, form]);

  async function onSubmit(data: CategoryUpdateType) {
    updateCategory({ id: category.id, data });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="gap-4 grid grid-cols-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Category Name</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 col-span-2 py-6">
              <Button type="button" variant="outline" size={"sm"} className="text-xs" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} size={"sm"} className="text-xs">
                {
                  isUpdating && <Loader className="animate-spin h-4 w-4 mr-2" />
                }
                Update Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
