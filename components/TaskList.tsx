"use client";

import { Task, TaskFormData, PartialTaskFormData } from "@/types/task";
import { useState, useCallback, useMemo, useEffect } from "react";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { useTasks } from "@/contexts/TasksContext";
import { useSearch } from "./AppLayout";

interface TaskListProps {
  externalFormOpen?: boolean;
  onExternalFormClose?: () => void;
}

export function TaskList({
  externalFormOpen,
  onExternalFormClose,
}: TaskListProps) {
  const searchQuery = useSearch() || "";
  const { tasks, createTask, updateTask, deleteTask, isLoading, error } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [internalFormOpen, setInternalFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hideCompleted");
    if (saved) {
      // Loading from localStorage during mount is a common pattern for client-only preferences
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setHideCompleted(JSON.parse(saved));
    }
  }, []);

  const toggleHideCompleted = useCallback(() => {
    setHideCompleted((prev) => {
      const newValue = !prev;
      localStorage.setItem("hideCompleted", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (hideCompleted) {
      result = result.filter((task) => task.status !== "done");
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      );
    }
    return result;
  }, [tasks, hideCompleted, searchQuery]);

  const isFormOpen = externalFormOpen || internalFormOpen;

  const handleFormClose = () => {
    setInternalFormOpen(false);
    setEditingTask(null);
    if (externalFormOpen && onExternalFormClose) {
      onExternalFormClose();
    }
  };

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setInternalFormOpen(true);
  }, []);

  const handleCreate = async (formData: TaskFormData) => {
    await createTask(formData);
  };

  const handleUpdate = useCallback(async (id: string, data: PartialTaskFormData) => {
    await updateTask(id, data);
  }, [updateTask]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteTask(id);
  }, [deleteTask]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="hidden lg:grid grid-cols-[1fr_120px_140px_140px_100px] gap-8 px-8 py-2 flex-1">
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
        <button
          onClick={toggleHideCompleted}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-colors ${
            hideCompleted
              ? "bg-primary/20 text-primary"
              : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {hideCompleted ? "visibility" : "visibility_off"}
          </span>
          {hideCompleted ? "Show Done" : "Hide Done"}
        </button>
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
            onEdit={handleEdit}
            onClick={setSelectedTask}
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

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}