// src/apps/recipes/components/Recipies/BistroMenuView.jsx
import React from "react";
import { Clock, Flame, Play, ChevronDown, ChevronUp } from "lucide-react";
import {
  slugifySection,
  getDishSubtext,
  formatDurationCompact,
  renderDietaryCodes,
} from "./recipeMenuUtils";

const BistroMenuView = ({
  groupedSections,
  collapsedSections,
  onToggleSection,
  onOpenDetails,
  onOpenCookMode,
}) => {
  return (
    <div
      className={
        groupedSections.length === 1
          ? "w-full"
          : "columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-4 sm:gap-5"
      }
    >
      {groupedSections.map(({ groupName, items }) => {
        const isCollapsed = Boolean(collapsedSections[groupName]);

        return (
          <section
            id={slugifySection(groupName)}
            key={groupName}
            className="break-inside-avoid-column mb-4 sm:mb-5 scroll-mt-14 border-2 border-stone-900 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#14110E] p-3.5 sm:p-4 shadow-xs"
          >
            {/* Compact Boxed Bistro Course Header */}
            <button
              type="button"
              onClick={() => onToggleSection(groupName)}
              className={`w-full text-left flex items-center justify-between gap-2 cursor-pointer group ${
                isCollapsed
                  ? ""
                  : "border-b-2 border-stone-900 dark:border-stone-700 pb-2 mb-3"
              }`}
            >
              <h2 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-xl text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-none">
                {groupName}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono font-bold text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider tabular-nums">
                  {items.length}
                </span>
                <span className="w-5 h-5 border border-stone-900/30 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:border-amber-600 dark:group-hover:border-amber-400">
                  {isCollapsed ? (
                    <ChevronDown size={11} />
                  ) : (
                    <ChevronUp size={11} />
                  )}
                </span>
              </div>
            </button>

            {/* Dense Dish List */}
            {!isCollapsed && (
              <div
                className={
                  groupedSections.length === 1
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-2.5"
                    : "divide-y divide-stone-200/80 dark:divide-stone-800/80"
                }
              >
                {items.map((item) => (
                  <article
                    key={item._id}
                    onClick={() => onOpenDetails(item._id)}
                    className={`group cursor-pointer ${
                      groupedSections.length === 1
                        ? "pb-2.5 border-b border-stone-200/80 dark:border-stone-800/80"
                        : "py-2.5 first:pt-0 last:pb-0"
                    }`}
                  >
                    {/* Line 1: Full Wrapping Title + Dietary + Video | Time + Cook */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans font-[1000] uppercase tracking-tighter text-[13px] sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-snug inline">
                          {item.title}
                        </h3>
                        {renderDietaryCodes(item)}
                        {item.video?.embedUrl && (
                          <Play
                            size={9}
                            fill="currentColor"
                            className="inline text-rose-500 ml-1 align-middle"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 font-mono pt-0.5">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] tabular-nums">
                          <Clock
                            size={9}
                            className="text-amber-600 dark:text-amber-400 shrink-0"
                          />
                          <span>{formatDurationCompact(item)}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => onOpenCookMode(e, item._id)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 border border-stone-900/25 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-400 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Launch Cook Mode"
                        >
                          <Flame size={9} />
                          <span>Cook</span>
                        </button>
                      </div>
                    </div>

                    {/* Line 2: Single-Line Description + Course Tag */}
                    <div className="flex items-center justify-between gap-2 mt-1 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                      <p className="truncate leading-snug">
                        {getDishSubtext(item)}
                      </p>
                      <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 shrink-0">
                        {item.courseType || "Main"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default BistroMenuView;