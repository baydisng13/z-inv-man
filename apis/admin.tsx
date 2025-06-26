/* 
Here’s how to build any features in your system.  
**An example is included at the end.**

---

## Feature Development Pattern

**All features in this system should follow this structure:**

### 1. **Schema & Types**
- Use [Zod](https://zod.dev/) to define validation schemas for create, update, and other payloads.
- Export TypeScript types from these schemas for type safety across the codebase.

### 2. **API Functions**
- Write standalone async functions for each API endpoint (GET, POST, PATCH, DELETE, etc.).
- Use a shared Axios instance for all HTTP requests.
- Parameterize endpoints and payloads for reusability.

### 3. **React Query Hooks**
- Wrap API functions with [React Query](https://tanstack.com/query/latest) hooks for data fetching and mutations.
- Use descriptive query keys for cache management.
- Provide options for customizing query/mutation behavior.

### 4. **UI Feedback**
- Use a toast/notification system to provide user feedback for all mutations (create, update, delete, etc.).
- Show loading, success, and error states.

### 5. **Export a Feature Object**
- Export a single object per feature that encapsulates all hooks and API methods for easy import and usage.

---

## Example: Feature Module Structure

Suppose you are building a `Task` feature.  
Here’s how the module should look:

````typescript
import axiosInstance from "@/lib/axios";
import queryClient from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

// 1. Zod Schemas & Types
export const TaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
export type TaskCreateType = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
export type TaskUpdateType = z.infer<typeof TaskUpdateSchema>;

export interface TaskType {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 2. API Functions
export async function getTasksFn() {
  return (await axiosInstance.get("/api/v1/tasks")).data;
}
export async function createTaskFn(data: TaskCreateType) {
  return (await axiosInstance.post("/api/v1/tasks", data)).data;
}
export async function updateTaskFn(data: TaskUpdateType) {
  return (await axiosInstance.patch(`/api/v1/tasks/${data.id}`, data)).data;
}
export async function deleteTaskFn(id: number) {
  return (await axiosInstance.delete(`/api/v1/tasks/${id}`)).data;
}

// 3. React Query Hooks & 4. Toasts
const Task = {
  Get: {
    useQuery: (options = {}) =>
      useQuery({
        queryKey: ["Tasks"],
        queryFn: getTasksFn,
        ...options,
      }),
  },
  Create: {
    useMutation: (options = {}) =>
      useMutation({
        mutationFn: createTaskFn,
        onSuccess: () => {
          toast("Task created successfully");
          queryClient.invalidateQueries({ queryKey: ["Tasks"] });
        },
        onError: () => toast("Failed to create task"),
        ...options,
      }),
  },
  Update: {
    useMutation: (options = {}) =>
      useMutation({
        mutationFn: updateTaskFn,
        onSuccess: () => {
          toast("Task updated successfully");
          queryClient.invalidateQueries({ queryKey: ["Tasks"] });
        },
        onError: () => toast("Failed to update task"),
        ...options,
      }),
  },
  Delete: {
    useMutation: (options = {}) =>
      useMutation({
        mutationFn: deleteTaskFn,
        onSuccess: () => {
          toast("Task deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["Tasks"] });
        },
        onError: () => toast("Failed to delete task"),
        ...options,
      }),
  },
};

export default Task;
````

---

## Example Usage in a Page or Component

````tsx
import Task from "@/apis/task";

export default function TaskList() {
  const { data, isLoading } = Task.Get.useQuery();
  const createTask = Task.Create.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button
        onClick={() => createTask.mutate({ title: "New Task" })}
      >
        Add Task
      </button>
      <ul>
        {data?.results?.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
````

---

**Summary:**  
Every feature should have:
- Zod schemas and types
- Typed API functions
- React Query hooks for CRUD operations
- Toast notifications for user feedback
- A single exported object for easy usage

This ensures consistency, type safety, and maintainability across your codebase.


*/

import { authClient } from "@/lib/auth-client";
import queryClient from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

// Zod schemas for admin operations
export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["user", "admin"]),
  data: z.record(z.any()).optional(),
});

export const ListUsersQuerySchema = z.object({
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  searchValue: z.string().optional(),
  limit: z.union([z.string(), z.number()]).optional(),
  offset: z.union([z.string(), z.number()]).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterOperator: z
    .enum(["lt", "eq", "ne", "lte", "gt", "gte", "contains"])
    .optional(),
  filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

// Export types from Zod schemas

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type ListUsersQueryType = z.infer<typeof ListUsersQuerySchema>;

// API functions
export async function createUserFn(data: CreateUserType) {
  return await authClient.admin.createUser(data, {
    throw: true,
  });
}

export async function listUsersFn(query: ListUsersQueryType = {}) {
  return await authClient.admin.listUsers({
    query,
    fetchOptions:{
      throw: true, 
    }
  });
}

export async function removeUserFn(userId: string) {
  return await authClient.admin.removeUser({
    userId,
  });
}

const Admin = {
  CreateUser: {
    useMutation: (options = {}) =>
      useMutation({
        mutationFn: createUserFn,
        onSuccess: () => {
          toast("User created successfully");
          queryClient.invalidateQueries({ queryKey: ["Users"] });
        },
        onError: () => toast("Failed to create user"),
        onMutate: () => toast("Creating user..."),
        ...options,
      }),
  },
  ListUsers: {
     useQuery: (
      query: ListUsersQueryType = {
        searchField: "email",
        searchOperator: "contains",
        searchValue: "",
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      options = {}
    ) =>
      useQuery({
        queryKey: ["Users", query],
        queryFn: () => listUsersFn(query),
        ...options,
      }),
  },
  RemoveUser: {
    useMutation: (options = {}) =>
      useMutation({
        mutationFn: removeUserFn,
        onSuccess: () => {
          toast("User removed successfully");
          queryClient.invalidateQueries({ queryKey: ["Users"] });
        },
        onMutate: () => toast("Removing user..."),
        onError: () => toast("Failed to remove user"),
        ...options,
      }),
  },
};

export default Admin;
