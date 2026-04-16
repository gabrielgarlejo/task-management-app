import { Task, TaskFormData, PartialTaskFormData, TaskStatus } from "@/types/task";

type ApiError = { error: string };
type ApiResponse<T> = T | ApiError;

async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  
  const data = await res.json() as ApiResponse<T>;
  
  if (!res.ok) {
    throw new Error((data as ApiError).error || "Request failed");
  }
  
  return data as T;
}

export const api = {
  tasks: {
    list: () => fetcher<{ tasks: Task[] }>("/api/tasks"),
    
    get: (id: string) => fetcher<{ task: Task }>(`/api/tasks/${id}`),
    
    create: (data: TaskFormData) => 
      fetcher<{ task: Task }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<PartialTaskFormData>) =>
      fetcher<{ task: Task }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetcher<{ success: boolean }>(`/api/tasks/${id}`, {
        method: "DELETE",
      }),
    
    updateStatus: (id: string, status: TaskStatus) =>
      fetcher<{ task: Task }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
  
  auth: {
    login: (email: string, password: string) =>
      fetcher<{ user: { id: string; email: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    
    logout: () => fetcher("/api/auth/logout", { method: "POST" }),
    
    me: () => fetcher<{ user: { id: string; email: string } }>("/api/auth/me"),
  },
} as const;