import {
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ErrorRes } from "@/types";
import {
  InventoryStockType,
} from "@/schemas/inventory-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";

// API Functions
export async function getInventoryStockFn(params?: { productId?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<InventoryStockType[]>(`/api/inventory${queryParams}`)).data;
}

// React Query Hooks
export const Inventory = {
  GetAllStock: {
    useQuery: (
      params?: { productId?: string },
      options?: UseQueryOptions<InventoryStockType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<InventoryStockType[], AxiosError<ErrorRes>>({
        queryKey: ["InventoryStock", params],
        queryFn: () => getInventoryStockFn(params),
        ...options,
      });
    },
  },
};
