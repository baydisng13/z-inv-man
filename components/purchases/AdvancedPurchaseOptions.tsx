"use client";

import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaymentStatusEnum, PurchaseCreateType, PurchaseStatusEnum } from "@/schemas/purchase-schema";

const AdvancedPurchaseOptions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormContext<PurchaseCreateType>();
  const paymentStatus = form.watch("paymentStatus");

  return (
    <div className="p-4 border rounded-lg">
      {/* Header (acts as a toggle) */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-lg font-medium">Advanced</h3>
        <Button type="button" variant="ghost" size="sm" className="w-9 p-0">
          <ChevronsUpDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          <span className="sr-only">Toggle</span>
        </Button>
      </div>

      {/* Content (always mounted, just hidden when closed) */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[800px] opacity-100 pt-4" : "max-h-0 opacity-0 pt-0"
        }`}
      >
        <div className="space-y-4">
          {/* Payment Status */}
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PaymentStatusEnum.enum).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Paid Amount */}
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
                      value={field.value || ""}
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

          {/* Order Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PurchaseStatusEnum.enum).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedPurchaseOptions;
