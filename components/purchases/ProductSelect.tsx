"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";

import api from "@/apis"; // Assuming your API hook for products is here
import { AdvancedSelect } from "../AdvancedSelectInput";

interface ProductSelectProps {
  control: Control<any>;
  name: string;
  errors: FieldErrors<any>;
  disabledProductIds?: string[]; // Pass the array of selected product IDs
}

const ProductSelect: React.FC<ProductSelectProps> = ({
  control,
  name,
  errors,
  disabledProductIds,
}) => {
  return (
    <AdvancedSelect
      control={control}
      name={name}
      errors={errors}
      // Provide the specific data fetching hook for products
      useQueryHook={api.Product.GetAll.useQuery} // Assumes this hook exists
      // Specify the keys for value ("id") and label ("name")
      itemValueKey="id"
      itemLabelKey="name"
      // UI Text
      selectPlaceholder="Select a product"
      searchPlaceholder="Search products..."
      emptyStateText="No product found."
      newItemPageUrl="/app/products/new"
      disabledItemValues={disabledProductIds}
      popoverContentClassName="w-[200px]"
    />
  );
};

export default ProductSelect;
