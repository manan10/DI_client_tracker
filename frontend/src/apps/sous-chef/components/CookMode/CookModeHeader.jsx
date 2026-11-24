// src/apps/recipes/components/CookMode/CookModeHeader.jsx
import React from "react";
import {
  X,
  ChevronDown,
  Video,
  Square,
  Speech,
  Timer,
} from "lucide-react";

const CookModeHeader = ({
  recipeTitle,
  wakeLockActive,
  hasVideo,
  showMobileVideo,
  onToggleMobileVideo,
  isSpeaking,
  onToggleSpeak,
  largeText,
  onToggleLargeText,
  timersCount,
  onOpenSheet,
  onExit,
}) => {
  return (
    <header className="px-3 sm:px-6 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#14110E]/95 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 z-30">
      {/* Left: Exit + Dish Switcher */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onExit}
          className="w-9 h-9 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#1B1714] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:border-amber-500 cursor-pointer shrink-0"
          title="Exit Cook Mode"
        >
          <X size={17} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => onOpenSheet("recipes")}
          className="min-w-0 text-left flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Cook Mode
              </span>
              {wakeLockActive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Screen Awake</span>
                </span>
              )}
            </div>
            <h1 className="text-xs sm:text-sm font-sans font-[1000] uppercase tracking-tight text-stone-900 dark:text-white truncate leading-tight group-hover:text-amber-500">
              {recipeTitle}
            </h1>
          </div>
          <ChevronDown
            size={14}
            className="text-stone-400 shrink-0 group-hover:text-amber-500"
          />
        </button>
      </div>

      {/* Right: Kitchen Utility Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Mobile Collapsible Video Toggle */}
        {hasVideo && (
          <button
            type="button"
            onClick={onToggleMobileVideo}
            className={`lg:hidden h-9 px-2.5 rounded-xl border text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              showMobileVideo
                ? "bg-rose-600 text-white border-rose-500"
                : "bg-[#FAF9F6] dark:bg-[#1B1714] border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200"
            }`}
            title="Toggle Recipe Video"
          >
            <Video size={14} />
            <span className="hidden xs:inline">
              {showMobileVideo ? "Hide" : "Video"}
            </span>
          </button>
        )}

        {/* Voice Read Aloud */}
        <button
          type="button"
          onClick={onToggleSpeak}
          className={`h-9 px-2.5 rounded-xl border text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
            isSpeaking
              ? "bg-amber-500 text-stone-950 border-amber-400 animate-pulse"
              : "bg-[#FAF9F6] dark:bg-[#1B1714] border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200"
          }`}
          title={isSpeaking ? "Stop Reading" : "Read Step Aloud"}
        >
          {isSpeaking ? (
            <>
              <Square size={12} fill="currentColor" />
              <span className="hidden sm:inline">Stop</span>
            </>
          ) : (
            <>
              <Speech size={15} />
              <span className="hidden sm:inline">Listen</span>
            </>
          )}
        </button>

        {/* Counter Distance Text Scale Toggle */}
        <button
          type="button"
          onClick={onToggleLargeText}
          className={`h-9 w-9 rounded-xl border text-xs font-sans font-[1000] transition-colors cursor-pointer ${
            largeText
              ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 border-stone-900 dark:border-amber-500"
              : "bg-[#FAF9F6] dark:bg-[#1B1714] border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200"
          }`}
          title="Toggle Large Counter Text"
        >
          {largeText ? "A+" : "A"}
        </button>

        {/* Quick Timer & Alerts Launcher */}
        <button
          type="button"
          onClick={() => onOpenSheet("timer")}
          className="h-9 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#1B1714] text-stone-700 dark:text-stone-200 hover:border-amber-500 flex items-center gap-1 text-xs font-mono font-bold cursor-pointer relative"
          title="Kitchen Timers & Phone Alerts"
        >
          <Timer size={15} />
          <span className="hidden md:inline">Timers</span>
          {timersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-extrabold flex items-center justify-center">
              {timersCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default CookModeHeader;