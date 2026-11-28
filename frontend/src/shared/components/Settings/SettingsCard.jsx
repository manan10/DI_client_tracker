import React from "react";

/**
 * SettingsCard
 * Renders an individual interactive settings tile with responsive typography and dark-mode styling.
 */
const SettingsCard = ({ card, variant = "default", onClick }) => {
  const isExpense = variant === "expense";

  if (isExpense) {
    return (
      <button
        type="button"
        onClick={() => onClick(card.id)}
        className={`group relative flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1A1C20] border border-stone-200/80 dark:border-white/[0.07] hover:border-emerald-700/45 dark:hover:border-[#4EA885]/50 shadow-2xs transition-all cursor-pointer outline-none active:scale-[0.98] ${
          card.isLocked ? "opacity-65" : ""
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-2.5 transition-transform group-hover:scale-105 ${
            card.isLocked
              ? "bg-stone-100 dark:bg-white/[0.05] text-stone-400 dark:text-stone-500"
              : "bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]"
          }`}
        >
          <card.icon size={18} strokeWidth={2.2} />
        </div>

        <span
          style={{ fontFamily: "'Lora', serif" }}
          className="text-xs sm:text-[13.5px] font-bold tracking-tight text-stone-950 dark:text-stone-50 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4] transition-colors truncate w-full"
        >
          {card.label}
        </span>
        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate w-full mt-0.5">
          {card.sub}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(card.id)}
      className="group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 hover:border-sky-400/70 dark:hover:border-sky-500/50 transition-colors cursor-pointer outline-none active:scale-[0.98]"
    >
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/70 mb-2.5 ${card.bgLight} ${card.color} group-hover:scale-105 transition-transform`}
      >
        <card.icon size={18} strokeWidth={2.2} />
      </div>

      <span className="sora-font text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors truncate w-full">
        {card.label}
      </span>
      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
        {card.sub}
      </span>
    </button>
  );
};

export default SettingsCard;