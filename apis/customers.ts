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
  CustomerType,
  CustomerCreateType,
  CustomerUpdateType,
} from "@/schemas/customer-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";

// API Functions
export async function getCustomersFn(params?: { page?: number; search?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<CustomerType[]>(`/api/customers${queryParams}`)).data;
}

export async function getCustomerByIdFn(id: string) {
  return (await axiosInstance.get<CustomerType>(`/api/customers/${id}`)).data;
}

export async function createCustomerFn(data: CustomerCreateType) {
  return (await axiosInstance.post<CustomerType>("/api/customers", data)).data;
}

export async function updateCustomerFn({
  id,
  data,
}: {
  id: string;
  data: CustomerUpdateType;
}) {
  return (await axiosInstance.put<CustomerType>(`/api/customers/${id}`, data))
    .data;
}

export async function deleteCustomerFn(id: string) {
  return (await axiosInstance.delete<CustomerType>(`/api/customers/${id}`)).data;
}

// React Query Hooks
export const Customer = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<CustomerType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<CustomerType[], AxiosError<ErrorRes>>({
        queryKey: ["Customers"],
        queryFn: () => getCustomersFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<CustomerType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<CustomerType, AxiosError<ErrorRes>>({
        queryKey: ["Customer", id],
        queryFn: () => getCustomerByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        CustomerType,
        AxiosError<ErrorRes>,
        CustomerCreateType
      >
    ) => {
      return useMutation<
        CustomerType,
        AxiosError<ErrorRes>,
        CustomerCreateType
      >({
        mutationFn: createCustomerFn,
        onSuccess: () => {
          toast("Customer created successfully");
          queryClient.invalidateQueries({ queryKey: ["Customers"]});
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to create customer");
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        CustomerType,
        AxiosError<ErrorRes>,
        { id: string; data: CustomerUpdateType }
      >
    ) => {
      return useMutation<
        CustomerType,
        AxiosError<ErrorRes>,
        { id: string; data: CustomerUpdateType }
      >({
        mutationFn: updateCustomerFn,
        onSuccess: (data) => {
          toast("Customer updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Customers"] });
          queryClient.invalidateQueries({ queryKey: ["Customer", data.id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to update customer");
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<CustomerType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<CustomerType, AxiosError<ErrorRes>, string>({
        mutationFn: deleteCustomerFn,
        onSuccess: (_, id) => {
          toast("Customer deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["Customers"] });
          queryClient.removeQueries({ queryKey: ["Customer", id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to delete customer");
        },
        ...options,
      });
    },
  },
};