import React from "react";

/**
 * SettingsCard
 * Renders an individual interactive settings tile with responsive typography and dark-mode styling.
 */
const SettingsCard = ({ card, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(card.id)}
      className={`group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0B1120] border-2 ${card.border} hover:shadow-md transition-all duration-150 cursor-pointer outline-none active:scale-95`}
    >
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 mb-2.5 ${card.bgLight} ${card.color} group-hover:scale-105 transition-transform`}
      >
        <card.icon size={19} strokeWidth={2.3} />
      </div>

      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate w-full">
        {card.label}
      </span>
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate w-full mt-0.5">
        {card.sub}
      </span>
    </button>
  );
};

export default SettingsCard;