import React from "react";

/**
 * Standard PageHeader Component
 * Locked: Titanium Slate Palette + Stepped Spine with Underline Micro-Ticks
 * 
 * Optimized for both compound titles ("Expense" + "Overview") and
 * standalone single-word titles ("Wallets", "Analytics", "Settings").
 *
 * @param {string} title - Primary title prefix or single-word title
 * @param {string} [accent] - Optional italic accent word (e.g. "Overview", "Directory")
 * @param {string} [description] - Explainer subtitle below the title
 * @param {string} [className] - Optional wrapper container styling
 */
const PageHeader = ({
  title = "Expense",
  accent,
  description = "See all your cash balances, track daily expenses, and check what's been spent this month in one place.",
  className = "",
}) => {
  const hasAccent = Boolean(accent && accent.trim().length > 0);

  return (
    <header className={`w-full select-none ${className}`}>
      <div className="flex flex-col border-l-2 border-slate-200 dark:border-white/10 pl-3.5 sm:pl-5 relative">
        {/* Titanium Slate Active Caliper Notch */}
        <div className="absolute -left-[2px] top-1 h-8 sm:h-9 w-[2px] bg-slate-500 dark:bg-slate-400" />

        {/* Primary Serif Heading (Balanced for both standalone and two-part titles) */}
        <h1
          className={`text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-serif text-slate-900 dark:text-slate-100 leading-tight ${
            hasAccent ? "tracking-tight" : "tracking-normal sm:tracking-tight font-semibold"
          }`}
        >
          {title}
          {hasAccent && (
            <>
              {" "}
              <span className="font-normal text-slate-600 dark:text-slate-300">
                {accent}
              </span>
            </>
          )}
        </h1>

        {/* Precision Underline Micro-Ticks */}
        <div className="flex items-center gap-1.5 mt-2 mb-1.5">
          <span className="h-1 w-5 rounded-full bg-slate-500 dark:bg-slate-400" />
          <span className="h-1 w-2 rounded-full bg-slate-500 dark:bg-slate-400 opacity-50" />
          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Subtitle Explainer */}
        {description && (
          <p className="mt-1 text-xs sm:text-sm lg:text-base font-sans font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </header>
  );
};

export default PageHeader;