"use client";

import { Task, TaskStatus } from "@/types/task";
import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTaskCard } from "./KanbanTaskCard";

interface GroupedTasks {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
  overdue: Task[];
}

const columnConfig = [
  { title: "Todo", status: "todo" as TaskStatus, colorDot: "bg-primary-fixed-dim" },
  { title: "In Progress", status: "in_progress" as TaskStatus, colorDot: "bg-secondary" },
  { title: "Done", status: "done" as TaskStatus, colorDot: "bg-on-tertiary-container" },
  { title: "Overdue", status: "overdue" as TaskStatus, colorDot: "bg-error" },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTasks(data.tasks || []);
      }
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const groupedTasks: GroupedTasks = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
    overdue: tasks.filter((t) => t.status === "overdue"),
  };

  const findContainer = (id: string): TaskStatus | undefined => {
    for (const col of columnConfig) {
      const task = groupedTasks[col.status].find((t) => t.id === id);
      if (task) return col.status;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
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

    // Optimistic update - update state immediately
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: overContainer! } : t))
    );

    // Then make API call in background
    try {
      const res = await fetch(`/api/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: overContainer }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: activeContainer } : t))
        );
      }
    } catch {
      setError("Failed to update task status");
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: activeContainer } : t))
      );
    }
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
            tasks={groupedTasks[col.status]}
            status={col.status}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <KanbanTaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}