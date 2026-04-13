"use client";

import { useState } from "react";
import { TaskList } from "@/components/TaskList";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* SideNavBar - hidden on mobile, shown as slide-out overlay */}
      <aside
        className={`
          fixed z-50
          w-[280px] h-screen bg-[#060e20] flex flex-col py-8 px-6
          transition-transform duration-300 ease-in-out
          ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <button
          className="absolute top-4 right-4 lg:hidden material-symbols-outlined text-on-surface"
          onClick={() => setIsMobileNavOpen(false)}
        >
          close
        </button>
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-[#dae2fd]">
            TaskFlow
          </h1>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#ccc3d8] mt-1">
            Editorial Workspace
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <a
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-[#2d3449]/50 text-[#ccc3d8] font-normal hover:text-[#dae2fd]"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[13px] font-medium">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out text-[#d0bcff] font-semibold border-l-4 border-[#d0bcff] bg-transparent"
            href="#"
          >
            <span className="material-symbols-outlined">assignment</span>
            <span className="text-[13px] font-medium">Tasks</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-[#2d3449]/50 text-[#ccc3d8] font-normal hover:text-[#dae2fd]"
            href="#"
          >
            <span className="material-symbols-outlined">view_kanban</span>
            <span className="text-[13px] font-medium">Kanban</span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-[#2d3449]/50 text-[#ccc3d8] font-normal hover:text-[#dae2fd]"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[13px] font-medium">Settings</span>
          </a>
        </nav>
        <div className="mt-auto">
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full py-4 px-6 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-90 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Task</span>
          </button>
          <div className="mt-8 flex items-center gap-3 px-2">
            <img
              alt="User profile"
              className="w-10 h-10 rounded-full object-cover grayscale brightness-90"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMqkXx96vML_62GRu_bMoPNZLF4dtJXzSmWWyOufFnrHsoYO3L9fpB3eN86AxSalRjF0j0251TsPU-wElsRnzU2Ddhwld057oixqLRByi1LZXcCe2GDXrJuI-xl3Q8I_PNuNbxLRRKZjpOpSh7eu9XjnE9yLXQfTbyweTHARQWiapaZRp-XIkdVgRBAjLgiYTi2StndQue4hFhLnODixnoSyu8ry0P7fU_EA865E1KbwcW13AQx1sf19mXtSHA2zNbI8eQoDy8xA"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-on-surface truncate">
                Alex Sterling
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-[#0b1326]/60 backdrop-blur-3xl z-40 flex justify-between items-center px-4 lg:px-12">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden material-symbols-outlined text-on-surface"
            onClick={() => setIsMobileNavOpen(true)}
          >
            menu
          </button>
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
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-6">
            <a
              className="text-sm font-medium text-[#ccc3d8] hover:text-[#dae2fd] transition-opacity"
              href="#"
            >
              Projects
            </a>
            <a className="text-sm font-bold text-[#d0bcff]" href="#">
              Analytics
            </a>
          </div>
          <div className="flex items-center gap-4 text-[#ccc3d8]">
            <button className="material-symbols-outlined hover:text-[#dae2fd] ease-[cubic-bezier(0.4,0,0.2,1)]">
              notifications
            </button>
            <button className="material-symbols-outlined hover:text-[#dae2fd] ease-[cubic-bezier(0.4,0,0.2,1)]">
              help_outline
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-20 lg:pt-24 px-4 lg:px-12 pb-12">
        {/* Header Section */}
        <section className="mb-8 lg:mb-12 flex justify-between items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-[3.5rem] font-bold tracking-tighter leading-tight text-on-surface mb-4">
              Focus.
            </h2>
            <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">
              Efficiency is the art of eliminating the non-essential. Your
              workspace is currently managing{" "}
              <span className="text-primary font-bold">12 active tasks</span>{" "}
              across 3 core verticals.
            </p>
          </div>
        </section>

        {/* Task List */}
        <TaskList
          externalFormOpen={isFormOpen}
          onExternalFormClose={() => setIsFormOpen(false)}
        />
      </main>
    </>
  );
}
