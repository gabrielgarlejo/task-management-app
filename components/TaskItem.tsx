'use client';

import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-surface-container-highest text-on-surface-variant',
  low: 'bg-surface-container-highest text-on-surface-variant/40',
};

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-surface-container-highest text-on-surface-variant',
  in_progress: 'bg-secondary-container text-on-secondary-container',
  done: 'bg-primary/20 text-primary',
};

export function TaskItem({ task, onUpdate, onDelete, onEdit }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: TaskStatus) => {
    setIsUpdating(true);
    await onUpdate(task.id, { status });
    setIsUpdating(false);
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    setIsUpdating(true);
    await onUpdate(task.id, { priority });
    setIsUpdating(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isDone = task.status === 'done';

  return (
    <div
      className={`group grid grid-cols-[1fr_120px_140px_140px_100px] gap-8 items-center bg-surface-container-low hover:bg-surface-container-high px-8 py-6 rounded-2xl ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isDone ? 'opacity-70' : ''
      }`}
    >
      <div className="flex flex-col">
        <span
          className={`text-lg font-semibold text-on-surface group-hover:text-primary ease-[cubic-bezier(0.4,0,0.2,1)] transition-colors ${
            isDone ? 'line-through text-on-surface-variant' : ''
          }`}
        >
          {task.title}
        </span>
        <span className="text-xs text-on-surface-variant mt-1">
          {task.description || '-'}
        </span>
      </div>

      <div>
        <select
          value={task.priority}
          onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
          disabled={isUpdating}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer focus:ring-2 focus:ring-primary ${priorityStyles[task.priority]}`}
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex justify-center">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          disabled={isUpdating}
          className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border-none cursor-pointer focus:ring-2 focus:ring-primary ${statusStyles[task.status]}`}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div>
        <span className="text-sm font-medium text-on-surface-variant">
          {formatDate(task.due_date)}
        </span>
      </div>

      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="material-symbols-outlined text-xl text-on-surface-variant hover:text-primary"
          title="Edit"
        >
          edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="material-symbols-outlined text-xl text-on-surface-variant hover:text-error"
          title="Delete"
        >
          delete
        </button>
      </div>
    </div>
  );
}
