"use client";

import { Task, TaskFormData, PartialTaskFormData, TaskStatus } from "@/types/task";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface UseTasksOptions {
  channelName?: string;
  enableRealtime?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { channelName = "tasks-changes", enableRealtime = true } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks");
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
  }, []);

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

  const createTask = async (formData: TaskFormData) => {
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
  };

  const updateTask = async (id: string, data: PartialTaskFormData) => {
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
  };

  const deleteTask = async (id: string) => {
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
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
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
  };

  const groupedTasks: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
    overdue: tasks.filter((t) => t.status === "overdue"),
  };

  return {
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
}