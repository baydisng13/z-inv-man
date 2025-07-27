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
import { Category } from "@/apis/categories";
import { Product } from "@/apis/products";
import { ProductType, ProductUpdateType, ProductUpdateSchema } from "@/schemas/product-schema";
import { SimpleSelect } from "@/components/SimpleSelect";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductType;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const { data: categories, isLoading: isLoadingCategories } = Category.GetAll.useQuery();

  const form = useForm<ProductUpdateType>({
    resolver: zodResolver(ProductUpdateSchema),
    defaultValues: {
      name: product.name,
      barcode: product.barcode,
      description: product.description,
      unit: product.unit,
      sellingPrice: Number(product.sellingPrice),
      categoryId: product.categoryId,
    },
  });

  const { mutate: updateProduct, isPending: isUpdating } = Product.Update.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        barcode: product.barcode,
        description: product.description,
        unit: product.unit,
        sellingPrice: Number(product.sellingPrice),
        categoryId: product.categoryId,
      });
    }
  }, [product, form]);

  const onSubmit = (data: ProductUpdateType) => {
    updateProduct({ id: product.id, data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter selling price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SimpleSelect
                      name="categoryId"
                      placeholder="Select a category"
                      isLoading={isLoadingCategories}
                      options={categories?.map((category) => ({
                        label: category.name,
                        value: category.id,
                      })) || []}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
