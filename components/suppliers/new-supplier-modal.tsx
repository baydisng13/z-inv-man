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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/apis";
import {
  SupplierCreateSchema,
  SupplierCreateType,
  SupplierType,
} from "@/schemas/supplier-schema";
import { Separator } from "../ui/separator";
import { useGlobalModal } from "@/store/useGlobalModal";

interface NewSupplierModalProps {
  onSuccess?: (data: SupplierType) => void;
}

export default function NewSupplierModal({
  onSuccess,
}: NewSupplierModalProps) {

  const {isOpen , closeModal} = useGlobalModal()
  const form = useForm<SupplierCreateType>({
    resolver: zodResolver(SupplierCreateSchema),
    defaultValues: {
      tin_number: "",
    },
  });

  const {
    mutate: createSupplier,
    isPending: isCreating,
    isSuccess: isCreated,
    data: responseData,
  } = api.Supplier.Create.useMutation();


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

  async function onSubmit(data: SupplierCreateType) {
    createSupplier(data);
  }

  return (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tin_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN Number</FormLabel>
                  <div className="flex gap-2">
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
            <Separator />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                Create Supplier
              </Button>
            </div>
          </form>
        </Form>

  );
}
