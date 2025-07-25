import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import AdvancedPurchaseOptions from "./AdvancedPurchaseOptions";
import { Separator } from "@/components/ui/separator";
import SupplierSelect from "./SupplierSelect";
import ProductSelect from "./ProductSelect";

export default function NewPurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const form = useForm<PurchaseCreateType>({
    resolver: zodResolver(PurchaseCreateSchema),
    defaultValues: {
      supplierId: null,
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

  const { mutate: createPurchaseOrder, isPending: isCreating , isSuccess: isCreated } =
    api.Purchase.Create.useMutation();


    useEffect(() => {
      if (isCreated) {
        form.reset();
        setIsOpen(false);
      }
    }, [isCreated]);

  async function onSubmit(data: PurchaseCreateType) {
    createPurchaseOrder(data);
  }
    
const items = useWatch({ control: form.control, name: "items" });
const paymentStatus = useWatch({ control: form.control, name: "paymentStatus" });


useEffect(() => {
  const total = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.costPrice || 0),
    0
  );

  form.setValue("totalAmount", total);

  if (paymentStatus === "PAID") {
    form.setValue("paidAmount", total);
  } else if (paymentStatus === "CREDIT") {
    form.setValue("paidAmount", 0);
  } else if (paymentStatus === "PARTIAL") {
    form.setValue("paidAmount", total);
  }
}, [items, paymentStatus, form]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Purchase Order</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[1000px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Items</h3>

                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                    {fields.map((field, index) => {
                      // Find all selected product IDs except current row
                      const selectedProductIds = form
                        .watch("items")
                        .map((item) => item.productId);

                      return (
                        <div key={index} className="space-y-2">
                          <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-center">
                            {/* Product Select */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.productId`}
                              render={() => (
                                // field is not needed here as ProductSelect handles it
                                <FormItem className="space-y-1">
                                  {index === 0 && (
                                    <FormLabel className="text-xs">
                                      Product
                                    </FormLabel>
                                  )}

                                  <ProductSelect
                                    name={`items.${index}.productId`}
                                    disabledProductIds={selectedProductIds}
                                  />

                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            {/* Quantity */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  {index === 0 && (
                                    <FormLabel className="text-xs">
                                      Qty
                                    </FormLabel>
                                  )}
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="h-8 text-xs"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />

                            {/* Cost Price */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.costPrice`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  {index === 0 && (
                                    <FormLabel className="text-xs">
                                      Item Cost
                                    </FormLabel>
                                  )}
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="h-8 text-xs"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />

                            {/* Remove Button */}
                            <div
                              className={cn(
                                "flex items-center justify-center",
                                index === 0 && "pt-5"
                              )}
                            >
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => remove(index)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Separator between rows */}
                          {index < fields.length - 1 && (
                            <Separator className="my-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Item Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      append({ productId: "", quantity: 1, costPrice: 0 })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {/* <pre>
                  {JSON.stringify(form.watch(), null, 2)}
                  {JSON.stringify(form.formState.errors, null, 2)}
                </pre> */}
              </div>

              <div className="col-span-1 space-y-6">
                <div className="p-4 border rounded-lg">
                  <SupplierSelect name="supplierId" />
                </div>

                <AdvancedPurchaseOptions />

                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Paid Amount</span>
                    <span>${form.watch("paidAmount").toFixed(2)}</span>
                  </div>
                  {/* remaining amount */}
                  <div className="flex justify-between">
                    <span>Remaining Amount</span>
                    <span>
                      $
                      {(
                        form.watch("totalAmount") - form.watch("paidAmount")
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>${form.watch("totalAmount").toFixed(2)}</span>
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
