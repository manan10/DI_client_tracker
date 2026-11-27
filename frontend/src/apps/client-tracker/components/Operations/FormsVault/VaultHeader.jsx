import React from "react";
import {
  Plus,
  Building2,
  Landmark,
  Layers,
} from "lucide-react";
import { SECTIONS } from "./vaultConstants";
import TabHeader from "../../../../../shared/components/TabHeader";

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
    <header className="w-full flex flex-col gap-5 shrink-0 font-sans text-left select-none">
      <TabHeader
        kicker="Regulatory & Operational Registry"
        title="Forms"
        accent="Vault"
        description="Centralized directory connecting directly to verified AMC, Bank, and RTA operational formats."
        actions={
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.99] flex items-center justify-center gap-2 outline-none cursor-pointer shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add New Form</span>
          </button>
        }
      />

      {/* FULL-WIDTH TAB NAVIGATION RAIL */}
      <div className="w-full border-b border-slate-200/80 dark:border-slate-800/80">
        <nav className="flex items-center gap-6 sm:gap-8 -mb-px overflow-x-auto no-scrollbar">
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
                  flex items-center gap-2 pb-3.5 text-xs font-semibold transition-colors relative outline-none cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.25 : 2}
                  className={
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                />
                <span className="sora-font">{sec.name}</span>

                {/* Count Pill */}
                <span
                  className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25"
                      : "bg-slate-100 text-slate-500 dark:bg-[#1C2230] dark:text-slate-400 border border-transparent"
                  }`}
                >
                  {folderCount}
                </span>

                {/* Active Underline Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400 animate-in fade-in duration-150 rounded-full" />
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