"use client";

import { AppLayout } from "@/components/AppLayout";
import { KanbanBoard } from "@/components/KanbanBoard";

export default function KanbanPage() {
  return (
    <AppLayout activePage="kanban">
      <KanbanBoard />
    </AppLayout>
  );
}