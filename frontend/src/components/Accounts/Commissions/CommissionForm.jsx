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
} from "lucide-react";

import { useApi } from "../../../hooks/useApi";

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
  }, [selectedMonth, selectedYear, arnId, isOpen, sortedAmcList]);

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

      // mergedDataPayload contains items grouped by AMC: { amcName, amount, date }
      mergedDataPayload.forEach((match) => {
        const registryKey = Object.keys(updated).find(
          (k) =>
            k.toLowerCase().includes(match.amcName.toLowerCase()) ||
            match.amcName.toLowerCase().includes(k.toLowerCase()),
        );

        if (registryKey) {
          // Extract the integer day (e.g. 15) from the date string to match manual formatting
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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-dvh sm:w-125 lg:w-200 bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-[100%] duration-300 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg">
              <Landmark size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-[1000] dark:text-white uppercase italic tracking-tighter">
                {arnName}
              </h2>
              <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">
                {arnNickname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ONLY show Date Picker in MANUAL mode */}
            {entryMode === "MANUAL" && (
              <div className="relative animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white transition-all hover:border-emerald-500"
                >
                  <Calendar size={14} className="text-emerald-500" />
                  {MONTHS[selectedMonth]} {selectedYear}
                  <ChevronDown size={14} />
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-[100] animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => setSelectedYear((y) => y - 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-black text-xs dark:text-white">
                        {selectedYear}
                      </span>
                      <button
                        onClick={() => setSelectedYear((y) => y + 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {MONTHS.map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMonth(idx);
                            setShowMonthPicker(false);
                          }}
                          className={`py-2 text-[9px] font-black uppercase rounded-md transition-all ${selectedMonth === idx ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
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
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <button
            onClick={() => setEntryMode("MANUAL")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === "MANUAL" ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setEntryMode("UPLOAD")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === "UPLOAD" ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
          >
            Statement Auto-Log
          </button>
        </div>

        {/* Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-slate-50 dark:bg-[#010413]"
        >
          {entryMode === "UPLOAD" ? (
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

        {/* ONLY show primary Authorization Footer in MANUAL mode */}
        {entryMode === "MANUAL" && (
          <div className="p-4 sm:p-6 sm:px-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <IndianRupee size={20} />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Monthly Liquidity
                </p>
                <p className="text-xl sm:text-3xl font-[1000] dark:text-white italic tracking-tighter">
                  ₹
                  {totalGross.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                onSave({
                  arnId,
                  accountingMonth: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
                  data: formData,
                  totalGross,
                })
              }
              disabled={saving || isFetching || sortedAmcList.length === 0}
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg font-[1000] uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-600/90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {saving ? (
                <Loader2 className="animate-spin inline mr-2" size={16} />
              ) : (
                <CheckCircle2 className="inline mr-2" size={16} />
              )}
              Authorize Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionForm;
