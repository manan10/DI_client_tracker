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

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeDayPicker, setActiveDayPicker] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({});

  const [entryMode, setEntryMode] = useState("MANUAL");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [extractedResults, setExtractedResults] = useState(null);

  const scrollContainerRef = useRef(null);
  const activePickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const monthPickerRef = useRef(null);

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
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full h-dvh sm:w-135 lg:w-215 bg-white dark:bg-[#131720] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
        {/* 1. TOP DRAWER HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-[#161B26] shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Landmark size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {arnName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-white dark:bg-[#131720] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  {arnNickname}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log monthly commission payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Custom Month/Year Selector */}
            {entryMode === "MANUAL" && (
              <div className="relative" ref={monthPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Calendar
                    size={13}
                    className="text-sky-600 dark:text-sky-400"
                  />
                  <span>
                    {MONTHS[selectedMonth]} {selectedYear}
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3.5 z-100 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedYear((y) => y - 1)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {selectedYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedYear((y) => y + 1)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
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
                          className={`py-2 rounded-md text-xs font-mono font-semibold uppercase transition-colors cursor-pointer ${
                            selectedMonth === idx
                              ? "bg-sky-600 text-white"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. MODE SWITCHER TABS */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#161B26]/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEntryMode("MANUAL")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none border ${
                entryMode === "MANUAL"
                  ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 border-sky-300 dark:border-sky-500/40"
                  : "bg-slate-100/70 dark:bg-[#131720] text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Edit3 size={14} />
              <span>Manual Entry</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode("UPLOAD")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none border ${
                entryMode === "UPLOAD"
                  ? "bg-white dark:bg-[#1C2230] text-cyan-600 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40"
                  : "bg-slate-100/70 dark:bg-[#131720] text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Statement Upload</span>
            </button>
          </div>
        </div>

        {/* 3. DYNAMIC CONTENT WORKSPACE */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 dark:bg-[#131720] no-scrollbar"
        >
          {isFetching ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2
                className="animate-spin text-sky-600 dark:text-sky-400"
                size={24}
              />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Loading month records...
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

        {/* 4. FOOTER */}
        {entryMode === "MANUAL" && (
          <div className="p-4 sm:px-6 bg-white dark:bg-[#161B26] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 z-50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <IndianRupee size={16} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Monthly Total
                </span>
                <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all disabled:opacity-50 cursor-pointer shrink-0 active:scale-[0.99]"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <CheckCircle2 size={15} strokeWidth={2.2} />
              )}
              <span>{saving ? "Saving..." : "Save Entries"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionForm;