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
      
      {/* 1. Large Command Search Bar & Folder Identifier */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Active Folder Context Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <FolderOpen size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Inside Folder
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {currentFolderForms.length} Active Form{currentFolderForms.length === 1 ? "" : "s"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
              {entityName}
            </h2>
          </div>
        </div>

        {/* Right: Enlarged Search Bar */}
        <div className="relative w-full sm:w-96 shrink-0">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search forms, reference codes, tags..."
            className="w-full bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual "Inside-The-Folder" Table Workspace */}
      <div className="relative rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-slate-50/50 dark:bg-[#0B1120]/60 p-2 sm:p-3 shadow-lg shadow-emerald-950/5">
        
        {/* Ledger Container */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 dark:bg-white/2 border-b border-slate-200 dark:border-white/10 text-[11px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="col-span-7">Form Title & Identification</div>
            <div className="col-span-2">Reference Code</div>
            <div className="col-span-3 text-right">Dispatch & Management</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {currentFolderForms.length > 0 ? (
              currentFolderForms.map((form) => (
                <div
                  key={form.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-white/2 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-start lg:items-center">
                    
                    {/* Column 1: Document Details & Tags */}
                    <div className="lg:col-span-7 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                          <ShieldCheck size={10} />
                          Official Format
                        </span>

                        {/* HIGH READABILITY LARGE FORM TITLE */}
                        <h3 className="text-base sm:text-lg font-[1000] text-slate-900 dark:text-white tracking-tight leading-snug">
                          {form.title}
                        </h3>
                      </div>

                      {/* Tag Cluster */}
                      {form.tags && form.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {form.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5"
                            >
                              <Tag size={9} className="opacity-40" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Reference Code */}
                    <div className="lg:col-span-2 min-w-0">
                      <span className="inline-block text-xs font-mono font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 shadow-2xs">
                        {form.code}
                      </span>
                    </div>

                    {/* Column 3: Actions Deck (Edit Always Visible + Direct Open + Fallback Hub) */}
                    <div className="lg:col-span-3 flex items-center justify-start lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                      {/* Secondary Portal Hub */}
                      {form.fallbackUrl && (
                        <button
                          type="button"
                          onClick={() => onOpenFallback(form)}
                          title="Open Institution Downloads Center"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Compass size={13} className="text-amber-600 dark:text-amber-400" />
                          <span className="hidden sm:inline">Downloads Page</span>
                        </button>
                      )}

                      {/* Primary Direct Download CTA */}
                      <button
                        type="button"
                        onClick={() => onOpenSource(form)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-sm hover:shadow active:scale-[0.98] cursor-pointer transition-all"
                      >
                        <span>Open Form</span>
                        <ExternalLink size={13} strokeWidth={2.5} />
                      </button>

                      {/* Always-Visible Edit Action */}
                      <button
                        type="button"
                        onClick={() => onEditForm(form)}
                        title="Edit Form & Links"
                        className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <Inbox size={32} className="text-slate-300 dark:text-slate-600 mb-2.5" />
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  No forms indexed in {entityName}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click "Upload Document" in the header above to register official links for this folder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DocumentLedger;