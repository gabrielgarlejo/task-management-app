"use client";

import { Task, TaskPriority } from "@/types/task";
import { useState, memo } from "react";
import { PRIORITY_STYLES, STATUS_STYLES, PRIORITY_LABELS } from "@/lib/styles";
import { formatDate } from "@/lib/date";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onEdit: (task: Task) => void;
  onClick?: (task: Task) => void;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

function TaskItemComponent({ task, onUpdate, onEdit, onClick }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePriorityChange = async (priority: TaskPriority) => {
    setIsUpdating(true);
    await onUpdate(task.id, { priority });
    setIsUpdating(false);
  };

  const isDone = task.status === "done";

  return (
    <div
      className={`group bg-surface-container hover:bg-surface-container-high px-4 lg:px-8 py-4 lg:py-6 rounded-2xl ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
        isDone ? "opacity-70" : ""
      }`}
      onClick={() => onClick?.(task)}
    >
      <div className="hidden lg:grid grid-cols-[1fr_120px_140px_140px_100px] gap-8 items-center">
        <div className="flex flex-col">
          <span
            className={`text-lg font-semibold text-on-surface group-hover:text-primary ease-[cubic-bezier(0.4,0,0.2,1)] transition-colors ${
              isDone ? "line-through text-on-surface-variant" : ""
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <span className="text-xs text-on-surface-variant/50 mt-1">
              {truncateText(task.description, 80)}
            </span>
          )}
        </div>

        <div>
          <select
            value={task.priority}
            onChange={(e) =>
              handlePriorityChange(e.target.value as TaskPriority)
            }
            disabled={isUpdating}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer focus:ring-2 focus:ring-primary ${PRIORITY_STYLES[task.priority]}`}
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex justify-center">
          <span
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[task.status]}`}
          >
            {task.status === "in_progress"
              ? "In Progress"
              : task.status === "done"
                ? "Done"
                : task.status === "overdue"
                  ? "Overdue"
                  : "Todo"}
          </span>
        </div>

        <div>
          <span className="text-sm font-medium text-on-surface-variant">
            {formatDate(task.due_date)}
          </span>
        </div>

        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="material-symbols-outlined text-xl text-on-surface-variant hover:text-primary"
            title="Edit"
          >
            edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(task);
            }}
            className="material-symbols-outlined text-xl text-on-surface-variant hover:text-error"
            title="Delete"
          >
            delete
          </button>
        </div>
      </div>

      <div className="lg:hidden flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <span
            className={`text-base font-semibold text-on-surface ${
              isDone ? "line-through text-on-surface-variant" : ""
            }`}
          >
            {task.title}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="material-symbols-outlined text-lg text-on-surface-variant hover:text-primary"
              title="Edit"
            >
              edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(task);
              }}
              className="material-symbols-outlined text-lg text-on-surface-variant hover:text-error"
              title="Delete"
            >
              delete
            </button>
          </div>
        </div>
        {task.description && (
          <span className="text-xs text-on-surface-variant/50">
            {truncateText(task.description, 80)}
          </span>
        )}
        <div className="flex flex-wrap gap-2 mt-1">
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}
          >
{PRIORITY_LABELS[task.priority]}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-semibold ${STATUS_STYLES[task.status]}`}
          >
            {task.status === "in_progress"
              ? "In Progress"
              : task.status === "done"
                ? "Done"
                : task.status === "overdue"
                  ? "Overdue"
                  : "Todo"}
          </span>
          <span className="text-xs text-on-surface-variant self-center">
            {formatDate(task.due_date)}
          </span>
        </div>
      </div>
    </div>
  );
}

export const TaskItem = memo(TaskItemComponent);
