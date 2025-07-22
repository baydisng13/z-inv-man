import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import queryClient from "@/lib/queryClient";
import { ErrorRes } from "@/types";
import {
  PurchaseType,
  PurchaseCreateType,
  PurchaseUpdateType,
  PurchaseItemWithProductType,
} from "@/schemas/purchase-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { SupplierType } from "@/schemas/supplier-schema";
import { User } from "better-auth";

// type
interface PurchaseItemWithProductResType {
  id: string;
  supplierId: string;
  totalAmount: string;
  paidAmount: string;
  paymentStatus: string;
  status: string;
  receivedAt: any;
  createdBy: string;
  createdAt: string;
  createdByUser: User
  supplier: SupplierType
}

// API Functions
export async function getPurchaseOrdersFn(params?: {
  page?: number;
  search?: string;
}) {
  const queryParams = buildQueryParams(params);
  return (
    await axiosInstance.get<PurchaseItemWithProductResType[]>(
      `/api/purchases${queryParams}`
    )
  ).data;
}

export async function getPurchaseOrderByIdFn(id: string) {
  return (await axiosInstance.get<PurchaseType>(`/api/purchases/${id}`)).data;
}

export async function createPurchaseOrderFn(data: PurchaseCreateType) {
  return (await axiosInstance.post<PurchaseType>("/api/purchases", data)).data;
}

export async function updatePurchaseOrderFn({
  id,
  data,
}: {
  id: string;
  data: PurchaseUpdateType;
}) {
  return (await axiosInstance.put<PurchaseType>(`/api/purchases/${id}`, data))
    .data;
}

export async function deletePurchaseOrderFn(id: string) {
  return (await axiosInstance.delete<PurchaseType>(`/api/purchases/${id}`))
    .data;
}

// React Query Hooks
export const Purchase = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<
        PurchaseItemWithProductResType[],
        AxiosError<ErrorRes>
      >
    ) => {
      return useQuery({
        queryKey: ["PurchaseOrders", params],
        queryFn: () => getPurchaseOrdersFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<PurchaseType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<PurchaseType, AxiosError<ErrorRes>>({
        queryKey: ["PurchaseOrder", id],
        queryFn: () => getPurchaseOrderByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        PurchaseType,
        AxiosError<ErrorRes>,
        PurchaseCreateType
      >
    ) => {
      return useMutation<
        PurchaseType,
        AxiosError<ErrorRes>,
        PurchaseCreateType
      >({
        mutationFn: createPurchaseOrderFn,
        onMutate: () => toast.loading("Creating purchase order..."),
        onSuccess: () => {
          toast.success("Purchase order created successfully");
          queryClient.invalidateQueries({ queryKey: ["PurchaseOrders"] });
        },
        onError: (err) => {
          toast.error(
            err.response?.data.message || "Failed to create purchase order"
          );
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        PurchaseType,
        AxiosError<ErrorRes>,
        { id: string; data: PurchaseUpdateType }
      >
    ) => {
      return useMutation<
        PurchaseType,
        AxiosError<ErrorRes>,
        { id: string; data: PurchaseUpdateType }
      >({
        mutationFn: updatePurchaseOrderFn,
        onMutate: () => toast.loading("Updating purchase order..."),
        onSuccess: (data) => {
          toast.success("Purchase order updated successfully");
          queryClient.invalidateQueries({ queryKey: ["PurchaseOrders"] });
          queryClient.invalidateQueries({
            queryKey: ["PurchaseOrder", data.id],
          });
        },
        onError: (err) => {
          toast.error(
            err.response?.data.message || "Failed to update purchase order"
          );
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<PurchaseType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<PurchaseType, AxiosError<ErrorRes>, string>({
        mutationFn: deletePurchaseOrderFn,
        onMutate: () => toast.loading("Deleting purchase order..."),
        onSuccess: (_, id) => {
          toast.success("Purchase order deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["PurchaseOrders"] });
          queryClient.removeQueries({ queryKey: ["PurchaseOrder", id] });
        },
        onError: (err) => {
          toast.error(
            err.response?.data.message || "Failed to delete purchase order"
          );
        },
        ...options,
      });
    },
  },
};
