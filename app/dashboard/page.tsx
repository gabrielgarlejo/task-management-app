"use client";

import { useState } from "react";
import { useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useTasks } from "@/contexts/TasksContext";
import { Task } from "@/types/task";
import Link from "next/link";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { getLocalDateString, formatDate } from "@/lib/date";

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block text-left w-full bg-surface-container-low hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors"
    >
      <span className="text-sm font-medium text-on-surface line-clamp-1">
        {task.title}
      </span>
      <span className="text-xs text-on-surface-variant mt-1 block">
        {formatDate(task.due_date)}
      </span>
    </button>
  );
}

function StatCard({
  title,
  count,
  icon,
  href,
}: {
  title: string;
  count: number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-surface-container-low hover:bg-surface-container-high p-5 rounded-2xl transition-colors"
    >
      <span className="material-symbols-outlined text-3xl text-primary">
        {icon}
      </span>
      <div>
        <p className="text-3xl font-bold text-on-surface">{count}</p>
        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
          {title}
        </p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { tasks, isLoading, groupedTasks, updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const dashboardData = useMemo(() => {
    const today = getLocalDateString();

    const dueToday: Task[] = [];
    const overdue: Task[] = [];
    const recent = [...tasks]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);

    for (const task of tasks) {
      if (!task.due_date) continue;
      const dueDate = task.due_date.split("T")[0];

      if (dueDate === today) {
        dueToday.push(task);
      }

      if (task.status === "overdue" || (task.status !== "done" && dueDate < today)) {
        overdue.push(task);
      }
    }

    const completed = groupedTasks.done;

    return { dueToday, overdue, completed, recent };
  }, [tasks, groupedTasks]);

  if (isLoading) {
    return (
      <AppLayout activePage="dashboard">
        <div className="flex items-center justify-center h-96">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">
            refresh
          </span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePage="dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            Dashboard
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Overview of your tasks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Due Today"
            count={dashboardData.dueToday.length}
            icon="today"
            href="/"
          />
          <StatCard
            title="Overdue"
            count={dashboardData.overdue.length}
            icon="warning"
            href="/"
          />
          <StatCard
            title="Completed"
            count={dashboardData.completed.length}
            icon="check_circle"
            href="/"
          />
          <StatCard
            title="Recent"
            count={dashboardData.recent.length}
            icon="schedule"
            href="/"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-surface-container-low rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-on-surface">
                Tasks Due Today
              </h3>
              <span className="text-xs font-medium text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                {dashboardData.dueToday.length}
              </span>
            </div>
            <div className="space-y-2">
              {dashboardData.dueToday.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No tasks due today
                </p>
              ) : (
                dashboardData.dueToday.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))
              )}
            </div>
          </section>

          <section className="bg-surface-container-low rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-on-surface">Overdue</h3>
              <span className="text-xs font-medium text-error bg-error-container/30 px-2 py-1 rounded-full">
                {dashboardData.overdue.length}
              </span>
            </div>
            <div className="space-y-2">
              {dashboardData.overdue.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No overdue tasks
                </p>
              ) : (
                dashboardData.overdue.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))
              )}
            </div>
          </section>

          <section className="bg-surface-container-low rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-on-surface">
                Completed
              </h3>
              <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
                {dashboardData.completed.length}
              </span>
            </div>
            <div className="space-y-2">
              {dashboardData.completed.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No completed tasks
                </p>
              ) : (
                dashboardData.completed
                  .slice(0, 5)
                  .map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />)
              )}
            </div>
          </section>

          <section className="bg-surface-container-low rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-on-surface">
                Recent Tasks
              </h3>
              <span className="material-symbols-outlined text-xl text-on-surface-variant">
                access_time
              </span>
            </div>
            <div className="space-y-2">
              {dashboardData.recent.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No recent tasks
                </p>
              ) : (
                dashboardData.recent.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => updateTask(task.id, task)}
          onDelete={(id) => deleteTask(id)}
        />
      )}
    </AppLayout>
  );
}
