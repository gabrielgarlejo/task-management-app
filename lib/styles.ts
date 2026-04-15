import { TaskPriority, TaskStatus } from "@/types/task";

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-tertiary-container text-on-tertiary-container",
  medium: "bg-surface-container-highest text-on-surface-variant",
  low: "bg-surface-container-highest text-on-surface-variant/40",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-surface-container-highest text-on-surface-variant",
  in_progress: "bg-secondary-container text-on-secondary-container",
  done: "bg-primary/20 text-primary",
  overdue: "bg-error-container/30 text-error",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  overdue: "Overdue",
};