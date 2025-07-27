
"use client";
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

import api from "@/apis";
import {
  CategoryCreateSchema,
  CategoryCreateType,
  CategoryType,
} from "@/schemas/category-schema";
import { useGlobalModal } from "@/store/useGlobalModal";
import { Loader } from "lucide-react";

interface NewCategoryModalProps {
  onSuccess?: (data: CategoryType) => void;
}

export default function NewCategoryModal({
  onSuccess,
}: NewCategoryModalProps) {

  const {isOpen , closeModal} = useGlobalModal()
  const form = useForm<CategoryCreateType>({
    resolver: zodResolver(CategoryCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    mutate: createCategory,
    isPending: isCreating,
    isSuccess: isCreated,
    data: responseData,
  } = api.Category.Create.useMutation();


  useEffect(() => {
    if (isCreated) {
      closeModal();
      if (onSuccess) onSuccess(responseData);
      form.reset();
    }
  }, [isCreated]);

  async function onSubmit(data: CategoryCreateType) {
    createCategory(data);
  }

  return (

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
              <Button type="button" variant="outline" size={"sm"} className="text-xs" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} size={"sm"} className="text-xs">
                {
                  isCreating && <Loader className="animate-spin h-4 w-4 mr-2" />
                }
                Create Category
              </Button>
            </div>
          </form>
        </Form>

  );
}
