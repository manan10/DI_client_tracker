import React from 'react';
import { Activity } from 'lucide-react';

const Sidebar = ({ arns, activeArnId, setActiveArnId }) => (
  <aside className="w-full lg:w-80 bg-white dark:bg-[#08090A] border-r border-slate-200 dark:border-white/5 flex flex-col sticky top-0 h-screen">
    {/* Header with increased padding */}
    <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest italic font-sans">Entity Index</span>
      <Activity size={18} className="text-emerald-500" />
    </div>

    {/* List with increased padding and text sizes */}
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {arns.map(arn => (
        <button 
          key={arn._id}
          onClick={() => setActiveArnId(arn._id)}
          className={`w-full p-6 text-left transition-all rounded-sm flex flex-col gap-2
            ${activeArnId === arn._id 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-[6px] border-emerald-500 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 border-l-[6px] border-transparent'}`}
        >
          {/* Main Code: Increased to 14px */}
          <span className="text-[14px] font-black uppercase tracking-tight leading-none">
            {arn.arnCode}
          </span>
          {/* Nickname: Increased to 11px */}
          <span className="text-[11px] font-bold truncate uppercase italic opacity-80 leading-none">
            {arn.nickname}
          </span>
        </button>
      ))}
    </div>
  </aside>
);

export default Sidebar;