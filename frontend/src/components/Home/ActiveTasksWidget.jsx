import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ListTodo, ArrowRight, Clock, User, CheckCircle2 } from "lucide-react";
import { useTasks } from "../../hooks/useTasks";

const ActiveTasksWidget = () => {
  const { tasks, loading, fetchTasks } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter out completed tasks and limit to the top 5
  const activeTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => {
      const order = { IN_PROGRESS: 1, PENDING_CLIENT: 2, BACKLOG: 3 };
      return (order[a.status] || 4) - (order[b.status] || 4);
    })
    .slice(0, 5);

  const statusConfig = {
    IN_PROGRESS: {
      label: "In Progress",
      badge: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
      dot: "bg-blue-500 animate-pulse",
    },
    PENDING_CLIENT: {
      label: "Client Pend",
      badge: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
      dot: "bg-amber-500",
    },
    BACKLOG: {
      label: "To Do",
      badge: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700",
      dot: "bg-slate-400",
    },
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 opacity-60">
        <Loader2 className="animate-spin text-emerald-500 mb-3" size={20} />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Syncing Operations...
        </span>
      </div>
    );
  }

  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-60">
        <CheckCircle2 className="text-emerald-500 mb-2" size={24} strokeWidth={1.5} />
        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1">
          Inbox Zero
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
          No operations pending
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1">
      
      {/* NATIVE LIST - No outer box, no hard dividers */}
      {activeTasks.map((task) => {
        const config = statusConfig[task.status] || statusConfig.BACKLOG;

        return (
          <div
            key={task._id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 -mx-3 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-slate-900/60 cursor-pointer"
          >
            {/* Left: Task Identity */}
            <div className="flex flex-col min-w-0">
              <h4 className="text-[13px] sm:text-sm font-[900] text-slate-900 dark:text-white leading-tight truncate transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {task.title}
              </h4>
              
              {/* Meta Information */}
              {task.client?.name ? (
                <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                  <User size={10} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
                    {task.client.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                  <Clock size={10} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
                    Internal Operation
                  </span>
                </div>
              )}
            </div>

            {/* Right: Thin FinTech Badge */}
            <div className="flex items-center justify-end shrink-0">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.badge}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-px">
                  {config.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* INLINE TEXT LINK - No footer box */}
      <Link 
        to="/tasks"
        className="group flex items-center gap-2 mt-4 inline-block w-fit"
      >
        <ListTodo size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span className="text-[9px] font-black text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors mt-px">
          Open Full Taskboard
        </span>
        <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
      </Link>
      
    </div>
  );
};

export default ActiveTasksWidget;