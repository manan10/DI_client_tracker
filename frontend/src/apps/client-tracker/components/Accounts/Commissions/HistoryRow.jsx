import React, { useState } from "react";
import { Calendar, ChevronDown, Trash2, Copy, Building2 } from "lucide-react";
import { toast } from "sonner";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatShortMonth = (monthStr) => {
  if (!monthStr || monthStr === "N/A") return "Last Month";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[month - 1] || parts[1]} '${year.slice(-2)}`;
};

const HistoryRow = ({ row, onDeleteSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeEntries = (row?.entries || [])
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => (a.amcName || "").localeCompare(b.amcName || ""));

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(row._id);
    toast.success("Record ID copied", { duration: 1200 });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/commissions/${row._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Entries for ${row.accountingMonth} deleted`);
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        toast.error(json.message || "Failed to delete record");
      }
    } catch {
      toast.error("Connection lost while deleting");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP ROW VIEW (>= md)                              */}
      {/* ======================================================== */}
      <tr
        onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
        className={`hidden md:table-row group cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/60 ${
          isExpanded
            ? "bg-sky-50/50 dark:bg-sky-500/[0.06]"
            : "hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
        } ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
      >
        {/* Month */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                isExpanded
                  ? "bg-sky-600 border-sky-600 text-white"
                  : "bg-slate-100 dark:bg-[#1C2230] border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300"
              }`}
            >
              <Calendar size={14} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white block">
                {row.accountingMonth}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {formatShortMonth(row.accountingMonth)}
              </span>
            </div>
          </div>
        </td>

        {/* AMC Breakdown */}
        <td className="px-5 py-3.5 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-40">
              {activeEntries[0]?.amcName || "No AMC recorded"}
            </span>
            {activeEntries.length > 1 && (
              <span className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-300 mt-0.5">
                + {activeEntries.length - 1} more AMC
                {activeEntries.length > 2 ? "s" : ""}
              </span>
            )}
          </div>
        </td>

        {/* Net Commission */}
        <td className="px-5 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white text-sm">
          ₹{formatINR(row.totalGross)}
        </td>

        {/* Status */}
        <td className="px-5 py-3.5 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Saved
          </span>
        </td>

        {/* Expand Action */}
        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                isExpanded
                  ? "bg-sky-100/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300"
                  : "text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
              }`}
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </td>
      </tr>

      {/* ======================================================== */}
      {/* 2. MOBILE CARD VIEW (< md)                               */}
      {/* ======================================================== */}
      <tr className="md:hidden border-b border-slate-100 dark:border-slate-800/60">
        <td colSpan="5" className="p-0">
          <div
            onClick={() => !isDeleting && setIsExpanded(!isExpanded)}
            className={`p-4 transition-colors cursor-pointer ${
              isExpanded
                ? "bg-sky-50/50 dark:bg-sky-500/[0.06]"
                : "bg-white dark:bg-[#131720]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                    isExpanded
                      ? "bg-sky-600 border-sky-600 text-white"
                      : "bg-slate-100 dark:bg-[#1C2230] border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Calendar size={14} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block">
                    {row.accountingMonth}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {activeEntries[0]?.amcName || "No AMC"}
                    {activeEntries.length > 1 &&
                      ` +${activeEntries.length - 1} more`}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block tabular-nums">
                  ₹{formatINR(row.totalGross)}
                </span>
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-300 inline-flex items-center gap-1 mt-0.5">
                  Details{" "}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* ======================================================== */}
      {/* 3. EXPANDED AMC BREAKDOWN                                */}
      {/* ======================================================== */}
      {isExpanded && (
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <td colSpan="5" className="p-0">
            <div className="bg-slate-50/80 dark:bg-[#161B26] p-4 sm:p-5 border-t border-slate-200/70 dark:border-slate-800 animate-in fade-in duration-200">
              {/* Breakdown Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2
                    size={14}
                    className="text-sky-600 dark:text-sky-400"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    AMC Breakdown ({activeEntries.length})
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Total: ₹{formatINR(row.totalGross)}
                </span>
              </div>

              {/* AMC Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2.5 px-3.5 bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-md"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                        title={entry.amcName}
                      >
                        {entry.amcName}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums shrink-0">
                      ₹{formatINR(entry.amount)}
                    </span>
                  </div>
                ))}

                {activeEntries.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No individual AMC amounts recorded for this month.
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={copyId}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
                >
                  <Copy size={12} /> ID: {row._id}
                </button>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete Month
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Delete this month?
                    </span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default HistoryRow;