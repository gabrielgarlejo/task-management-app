"use client";

import { Task } from "@/types/task";
import { PRIORITY_STYLES, STATUS_STYLES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/styles";
import { formatDateLong, formatDateTime } from "@/lib/date";

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailsModal({
  task,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface-container-high rounded-[2rem] p-8 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-on-surface pr-8">{task.title}</h3>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-2xl text-on-surface-variant hover:text-on-surface shrink-0"
          >
            close
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}
            >
              {PRIORITY_LABELS[task.priority]} Priority
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
          </div>

          {task.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                Description
              </h4>
              <p className="text-on-surface leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">
                Due Date
              </h4>
              <p className="text-on-surface font-medium">{formatDateLong(task.due_date)}</p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">
                Status
              </h4>
              <p className="text-on-surface font-medium">{STATUS_LABELS[task.status]}</p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">
                Created
              </h4>
              <p className="text-on-surface font-medium">{formatDateTime(task.created_at)}</p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">
                Last Updated
              </h4>
              <p className="text-on-surface font-medium">{formatDateTime(task.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-4 border-t border-outline-variant/20">
          <button
            onClick={() => {
              onEdit(task);
              onClose();
            }}
            className="flex-1 py-3 px-6 bg-surface-container-low text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="py-3 px-6 bg-error-container/30 text-error font-semibold rounded-xl hover:bg-error-container/50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}