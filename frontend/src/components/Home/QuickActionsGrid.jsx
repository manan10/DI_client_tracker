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
  ArrowUpRight
} from "lucide-react";


  const GridTile = ({ title, icon: Icon, theme, onClick }) => {
    return (
      <button 
        onClick={onClick}
        className={`
          group relative flex flex-col justify-between text-left
          p-3 sm:p-4 h-20 sm:h-24
          bg-white dark:bg-slate-900/80 
          border-2 ${theme.border} ${theme.hover}
          rounded-xl shadow-sm hover:shadow-md 
          hover:-translate-y-0.5 active:translate-y-0 active:scale-95
          transition-all duration-200 overflow-hidden
        `}
      >
        <div className="flex justify-between items-start w-full">
          <div className={`p-1.5 sm:p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${theme.bg}`}>
            <Icon size={18} strokeWidth={2.5} className={theme.text} />
          </div>
          <ArrowUpRight 
            size={16} 
            strokeWidth={2.5}
            className={`
              transition-all duration-300 
              opacity-0 -translate-x-2 translate-y-2 
              group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0
              ${theme.text}
            `} 
          />
        </div>
        <span className="text-xs sm:text-sm font-bold leading-tight mt-auto text-slate-800 dark:text-slate-200">
          {title}
        </span>
      </button>
    );
  };

const QuickActionsGrid = ({ onLogInteraction, onNewSubmission, onNewTask }) => {
  const navigate = useNavigate();
  
  const themes = {
    interaction: {
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      border: "border-indigo-100 dark:border-indigo-900/40",
      hover: "hover:border-indigo-400 dark:hover:border-indigo-500/80"
    },
    submission: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-900/40",
      hover: "hover:border-blue-400 dark:hover:border-blue-500/80"
    },
    task: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-900/40",
      hover: "hover:border-emerald-400 dark:hover:border-emerald-500/80"
    },
    directory: {
      text: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      border: "border-violet-100 dark:border-violet-900/40",
      hover: "hover:border-violet-400 dark:hover:border-violet-500/80"
    },
    bank: {
      text: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-500/10",
      border: "border-teal-100 dark:border-teal-900/40",
      hover: "hover:border-teal-400 dark:hover:border-teal-500/80"
    },
    commissions: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-100 dark:border-rose-900/40",
      hover: "hover:border-rose-400 dark:hover:border-rose-500/80"
    },
    tally: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-900/40",
      hover: "hover:border-amber-400 dark:hover:border-amber-500/80"
    },
    settings: {
      text: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800",
      border: "border-slate-200 dark:border-slate-700",
      hover: "hover:border-slate-400 dark:hover:border-slate-500"
    }
  };



  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        <GridTile 
          title={<>Log Interaction</>}
          icon={MessageSquarePlus} 
          theme={themes.interaction}
          onClick={onLogInteraction}
        />

        <GridTile 
          title={<>New Submission</>}
          icon={FilePlus2} 
          theme={themes.submission}
          onClick={onNewSubmission} // Trigger Drawer
        />

        <GridTile 
          title={<>Add Task</>}
          icon={ListTodo} 
          theme={themes.task}
          onClick={onNewTask} // Trigger Drawer
        />

        <GridTile 
          title={<>Master Directory</>}
          icon={BookOpen} 
          theme={themes.directory}
          onClick={() => navigate('/directory')}
        />

        <GridTile 
          title={<>Bank Accounts</>}
          icon={Landmark} 
          theme={themes.bank}
          onClick={() => navigate('/accounts', { state: { activeTab: 'balances' } })}
        />

        <GridTile 
          title={<>Manage Commissions</>}
          icon={BadgePercent} 
          theme={themes.commissions}
          onClick={() => navigate('/accounts', { state: { activeTab: 'commissions' } })}
        />

        <GridTile 
          title={<>Tally Workbench</>}
          icon={DatabaseZap} 
          theme={themes.tally}
          onClick={() => navigate('/accounts', { state: { activeTab: 'audit' } })}
        />

        <GridTile 
          title={<>System Settings</>}
          icon={Settings} 
          theme={themes.settings}
          onClick={() => navigate('/settings')}
        />

      </div>
    </div>
  );
};

export default QuickActionsGrid;