"use client";

import { Task, TaskStatus } from "@/types/task";
import { useState } from "react";
import { useSensors, useSensor } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { useTasks } from "@/hooks/useTasks";

const columnConfig = [
  {
    title: "Todo",
    status: "todo" as TaskStatus,
    colorDot: "bg-primary-fixed-dim",
  },
  {
    title: "In Progress",
    status: "in_progress" as TaskStatus,
    colorDot: "bg-secondary",
  },
  {
    title: "Done",
    status: "done" as TaskStatus,
    colorDot: "bg-on-tertiary-container",
  },
  { title: "Overdue", status: "overdue" as TaskStatus, colorDot: "bg-error" },
];

export function KanbanBoard() {
  const { groupedTasks, updateTaskStatus, isLoading, error } = useTasks({
    channelName: "tasks-changes",
  });
  const [activeTask, setActiveTask] = useState<{ id: string; task: Task } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = (id: string): TaskStatus | undefined => {
    for (const col of columnConfig) {
      const task = groupedTasks[col.status]?.find((t) => t.id === id);
      if (task) return col.status;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    for (const col of columnConfig) {
      const task = groupedTasks[col.status]?.find((t) => t.id === active.id);
      if (task) {
        setActiveTask({ id: task.id, task });
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    let overContainer: TaskStatus | undefined;

    if (columnConfig.some((col) => col.status === overId)) {
      overContainer = overId as TaskStatus;
    } else {
      overContainer = findContainer(overId);
    }

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    await updateTaskStatus(activeId, overContainer);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-error">{error}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 h-[calc(100vh-280px)] kanban-scroll overflow-x-auto">
        {columnConfig.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            colorDot={col.colorDot}
            tasks={groupedTasks[col.status] || []}
            status={col.status}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <KanbanTaskCard task={activeTask.task} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}