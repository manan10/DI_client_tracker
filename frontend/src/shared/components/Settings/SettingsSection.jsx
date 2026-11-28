import React from "react";
import SettingsCard from "./SettingsCard";

/**
 * SettingsSection
 * Renders a categorized section heading with an icon, module counter, and responsive grid of cards.
 */
const SettingsSection = ({
  variant = "default",
  title,
  icon: Icon,
  iconColor = "text-sky-600 dark:text-sky-400",
  iconBg = "bg-sky-50 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-500/25",
  cards = [],
  isAdmin = false,
  onCardClick,
}) => {
  const visibleCards = cards.filter((c) => !c.adminOnly || isAdmin);
  const isExpense = variant === "expense";

  if (visibleCards.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Category Section Header */}
      {isExpense ? (
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
              {title}
            </h2>
          </div>
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
          >
            {visibleCards.length} Modules
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md border ${iconBg} ${iconColor}`}>
              <Icon size={15} />
            </div>
            <h2 className="sora-font text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">
            {visibleCards.length} Modules
          </span>
        </div>
      )}

      {/* Responsive Grid: 3-in-a-row on mobile, fluid up to 10 on wide viewports */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2.5 sm:gap-3">
        {visibleCards.map((card) => (
          <SettingsCard
            key={card.id}
            card={card}
            variant={variant}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;