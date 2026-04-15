"use client";

import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanTaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-secondary-container/30 text-secondary",
  medium: "bg-tertiary-container/30 text-tertiary",
  low: "bg-surface-container-highest text-on-surface-variant/40",
};

const priorityLabels: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No due date";
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today && task.status !== "done") {
      return "Overdue";
    }
    if (dueDate.getTime() === today.getTime()) {
      return "Today";
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isDone = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-surface-container-low p-5 rounded-xl border border-transparent hover:border-outline-variant/30 transition-all group cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      } ${isDone ? "opacity-60 grayscale-[0.3]" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg ${priorityStyles[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-on-surface-variant/60 transition-colors">
          drag_indicator
        </span>
      </div>

      <h4
        className={`font-medium text-on-surface text-base mb-4 leading-snug ${
          isDone ? "line-through text-on-surface/50" : ""
        }`}
      >
        {task.title}
      </h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span className="text-[11px] font-medium">{formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
}