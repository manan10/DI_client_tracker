import React from 'react';

const StatCard = ({ title, value, icon, colorClass = "text-amber-600" }) => {
  return (
    <div className="flex items-center gap-3 px-3 py-4 sm:px-5 sm:py-3 flex-1 group transition-all duration-300 relative
                    /* THE TACTILE LIFT */
                    bg-white dark:bg-slate-800 
                    border border-slate-200 dark:border-white/5 
                    border-b-4 border-b-slate-200 dark:border-b-black/40
                    shadow-[0_4px_12px_-5px_rgba(0,0,0,0.1)]
                    rounded-2xl cursor-default overflow-hidden
                    hover:-translate-y-1 hover:border-b-amber-500 dark:hover:border-b-orange-500
                    active:translate-y-0.5 active:border-b-0">
      
      {/* Icon Well: High Contrast */}
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500
                      ${colorClass.replace('text', 'bg').replace('600', '100').replace('700', '100').replace('500', '500/20')} 
                      ${colorClass} group-hover:rotate-360`}>
        {React.cloneElement(icon, { size: 16, strokeWidth: 3 })}
      </div>
      
      <div className="flex flex-col min-w-0">
        <h3 className="text-[13px] sm:text-base font-[1000] text-slate-950 dark:text-white tracking-tight leading-none truncate">
          {value}
        </h3>
        <p className={`text-[8px] font-black uppercase tracking-[0.15em] mt-2 leading-none truncate
                      ${colorClass} opacity-90`}>
          {title}
        </p>
      </div>

      {/* Visual Pattern for "Whiteness" breakdown */}
      <div className={`absolute -right-1 -bottom-1 opacity-[0.04] dark:opacity-[0.07] group-hover:scale-125 transition-transform duration-700 ${colorClass}`}>
        {React.cloneElement(icon, { size: 48 })}
      </div>
    </div>
  );
};

export default StatCard;