import React from 'react';
import { Landmark, Calendar, Building2, AlertCircle, Sparkles } from 'lucide-react';

const formatIndianNumber = (numStr) => {
  if (!numStr && numStr !== 0) return '';
  const parts = numStr.toString().split('.');
  const integerPart = parts[0].replace(/,/g, '');
  const decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';
  const lastThree = integerPart.slice(-3);
  const otherParts = integerPart.slice(0, -3);
  const formattedInteger = otherParts ? (otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree) : lastThree;
  return formattedInteger + decimalPart;
};

const unformatNumber = (formattedStr) => {
  return formattedStr.toString().replace(/,/g, '');
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
  selectedMonth
}) => {
  if (sortedAmcList.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#0B1120] border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
          <Building2 size={20} />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          No AMC Entities Mapped
        </p>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
          Please link mutual fund AMCs in your ARN Registry settings to enable manual bookkeeping.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5 pb-24 animate-in fade-in duration-200">
      
      {/* Quick Summary Header Bar */}
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Mutual Fund House ({sortedAmcList.length} Registered)
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Payout Date & Gross Revenue (₹)
        </span>
      </div>

      {sortedAmcList.map((amc, idx) => {
        const amcName = typeof amc === 'string' ? amc : amc.name;
        const amcId = typeof amc === 'string' ? amc : amc._id || idx;
        if (!amcName) return null;

        const currentEntry = formData[amcName] || {};
        const amountNum = parseFloat(currentEntry.amount || 0);
        const hasAmount = amountNum > 0;
        const isPickerActive = activeDayPicker === amcName;

        return (
          <div 
            key={amcId} 
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
              hasAmount
                ? 'bg-white dark:bg-[#0B1120] border-emerald-500/30 dark:border-emerald-500/20 shadow-xs ring-1 ring-emerald-500/10'
                : 'bg-white dark:bg-[#0B1120] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
            }`}
          >
            {/* AMC Identity with Active Status Dot */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${hasAmount ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate">
                  {amcName}
                </h4>
              </div>
            </div>

            {/* Inputs: Payout Day Button & INR Currency Field */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
              
              {/* Day Picker Popover */}
              <div className="relative" ref={isPickerActive ? activePickerRef : null}>
                <button 
                  type="button"
                  onClick={() => setActiveDayPicker(isPickerActive ? null : amcName)}
                  className={`min-w-22.5 sm:min-w-26.25 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    currentEntry.day 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Calendar size={13} className={currentEntry.day ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                  <span>{currentEntry.day ? `${currentEntry.day} ${MONTHS[selectedMonth]}` : 'Set Day'}</span>
                </button>

                {isPickerActive && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-3 z-200 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Select Payout Day
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
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
                            className={`h-7 w-7 text-xs font-mono font-bold rounded-md transition-all cursor-pointer flex items-center justify-center ${
                              isSelectedDay
                                ? 'bg-emerald-600 text-white shadow-2xs' 
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">
                  ₹
                </span>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={currentEntry.amount ? formatIndianNumber(currentEntry.amount) : ''}
                  onChange={(e) => onAmountChange(amcName, unformatNumber(e.target.value))}
                  className={`w-32 sm:w-44 pl-7 pr-3 py-2 rounded-lg text-right font-mono font-bold text-xs sm:text-sm border transition-all outline-none tabular-nums ${
                    hasAmount
                      ? 'bg-emerald-50/50 dark:bg-emerald-500/8 border-emerald-300 dark:border-emerald-500/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20' 
                      : 'bg-slate-50/50 dark:bg-white/2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500'
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