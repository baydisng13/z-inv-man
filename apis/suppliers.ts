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
  SupplierType,
  SupplierCreateType,
  SupplierUpdateType,
} from "@/schemas/supplier-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";

// API Functions
export async function getSuppliersFn(params?: { page?: number; search?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<SupplierType[]>(`/api/suppliers${queryParams}`)).data;
}

export async function getSupplierByIdFn(id: string) {
  return (await axiosInstance.get<SupplierType>(`/api/suppliers/${id}`)).data;
}

export async function createSupplierFn(data: SupplierCreateType) {
  return (await axiosInstance.post<SupplierType>("/api/suppliers", data)).data;
}

export async function updateSupplierFn({
  id,
  data,
}: {
  id: string;
  data: SupplierUpdateType;
}) {
  return (await axiosInstance.put<SupplierType>(`/api/suppliers/${id}`, data))
    .data;
}

export async function deleteSupplierFn(id: string) {
  return (await axiosInstance.delete<SupplierType>(`/api/suppliers/${id}`)).data;
}

// React Query Hooks
export const Supplier = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<SupplierType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<SupplierType[], AxiosError<ErrorRes>>({
        queryKey: ["Suppliers"],
        queryFn: () => getSuppliersFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<SupplierType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<SupplierType, AxiosError<ErrorRes>>({
        queryKey: ["Supplier", id],
        queryFn: () => getSupplierByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        SupplierType,
        AxiosError<ErrorRes>,
        SupplierCreateType
      >
    ) => {
      return useMutation<
        SupplierType,
        AxiosError<ErrorRes>,
        SupplierCreateType
      >({
        mutationFn: createSupplierFn,
        onSuccess: () => {
          toast("Supplier created successfully");
          queryClient.invalidateQueries({ queryKey: ["Suppliers"]});
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to create supplier");
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        SupplierType,
        AxiosError<ErrorRes>,
        { id: string; data: SupplierUpdateType }
      >
    ) => {
      return useMutation<
        SupplierType,
        AxiosError<ErrorRes>,
        { id: string; data: SupplierUpdateType }
      >({
        mutationFn: updateSupplierFn,
        onSuccess: (data) => {
          toast("Supplier updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
          queryClient.invalidateQueries({ queryKey: ["Supplier", data.id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to update supplier");
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<SupplierType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<SupplierType, AxiosError<ErrorRes>, string>({
        mutationFn: deleteSupplierFn,
        onSuccess: (_, id) => {
          toast("Supplier deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
          queryClient.removeQueries({ queryKey: ["Supplier", id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to delete supplier");
        },
        ...options,
      });
    },
  },
};
