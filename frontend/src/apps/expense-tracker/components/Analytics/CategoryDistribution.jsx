import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 6;

// Color gradients for category progress tracks
const PROGRESS_COLORS = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-indigo-500 to-violet-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-teal-500 to-emerald-500",
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
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="w-full flex flex-col justify-between min-w-0 font-sans">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4 min-w-0">
          <div>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Spending by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked from highest to lowest this month
            </p>
          </div>

          <span className="text-xs font-sans font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
            {totalCategories > 0
              ? `${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, totalCategories)} of ${totalCategories}`
              : "0"}
          </span>
        </div>

        {/* Continuous List */}
        {categories.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 italic">
            No expenses recorded in any category for this month.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {paginatedCategories.map((cat, idx) => {
              const percentage =
                totalSpend > 0
                  ? ((cat.amount / totalSpend) * 100).toFixed(1)
                  : "0.0";
              const trackColor =
                PROGRESS_COLORS[(startIndex + idx) % PROGRESS_COLORS.length];

              return (
                <div
                  key={cat.category || idx}
                  onClick={() => onSelectCategory(cat.category)}
                  className="py-3.5 group cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.02] px-1 rounded-md transition-colors min-w-0"
                >
                  <div className="flex justify-between items-center mb-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-sans font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate pr-4">
                      {cat.category}
                    </span>

                    <div className="text-right flex items-baseline gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-sans font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        ₹{formatINR(cat.amount)}
                      </span>
                      <span className="text-xs font-sans font-bold text-slate-500 dark:text-slate-400 w-11 text-right tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Clean progress indicator */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-linear-to-r ${trackColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-6">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, categoryPage - 1))}
            disabled={categoryPage === 1}
            aria-label="Previous Page"
            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 disabled:opacity-20 transition-colors cursor-pointer outline-none"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          
          <span className="text-xs font-sans font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Page {categoryPage} of {totalPages}
          </span>
          
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, categoryPage + 1))}
            disabled={categoryPage === totalPages}
            aria-label="Next Page"
            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 disabled:opacity-20 transition-colors cursor-pointer outline-none"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryDistribution;