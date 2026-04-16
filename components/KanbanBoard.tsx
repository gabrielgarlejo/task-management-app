"use client";

import { Task, TaskStatus } from "@/types/task";
import { useState, useMemo, useCallback } from "react";
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
import { TaskDetailsModal } from "./TaskDetailsModal";
import { TaskForm } from "./TaskForm";
import { useTasks } from "@/contexts/TasksContext";
import { PartialTaskFormData } from "@/types/task";

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
  const { groupedTasks, updateTaskStatus, isLoading, error, deleteTask, updateTask } = useTasks();
  const [activeTask, setActiveTask] = useState<{ id: string; task: Task } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const taskToStatusMap = useMemo(() => {
    const map = new Map<string, TaskStatus>();
    Object.entries(groupedTasks).forEach(([status, tasks]) => {
      tasks.forEach((t) => map.set(t.id, status as TaskStatus));
    });
    return map;
  }, [groupedTasks]);

  const findContainer = useCallback(
    (id: string): TaskStatus | undefined => {
      return taskToStatusMap.get(id);
    },
    [taskToStatusMap],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = taskToStatusMap.get(active.id as string);
      if (task) {
        const foundTask = groupedTasks[task]?.find((t) => t.id === active.id);
        if (foundTask) {
          setActiveTask({ id: foundTask.id, task: foundTask });
        }
      }
    },
    [groupedTasks, taskToStatusMap],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
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
    },
    [findContainer, updateTaskStatus],
  );

  const handleCloseModal = useCallback(() => setSelectedTask(null), []);
  const handleEditFromModal = useCallback(
    (task: Task) => {
      setSelectedTask(null);
      setEditingTask(task);
      setIsEditing(true);
    },
    [],
  );
  const handleCloseForm = useCallback(() => {
    setIsEditing(false);
    setEditingTask(null);
  }, []);
  const handleFormSubmit = useCallback(
    async (data: PartialTaskFormData) => {
      if (editingTask) {
        await updateTask(editingTask.id, data as PartialTaskFormData);
      }
      setIsEditing(false);
      setEditingTask(null);
    },
    [editingTask, updateTask],
  );

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
    <>
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
              onTaskClick={setSelectedTask}
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

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleCloseModal}
          onEdit={handleEditFromModal}
          onDelete={deleteTask}
        />
      )}

      {isEditing && (
        <TaskForm
          isOpen={isEditing}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          editTask={editingTask}
        />
      )}
    </>
  );
}