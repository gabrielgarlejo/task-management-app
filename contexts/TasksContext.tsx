"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { Task, TaskFormData, PartialTaskFormData, TaskStatus } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TasksContextValue {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  groupedTasks: {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
    overdue: Task[];
  };
  fetchTasks: () => Promise<void>;
  createTask: (formData: TaskFormData) => Promise<boolean>;
  updateTask: (id: string, data: PartialTaskFormData) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return context;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const channelName = "tasks-changes";
  const enableRealtime = true;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTasks(data.tasks || []);
      }
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase.channel(channelName).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          setTasks((prev) => {
            if (prev.some((t) => t.id === (payload.new as Task).id)) {
              return prev;
            }
            return [payload.new as Task, ...prev];
          });
        } else if (payload.eventType === "UPDATE") {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === payload.new.id ? { ...t, ...(payload.new as Task) } : t,
            ),
          );
        } else if (payload.eventType === "DELETE") {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      },
    ).subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, enableRealtime]);

  const createTask = useCallback(async (formData: TaskFormData) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return false;
      }
      setTasks((prev) => [data.task, ...prev]);
      return true;
    } catch {
      setError("Failed to create task");
      return false;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: PartialTaskFormData) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        return false;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? result.task : t)));
      return true;
    } catch {
      setError("Failed to update task");
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return false;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch {
      setError("Failed to delete task");
      return false;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    const previousStatus = task?.status;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        if (previousStatus) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, status: previousStatus } : t,
            ),
          );
        }
        return false;
      }
      return true;
    } catch {
      setError("Failed to update task status");
      if (previousStatus) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: previousStatus } : t)),
        );
      }
      return false;
    }
  }, [tasks]);

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      done: tasks.filter((t) => t.status === "done"),
      overdue: tasks.filter((t) => t.status === "overdue"),
    }),
    [tasks],
  );

  const value: TasksContextValue = {
    tasks,
    isLoading,
    error,
    groupedTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}