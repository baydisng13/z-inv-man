import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Trash, ChevronsUpDown } from "lucide-react";
import api from "@/apis";
import {
  PurchaseCreateSchema,
  PurchaseCreateType,
  PaymentStatusEnum,
  PurchaseStatusEnum,
} from "@/schemas/purchase-schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NewPurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const form = useForm<PurchaseCreateType>({
    resolver: zodResolver(PurchaseCreateSchema),
    defaultValues: {
      supplierId: "",
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { mutate: createPurchaseOrder, isPending: isCreating } =
    api.Purchase.Create.useMutation({
      onSuccess: () => {
        toast.success("Purchase order created successfully!");
        setIsOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(`Failed to create purchase order: ${error.message}`);
      },
    });

  async function onSubmit(data: PurchaseCreateType) {
    createPurchaseOrder(data);
  }

  const { data: suppliers, isLoading: isLoadingSuppliers } =
    api.Supplier.GetAll.useQuery();
  const { data: products, isLoading: isLoadingProducts } =
    api.Product.GetAll.useQuery();

  const watchedItems = form.watch("items");
  const paymentStatus = form.watch("paymentStatus");

  useEffect(() => {
    const total = watchedItems.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.costPrice || 0),
      0
    );
    form.setValue("totalAmount", total);

    if (paymentStatus === "PAID") {
      form.setValue("paidAmount", total);
    } else if (paymentStatus === "UNPAID") {
      form.setValue("paidAmount", 0);
    }
  }, [watchedItems, paymentStatus, form]);

  useEffect(() => {
    if (!isAdvancedOpen) {
      form.setValue("paymentStatus", "PAID");
      form.setValue("status", "RECEIVED");
    }
  }, [isAdvancedOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Purchase Order</Button>
      </DialogTrigger>
      <DialogContent className="w-[1000px]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Items</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-start p-4 border rounded-md"
                      >
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Product
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingProducts ? (
                                    <SelectItem value="" disabled>
                                      Loading...
                                    </SelectItem>
                                  ) : (
                                    products?.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Quantity
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.costPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className={cn(index !== 0 && "sr-only")}
                              >
                                Cost Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Cost"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div
                          className={cn(
                            "flex items-center",
                            index === 0 ? "pt-8" : ""
                          )}
                        >
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      append({ productId: "", quantity: 1, costPrice: 0 })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="col-span-1 space-y-6">
                <div className="p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingSuppliers ? (
                              <SelectItem value="" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              suppliers?.map((supplier: any) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id}
                                >
                                  {supplier.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Collapsible
                  open={isAdvancedOpen}
                  onOpenChange={setIsAdvancedOpen}
                  className="p-4 border rounded-lg"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h3 className="text-lg font-medium">Advanced</h3>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(PaymentStatusEnum.enum).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {paymentStatus === "PARTIAL" && (
                      <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paid Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(PurchaseStatusEnum.enum).map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
                
                <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>${form.getValues('totalAmount').toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Paid Amount</span>
                        <span>${form.getValues('paidAmount').toFixed(2)}</span>
                    </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}