"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ProductUpdateSchema,
  ProductUpdateType,
} from "@/schemas/product-schema";
import ImprovedBarcodeField from "@/components/improved-barcode-field";
import api from "@/apis";

export default function UpdateProductPage() {
  const router = useRouter();

  const { product_id } = useParams<{
    product_id: string;
  }>();

  const { data: product, isLoading, isSuccess, isError, error } = api.Product.GetById.useQuery(product_id);

  const form = useForm<ProductUpdateType>({
    resolver: zodResolver(ProductUpdateSchema),
    defaultValues: {
      barcode: "",
    },
  });

  useEffect(() => {
    if (isSuccess) {
      form.setValue("barcode", product?.barcode);
      form.setValue("name", product?.name);
      form.setValue("description", product?.description);
      form.setValue("unit", product?.unit);
      product?.sellingPrice &&form.setValue("sellingPrice", parseInt(product?.sellingPrice));
    }
  }, [isSuccess, router]);


  const {
    mutate: UpdateProduct,
    isPending: isCreating,
    isSuccess: isUpdated,
    isError: isCreationError,
    error: creationError,
  } = api.Product.Update.useMutation();

  useEffect(() => {
    if (isUpdated) {
      router.push("/app/products");
    }
  }, [isUpdated, router]);

  async function onSubmit(data: ProductUpdateType) {
    UpdateProduct({
      id: product_id,
      data,
    });
  }

  return (
    <div className="px-6  flex flex-col gap-4">
      <div className="flex flex-col  gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Update a new product in your catalog
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>x``
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
                        defaultValue={field.value}
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

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="px-8 py-2 text-base"
                >
                  {isCreating ? "Creating..." : "Update Product"}
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
