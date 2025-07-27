
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
  CategoryType,
  CategoryCreateType,
  CategoryUpdateType,
} from "@/schemas/category-schema";
import { axiosInstance } from "@/lib/axios";
import { buildQueryParams } from "@/lib/buildQueryParams";

// API Functions
export async function getCategoriesFn(params?: { page?: number; search?: string }) {
  const queryParams = buildQueryParams(params);
  return (await axiosInstance.get<CategoryType[]>(`/api/categories${queryParams}`)).data;
}

export async function getCategoryByIdFn(id: string) {
  return (await axiosInstance.get<CategoryType>(`/api/categories/${id}`)).data;
}

export async function createCategoryFn(data: CategoryCreateType) {
  return (await axiosInstance.post<CategoryType>("/api/categories", data)).data;
}

export async function updateCategoryFn({
  id,
  data,
}: {
  id: number;
  data: CategoryUpdateType;
}) {
  return (await axiosInstance.put<CategoryType>(`/api/categories/${id}`, data))
    .data;
}

export async function deleteCategoryFn(id: number) {
  return (await axiosInstance.delete<CategoryType>(`/api/categories/${id}`)).data;
}

// React Query Hooks
export const Category = {
  GetAll: {
    useQuery: (
      params?: { page?: number; search?: string },
      options?: UseQueryOptions<CategoryType[], AxiosError<ErrorRes>>
    ) => {
      return useQuery<CategoryType[], AxiosError<ErrorRes>>({
        queryKey: ["Categories"],
        queryFn: () => getCategoriesFn(params),
        ...options,
      });
    },
  },

  GetById: {
    useQuery: (
      id: string,
      options?: UseQueryOptions<CategoryType, AxiosError<ErrorRes>>
    ) => {
      return useQuery<CategoryType, AxiosError<ErrorRes>>({
        queryKey: ["Category", id],
        queryFn: () => getCategoryByIdFn(id),
        enabled: !!id,
        ...options,
      });
    },
  },

  Create: {
    useMutation: (
      options?: UseMutationOptions<
        CategoryType,
        AxiosError<ErrorRes>,
        CategoryCreateType
      >
    ) => {
      return useMutation<
        CategoryType,
        AxiosError<ErrorRes>,
        CategoryCreateType
      >({
        mutationFn: createCategoryFn,
        onSuccess: () => {
          toast("Category created successfully");
          queryClient.invalidateQueries({ queryKey: ["Categories"]});
        },
        onError: (err) => {
          toast.error(err.response?.data.message || "Failed to create category");
        },
        ...options,
      });
    },
  },

  Update: {
    useMutation: (
      options?: UseMutationOptions<
        CategoryType,
        AxiosError<ErrorRes>,
        { id: number; data: CategoryUpdateType }
      >
    ) => {
      return useMutation<
        CategoryType,
        AxiosError<ErrorRes>,
        { id: number; data: CategoryUpdateType }
      >({
        mutationFn: updateCategoryFn,
        onSuccess: (data) => {
          toast("Category updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Categories"] });
          queryClient.invalidateQueries({ queryKey: ["Category", data.id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to update category");
        },
        ...options,
      });
    },
  },

  Delete: {
    useMutation: (
      options?: UseMutationOptions<CategoryType, AxiosError<ErrorRes>, number>
    ) => {
      return useMutation<CategoryType, AxiosError<ErrorRes>, number>({
        mutationFn: deleteCategoryFn,
        onSuccess: (_, id) => {
          toast("Category deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["Categories"] });
          queryClient.removeQueries({ queryKey: ["Category", id] });
        },
        onError: (err) => {
          toast(err.response?.data.message || "Failed to delete category");
        },
        ...options,
      });
    },
  },
};
