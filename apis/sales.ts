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

import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { SalesCreateType, SalesType, SalesUpdateType } from "@/schemas/sales-schema";

// API Functions
export async function getSalesFn(params?: { page?: number; search?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<SalesType[]>(`/api/sales${queryParams}`)).data;
}

export async function getSalesByIdFn(id: string) {
  return (await axiosInstance.get<SalesType>(`/api/sales/${id}`)).data;
}

export async function createSalesFn(data: SalesCreateType) {
  return (await axiosInstance.post<SalesType>("/api/sales", data)).data;
}

export async function updateSalesFn({
  id,
  data,
}: {
  id: string;
  data: SalesUpdateType;
}) {
  return (await axiosInstance.put<SalesType>(`/api/sales/${id}`, data))
    .data;
}

export async function deleteSalesFn(id: string) {
  return (await axiosInstance.delete<SalesType>(`/api/sales/${id}`)).data;
}

// React Query Hooks
export const Sales = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<SalesType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<SalesType[], AxiosError<ErrorRes>>({
        queryKey: ["Sales"],
        queryFn: () => getSalesFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<SalesType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<SalesType, AxiosError<ErrorRes>>({
        queryKey: ["Sales", id],
        queryFn: () => getSalesByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        SalesType,
        AxiosError<ErrorRes>,
        SalesCreateType
      >
    ) => {
      return useMutation<
        SalesType,
        AxiosError<ErrorRes>,
        SalesCreateType
      >({
        mutationFn: createSalesFn,
        onSuccess: () => {
          toast("Sales created successfully");
          queryClient.invalidateQueries({ queryKey: ["Sales"]});
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to create sales");
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        SalesType,
        AxiosError<ErrorRes>,
        { id: string; data: SalesUpdateType }
      >
    ) => {
      return useMutation<
        SalesType,
        AxiosError<ErrorRes>,
        { id: string; data: SalesUpdateType }
      >({
        mutationFn: updateSalesFn,
        onSuccess: (data) => {
          toast("Sales updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Sales"] });
          queryClient.invalidateQueries({ queryKey: ["Sales", data.id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to update sales");
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<SalesType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<SalesType, AxiosError<ErrorRes>, string>({
        mutationFn: deleteSalesFn,
        onSuccess: (_, id) => {
          toast("Sales deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["Sales"] });
          queryClient.removeQueries({ queryKey: ["Sales", id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to delete sales");
        },
        ...options,
      });
    },
  },
};
