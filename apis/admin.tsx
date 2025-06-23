/* 
Here’s how you can explain to a developer how to build all features in your system, using the pattern shown in your `NewsStory` API module.  
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

import { z } from "zod";


// documentation 
// ========================
// purpuse : create user
// request : /api/admin/users
// method : POST
// request body : {name: string, email: string, password: string, role?: string, data?: any}
// response : {success: boolean, error?: string, data?: any}
// ========================

// ========================
// purpuse : list users
// request : /api/admin/users
// method : GET
// request body : {searchField?: "email" | "name", searchOperator?: "contains" | "starts_with" | "ends_with", searchValue?: string, limit?: number, offset?: number, sortBy?: "createdAt" | "updatedAt", sortDirection?: "asc" | "desc", filterField?: string, filterOperator?: "eq" | "contains" | "starts_with" | "ends_with", filterValue?: string}
// response : {success: boolean, error?: string, data?: any}
// ========================



// zod schemas

export const UserCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]),
  data: z.record(z.any()).optional(),
});

// Types

export type UserCreateType = z.infer<typeof UserCreateSchema>;
export type UserListResponse = {
  // data
}