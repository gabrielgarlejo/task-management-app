"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: "tasks" | "kanban" | "dashboard";
  onNewTask?: () => void;
}

export function AppLayout({ children, activePage, onNewTask }: AppLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, isLoading: authLoading } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth < 1024);
  }, []);

  const handleResize = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsMobile(window.innerWidth < 1024);
    }, 150);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const handleLogout = async () => {
    await logout();
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <>
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <aside
        className={`
          fixed z-50
          w-[280px] h-screen bg-surface-container-lowest flex flex-col py-8 px-6
          transition-transform duration-300 ease-in-out
          ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {isMobile && (
          <button
            className="absolute top-4 right-4 material-symbols-outlined text-on-surface"
            onClick={() => setIsMobileNavOpen(false)}
          >
            close
          </button>
        )}
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            TaskFlow
          </h1>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mt-1">
            Editorial Workspace
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
              activePage === "dashboard"
                ? "text-primary font-semibold border-l-4 border-primary bg-transparent"
                : "hover:bg-surface-container-highest/50 text-on-surface-variant font-normal hover:text-on-surface"
            }`}
            href="/dashboard"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[13px] font-medium">Dashboard</span>
          </Link>
          <Link
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
              activePage === "tasks"
                ? "text-primary font-semibold border-l-4 border-primary bg-transparent"
                : "hover:bg-surface-container-highest/50 text-on-surface-variant font-normal hover:text-on-surface"
            }`}
            href="/"
          >
            <span className="material-symbols-outlined">assignment</span>
            <span className="text-[13px] font-medium">Tasks</span>
          </Link>
          <Link
            href="/kanban"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
              activePage === "kanban"
                ? "text-primary font-semibold border-l-4 border-primary bg-transparent"
                : "hover:bg-surface-container-highest/50 text-on-surface-variant font-normal hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined">view_kanban</span>
            <span className="text-[13px] font-medium">Kanban</span>
          </Link>

        </nav>
        <div className="mt-auto">
          {onNewTask && (
            <button
              onClick={onNewTask}
              className="w-full py-4 px-6 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-90 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">add</span>
              <span>New Task</span>
            </button>
          )}
          {!authLoading && (
            <div className="mt-8 flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">{userInitial}</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {user?.email || "User"}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-surface/60 backdrop-blur-3xl z-40 flex justify-between items-center px-4 lg:px-12">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              className="material-symbols-outlined text-on-surface"
              onClick={() => setIsMobileNavOpen(true)}
            >
              menu
            </button>
          )}
          <div className="hidden lg:flex items-center bg-surface-container-lowest px-4 py-2 rounded-full w-96">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/50 w-full"
              placeholder="Search tasks, project files..."
              type="text"
            />
          </div>
        </div>

      </header>

      <main className="lg:ml-[280px] pt-20 lg:pt-24 px-4 lg:px-12 pb-12">
        {children}
      </main>
    </>
  );
}