import React from "react";
import {
  ExternalLink,
  Printer,
  FileText,
  Tag,
  ShieldCheck,
  Info,
  Maximize2,
  Minimize2,
  Pencil,
  Compass,
  CheckCircle2,
  Building2,
} from "lucide-react";

const DocumentPreviewStage = ({
  currentPreview,
  activeFolder,
  isExpanded,
  onToggleExpand,
  onOpenSource,
  onOpenFallback,
  onEditForm,
  onPrint,
}) => {
  const entityName =
    activeFolder?.name ||
    (typeof currentPreview?.folderId === "object" && currentPreview?.folderId !== null
      ? currentPreview?.folderId?.name
      : currentPreview?.section) ||
    "Institution";

  return (
    <div
      className={`${
        isExpanded ? "lg:col-span-12" : "lg:col-span-5 xl:col-span-4"
      } sticky top-6 min-w-0`}
    >
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Stage Top Nav Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileText size={16} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                Form Details
              </h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {currentPreview
                  ? `${entityName} • ${currentPreview.code}`
                  : "No document selected"}
              </p>
            </div>
          </div>

          {currentPreview && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onToggleExpand}
                title={isExpanded ? "Standard View" : "Expand View"}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              <button
                type="button"
                onClick={() => onEditForm(currentPreview)}
                title="Edit Form & Links"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold cursor-pointer transition-colors"
              >
                <Pencil size={13} />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onPrint(currentPreview)}
                title="Print Document"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold cursor-pointer transition-colors"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {currentPreview ? (
          <div className="p-5 space-y-4 text-left">
            {/* Visual Document Hero Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-linear-to-br from-slate-50 to-emerald-50/30 dark:from-white/3 dark:to-emerald-950/10 border border-slate-200/80 dark:border-white/10 space-y-3.5">
              
              {/* Category Badge & Form Code */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-500/30">
                  <ShieldCheck size={11} />
                  Verified Official Form
                </span>

                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  Ref: {currentPreview.code}
                </span>
              </div>

              {/* BOLD & PROMINENT ENTITY NAME */}
              <div className="pt-0.5 pb-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                  <Building2 size={11} className="text-emerald-500" />
                  Issuing Institution
                </span>
                <h2 className="text-xl sm:text-2xl font-[1000] uppercase italic tracking-tight text-slate-900 dark:text-white leading-tight wrap-break-word">
                  {entityName}
                </h2>
              </div>

              {/* Form Title & Context */}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Form Document
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-snug">
                  {currentPreview.title}
                </h3>
              </div>

              {/* Primary Direct Download / Open Action Button */}
              <button
                type="button"
                onClick={() => onOpenSource(currentPreview)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
              >
                <span>Open & Download Form</span>
                <ExternalLink size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Fallback Downloads Page Section (Friendly Non-Technical Banner) */}
            {currentPreview.fallbackUrl ? (
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/70 dark:border-amber-500/20 flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                    <Compass size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{entityName} Downloads Center</span>
                  </div>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-tight">
                    If the direct form doesn't load or has changed, locate it here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenFallback(currentPreview)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                >
                  <span>Open Center</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            ) : null}

            {/* Desk Instructions & Enclosures */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info size={13} className="text-blue-500" />
                Submission Guidelines & Attachments
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  {currentPreview.description ||
                    "No special instructions recorded for this form."}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200/50 dark:border-white/5">
                  <CheckCircle2 size={12} />
                  <span>Ready for office printing & client signature</span>
                </div>
              </div>
            </div>

            {/* Categorization Tags */}
            {currentPreview.tags && currentPreview.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tags & Categories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPreview.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-white/10"
                    >
                      <Tag size={9} className="opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <FileText size={22} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              No Form Selected
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
              Select any form from the list to view its submission checklist, print format, and download button.
            </p>
          </div>
        )}

        {/* Footer Info */}
        {currentPreview && (
          <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Direct Official Route</span>
            <span>Ref: {currentPreview.updatedAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewStage;