import React from "react";

/**
 * Universal PageHeader Component (Locked: Sora Architectural Edition)
 *
 * - Sora technical geometric sans-serif typography
 * - Dual-weight lockup (Bold primary title + Normal sky-blue accent)
 * - Segmented sky micro-ticks calibrated to WorkspaceShell's palette
 * - Clean, unobstructed title, micro-ticks, and subtitle
 *
 * @param {string} title - Primary title or single-word heading
 * @param {string} [accent] - Optional secondary title word
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
    <div className={`relative w-full select-none ${className}`}>
      {/* Sora Google Font Loader */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .workspace-sora-header h1,
        .workspace-sora-header p {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      <div className="workspace-sora-header flex flex-col text-left w-full min-w-0">
        {/* Title Row */}
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {title}
          {hasAccent && (
            <span className="ml-2 font-normal text-sky-600 dark:text-sky-300">
              {accent}
            </span>
          )}
        </h1>

        {/* Segmented Sky Micro-Ticks */}
        <div className="flex items-center gap-1.5 mt-2.5 mb-2.5">
          <span className="h-[2.5px] w-6 rounded-full bg-sky-600 dark:bg-sky-400" />
          <span className="h-[2.5px] w-2 rounded-full bg-sky-500/60 dark:bg-sky-400/60" />
          <span className="h-[2.5px] w-1 rounded-full bg-cyan-400/60 dark:bg-cyan-300/50" />
        </div>

        {/* Explainer Subtitle */}
        {description && (
          <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;