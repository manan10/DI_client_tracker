import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ListTodo, ArrowRight, Clock, User, CheckCircle2, Layers } from "lucide-react";
import { useTasks } from "../../hooks/useTasks";

const ActiveTasksWidget = () => {
  const { tasks, loading, fetchTasks } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      badge: "text-blue-700 bg-blue-50 ring-blue-500/20 dark:text-blue-400 dark:bg-blue-500/10 dark:ring-blue-500/20",
      dot: "bg-blue-500 animate-pulse",
    },
    PENDING_CLIENT: {
      label: "Client Pend",
      badge: "text-amber-700 bg-amber-50 ring-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:ring-amber-500/20",
      dot: "bg-amber-500",
    },
    BACKLOG: {
      label: "To Do",
      badge: "text-slate-600 bg-slate-50 ring-slate-500/20 dark:text-slate-400 dark:bg-white/5 dark:ring-white/10",
      dot: "bg-slate-400",
    },
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* WIDGET HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" strokeWidth={2.5} />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
            Active Operations
          </h3>
        </div>
        {activeTasks.length > 0 && (
          <span className="text-[10px] font-mono font-medium text-slate-500">
            Top {activeTasks.length}
          </span>
        )}
      </div>

      {/* LIST CONTENT */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={20} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Syncing Board...
            </span>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-emerald-50/30 dark:bg-emerald-500/5">
            <CheckCircle2 className="text-emerald-500 mb-2" size={24} strokeWidth={2} />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-1">
              Inbox Zero
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              No operations pending
            </span>
          </div>
        ) : (
          activeTasks.map((task) => {
            const config = statusConfig[task.status] || statusConfig.BACKLOG;
            return (
              <div
                key={task._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors cursor-pointer min-w-0"
              >
                {/* Left: Task Identity */}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    {task.client?.name ? (
                      <>
                        <User size={10} className="text-slate-400" strokeWidth={2.5} />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 truncate">
                          {task.client.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={10} className="text-slate-400" strokeWidth={2.5} />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 truncate">
                          Internal Task
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill */}
                <div className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ring-1 inset-ring ${config.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-px">
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER ACTION */}
      <Link 
        to="/tasks"
        className="group flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/2 border-t border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full"
      >
        <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-widest transition-colors mt-px">
          Open Full Taskboard
        </span>
        <ArrowRight size={14} strokeWidth={2.5} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
};

export default ActiveTasksWidget;