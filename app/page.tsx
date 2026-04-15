"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TaskList } from "@/components/TaskList";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AppLayout activePage="tasks" onNewTask={() => setIsFormOpen(true)}>
      <TaskList
        externalFormOpen={isFormOpen}
        onExternalFormClose={() => setIsFormOpen(false)}
      />
    </AppLayout>
  );
}