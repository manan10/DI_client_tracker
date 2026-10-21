import React from "react";
import SettingsCard from "./SettingsCard";

/**
 * SettingsSection
 * Renders a categorized section heading with an icon, module counter, and responsive grid of cards.
 */
const SettingsSection = ({
  title,
  icon: Icon,
  iconColor = "text-emerald-600 dark:text-emerald-400",
  iconBg = "bg-emerald-500/10 border-emerald-500/20",
  cards = [],
  isAdmin = false,
  onCardClick,
}) => {
  const visibleCards = cards.filter((c) => !c.adminOnly || isAdmin);

  if (visibleCards.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/80 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className={`p-1 rounded-md border ${iconBg} ${iconColor}`}>
            <Icon size={15} />
          </div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {visibleCards.length} Modules
        </span>
      </div>

      {/* Responsive Grid: 3-in-a-row on mobile, fluid up to 10 on wide viewports */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3">
        {visibleCards.map((card) => (
          <SettingsCard key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;