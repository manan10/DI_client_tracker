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
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Kanban,
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

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Live Metrics Count
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  // const pendingTasks = tasks.filter((t) => t.status === "PENDING_CLIENT" || t.status === "BACKLOG").length;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 transition-colors duration-300 relative">
      <div className="w-full space-y-6">
        {/* COMMAND & ACTION BAR (Border-free flat layout inspired by Vercel/Linear to eliminate widget boxes) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <Kanban size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Fulfillment Kanban Pipeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Real-time tracking of operational tickets, workflow handoffs,
                and client action queues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="hidden sm:flex items-center gap-6 px-4 py-1.5 bg-slate-100/70 dark:bg-slate-900/40 rounded-lg border border-slate-200/60 dark:border-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>{" "}
                Total:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {totalTasks}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>{" "}
                Active:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {inProgressTasks}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                Done:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {completedTasks}
                </strong>
              </span>
            </div>

            <button
              onClick={() => setIsPanelOpen(true)}
              className="w-full lg:w-auto px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 outline-none cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        {/* SEARCH & TEAM TOOLBAR STRIP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative group flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={15}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, descriptions or client accounts..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold focus:ring-1 ring-emerald-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center -space-x-1.5">
              {["AD", "MD", "UD", "PD"].map((initials, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-950 bg-slate-800 flex items-center justify-center text-[9px] font-black text-white shadow-2xs cursor-pointer hover:-translate-y-0.5 transition-transform"
                >
                  {initials}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-300">
                +4
              </div>
            </div>
            <button className="sm:hidden p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500">
              <Filter size={15} />
            </button>
          </div>
        </div>

        {/* BOARD AREA */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
              Syncing Board Tasks...
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-20 items-stretch">
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
                <div className="rotate-2 scale-105 shadow-2xl opacity-90">
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
        key={selectedTask?._id || "new"}
      />
    </div>
  );
};

export default TaskBoard;
