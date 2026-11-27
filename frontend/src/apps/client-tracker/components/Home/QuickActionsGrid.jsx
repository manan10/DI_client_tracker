import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquarePlus, 
  FilePlus2, 
  ListTodo, 
  DatabaseZap,
  BookOpen,
  Landmark,
  BadgePercent,
  Settings,
  ArrowUpRight,
  Plus
} from "lucide-react";

const QuickActionsGrid = ({ onLogInteraction, onNewSubmission, onNewTask }) => {
  const navigate = useNavigate();

  const primaryActions = [
    {
      title: "Log Interaction",
      subtitle: "Record meeting or call",
      icon: MessageSquarePlus,
      onClick: onLogInteraction,
    },
    {
      title: "New Submission",
      subtitle: "Start client form",
      icon: FilePlus2,
      onClick: onNewSubmission,
    },
    {
      title: "Add Task",
      subtitle: "Create ops ticket",
      icon: ListTodo,
      onClick: onNewTask,
    },
  ];

  const workspaceShortcuts = [
    {
      title: "Master Directory",
      icon: BookOpen,
      onClick: () => navigate("/directory"),
    },
    {
      title: "Bank Accounts",
      icon: Landmark,
      onClick: () => navigate("/accounts", { state: { activeTab: "balances" } }),
    },
    {
      title: "Commissions",
      icon: BadgePercent,
      onClick: () => navigate("/accounts", { state: { activeTab: "commissions" } }),
    },
    {
      title: "Tally Workbench",
      icon: DatabaseZap,
      onClick: () => navigate("/accounts", { state: { activeTab: "audit" } }),
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Primary Create Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {primaryActions.map(({ title, subtitle, icon: Icon, onClick }) => (
          <button
            key={title}
            type="button"
            onClick={onClick}
            className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/60 dark:hover:border-sky-500/50 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-sky-600 text-white shadow-xs shrink-0 group-hover:bg-sky-500 transition-colors">
                <Icon size={17} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <span className="block text-[13px] font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {title}
                </span>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {subtitle}
                </span>
              </div>
            </div>
            <Plus
              size={15}
              className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 shrink-0 transition-colors"
            />
          </button>
        ))}
      </div>

      {/* Workspace Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {workspaceShortcuts.map(({ title, icon: Icon, onClick }) => (
          <button
            key={title}
            type="button"
            onClick={onClick}
            className="group flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50/80 dark:bg-[#131720] border border-slate-200 dark:border-slate-800/80 hover:bg-white dark:hover:bg-[#1C2230] hover:border-sky-500/40 rounded-lg transition-all duration-200 text-left cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon
                size={14}
                className="text-slate-400 group-hover:text-sky-500 shrink-0 transition-colors"
                strokeWidth={2.25}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                {title}
              </span>
            </div>
            <ArrowUpRight
              size={13}
              className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 shrink-0 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;