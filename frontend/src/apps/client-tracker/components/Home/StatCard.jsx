import React from 'react';

const StatCard = ({ title, value, icon, theme }) => {
  return (
    <div className="relative overflow-hidden flex flex-col p-4 sm:p-5 lg:p-6 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300 group cursor-default">

      {/* AMBIENT HOVER GLOW */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${theme.glow}`} />

      {/* HEADER: Icon */}
      <div className="relative flex items-center justify-between mb-4 sm:mb-8">
        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-sm ${theme.bg} ${theme.border} ${theme.text}`}>
          {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
        </div>
      </div>

      {/* DATA: Value & Label */}
      <div className="relative flex flex-col min-w-0 mt-auto">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 truncate">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight truncate">
          {value}
        </p>
      </div>

    </div>
  );
};

export default StatCard;