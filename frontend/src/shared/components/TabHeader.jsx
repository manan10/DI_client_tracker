import React from "react";

/**
 * Universal TabHeader Component (Locked: Option 6 — Monospace Kicker Datum)
 *
 * Calibrated to WorkspaceShell's Sora + Sky/Cyan palette and #131720/#161B26 dark surfaces.
 * Designed as a clear subordinate tier below PageHeader.
 *
 * @param {string} title - Primary section/tab heading
 * @param {string} [accent] - Optional secondary word in sky-blue accent
 * @param {string} [description] - Optional concise explainer below the title
 * @param {string} [kicker] - Optional uppercase micro-label (defaults to "Section Overview")
 * @param {React.ReactNode} [actions] - Optional right-side tab controls/buttons
 * @param {string} [className] - Optional outer wrapper classes
 */
const TabHeader = ({
  title,
  accent,
  description,
  kicker = "Section Overview",
  actions,
  className = "",
}) => {
  if (!title) return null;

  const hasAccent = Boolean(accent && accent.trim().length > 0);

  return (
    <div
      className={`w-full pb-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${className}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-tab-title,
        .sora-tab-desc {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* Left: Monospace Kicker Datum + Subordinate Sora Title Lockup */}
      <div className="flex flex-col text-left min-w-0">
        {kicker && (
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
              {kicker}
            </span>
          </div>
        )}

        <h2 className="sora-tab-title text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
          {title}
          {hasAccent && (
            <span className="ml-1.5 font-normal text-sky-600 dark:text-sky-300">
              {accent}
            </span>
          )}
        </h2>

        {description && (
          <p className="sora-tab-desc mt-1 text-xs sm:text-[13px] font-normal text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Optional Right Slot for Tab-Level Actions */}
      {actions && (
        <div className="shrink-0 flex items-center gap-2.5 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default TabHeader;