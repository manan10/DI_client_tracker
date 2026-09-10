import React from "react";
import {
  Sparkles,
  Plus,
  Building2,
  Landmark,
  Layers,
} from "lucide-react";
import { SECTIONS } from "./vaultConstants";

const ICONS = {
  AMC: Building2,
  BANK: Landmark,
  RTA: Layers,
};

const VaultHeader = ({
  activeSection,
  onSelectSection,
  folders = [],
  onOpenUpload,
}) => {
  return (
    <header className="w-full flex flex-col gap-6 shrink-0 font-sans text-left select-none">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE BAR: Title (Left) & Index Button (Right)                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
        <div className="shrink-0 flex flex-col items-start">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-3">
            <Sparkles size={11} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 uppercase tracking-widest">
              Regulatory & Operational Registry
            </span>
          </div>

          {/* Master Heading */}
          <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
            Forms <span className="text-emerald-500">Vault</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
            Centralized directory connecting directly to verified AMC, Bank, and RTA operational formats.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-[1000] uppercase tracking-wider rounded-xl shadow-xs hover:shadow active:scale-[0.98] transition-all cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add New Form</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED FULL-WIDTH TAB NAVIGATION RAIL                               */}
      {/* ========================================================================= */}
      <div className="w-full border-b border-slate-200 dark:border-white/10">
        <nav className="flex items-center gap-8 sm:gap-10 -mb-px">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const Icon = ICONS[sec.id] || Building2;
            const folderCount = folders.filter((f) => f.section === sec.id).length;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`
                  flex items-center gap-2.5 pb-4 text-xs font-bold uppercase tracking-wider transition-all relative outline-none cursor-pointer
                  ${
                    isActive
                      ? "text-slate-900 dark:text-white font-[1000]"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }
                `}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                />
                <span>{sec.name}</span>

                {/* Count Pill */}
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                      : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500"
                  }`}
                >
                  {folderCount}
                </span>

                {/* Active Underline Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 animate-in fade-in duration-150 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default VaultHeader;