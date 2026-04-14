"use client";

import { Task, TaskFormData } from "@/types/task";
import { useState } from "react";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TaskFormData>) => void;
  editTask?: Task | null;
}

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: "",
};

function getInitialFormData(editTask: Task | null | undefined): TaskFormData {
  if (editTask) {
    return {
      title: editTask.title,
      description: editTask.description || "",
      status: editTask.status,
      priority: editTask.priority,
      due_date: editTask.due_date ? editTask.due_date.split("T")[0] : "",
    };
  }
  return defaultFormData;
}

function buildChangedFields(
  formData: TaskFormData,
  original: TaskFormData,
  isNewTask: boolean,
): Partial<TaskFormData> {
  const changed: Partial<TaskFormData> = {};

  if (isNewTask) {
    if (formData.title.trim()) changed.title = formData.title;
    if (formData.description)
      changed.description = formData.description || null;
    changed.status = formData.status;
    changed.priority = formData.priority;
    if (formData.due_date) {
      changed.due_date = new Date(formData.due_date).toISOString();
    } else {
      changed.due_date = null;
    }
    return changed;
  }

  if (formData.title !== original.title) {
    changed.title = formData.title;
  }
  if (formData.description !== original.description) {
    changed.description = formData.description || null;
  }
  if (formData.priority !== original.priority) {
    changed.priority = formData.priority;
  }
  if (formData.due_date !== original.due_date) {
    changed.due_date = formData.due_date
      ? new Date(formData.due_date).toISOString()
      : null;
  }

  return changed;
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  editTask,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(() =>
    isOpen ? getInitialFormData(editTask) : defaultFormData,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewTask = !editTask;
  const originalData = isNewTask
    ? defaultFormData
    : getInitialFormData(editTask);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNewTask && !formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);
    const changedFields = buildChangedFields(formData, originalData, isNewTask);
    await onSubmit(changedFields);
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-surface-container-high rounded-[2rem] p-8 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-on-surface">
            {editTask ? "Edit Task" : "New Task"}
          </h3>
          <button
            onClick={handleClose}
            className="material-symbols-outlined text-2xl text-on-surface-variant hover:text-on-surface"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required={isNewTask}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
              rows={3}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="lg:w-1/2">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date ?? ""}
              onChange={handleChange}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 bg-surface-container-low text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : editTask ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
