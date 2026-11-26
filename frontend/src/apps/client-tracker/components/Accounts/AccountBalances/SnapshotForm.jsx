import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Calendar as CalendarIcon,
  FileText,
  Landmark,
  CheckCircle2,
  Info,
  Keyboard,
  CornerDownLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatLocalISO = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseISODate = (isoStr) => {
  if (!isoStr) return new Date();
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/* ========================================================================= */
/* CUSTOM THEMED DATE PICKER (NO NATIVE BROWSER UI)                          */
/* ========================================================================= */
const CustomDatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseISODate(value), [value]);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const containerRef = useRef(null);

  useEffect(() => {
    const d = parseISODate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const daysGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDate = (dateObj) => {
    onChange(formatLocalISO(dateObj));
    setOpen(false);
  };

  const applyPreset = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    selectDate(d);
  };

  const displayLabel = selectedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const weekdayLabel = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all outline-none cursor-pointer ${
          open
            ? "bg-white dark:bg-[#1C2230] border-sky-500 ring-2 ring-sky-500/15"
            : "bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <CalendarIcon size={14} strokeWidth={2.2} />
          </div>
          <div>
            <p className="sora-font text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {displayLabel}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {weekdayLabel}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-sky-200/70 dark:border-sky-500/20">
          Change
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => applyPreset(0)}
              className="flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-sky-50 dark:bg-[#161B26] dark:hover:bg-sky-500/15 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-1)}
              className="flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-sky-50 dark:bg-[#161B26] dark:hover:bg-sky-500/15 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Yesterday
            </button>
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="sora-font text-xs font-bold text-slate-900 dark:text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((cellDate, i) => {
              if (!cellDate) return <div key={`empty-${i}`} />;
              const cellISO = formatLocalISO(cellDate);
              const isSelected = cellISO === value;
              const isToday = cellISO === formatLocalISO(new Date());

              return (
                <button
                  key={cellISO}
                  type="button"
                  onClick={() => selectDate(cellDate)}
                  className={`h-8 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-sky-600 text-white"
                      : isToday
                        ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cellDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* MAIN SNAPSHOT FORM SIDE DRAWER                                            */
/* ========================================================================= */
const SnapshotForm = ({
  isOpen,
  onClose,
  groupedAccounts,
  inputValues,
  setInputValues,
  entryDate,
  onDateChange,
  note,
  setNote,
  onSave,
  saving,
  editingId,
}) => {
  const drawerRef = useRef(null);
  const groupRefs = useRef({});

  const toIndianCSV = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const parts = val.toString().split(".");
    const integerPart = parts[0].replace(/,/g, "");
    if (!integerPart) return parts.length > 1 ? `0.${parts[1].slice(0, 2)}` : "";
    const formattedInteger = new Intl.NumberFormat("en-IN").format(integerPart);
    return parts.length > 1
      ? `${formattedInteger}.${parts[1].slice(0, 2)}`
      : formattedInteger;
  };

  const totalAbsolute = Object.values(inputValues).reduce((sum, v) => {
    const num = typeof v === "string" ? v.replace(/,/g, "") : v;
    return sum + (Number(num) || 0);
  }, 0);

  const totalInLakhs = totalAbsolute / 100000;
  const isFormValid = Boolean(entryDate && totalAbsolute > 0);

  const filledAccountsCount = useMemo(
    () =>
      Object.values(inputValues).filter((v) => Number(String(v).replace(/,/g, "")) > 0)
        .length,
    [inputValues],
  );

  const totalAccountsCount = useMemo(
    () =>
      Object.values(groupedAccounts).reduce(
        (sum, grp) => sum + (grp.list?.length || 0),
        0,
      ),
    [groupedAccounts],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isFormValid && !saving) {
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSave, saving, isFormValid]);

  if (!isOpen) return null;

  const handleInputChange = (id, rawValue) => {
    let cleanValue = rawValue.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }
    setInputValues({ ...inputValues, [id]: cleanValue });
  };

  const handleClearAll = () => {
    setInputValues({});
  };

  const scrollToGroup = (key) => {
    const el = groupRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Build sequential tab order across all groups
  const groupEntries = Object.entries(groupedAccounts);
  let runningTabIndex = 1;

  return (
    /* BACKDROP */
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs transition-all">
      {/* RIGHT SIDE DRAWER (Preserving large desktop width) */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className="w-full h-dvh sm:w-212.5 lg:w-237.5 bg-white dark:bg-[#131720] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-[100%] sm:slide-in-from-bottom-0 sm:slide-in-from-right-[100%] duration-300 sm:border-l border-slate-200 dark:border-slate-800"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
          .sora-font {
            font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
          }
        `}</style>

        {/* --- HEADER --- */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-[#161B26] shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2 rounded-lg border ${
                editingId
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/25"
                  : "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-500/25"
              }`}
            >
              <Landmark size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingId ? (
                    <>
                      Edit{" "}
                      <span className="font-normal text-sky-600 dark:text-sky-300">
                        Balances
                      </span>
                    </>
                  ) : (
                    <>
                      Record{" "}
                      <span className="font-normal text-sky-600 dark:text-sky-300">
                        Balances
                      </span>
                    </>
                  )}
                </h2>
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131720] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                  {filledAccountsCount}/{totalAccountsCount} filled
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enter the current balance for each account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filledAccountsCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors outline-none cursor-pointer"
            >
              <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono font-semibold text-slate-400 bg-white dark:bg-[#131720]">
                ESC
              </kbd>
              <X
                size={20}
                className="text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white transition-colors"
              />
            </button>
          </div>
        </div>

        {/* --- DUAL-COLUMN WORKSPACE --- */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto sm:overflow-hidden bg-white dark:bg-[#131720]">
          {/* LEFT COLUMN: Date & Note */}
          <div className="w-full sm:w-[310px] lg:w-88 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161B26]/60 p-6 flex flex-col gap-5 sm:overflow-y-auto custom-scrollbar">
            {editingId && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-lg p-3.5 flex items-start gap-2.5">
                <Info
                  className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  Updating the saved entry for this date. Saving will replace
                  the previous amounts.
                </p>
              </div>
            )}

            {/* Custom Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Date
              </label>
              <CustomDatePicker value={entryDate} onChange={onDateChange} />
            </div>

            {/* Note Input */}
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <FileText
                  size={13}
                  className="text-sky-600 dark:text-sky-400"
                />
                <span>Note (Optional)</span>
              </label>

              <textarea
                rows="5"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any context or remarks..."
                className="w-full flex-1 min-h-[110px] bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/90 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none resize-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Holder Quick Jump List */}
            {groupEntries.length > 1 && (
              <div className="hidden sm:block space-y-2 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Jump to Holder
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {groupEntries.map(([key, grp]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => scrollToGroup(key)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-[#161B26] hover:bg-sky-50 dark:hover:bg-sky-500/15 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                    >
                      {grp.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-xs">
              <Keyboard size={14} />
              <span>Press Tab to move down accounts</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Account Inputs */}
          <div className="flex-1 p-6 sm:p-8 sm:overflow-y-auto custom-scrollbar bg-white dark:bg-[#131720]">
            <div className="max-w-3xl mx-auto space-y-8">
              {groupEntries.map(([key, group]) => {
                const groupSubtotal = group.list.reduce((sum, acc) => {
                  const raw = inputValues[acc._id];
                  const num =
                    typeof raw === "string" ? raw.replace(/,/g, "") : raw;
                  return sum + (Number(num) || 0);
                }, 0);

                return (
                  <div
                    key={key}
                    ref={(el) => {
                      groupRefs.current[key] = el;
                    }}
                    className="space-y-3 scroll-mt-4"
                  >
                    {/* Holder Group Header + Live Group Subtotal */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded-xs bg-sky-500" />
                        <h3 className="sora-font text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                          {group.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          ({group.list.length})
                        </span>
                      </div>

                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        Subtotal:{" "}
                        <strong className="text-slate-900 dark:text-white">
                          ₹
                          {new Intl.NumberFormat("en-IN", {
                            maximumFractionDigits: 2,
                          }).format(groupSubtotal)}
                        </strong>
                      </span>
                    </div>

                    {/* Account Rows */}
                    <div className="flex flex-col gap-2">
                      {group.list.map((acc) => {
                        const currentTab = runningTabIndex++;
                        const hasValue =
                          Number(
                            String(inputValues[acc._id] || "").replace(/,/g, ""),
                          ) > 0;

                        return (
                          <div
                            key={acc._id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded-lg border transition-all gap-3 ${
                              hasValue
                                ? "bg-sky-50/35 dark:bg-sky-500/[0.04] border-sky-200/80 dark:border-sky-500/25"
                                : "bg-slate-50/70 dark:bg-[#161B26] border-slate-200/90 dark:border-slate-800"
                            } focus-within:bg-white dark:focus-within:bg-[#1C2230] focus-within:border-sky-500 dark:focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/15`}
                          >
                            <div className="min-w-0 pr-3 flex-1">
                              <label
                                htmlFor={`input-${acc._id}`}
                                className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer block truncate"
                              >
                                {acc.name}
                              </label>
                              {acc.accountNumber && (
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 block">
                                  #{acc.accountNumber}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto shrink-0">
                              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                Tab <CornerDownLeft size={10} />
                              </span>

                              <div className="relative w-full sm:w-52">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono font-semibold text-xs">
                                  ₹
                                </span>
                                <input
                                  id={`input-${acc._id}`}
                                  type="text"
                                  inputMode="decimal"
                                  tabIndex={currentTab}
                                  value={toIndianCSV(inputValues[acc._id])}
                                  onChange={(e) =>
                                    handleInputChange(acc._id, e.target.value)
                                  }
                                  placeholder="0.00"
                                  className="w-full bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-700 rounded-md py-2 pl-7 pr-3 text-right font-mono text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors tabular-nums placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- STICKY FOOTER --- */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#161B26] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start bg-white dark:bg-[#131720] px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-mono text-lg sm:text-xl font-bold tabular-nums ${
                  totalAbsolute > 0
                    ? "text-sky-600 dark:text-sky-300"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                ₹
                {totalInLakhs.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs font-medium text-slate-400">Lakhs</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:block px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!isFormValid || saving}
              className={`w-full sm:w-auto px-7 py-3 rounded-lg font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 outline-none ${
                isFormValid && !saving
                  ? "bg-sky-600 text-white hover:bg-sky-500 active:scale-[0.99] cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300/60 dark:border-slate-700/60"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Balances</span>
                  <kbd
                    className={`hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isFormValid
                        ? "bg-sky-700/80 text-sky-100 border border-sky-400/30"
                        : "bg-slate-300/60 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    ⌘ ↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotForm;