"use client";

import { Task, TaskStatus } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import { KanbanTaskCard } from "./KanbanTaskCard";

interface KanbanColumnProps {
  title: string;
  colorDot: string;
  tasks: Task[];
  status: TaskStatus;
}

export function KanbanColumn({
  title,
  colorDot,
  tasks,
  status,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[360px] flex flex-col gap-4 transition-colors ${
        isOver ? "bg-surface-container-high/30 rounded-xl" : ""
      }`}
    >
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${colorDot}`}></span>
          <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface-variant">
            {title}
          </h3>
          <span className="text-xs font-medium text-on-surface-variant/40">
            {tasks.length}
          </span>
        </div>
        <button className="text-on-surface-variant/50 hover:text-on-surface">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto kanban-scroll">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant/40 text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} />
          ))
        )}
        <button className="w-full py-3 border-2 border-dashed border-outline-variant/10 rounded-xl text-on-surface-variant/40 hover:text-on-surface-variant hover:border-outline-variant/30 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="text-xs font-semibold uppercase tracking-widest">
            Add Task
          </span>
        </button>
      </div>
    </div>
  );
}