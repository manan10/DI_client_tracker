// src/apps/recipes/components/Recipies/BanquetMenuView.jsx
import React from "react";
import { Clock, Flame, Play, ChevronDown, ChevronUp } from "lucide-react";
import {
  slugifySection,
  getDishSubtext,
  formatDurationCompact,
  renderDietaryCodes,
} from "./recipeMenuUtils";

const BanquetMenuView = ({
  groupedSections,
  collapsedSections,
  onToggleSection,
  onOpenDetails,
  onOpenCookMode,
}) => {
  return (
    <div className="border-2 border-stone-900 dark:border-stone-700 p-1 bg-[#FAF9F6] dark:bg-[#14110E] shadow-xs">
      <div className="border border-stone-400 dark:border-stone-700 px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-7">
        {groupedSections.map(({ groupName, items }) => {
          const isCollapsed = Boolean(collapsedSections[groupName]);

          return (
            <section
              id={slugifySection(groupName)}
              key={groupName}
              className="scroll-mt-14 space-y-4"
            >
              {/* Compact Centered Royal Section Header */}
              <button
                type="button"
                onClick={() => onToggleSection(groupName)}
                className="w-full relative flex items-center justify-center cursor-pointer group"
              >
                <div className="w-full h-[1px] bg-stone-300 dark:bg-stone-700" />
                <div className="px-4 sm:px-6 bg-[#FAF9F6] dark:bg-[#14110E] shrink-0 text-center">
                  <span className="block text-amber-600 dark:text-amber-400 text-[9px] tracking-[0.3em] leading-none mb-1">
                    ✦ ✦ ✦
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-2xl text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-none">
                      {groupName}
                    </h2>
                    <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 tabular-nums">
                      ({items.length})
                    </span>
                    {isCollapsed ? (
                      <ChevronDown
                        size={13}
                        className="text-amber-600 dark:text-amber-400"
                      />
                    ) : (
                      <ChevronUp size={13} className="text-stone-400" />
                    )}
                  </div>
                </div>
                <div className="w-full h-[1px] bg-stone-300 dark:bg-stone-700" />
              </button>

              {/* High-Density Symmetrical Dish Grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-7 gap-y-4">
                  {items.map((item) => (
                    <article
                      key={item._id}
                      onClick={() => onOpenDetails(item._id)}
                      className="group text-center flex flex-col items-center justify-between px-2 py-1.5 border-b border-stone-200/70 dark:border-stone-800/70 cursor-pointer hover:bg-amber-500/[0.04] transition-colors"
                    >
                      <div className="w-full flex flex-col items-center">
                        <div className="inline-flex items-center justify-center gap-1 max-w-full">
                          <h3 className="font-sans font-[1000] uppercase tracking-tighter text-sm sm:text-[15px] text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-tight truncate">
                            {item.title}
                          </h3>
                          <span className="shrink-0">
                            {renderDietaryCodes(item)}
                          </span>
                          {item.video?.embedUrl && (
                            <Play
                              size={9}
                              fill="currentColor"
                              className="text-rose-500 shrink-0"
                            />
                          )}
                        </div>

                        <p className="text-[11px] font-mono text-stone-600 dark:text-stone-300 mt-0.5 max-w-sm leading-snug line-clamp-1">
                          {getDishSubtext(item)}
                        </p>
                      </div>

                      <div className="mt-1.5 inline-flex items-center justify-center gap-2 text-[10px] font-mono">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40 font-extrabold tabular-nums">
                          <Clock
                            size={9}
                            className="text-amber-600 dark:text-amber-400"
                          />
                          {formatDurationCompact(item)}
                        </span>

                        <span className="text-stone-300 dark:text-stone-700">
                          •
                        </span>

                        <span className="font-bold uppercase text-stone-500 dark:text-stone-400">
                          {item.difficulty || "Medium"}
                        </span>

                        <span className="text-stone-300 dark:text-stone-700">
                          •
                        </span>

                        <button
                          type="button"
                          onClick={(e) => onOpenCookMode(e, item._id)}
                          className="inline-flex items-center gap-0.5 font-extrabold uppercase text-amber-700 dark:text-amber-300 hover:text-stone-900 dark:hover:text-white underline cursor-pointer"
                        >
                          <Flame size={9} />
                          <span>Cook</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default BanquetMenuView;