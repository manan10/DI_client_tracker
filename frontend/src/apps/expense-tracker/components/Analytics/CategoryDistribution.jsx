import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 6;

const PROGRESS_TONES = [
  "bg-emerald-700 dark:bg-[#4EA885]",
  "bg-emerald-600/85 dark:bg-[#68C19D]",
  "bg-stone-700 dark:bg-stone-400",
  "bg-amber-700/85 dark:bg-amber-400/80",
  "bg-rose-700/85 dark:bg-[#E88D96]",
  "bg-stone-500 dark:bg-stone-500",
];

const CategoryDistribution = ({
  categories = [],
  totalSpend = 0,
  categoryPage = 1,
  onPageChange,
  onSelectCategory,
  formatINR,
}) => {
  const totalCategories = categories.length;
  const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);
  const startIndex = (categoryPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = categories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200/90 dark:border-white/[0.07] mb-3.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-3.5 rounded-full bg-emerald-700 dark:bg-[#4EA885] shrink-0" />
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100 truncate">
              Spending by Category
            </h3>
          </div>
        </div>

        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/[0.06] text-stone-700 dark:text-stone-200 shrink-0"
        >
          {totalCategories > 0
            ? `${startIndex + 1}–${Math.min(
                startIndex + ITEMS_PER_PAGE,
                totalCategories
              )} of ${totalCategories}`
            : "0"}
        </span>
      </div>

      {/* Editorial Sheet */}
      <div className="-mx-4 sm:mx-0 sm:w-full flex-1 flex flex-col justify-between rounded-none sm:rounded-2xl bg-white dark:bg-[#1A1C20] border-y border-x-0 sm:border border-stone-200/80 dark:border-white/[0.07] sm:shadow-2xs overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
            No expenses recorded in any category for this month.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-white/[0.05]">
            {paginatedCategories.map((cat, idx) => {
              const percentage =
                totalSpend > 0
                  ? ((cat.amount / totalSpend) * 100).toFixed(1)
                  : "0.0";
              const trackTone =
                PROGRESS_TONES[(startIndex + idx) % PROGRESS_TONES.length];

              return (
                <div
                  key={cat.category || idx}
                  onClick={() => onSelectCategory(cat.category)}
                  className="px-4 sm:px-5 py-3.5 group cursor-pointer hover:bg-stone-50/80 dark:hover:bg-white/[0.025] transition-colors min-w-0"
                >
                  <div className="flex justify-between items-baseline mb-2 min-w-0">
                    <span
                      style={{ fontFamily: "'Lora', serif" }}
                      className="text-sm font-bold text-stone-950 dark:text-stone-50 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4] transition-colors truncate pr-4"
                    >
                      {cat.category}
                    </span>

                    <div
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      className="text-right flex items-baseline gap-3 shrink-0"
                    >
                      <span className="text-sm font-bold text-stone-950 dark:text-stone-50 tabular-nums tracking-tight">
                        ₹{formatINR(cat.amount)}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 w-11 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Clean progress indicator */}
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${trackTone} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#FAF9F6] dark:bg-[#16181C] border-t border-stone-200/70 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, categoryPage - 1))}
              disabled={categoryPage === 1}
              aria-label="Previous Page"
              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:text-[#68C19D] dark:hover:bg-white/[0.06] disabled:opacity-25 transition-colors cursor-pointer outline-none"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider"
            >
              Page {categoryPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                onPageChange(Math.min(totalPages, categoryPage + 1))
              }
              disabled={categoryPage === totalPages}
              aria-label="Next Page"
              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:text-[#68C19D] dark:hover:bg-white/[0.06] disabled:opacity-25 transition-colors cursor-pointer outline-none"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDistribution;
