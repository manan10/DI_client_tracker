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
      className="group relative flex flex-col items-start p-4 h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 overflow-hidden outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950 text-left w-full min-w-0"
    >
      {/* Subtle Background Glow on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-br ${theme.gradient} transition-opacity duration-300 pointer-events-none`} />

      <div className="relative flex justify-between items-start w-full mb-3 md:mb-4">
        {/* Colored Icon Well */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-transform duration-300 group-hover:scale-110 shadow-sm border border-white/20 dark:border-black/20 ${theme.bg} ${theme.text}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        
        {/* Action Arrow */}
        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" strokeWidth={2.5} />
        </div>
      </div>

      <span className="relative text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug mt-auto truncate w-full">
        {title}
      </span>
    </button>
  );
};

const QuickActionsGrid = ({ onLogInteraction, onNewSubmission, onNewTask }) => {
  const navigate = useNavigate();
  
  // Vibrant but professional SaaS themes
  const themes = {
    interaction: {
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-500/20",
      gradient: "from-indigo-50/50 to-transparent dark:from-indigo-500/5",
    },
    submission: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/20",
      gradient: "from-blue-50/50 to-transparent dark:from-blue-500/5",
    },
    task: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      gradient: "from-emerald-50/50 to-transparent dark:from-emerald-500/5",
    },
    directory: {
      text: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-500/20",
      gradient: "from-violet-50/50 to-transparent dark:from-violet-500/5",
    },
    bank: {
      text: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-100 dark:bg-teal-500/20",
      gradient: "from-teal-50/50 to-transparent dark:from-teal-500/5",
    },
    commissions: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-500/20",
      gradient: "from-rose-50/50 to-transparent dark:from-rose-500/5",
    },
    tally: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-500/20",
      gradient: "from-amber-50/50 to-transparent dark:from-amber-500/5",
    },
    settings: {
      text: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-200 dark:bg-slate-700",
      gradient: "from-slate-50/50 to-transparent dark:from-slate-500/5",
    }
  };

  return (
    <div className="w-full">
      {/* Explicit grid-cols-2 for Mobile, 4 for Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GridTile 
          title="Log Interaction"
          icon={MessageSquarePlus} 
          theme={themes.interaction}
          onClick={onLogInteraction}
        />
        <GridTile 
          title="New Submission"
          icon={FilePlus2} 
          theme={themes.submission}
          onClick={onNewSubmission}
        />
        <GridTile 
          title="Add Task"
          icon={ListTodo} 
          theme={themes.task}
          onClick={onNewTask}
        />
        <GridTile 
          title="Master Directory"
          icon={BookOpen} 
          theme={themes.directory}
          onClick={() => navigate('/directory')}
        />
        <GridTile 
          title="Bank Accounts"
          icon={Landmark} 
          theme={themes.bank}
          onClick={() => navigate('/accounts', { state: { activeTab: 'balances' } })}
        />
        <GridTile 
          title="Manage Commissions"
          icon={BadgePercent} 
          theme={themes.commissions}
          onClick={() => navigate('/accounts', { state: { activeTab: 'commissions' } })}
        />
        <GridTile 
          title="Tally Workbench"
          icon={DatabaseZap} 
          theme={themes.tally}
          onClick={() => navigate('/accounts', { state: { activeTab: 'audit' } })}
        />
        <GridTile 
          title="System Settings"
          icon={Settings} 
          theme={themes.settings}
          onClick={() => navigate('/settings')}
        />
      </div>
    </div>
  );
};

export default QuickActionsGrid;