"use client";

import React from "react";
import { Control, FieldErrors } from "react-hook-form";

import api from "@/apis";
import NewSupplierModal from "../suppliers/new-supplier-modal";
import { AdvancedSelect } from "../AdvancedSelectInput";

interface SupplierSelectProps {
  control: Control<any>;
  name: string;
  errors: FieldErrors<any>;
}

const SupplierSelect: React.FC<SupplierSelectProps> = ({
  control,
  name,
  errors,
}) => {
  return (
    <AdvancedSelect
      // Pass react-hook-form props
      control={control}
      name={name}
      errors={errors}
      
      // Provide the specific data fetching hook for suppliers
      useQueryHook={api.Supplier.GetAll.useQuery}
      
      // Specify the keys for value ("id") and label ("name")
      itemValueKey="id"
      itemLabelKey="name"
      
      // Provide UI text for the supplier context
      label="Supplier"
      selectPlaceholder="Select supplier"
      searchPlaceholder="Search suppliers..."
      emptyStateText="No supplier found."
      
      // Provide the specific modal component for creating a new supplier
      NewItemModal={NewSupplierModal}
    />
  );
};

export default SupplierSelect;