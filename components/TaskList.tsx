"use client";

import { Task, TaskFormData, PartialTaskFormData } from "@/types/task";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";

interface TaskListProps {
  externalFormOpen?: boolean;
  onExternalFormClose?: () => void;
}

export function TaskList({
  externalFormOpen,
  onExternalFormClose,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    const channel = supabase
      .channel("tasks-changes-list")
      .on(
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
                t.id === payload.new.id
                  ? { ...t, ...(payload.new as Task) }
                  : t,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (externalFormOpen) {
      setIsFormOpen(true);
    }
  }, [externalFormOpen]);

  useEffect(() => {
    if (!isFormOpen && onExternalFormClose) {
      onExternalFormClose();
    }
  }, [isFormOpen, onExternalFormClose]);

  const handleCreate = async (formData: TaskFormData) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch {
      setError("Failed to create task");
    }
  };

  const handleUpdate = async (id: string, data: Partial<TaskFormData>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setTasks((prev) => prev.map((t) => (t.id === id ? result.task : t)));
      }
    } catch {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      setError("Failed to delete task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    formData: PartialTaskFormData | TaskFormData,
  ) => {
    if (editingTask) {
      await handleUpdate(editingTask.id, formData);
    } else {
      await handleCreate(formData as TaskFormData);
    }
    setEditingTask(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks;

  return (
    <div className="space-y-4">
      <div className="hidden lg:grid grid-cols-[1fr_120px_140px_140px_100px] gap-8 px-8 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
          Task Intent
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
          Priority
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 text-center">
          Status
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
          Due Date
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 text-right">
          Actions
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-on-surface-variant">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-error">{error}</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          No tasks found
        </div>
      ) : (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}

      <TaskForm
        key={editingTask ? editingTask.id : "new"}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editTask={editingTask}
      />
    </div>
  );
}
