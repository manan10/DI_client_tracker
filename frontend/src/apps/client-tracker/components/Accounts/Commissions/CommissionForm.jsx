import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Landmark,
  CheckCircle2,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileSpreadsheet,
  Edit3,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import { useApi } from "../../../../../shared/hooks/useApi";

import ManualEntryTab from "./ManualEntryTab";
import StatementUploadTab from "./StatementUploadTab";

const MONTHS = [
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

const CommissionForm = ({
  isOpen,
  onClose,
  arnName,
  arnNickname,
  arnId,
  amcList = [],
  onSave,
  saving,
}) => {
  const { request } = useApi();

  // --- Core State ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeDayPicker, setActiveDayPicker] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({});

  // --- Upload State ---
  const [entryMode, setEntryMode] = useState("MANUAL");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [extractedResults, setExtractedResults] = useState(null);

  const scrollContainerRef = useRef(null);
  const activePickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const monthPickerRef = useRef(null);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target)
      ) {
        setShowMonthPicker(false);
      }
    };
    if (showMonthPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMonthPicker]);

  const sortedAmcList = useMemo(() => {
    if (!amcList || amcList.length === 0) return [];
    return [...amcList].sort((a, b) => {
      const nameA = (typeof a === "string" ? a : a.name || "").toLowerCase();
      const nameB = (typeof b === "string" ? b : b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [amcList]);

  useEffect(() => {
    if (!isOpen || !arnId) return;

    const fetchExistingRecord = async () => {
      setIsFetching(true);
      try {
        const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
        const result = await request(
          `/commissions/${arnId}/${monthStr}`,
          "GET",
        );

        const newFormData = {};
        sortedAmcList.forEach((amc) => {
          const name = typeof amc === "string" ? amc : amc.name;
          if (name) newFormData[name] = { amount: "", day: null };
        });

        if (result?.success && result?.data?.entries) {
          result.data.entries.forEach((entry) => {
            if (Object.hasOwn(newFormData, entry.amcName)) {
              newFormData[entry.amcName] = {
                amount: entry.amount > 0 ? entry.amount.toString() : "",
                day: entry.payoutDay,
              };
            }
          });
        }
        setFormData(newFormData);
      } catch (error) {
        console.error("Fetch existing record error:", error);
        const fallback = {};
        sortedAmcList.forEach((amc) => {
          const name = typeof amc === "string" ? amc : amc.name;
          if (name) fallback[name] = { amount: "", day: null };
        });
        setFormData(fallback);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingRecord();
  }, [selectedMonth, selectedYear, arnId, isOpen, sortedAmcList, request]);

  useEffect(() => {
    if (activeDayPicker && activePickerRef.current) {
      setTimeout(() => {
        activePickerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    }
  }, [activeDayPicker]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const totalGross = useMemo(() => {
    return Object.values(formData).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [formData]);

  // --- Handlers ---
  const handleDaySelect = (amcName, day) => {
    setFormData((prev) => ({
      ...prev,
      [amcName]: { ...prev[amcName], day: day },
    }));
    setActiveDayPicker(null);
  };

  const handleAmountChange = (amcName, unformattedValue) => {
    if (!/^\d*\.?\d*$/.test(unformattedValue)) return;
    setFormData((prev) => ({
      ...prev,
      [amcName]: { ...prev[amcName], amount: unformattedValue },
    }));
  };

  const handleFileSelect = (e) => {
    const incomingFiles = e.target.files;
    if (incomingFiles && incomingFiles.length > 0) {
      const fileArray = Array.from(incomingFiles);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const processStatements = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessingFiles(true);

    try {
      const uploadData = new FormData();
      selectedFiles.forEach((f) => uploadData.append("files", f));
      uploadData.append("arnId", arnId);
      uploadData.append("month", selectedMonth + 1);
      uploadData.append("year", selectedYear);

      const result = await request(
        "/commissions/extract-statements",
        "POST",
        uploadData,
      );

      if (result && result.success) {
        setExtractedResults(result.data);
      } else {
        throw new Error(
          result?.message || "Failed to extract data from statements.",
        );
      }
    } catch (error) {
      console.error("Statement processing error:", error);
      alert(
        error.message || "Something went wrong while processing the files.",
      );
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleUpdateMapping = (index, newAmcName) => {
    setExtractedResults((prev) => {
      const updated = [...prev];
      updated[index].amcName = newAmcName;
      return updated;
    });
  };

  const handleToggleExclude = (index) => {
    setExtractedResults((prev) => {
      const updated = [...prev];
      updated[index].isExcluded = !updated[index].isExcluded;
      return updated;
    });
  };

  const handleAcceptResults = (mergedDataPayload) => {
    if (!mergedDataPayload || mergedDataPayload.length === 0) return;

    setFormData((prev) => {
      const updated = { ...prev };

      mergedDataPayload.forEach((match) => {
        const registryKey = Object.keys(updated).find(
          (k) =>
            k.toLowerCase().includes(match.amcName.toLowerCase()) ||
            match.amcName.toLowerCase().includes(k.toLowerCase()),
        );

        if (registryKey) {
          const earliestDay = match.date
            ? new Date(match.date).getDate()
            : null;

          updated[registryKey] = {
            amount: match.amount.toString(),
            day: earliestDay || updated[registryKey].day,
          };
        }
      });
      return updated;
    });

    setExtractedResults(null);
    setSelectedFiles([]);
    setEntryMode("MANUAL");
  };

  const handleDiscardResults = () => {
    setExtractedResults(null);
    setSelectedFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full h-dvh sm:w-135 lg:w-215 bg-white dark:bg-[#0B1120] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10">
        {/* --- 1. TOP DRAWER HEADER --- */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/70 dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Landmark size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {arnName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 shrink-0">
                  {arnNickname}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                Brokerage Reconciliation Workbench
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Custom Month/Year Selector */}
            {entryMode === "MANUAL" && (
              <div className="relative" ref={monthPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-all shadow-2xs cursor-pointer"
                >
                  <Calendar
                    size={13}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <span>
                    {MONTHS[selectedMonth]} {selectedYear}
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-3.5 z-100 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setSelectedYear((y) => y - 1)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {selectedYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedYear((y) => y + 1)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {MONTHS.map((m, idx) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => {
                            setSelectedMonth(idx);
                            setShowMonthPicker(false);
                          }}
                          className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                            selectedMonth === idx
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- 2. HIGH-CONTRAST STRUCTURED TABS --- */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-[#070B14] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEntryMode("MANUAL")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none border ${
                entryMode === "MANUAL"
                  ? "bg-white dark:bg-[#0B1120] text-emerald-700 dark:text-emerald-400 border-slate-200/90 dark:border-white/15 shadow-sm ring-2 ring-emerald-500/20"
                  : "bg-slate-100/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10"
              }`}
            >
              <Edit3
                size={14}
                className={
                  entryMode === "MANUAL"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400"
                }
              />
              <span>Manual Entry</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode("UPLOAD")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none border ${
                entryMode === "UPLOAD"
                  ? "bg-white dark:bg-[#0B1120] text-indigo-700 dark:text-indigo-400 border-slate-200/90 dark:border-white/15 shadow-sm ring-2 ring-indigo-500/20"
                  : "bg-slate-100/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10"
              }`}
            >
              <FileSpreadsheet
                size={14}
                className={
                  entryMode === "UPLOAD"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }
              />
              <span>Statement Auto-Log</span>
            </button>
          </div>
        </div>

        {/* --- 3. DYNAMIC CONTENT WORKSPACE --- */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#070B14] no-scrollbar"
        >
          {isFetching ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2
                className="animate-spin text-emerald-600 dark:text-emerald-400"
                size={24}
              />
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Synchronizing cycle records...
              </p>
            </div>
          ) : entryMode === "UPLOAD" ? (
            <StatementUploadTab
              fileInputRef={fileInputRef}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onRemoveFile={removeFile}
              onProcess={processStatements}
              isProcessing={isProcessingFiles}
              extractedResults={extractedResults}
              onAcceptResults={handleAcceptResults}
              onDiscardResults={handleDiscardResults}
              onUpdateMapping={handleUpdateMapping}
              onToggleExclude={handleToggleExclude}
              sortedAmcList={sortedAmcList}
            />
          ) : (
            <ManualEntryTab
              sortedAmcList={sortedAmcList}
              formData={formData}
              onAmountChange={handleAmountChange}
              onDaySelect={handleDaySelect}
              activeDayPicker={activeDayPicker}
              setActiveDayPicker={setActiveDayPicker}
              activePickerRef={activePickerRef}
              daysInMonth={daysInMonth}
              MONTHS={MONTHS}
              selectedMonth={selectedMonth}
            />
          )}
        </div>

        {/* --- 4. TELEMETRY AUTHORIZATION FOOTER --- */}
        {entryMode === "MANUAL" && (
          <div className="p-4 sm:p-5 px-6 sm:px-8 bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 z-50 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <IndianRupee size={18} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Monthly Total Gross
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight tabular-nums mt-0.5">
                  ₹
                  {totalGross.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onSave({
                  arnId,
                  accountingMonth: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
                  data: formData,
                  totalGross,
                })
              }
              disabled={saving || isFetching || sortedAmcList.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <CheckCircle2 size={15} strokeWidth={2.2} />
              )}
              <span>{saving ? "Authorizing..." : "Authorize Ledger"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionForm;
