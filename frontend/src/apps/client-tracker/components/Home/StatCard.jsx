import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, onClick }) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative overflow-hidden flex flex-col p-4 sm:p-5 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg transition-all duration-200 group text-left w-full min-w-0 ${
        onClick
          ? 'hover:border-sky-500/50 dark:hover:border-sky-500/40 hover:shadow-md cursor-pointer'
          : 'cursor-default'
      }`}
    >
      {/* HEADER: Icon & Optional Arrow */}
      <div className="relative flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform duration-200">
          {React.cloneElement(icon, { size: 18, strokeWidth: 2.25 })}
        </div>
        {onClick && (
          <ArrowUpRight
            size={15}
            className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors"
          />
        )}
      </div>

      {/* DATA: Value & Label */}
      <div className="relative flex flex-col min-w-0 mt-auto">
        <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 truncate">
          {title}
        </h3>
        <p className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {value}
        </p>
        {subtitle && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </Tag>
  );
};

export default StatCard;