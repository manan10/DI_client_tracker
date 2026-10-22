import React from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm Action",
  type = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  const config = isDanger
    ? {
        icon: <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400" />,
        badgeBg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
        btnConfirm: "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs",
        accentBorder: "border-rose-500/30",
        italicAccent: "text-rose-700 dark:text-rose-400",
      }
    : {
        icon: <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />,
        badgeBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        btnConfirm: "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs",
        accentBorder: "border-amber-500/30",
        italicAccent: "text-amber-700 dark:text-amber-400",
      };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 antialiased text-left font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card: Crisp, clean, non-bubbly geometry */}
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-white/10 ${config.accentBorder} animate-in zoom-in-95 duration-200 z-10`}
      >
        {/* Top Header Row with Icon and Close Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${config.badgeBg}`}
          >
            {config.icon}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title & Explainer */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-lg font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}{" "}
            <span className={`italic font-normal ${config.italicAccent}`}>
              Confirmation
            </span>
          </h3>
          <p className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5 font-sans">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-md text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-1.5 rounded-md text-xs font-sans font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${config.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;