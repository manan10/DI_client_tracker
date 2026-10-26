import React from "react";

/**
 * Universal PageHeader Component (Option 8 - Oxford Azure Edition)
 *
 * Locked Design:
 * - High-impact Plus Jakarta Sans typography (font-[900])
 * - Luminous Oxford Azure horizon beam with radial glow
 * - Multi-word / compound accent text rendered in an Azure gradient
 * - Single-word titles render in solid high-contrast monochrome
 * - No default string values for title, accent, or description
 * - Strictly title, beam, and subtext (zero switcher UI or extra elements)
 *
 * @param {string} title - Primary title or single-word heading (e.g. "Wallets", "Expense")
 * @param {string} [accent] - Optional secondary title word (e.g. "Overview")
 * @param {string} [description] - Optional explainer subtitle below the title
 * @param {string} [className] - Optional container styling classes
 */
const PageHeader = ({
  title,
  accent,
  description,
  className = "",
}) => {
  if (!title) return null;

  const hasAccent = Boolean(accent && accent.trim().length > 0);

  return (
    <header className={`relative w-full select-none ${className}`}>
      {/* Plus Jakarta Sans Typeface */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800;900&display=swap');
        header.opt8-azure-final h1, header.opt8-azure-final p {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="opt8-azure-final flex flex-col text-left w-full min-w-0">
        {/* Title Block */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-[900] tracking-tighter text-slate-950 dark:text-white leading-none">
          {title}
          {hasAccent && (
            <span className="ml-2 sm:ml-2.5 font-[900] bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
              {accent}
            </span>
          )}
        </h1>

        {/* Oxford Azure Horizon Glow Beam */}
        <div className="h-[2.5px] w-14 sm:w-16 rounded-full mt-3 mb-2 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 shadow-[0_0_14px_rgba(14,165,233,0.5)]" />

        {/* Optional Explainer Subtitle */}
        {description && (
          <p className="text-xs sm:text-sm lg:text-[15px] font-normal text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </header>
  );
};

export default PageHeader;