import React from 'react';
import { Activity } from 'lucide-react';

const formatIndianNumber = (numStr) => {
  if (!numStr) return '';
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
  sortedAmcList,
  formData,
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
      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
        <Activity size={40} className="opacity-20" />
        <p className="font-black uppercase text-[10px] tracking-[0.3em] text-center">
          No AMCs mapped.<br/>
          <span className="text-[8px] opacity-50 tracking-normal">Go to Settings &gt; AMC Registry to link AMCs.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:gap-3 max-w-5xl mx-auto pb-32 animate-in fade-in">
      {sortedAmcList.map((amc) => {
        const amcName = typeof amc === 'string' ? amc : amc.name;
        const amcId = typeof amc === 'string' ? amc : amc._id;
        if (!amcName) return null;

        const isPickerActive = activeDayPicker === amcName;

        return (
          <div 
            key={amcId} 
            className="flex flex-row items-center justify-between p-3 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic truncate">{amcName}</h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative" ref={isPickerActive ? activePickerRef : null}>
                <button 
                  onClick={() => setActiveDayPicker(isPickerActive ? null : amcName)}
                  className={`w-20 sm:w-40 px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-[8px] sm:text-[11px] font-black transition-all border-2 ${
                    formData[amcName]?.day 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                    : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'
                  }`}
                >
                  {formData[amcName]?.day ? `${formData[amcName].day} ${MONTHS[selectedMonth]}` : 'Set Day'}
                </button>

                {isPickerActive && (
                  <div className="absolute top-full mt-2 right-0 sm:left-0 w-64 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 z-[200] animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-7 gap-1">
                      {[...Array(daysInMonth)].map((_, i) => (
                        <button
                          key={i+1}
                          onClick={() => onDaySelect(amcName, i+1)}
                          className={`h-7 w-7 text-[9px] font-black rounded-md transition-all ${
                            formData[amcName]?.day === i+1 ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {i+1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] sm:text-sm">₹</span>
                <input 
                  type="text"
                  value={formData[amcName]?.amount ? formatIndianNumber(formData[amcName].amount) : ''}
                  onChange={(e) => onAmountChange(amcName, unformatNumber(e.target.value))}
                  className={`w-24 sm:w-48 pl-6 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-3 border-2 rounded-lg text-right font-black dark:text-white outline-none focus:border-emerald-500 transition-all text-xs sm:text-lg ${
                    formData[amcName]?.amount && parseFloat(formData[amcName].amount) > 0 
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30' 
                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'
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