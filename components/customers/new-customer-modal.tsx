"use client";
import { use, useEffect, useState } from "react";
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
  CustomerCreateSchema,
  CustomerCreateType,
  CustomerType,
} from "@/schemas/customer-schema";
import { Separator } from "../ui/separator";
import { useGlobalModal } from "@/store/useGlobalModal";
import { Loader } from "lucide-react";

interface NewCustomerModalProps {
  onSuccess?: (data: CustomerType) => void;
}

export default function NewCustomerModal({
  onSuccess,
}: NewCustomerModalProps) {

  const {isOpen , closeModal} = useGlobalModal()
  const form = useForm<CustomerCreateType>({
    resolver: zodResolver(CustomerCreateSchema),
    defaultValues: {
      tin_number: "",
    },
  });

  const {
    mutate: createCustomer,
    isPending: isCreating,
    isSuccess: isCreated,
    data: responseData,
  } = api.Customer.Create.useMutation();


  const {
    mutate: getRegistrationInfoByTin,
    isPending: isVerifying,
    isSuccess: isFetched,
    data: registrationInfo,
  } = api.Helper.GetRegistrationInfoByTin.useMutation();

  useEffect(() => {
    if (isCreated) {
      closeModal();
      if (onSuccess) onSuccess(responseData);
      form.reset();
    }
  }, [isCreated]);

  useEffect(() => {
    // for tin number
    if (isFetched) {
      form.setValue("name", registrationInfo.BusinessName);
      form.setValue("address", registrationInfo.RegNo);
    }
  }, [isFetched]);

  async function onVerify() {
    const tin = form.watch("tin_number");
    if (tin) {
      getRegistrationInfoByTin(tin);
    } else {
      form.setError("tin_number", { message: "TIN number is required" });
    }
  }

  async function onSubmit(data: CustomerCreateType) {
    createCustomer(data);
  }

  return (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="gap-4 grid grid-cols-2">
            <FormField
              control={form.control}
              name="tin_number"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs">TIN Number</FormLabel>
                  <div className="flex gap-2 col-span-2">
                    <FormControl>
                      <Input className="text-xs" placeholder="Enter TIN number" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={onVerify}
                      disabled={isVerifying}
                      className="space-x-2 text-xs"
                    >
                      {isVerifying && <Loader className="animate-spin h-4 w-4 " />}
                      Verify TIN

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
                  <FormLabel className="text-xs">Customer Name</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="Enter customer name" {...field} />
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
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input className="text-xs" type="email" placeholder="Enter email" {...field} />
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
                  <FormLabel className="text-xs">Phone</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="Enter phone number" {...field} />
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
                  <FormLabel className="text-xs">Address</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="Enter address" {...field} />
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
                  <FormLabel className="text-xs">Country</FormLabel>
                  <FormControl>
                    <Input className="text-xs" placeholder="Enter country" {...field} />
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
                Create Customer
              </Button>
            </div>
          </form>
        </Form>

  );
}