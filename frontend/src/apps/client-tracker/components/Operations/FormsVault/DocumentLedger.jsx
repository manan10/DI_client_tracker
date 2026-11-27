import React from "react";
import {
  Search,
  X,
  Tag,
  ExternalLink,
  Inbox,
  ShieldCheck,
  FolderOpen,
  Pencil,
  Compass,
} from "lucide-react";

const DocumentLedger = ({
  activeFolder,
  currentFolderForms,
  searchQuery,
  onSearchChange,
  onOpenSource,
  onOpenFallback,
  onEditForm,
}) => {
  const entityName = activeFolder?.name || "Institution";

  return (
    <div className="w-full space-y-4 font-sans text-left select-none animate-in fade-in duration-200">

      {/* 1. Command Search Bar & Folder Identifier */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Active Folder Context Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/25">
            <FolderOpen size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Inside Folder
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {currentFolderForms.length} Active Form{currentFolderForms.length === 1 ? "" : "s"}
              </span>
            </div>
            <h2 className="sora-font text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {entityName}
            </h2>
          </div>
        </div>

        {/* Right: Search Bar */}
        <div className="relative w-full sm:w-80 shrink-0">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search forms, reference codes, tags..."
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Inside-The-Folder Ledger Container */}
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3.5 bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <div className="col-span-7">Form Title & Identification</div>
          <div className="col-span-2">Reference Code</div>
          <div className="col-span-3 text-right">Dispatch & Management</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {currentFolderForms.length > 0 ? (
            currentFolderForms.map((form) => (
              <div
                key={form.id}
                className="p-4 sm:px-5 sm:py-4 hover:bg-slate-50/80 dark:hover:bg-[#1C2230]/60 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-start lg:items-center">

                  {/* Column 1: Document Details & Tags */}
                  <div className="lg:col-span-7 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25">
                        <ShieldCheck size={10} />
                        Official Format
                      </span>

                      <h3 className="sora-font text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {form.title}
                      </h3>
                    </div>

                    {/* Tag Cluster */}
                    {form.tags && form.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {form.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70"
                          >
                            <Tag size={9} className="opacity-50" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Reference Code */}
                  <div className="lg:col-span-2 min-w-0">
                    <span className="inline-block text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#1C2230] px-2.5 py-1 rounded-md border border-slate-200/70 dark:border-slate-700/70">
                      {form.code || "—"}
                    </span>
                  </div>

                  {/* Column 3: Actions Deck */}
                  <div className="lg:col-span-3 flex items-center justify-start lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/80">
                    {/* Secondary Portal Hub */}
                    {form.fallbackUrl && (
                      <button
                        type="button"
                        onClick={() => onOpenFallback(form)}
                        title="Open Institution Downloads Center"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200/80 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Compass size={13} className="text-amber-600 dark:text-amber-400" />
                        <span className="hidden sm:inline">Downloads Page</span>
                      </button>
                    )}

                    {/* Primary Direct Download CTA */}
                    <button
                      type="button"
                      onClick={() => onOpenSource(form)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg active:scale-[0.99] cursor-pointer transition-all"
                    >
                      <span>Open Form</span>
                      <ExternalLink size={13} strokeWidth={2.2} />
                    </button>

                    {/* Edit Action */}
                    <button
                      type="button"
                      onClick={() => onEditForm(form)}
                      title="Edit Form & Links"
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-[#1C2230] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 cursor-pointer transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <Inbox size={28} className="text-slate-300 dark:text-slate-600 mb-2.5" />
              <h4 className="sora-font text-sm font-bold text-slate-800 dark:text-slate-200">
                No forms indexed in {entityName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Click "Add New Form" in the header above to register official links for this folder.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DocumentLedger;