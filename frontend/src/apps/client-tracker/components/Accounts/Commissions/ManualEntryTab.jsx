import React from "react";
import { Calendar, Building2 } from "lucide-react";

const formatIndianNumber = (numStr) => {
  if (!numStr && numStr !== 0) return "";
  const parts = numStr.toString().split(".");
  const integerPart = parts[0].replace(/,/g, "");
  const decimalPart = parts[1] !== undefined ? "." + parts[1] : "";
  const lastThree = integerPart.slice(-3);
  const otherParts = integerPart.slice(0, -3);
  const formattedInteger = otherParts
    ? otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return formattedInteger + decimalPart;
};

const unformatNumber = (formattedStr) => {
  return formattedStr.toString().replace(/,/g, "");
};

const ManualEntryTab = ({
  sortedAmcList = [],
  formData = {},
  onAmountChange,
  onDaySelect,
  activeDayPicker,
  setActiveDayPicker,
  activePickerRef,
  daysInMonth,
  MONTHS,
  selectedMonth,
}) => {
  if (sortedAmcList.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#161B26] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
          <Building2 size={20} />
        </div>
        <p className="sora-font text-xs font-bold text-slate-800 dark:text-slate-200">
          No AMCs Linked
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Link mutual fund AMCs in your ARN settings to enter monthly commissions.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5 pb-24 animate-in fade-in duration-200">
      {/* Column Header Bar */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Fund House ({sortedAmcList.length} Linked)
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Payout Day & Amount (₹)
        </span>
      </div>

      {sortedAmcList.map((amc, idx) => {
        const amcName = typeof amc === "string" ? amc : amc.name;
        const amcId = typeof amc === "string" ? amc : amc._id || idx;
        if (!amcName) return null;

        const currentEntry = formData[amcName] || {};
        const amountNum = parseFloat(currentEntry.amount || 0);
        const hasAmount = amountNum > 0;
        const isPickerActive = activeDayPicker === amcName;

        return (
          <div
            key={amcId}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors ${
              hasAmount
                ? "bg-sky-50/35 dark:bg-sky-500/[0.04] border-sky-200/80 dark:border-sky-500/25"
                : "bg-white dark:bg-[#161B26] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {/* AMC Name */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasAmount
                    ? "bg-sky-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              />
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {amcName}
              </h4>
            </div>

            {/* Payout Day & Amount Inputs */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              {/* Day Picker */}
              <div
                className="relative"
                ref={isPickerActive ? activePickerRef : null}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveDayPicker(isPickerActive ? null : amcName)
                  }
                  className={`min-w-24 px-3 py-2 rounded-md text-xs font-mono font-semibold transition-colors border flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    currentEntry.day
                      ? "bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300"
                      : "bg-slate-50 dark:bg-[#131720] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Calendar
                    size={13}
                    className={
                      currentEntry.day
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400"
                    }
                  />
                  <span>
                    {currentEntry.day
                      ? `${currentEntry.day} ${MONTHS[selectedMonth]}`
                      : "Set Day"}
                  </span>
                </button>

                {isPickerActive && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-200 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Payout Day
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {MONTHS[selectedMonth]}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {[...Array(daysInMonth)].map((_, i) => {
                        const dayNum = i + 1;
                        const isSelectedDay = currentEntry.day === dayNum;
                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={() => onDaySelect(amcName, dayNum)}
                            className={`h-7 w-7 text-xs font-mono font-semibold rounded transition-colors cursor-pointer flex items-center justify-center ${
                              isSelectedDay
                                ? "bg-sky-600 text-white"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono font-semibold text-xs">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    currentEntry.amount
                      ? formatIndianNumber(currentEntry.amount)
                      : ""
                  }
                  onChange={(e) =>
                    onAmountChange(amcName, unformatNumber(e.target.value))
                  }
                  className={`w-36 sm:w-44 pl-7 pr-3 py-2 rounded-md text-right font-mono font-bold text-xs sm:text-sm border transition-colors outline-none tabular-nums ${
                    hasAmount
                      ? "bg-white dark:bg-[#131720] border-sky-400 dark:border-sky-500/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/15"
                      : "bg-slate-50/70 dark:bg-[#131720] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-sky-500"
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManualEntryTab;