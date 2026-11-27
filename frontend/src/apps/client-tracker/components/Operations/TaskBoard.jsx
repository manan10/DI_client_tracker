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
import TabHeader from "../../../../shared/components/TabHeader";
import Column from "./TaskBoard/Column";
import TaskCard from "./TaskBoard/TaskCard";
import NewTicketPanel from "./TaskBoard/NewTicketPanel";
import TicketDetailView from "./TaskBoard/TicketDetailView";

const COLUMNS = [
  { id: "BACKLOG", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "PENDING_CLIENT", title: "Waiting on Client" },
  { id: "COMPLETED", title: "Done" },
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        {/* COMPLEMENTARY TAB HEADER */}
        <TabHeader
          kicker="Operations Pipeline"
          title="Task"
          accent="Board"
          description="Real-time tracking of operational tickets, workflow handoffs, and client action queues."
          actions={
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-4 px-3.5 py-2 bg-slate-100/90 dark:bg-[#161B26] rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Total:{" "}
                  <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                    {totalTasks}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Active:{" "}
                  <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                    {inProgressTasks}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Done:{" "}
                  <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                    {completedTasks}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => setIsPanelOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2 outline-none cursor-pointer shrink-0"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create Ticket</span>
              </button>
            </div>
          }
        />

        {/* SEARCH & TEAM TOOLBAR STRIP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative group flex-1 sm:max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
              size={14}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, descriptions or client accounts..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-sky-500 dark:focus:border-sky-400 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center -space-x-1.5">
              {["AD", "MD", "UD", "PD"].map((initials, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-[#131720] bg-slate-800 dark:bg-[#1C2230] flex items-center justify-center text-[10px] font-mono font-semibold text-white cursor-pointer hover:-translate-y-0.5 transition-transform"
                >
                  {initials}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#131720] bg-slate-200 dark:bg-[#161B26] flex items-center justify-center text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                +4
              </div>
            </div>
            <button className="sm:hidden p-2 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
              <Filter size={15} />
            </button>
          </div>
        </div>

        {/* BOARD AREA */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] gap-3">
            <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" size={26} strokeWidth={2.25} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
