import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ErrorRes } from "@/types";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { ProductType } from "@/schemas/product-schema";
import { InventoryStockType } from "@/schemas/inventory-schema";

// type

export type InventoryStockGetResponse = {
  inventory_stock: InventoryStockType;
  products: ProductType;
};

// API Functions
export async function getInventoryStockFn(params?: { productId?: string }) {
  const queryParams = buildQueryParams(params);
  return (
    await axiosInstance.get<InventoryStockGetResponse[]>(
      `/api/inventory${queryParams}`
    )
  ).data;
}

// React Query Hooks
export const Inventory = {
  GetAllStock: {
    useQuery: (
      params?: { productId?: string },
      options?: UseQueryOptions<InventoryStockGetResponse[], AxiosError<ErrorRes>>
    ) => {
      return useQuery({
        queryKey: ["InventoryStock", params],
        queryFn: () => getInventoryStockFn(params),
        ...options,
      });
    },
  },
};
