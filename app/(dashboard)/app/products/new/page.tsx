"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ProductCreateSchema,
  ProductCreateType,
} from "@/schemas/product-schema";
import ImprovedBarcodeField from "@/components/improved-barcode-field";
import api from "@/apis";
import { SimpleSelect } from "@/components/SimpleSelect";

export default function NewProductPage() {
  const router = useRouter();
  const [createAnother, setCreateAnother] = useState(false);
  const { data: categories, isLoading: isLoadingCategories } = api.Category.GetAll.useQuery();

  const form = useForm<ProductCreateType>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: {
      barcode: "",
      name: "",
      description: "",
      sellingPrice: 0,
      categoryId: "",
    },
  });

  const {
    mutate: createProduct,
    isPending: isCreating,
    isSuccess,
  } = api.Product.Create.useMutation();

  useEffect(() => {
    if (isSuccess) {
      if (createAnother) {
        form.reset({
          barcode: "",
          name: "",
          description: "",
          unit: undefined,
          sellingPrice: 0,
          categoryId: "",
        });
      } else {
        router.push("/app/products");
      }
    }
  }, [isSuccess, createAnother, form, router]);

  async function onSubmit(data: ProductCreateType) {
    createProduct(data);
  }

  return (
    <div className="px-6 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Link href="/app/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => <ImprovedBarcodeField field={field} />}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
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
                      <Textarea
                        placeholder="Enter product description (optional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="lbs">Pounds</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="flex items-center space-x-2">
                <Switch
                  id="create-another"
                  checked={createAnother}
                  onCheckedChange={setCreateAnother}
                />
                <Label htmlFor="create-another">
                  Create and add another
                </Label>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="px-8 py-2 text-base"
                >
                  {isCreating ? "Creating..." : "Create Product"}
                </Button>
                <Link href="/app/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
