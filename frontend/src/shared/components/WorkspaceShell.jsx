import React from "react";
import { Lock } from "lucide-react";
import PageHeader from "./Auth/PageHeader";

/**
 * Universal WorkspaceShell Component (Sora Architectural Edition)
 *
 * - Applies Sora technical geometric typography across the entire workspace shell
 * - Wide full-bleed elevated header band (max-w-[1840px]) with adaptive desktop
 *   navigation decks and docked mobile tab rails
 * - Slightly narrower recessed workspace canvas (max-w-[96rem]) below so content
 *   reads comfortably inside the wider header frame
 *
 * @param {React.ReactNode} navbar - Top Navbar component
 * @param {React.ReactNode} [customHeader] - Optional full-bleed header override (e.g. ClientProfileHeader)
 * @param {string} [title] - Primary PageHeader title
 * @param {string} [accent] - Optional PageHeader accent word
 * @param {string} [description] - Optional PageHeader subtitle
 * @param {string} [badge] - Optional eyebrow badge label (e.g. "Advisory Workspace")
 * @param {React.ElementType} [badgeIcon] - Optional Lucide icon for the eyebrow badge
 * @param {Array<{ id: string, name: string, mobileName?: string, subtitle?: string, icon: React.ElementType, isLocked?: boolean }>} [tabs] - Optional navigation tabs
 * @param {string} [activeTab] - Currently active tab ID
 * @param {(id: string, tab?: object) => void} [onTabChange] - Tab selection handler
 * @param {React.ReactNode} [rightSlot] - Optional custom right-side header controls (used when `tabs` is omitted)
 * @param {string} [mainClassName] - Optional override for the main container spacing
 * @param {React.ReactNode} children - Main page workspace content
 */
const WorkspaceShell = ({
  navbar,
  customHeader,
  title,
  accent,
  description,
  badge,
  badgeIcon: BadgeIcon,
  tabs = [],
  activeTab,
  onTabChange,
  rightSlot,
  mainClassName,
  children,
}) => {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;
  const hasRightContent = hasTabs || Boolean(rightSlot);

  const desktopDeckCols =
    tabs.length === 2
      ? "grid-cols-2"
      : tabs.length >= 4
      ? "grid-cols-2 xl:grid-cols-4"
      : "grid-cols-3";

  const mobileRailCols =
    tabs.length === 2
      ? "grid-cols-2"
      : tabs.length >= 4
      ? "grid-cols-4"
      : "grid-cols-3";

  return (
    <div className="workspace-sora-shell min-h-screen bg-[#F6F8FB] dark:bg-[#131720] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Global Sora Font Enforcement for WorkspaceShell (preserving font-mono) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .workspace-sora-shell,
        .workspace-sora-shell *:not(.font-mono) {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {navbar}

      {/* ===================================================================== */}
      {/* WIDE FULL-BLEED ELEVATED HEADER BAND                                  */}
      {/* ===================================================================== */}
      {customHeader ? (
        customHeader
      ) : (
        <header className="relative bg-white dark:bg-[#1B202C] border-b border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_20px_-12px_rgba(15,23,42,0.05)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] transition-colors duration-300">
          {/* Specular Top Horizon Line */}
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500/70 to-transparent" />

          <div
            className={`w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-14 pt-6 ${
              hasTabs ? "pb-0 sm:py-8" : "pb-6 sm:py-8"
            }`}
          >
            <div
              className={
                hasRightContent
                  ? "grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
                  : "w-full"
              }
            >
              {/* Left: Optional Eyebrow Badge + Standard PageHeader */}
              <div className={hasRightContent ? "lg:col-span-5 xl:col-span-5" : "w-full"}>
                {badge && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-400/20 text-sky-700 dark:text-sky-300 text-[10px] font-semibold uppercase tracking-widest mb-3">
                    {BadgeIcon && <BadgeIcon size={11} />}
                    <span>{badge}</span>
                  </div>
                )}

                <PageHeader
                  title={title}
                  accent={accent}
                  description={description}
                />
              </div>

              {/* Right Option A: Adaptive Interactive Navigation Deck (Desktop & Tablet) */}
              {hasTabs && (
                <div
                  className={`hidden sm:grid lg:col-span-7 xl:col-span-7 ${desktopDeckCols} gap-2.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-[#151923] border border-slate-200/80 dark:border-white/[0.07]`}
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isLocked = Boolean(tab.isLocked);
                    const Icon = isLocked ? Lock : tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange?.(tab.id, tab)}
                        className={`p-3.5 rounded-xl text-left transition-all duration-200 flex flex-col justify-between gap-2.5 border ${
                          isLocked
                            ? "bg-transparent border-transparent text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed"
                            : isActive
                            ? "bg-white border-sky-300/80 shadow-[0_6px_16px_-6px_rgba(14,165,233,0.16)] dark:bg-[#232A3B] dark:border-sky-400/40 dark:shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)] cursor-pointer"
                            : "bg-transparent hover:bg-white/60 border-transparent text-slate-600 dark:hover:bg-white/[0.04] dark:text-slate-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
                              isActive && !isLocked
                                ? "bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30"
                                : "bg-white/80 text-slate-500 border-slate-200/70 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.07]"
                            }`}
                          >
                            {Icon && <Icon size={16} strokeWidth={2.2} />}
                          </div>
                          {isActive && !isLocked && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div
                            className={`text-xs font-semibold tracking-tight truncate transition-colors ${
                              isActive && !isLocked
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {tab.name}
                          </div>
                          {tab.subtitle && (
                            <div
                              className={`text-[10px] truncate mt-0.5 transition-colors ${
                                isActive && !isLocked
                                  ? "text-sky-700/80 dark:text-sky-300/80 font-medium"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {tab.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Right Option B: Custom Header Controls (Search, Filters, Primary CTAs) */}
              {!hasTabs && rightSlot && (
                <div className="lg:col-span-7 xl:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full">
                  {rightSlot}
                </div>
              )}
            </div>

            {/* Mobile: Docked Bottom Tab Rail Flush Against Header Border */}
            {hasTabs && (
              <div
                role="tablist"
                aria-label={`${title} Navigation`}
                className={`sm:hidden grid ${mobileRailCols} w-full mt-5 -mb-px border-t border-slate-200/70 dark:border-white/[0.06]`}
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isLocked = Boolean(tab.isLocked);
                  const Icon = isLocked ? Lock : tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => onTabChange?.(tab.id, tab)}
                      className={`
                        relative flex items-center justify-center gap-1.5 py-3 px-1.5 text-[11px] tracking-tight whitespace-nowrap transition-colors duration-200 outline-none border-b-2
                        ${
                          isLocked
                            ? "border-transparent text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed"
                            : isActive
                            ? "border-sky-600 dark:border-sky-400 text-slate-950 dark:text-white font-semibold bg-sky-500/[0.04] dark:bg-sky-400/[0.05] cursor-pointer"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-normal cursor-pointer"
                        }
                      `}
                    >
                      {Icon && (
                        <Icon
                          size={13}
                          strokeWidth={isActive ? 2.4 : 2}
                          className={`shrink-0 ${
                            isActive && !isLocked
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      )}
                      <span className="truncate">{tab.mobileName || tab.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>
      )}

      {/* ===================================================================== */}
      {/* RECESSED WORKSPACE CANVAS (SLIGHTLY NARROWER THAN HEADER)             */}
      {/* ===================================================================== */}
      <main
        className={
          mainClassName ||
          "w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-9 pb-32"
        }
      >
        <div
          key={activeTab || "default"}
          className="animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out w-full min-w-0"
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceShell;