
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
  ProductType,
  ProductCreateType,
  ProductUpdateType,
} from "@/schemas/product-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";

// API Functions
export async function getProductsFn(params?: { page?: number; search?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<ProductType[]>(`/api/products${queryParams}`)).data;
}

export async function getProductByIdFn(id: string) {
  return (await axiosInstance.get<ProductType>(`/api/products/${id}`)).data;
}

export async function createProductFn(data: ProductCreateType) {
  return (await axiosInstance.post<ProductType>("/api/products", data)).data;
}

export async function updateProductFn({
  id,
  data,
}: {
  id: string;
  data: ProductUpdateType;
}) {
  return (await axiosInstance.put<ProductType>(`/api/products/${id}`, data))
    .data;
}

export async function deleteProductFn(id: string) {
  return (await axiosInstance.delete<ProductType>(`/api/products/${id}`)).data;
}

// React Query Hooks
export const Product = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<ProductType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<ProductType[], AxiosError<ErrorRes>>({
        queryKey: ["Products", params],
        queryFn: () => getProductsFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<ProductType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<ProductType, AxiosError<ErrorRes>>({
        queryKey: ["Product", id],
        queryFn: () => getProductByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        ProductType,
        AxiosError<ErrorRes>,
        ProductCreateType
      >
    ) => {
      return useMutation<
        ProductType,
        AxiosError<ErrorRes>,
        ProductCreateType
      >({
        mutationFn: createProductFn,
        
        onSuccess: () => {
          toast.success("Product created successfully");
          queryClient.invalidateQueries({ queryKey: ["Products"] });
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to create product");
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        ProductType,
        AxiosError<ErrorRes>,
        { id: string; data: ProductUpdateType }
      >
    ) => {
      return useMutation<
        ProductType,
        AxiosError<ErrorRes>,
        { id: string; data: ProductUpdateType }
      >({
        mutationFn: updateProductFn,
        
        onSuccess: (data) => {
          toast.success("Product updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Products"] });
          queryClient.invalidateQueries({ queryKey: ["Product", data.id] });
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to update product");
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<ProductType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<ProductType, AxiosError<ErrorRes>, string>({
        mutationFn: deleteProductFn,
        onSuccess: (_, id) => {
          toast.success("Product archived successfully");
          queryClient.invalidateQueries({ queryKey: ["Products"] });
          queryClient.removeQueries({ queryKey: ["Product", id] });
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to archive product");
        },
        ...options,
      });
    },
  },

  Unarchive: {
    useMutation: (
      options?: UseMutationOptions<ProductType, AxiosError<ErrorRes>, string>
    ) => {
      return useMutation<ProductType, AxiosError<ErrorRes>, string>({
        mutationFn: (id) => updateProductFn({ id, data: { isArchived: false } }),
        onMutate: () => toast("Unarchiving product..."),
        onSuccess: (_, id) => {
          toast.success("Product unarchived successfully");
          queryClient.invalidateQueries({ queryKey: ["Products"] });
          queryClient.removeQueries({ queryKey: ["Product", id] });
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to unarchive product");
        },
        ...options,
      });
    },
  },
};
