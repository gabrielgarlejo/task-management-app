"use client";

import { Task, TaskFormData, PartialTaskFormData } from "@/types/task";
import { useState } from "react";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { useTasks } from "@/hooks/useTasks";

interface TaskListProps {
  externalFormOpen?: boolean;
  onExternalFormClose?: () => void;
}

export function TaskList({
  externalFormOpen,
  onExternalFormClose,
}: TaskListProps) {
  const { tasks, createTask, updateTask, deleteTask, isLoading, error, fetchTasks } = useTasks({
    channelName: "tasks-changes-list",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useState(() => {
    if (externalFormOpen) {
      setIsFormOpen(true);
    }
  });

  useState(() => {
    if (!isFormOpen && onExternalFormClose) {
      onExternalFormClose();
    }
  });

  const handleCreate = async (formData: TaskFormData) => {
    await createTask(formData);
  };

  const handleUpdate = async (id: string, data: PartialTaskFormData) => {
    await updateTask(id, data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(id);
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          No tasks found
        </div>
      ) : (
        tasks.map((task) => (
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