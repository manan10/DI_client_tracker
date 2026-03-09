import React from 'react';

const StatCard = ({
  title,
  value,
  icon,
  colorClass = "text-amber-600",
  bgIconClass = "bg-slate-50 dark:bg-slate-800"
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 flex items-center gap-3 transition-all hover:border-amber-500/30 group">
      <div className={`p-2.5 rounded-xl ${bgIconClass} ${colorClass} transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
          {title}
        </p>
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;