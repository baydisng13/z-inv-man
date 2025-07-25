"use client";

import React, { useMemo } from "react";
import { Control, FieldErrors } from "react-hook-form";

import api from "@/apis";
import { SimpleSelect } from "../SimpleSelect";

interface ProductSelectProps {
  name: string;
  disabledProductIds?: string[];
}

const ProductSelect: React.FC<ProductSelectProps> = ({
  name,
  disabledProductIds,
}) => {
  const { data: products, isLoading } = api.Product.GetAll.useQuery();

  const options = useMemo(() => {
    if (!products) return [];
    return products
      .map((product) => ({
        label: product.name,
        value: product.id,
      }));
  }, [products, disabledProductIds]);

  return (
    <SimpleSelect
      name={name}
      placeholder="Select a product"
      searchPlaceholder="Search products..."
      emptyStateText={isLoading ? "Loading products..." : "No product found."}
      options={options}
      isLoading={isLoading}
      disabledKeys={disabledProductIds} 
    />
  );
};

export default ProductSelect;