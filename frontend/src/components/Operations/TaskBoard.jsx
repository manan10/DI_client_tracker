import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Plus,
  Search,
  Settings,
  ChevronRight,
  Share2,
  LayoutDashboard,
  Filter,
  Loader2,
} from "lucide-react";

import { useTasks } from "../../hooks/useTasks";
import Column from "./TaskBoard/Column";
import TaskCard from "./TaskBoard/TaskCard";
import NewTicketPanel from "./TaskBoard/NewTicketPanel";
import TicketDetailView from "./TaskBoard/TicketDetailView";

const COLUMNS = [
  { id: "BACKLOG", title: "TO DO" },
  { id: "IN_PROGRESS", title: "IN PROGRESS" },
  { id: "PENDING_CLIENT", title: "WAITING ON CLIENT" },
  { id: "COMPLETED", title: "DONE" },
];

const TaskBoard = () => {
  const { tasks, loading, fetchTasks, moveTask, quickAdd, setTasks } =
    useTasks();
  const [activeId, setActiveId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync data on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t._id === activeId);
    const overColumn = COLUMNS.find((c) => c.id === overId)
      ? overId
      : tasks.find((t) => t._id === overId)?.status;

    if (!activeTask || !overColumn || activeTask.status === overColumn) return;

    moveTask(activeId, overColumn);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeIndex = tasks.findIndex((t) => t._id === active.id);
      const overIndex = tasks.findIndex((t) => t._id === over.id);

      if (tasks[activeIndex].status === tasks[overIndex].status) {
        setTasks((items) => arrayMove(items, activeIndex, overIndex));
      }
    }
    setActiveId(null);
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#020303] dark:bg-[radial-gradient(circle_at_center,var(--tw-gradient-from)_0%,transparent_100%)] dark:from-[#08090a] transition-colors duration-500">
      <div className="w-full px-4 md:px-8 py-6 space-y-6">
        {/* BREADCRUMBS & ACTION HEADER */}
        <div className="flex flex-col gap-4">
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            <span>Workspace</span>
            <ChevronRight size={10} strokeWidth={3} />
            <span className="text-emerald-500/80 font-black uppercase tracking-widest">
              Operations Flow
            </span>
          </nav>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/10 dark:bg-emerald-500/5 rounded-lg flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <LayoutDashboard size={20} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-[1000] dark:text-white uppercase italic tracking-tighter">
                Ops <span className="text-emerald-500">Kanban</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-slate-200 dark:hover:bg-white/5 rounded-md transition-all hidden md:flex border border-transparent dark:border-white/5">
                <Share2 size={16} className="text-slate-400" />
              </button>
              <button
                onClick={() => setIsPanelOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 md:px-8 py-3 rounded-sm font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={4} />
                <span className="hidden sm:inline">Create Ticket</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* RESTORED SEARCH & USER AVATARS */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="relative group flex-1 md:flex-none">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={14}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks or clients..."
              className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white dark:bg-[#0B0C0E] border border-slate-300 dark:border-white/10 rounded-sm text-[12px] focus:ring-2 ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between md:justify-start gap-6">
            <div className="flex items-center -space-x-2.5 ml-0 md:ml-4">
              {["RM", "AD", "SS"].map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#F4F5F7] dark:border-[#020303] bg-slate-800 flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  {initials}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-[#F4F5F7] dark:border-[#020303] bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-black text-slate-500">
                +4
              </div>
            </div>
            <button className="md:hidden p-2.5 bg-white dark:bg-[#0B0C0E] border border-slate-300 dark:border-white/10 rounded-md">
              <Filter size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* LOADING & BOARD GRID */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
              Syncing Ledger...
            </span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-20 min-h-[75vh]">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={filteredTasks.filter((t) => t.status === col.id)}
                  onTaskClick={setSelectedTask}
                  onQuickAdd={quickAdd}
                />
              ))}
            </div>

            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeId ? (
                <div className="rotate-3 scale-105 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
                  <TaskCard
                    task={tasks.find((t) => t._id === activeId)}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <NewTicketPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onCreated={fetchTasks}
      />

      <TicketDetailView
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onUpdate={fetchTasks}
        key={selectedTask?._id || 'new'}
      />
    </div>
  );
};

export default TaskBoard;
