import React from 'react';

const StatCard = ({
  title,
  value,
  icon,
  colorClass = "text-amber-600",
  borderClass = "border-l-amber-500",
  bgIconClass = "bg-slate-50 dark:bg-slate-800" // Added for dark mode flexibility
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 border-l-4 ${borderClass} transition-all hover:shadow-2xl hover:-translate-y-1`}
    >
      <div className={`p-4 rounded-xl ${bgIconClass} ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;