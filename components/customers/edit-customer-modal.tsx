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
  CustomerType,
  CustomerUpdateSchema,
  CustomerUpdateType,
} from "@/schemas/customer-schema";
import { Separator } from "../ui/separator";

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerType;
}

export default function EditCustomerModal({
  isOpen,
  onClose,
  customer,
}: EditCustomerModalProps) {
  const form = useForm<CustomerUpdateType>({
    resolver: zodResolver(CustomerUpdateSchema),
    defaultValues: {
      name: customer.name,
    },
  });

  const { mutate: updateCustomer, isPending: isUpdating } =
    api.Customer.Update.useMutation({
      onSuccess: () => {
        onClose();
      },
    });

  const {
    mutate: getRegistrationInfoByTin,
    isPending: isVerifying,
    isSuccess: isFetched,
    data: registrationInfo,
  } = api.Helper.GetRegistrationInfoByTin.useMutation();

  useEffect(() => {
    if (customer) {
      form.reset(customer);
    }
  }, [customer, form]);

  async function onVerify() {
    const tin = form.watch("tin_number");
    if (tin) {
      getRegistrationInfoByTin(tin);
    } else {
      form.setError("tin_number", { message: "TIN number is required" });
    }
  }

  async function onSubmit(data: CustomerUpdateType) {
    updateCustomer({ id: customer.id, data });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="gap-4 grid grid-cols-2"
          >
            <FormField
              control={form.control}
              name="tin_number"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>TIN Number</FormLabel>
                  <div className="flex gap-2 col-span-2">
                    <FormControl>
                      <Input placeholder="Enter TIN number" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={onVerify}
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify TIN"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="my-4 col-span-2" />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 col-span-2 py-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                Update Customer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
