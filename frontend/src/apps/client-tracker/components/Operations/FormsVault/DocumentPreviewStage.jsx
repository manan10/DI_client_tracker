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
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden flex flex-col">
        {/* Stage Top Nav Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#1C2230] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/25">
              <FileText size={15} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="sora-font text-xs font-bold text-slate-900 dark:text-white truncate">
                Form Details
              </h4>
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
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
                className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              <button
                type="button"
                onClick={() => onEditForm(currentPreview)}
                title="Edit Form & Links"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Pencil size={12} />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onPrint(currentPreview)}
                title="Print Document"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Printer size={12} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {currentPreview ? (
          <div className="p-5 space-y-4 text-left">
            {/* Visual Document Hero Card */}
            <div className="p-4 sm:p-5 rounded-lg bg-slate-50/80 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/70 space-y-3.5">

              {/* Category Badge & Form Code */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25">
                  <ShieldCheck size={11} />
                  Verified Official Form
                </span>

                <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161B26] px-2.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80">
                  Ref: {currentPreview.code}
                </span>
              </div>

              {/* ENTITY NAME */}
              <div className="pt-0.5 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                  <Building2 size={11} className="text-sky-500 dark:text-sky-400" />
                  Issuing Institution
                </span>
                <h2 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight wrap-break-word">
                  {entityName}
                </h2>
              </div>

              {/* Form Title & Context */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Form Document
                </span>
                <h3 className="sora-font text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {currentPreview.title}
                </h3>
              </div>

              {/* Primary Direct Download / Open Action Button */}
              <button
                type="button"
                onClick={() => onOpenSource(currentPreview)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Open & Download Form</span>
                <ExternalLink size={14} strokeWidth={2.2} />
              </button>
            </div>

            {/* Fallback Downloads Page Section */}
            {currentPreview.fallbackUrl ? (
              <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25 flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <Compass size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{entityName} Downloads Center</span>
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-tight">
                    If the direct form doesn't load or has changed, locate it here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenFallback(currentPreview)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold shrink-0 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>Open Center</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            ) : null}

            {/* Desk Instructions & Enclosures */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info size={13} className="text-sky-500 dark:text-sky-400" />
                Submission Guidelines & Attachments
              </span>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p>
                  {currentPreview.description ||
                    "No special instructions recorded for this form."}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600 dark:text-sky-300 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70">
                  <CheckCircle2 size={12} />
                  <span>Ready for office printing & client signature</span>
                </div>
              </div>
            </div>

            {/* Categorization Tags */}
            {currentPreview.tags && currentPreview.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tags & Categories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPreview.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1C2230] px-2.5 py-1 rounded-md border border-slate-200/70 dark:border-slate-700/70"
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
            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <FileText size={20} />
            </div>
            <h4 className="sora-font text-xs font-bold text-slate-700 dark:text-slate-200">
              No Form Selected
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
              Select any form from the list to view its submission checklist, print format, and download button.
            </p>
          </div>
        )}

        {/* Footer Info */}
        {currentPreview && (
          <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#1C2230] flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span>Direct Official Route</span>
            <span>Ref: {currentPreview.updatedAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewStage;