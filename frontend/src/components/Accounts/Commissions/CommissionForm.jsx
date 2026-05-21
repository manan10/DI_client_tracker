import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Calendar, Landmark, CheckCircle2, IndianRupee, ChevronLeft, ChevronRight, ChevronDown, Loader2, Activity } from 'lucide-react';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const CommissionForm = ({ isOpen, onClose, arnName, arnNickname, arnId, amcList = [], onSave, saving }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeDayPicker, setActiveDayPicker] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({});
  
  const scrollContainerRef = useRef(null);
  const activePickerRef = useRef(null);

  const sortedAmcList = useMemo(() => {
    if (!amcList || amcList.length === 0) return [];
    
    return [...amcList].sort((a, b) => {
      const nameA = (typeof a === 'string' ? a : a.name || '').toLowerCase();
      const nameB = (typeof b === 'string' ? b : b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [amcList]);

  useEffect(() => {
    if (!isOpen || !arnId) return;

    const fetchExistingRecord = async () => {
      setIsFetching(true);
      try {
        const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const response = await fetch(`/api/commissions/${arnId}/${monthStr}`);
        const result = await response.json();

        const newFormData = {};
        sortedAmcList.forEach(amc => {
          const name = typeof amc === 'string' ? amc : amc.name;
          if (name) newFormData[name] = { amount: '', day: null };
        });

        if (result.success && result.data?.entries) {
          result.data.entries.forEach(entry => {
            if (Object.hasOwn(newFormData, entry.amcName)) {
              newFormData[entry.amcName] = { 
                amount: entry.amount > 0 ? entry.amount.toString() : '', 
                day: entry.payoutDay 
              };
            }
          });
        }
        setFormData(newFormData);
      } catch {
        const fallback = {};
        sortedAmcList.forEach(amc => {
          const name = typeof amc === 'string' ? amc : amc.name;
          if (name) fallback[name] = { amount: '', day: null };
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
          behavior: 'smooth',
          block: 'center'
        });
      }, 50);
    }
  }, [activeDayPicker]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const totalGross = useMemo(() => {
    return Object.values(formData).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [formData]);

  const handleDaySelect = (amcName, day) => {
    setFormData(prev => ({ ...prev, [amcName]: { ...prev[amcName], day: day } }));
    setActiveDayPicker(null);
  };

  const handleAmountChange = (amcName, e) => {
    const unformattedValue = unformatNumber(e.target.value);
    if (!/^\d*\.?\d*$/.test(unformattedValue)) return;
    setFormData(prev => ({ ...prev, [amcName]: { ...prev[amcName], amount: unformattedValue } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-dvh sm:w-212.5 lg:w-237.5 bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-[100%] duration-300 border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg">
              <Landmark size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-[1000] dark:text-white uppercase italic tracking-tighter">{arnName}</h2>
              <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">{arnNickname}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white transition-all hover:border-emerald-500"
              >
                <Calendar size={14} className="text-emerald-500" />
                {MONTHS[selectedMonth]} {selectedYear}
                <ChevronDown size={14} />
              </button>

              {showMonthPicker && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-100 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronLeft size={16}/></button>
                    <span className="font-black text-xs dark:text-white">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronRight size={16}/></button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map((m, idx) => (
                      <button
                        key={m}
                        onClick={() => { setSelectedMonth(idx); setShowMonthPicker(false); }}
                        className={`py-2 text-[9px] font-black uppercase rounded-md transition-all ${selectedMonth === idx ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50 dark:bg-[#010413]"
        >
          {sortedAmcList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Activity size={40} className="opacity-20" />
              <p className="font-black uppercase text-[10px] tracking-[0.3em] text-center">No AMCs mapped.<br/><span className="text-[8px] opacity-50 tracking-normal">Go to Settings &gt; AMC Registry to link AMCs.</span></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:gap-3 max-w-5xl mx-auto pb-32">
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
                          <div className="absolute top-full mt-2 right-0 sm:left-0 w-64 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 z-200 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-7 gap-1">
                              {[...Array(daysInMonth)].map((_, i) => (
                                <button
                                  key={i+1}
                                  onClick={() => handleDaySelect(amcName, i+1)}
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
                          onChange={(e) => handleAmountChange(amcName, e)}
                          className="w-24 sm:w-48 pl-6 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-3 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-lg text-right font-black dark:text-white outline-none focus:border-emerald-500 transition-all text-xs sm:text-lg"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 sm:px-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Liquidity</p>
              <p className="text-xl sm:text-3xl font-[1000] dark:text-white italic tracking-tighter">₹{totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <button 
            onClick={() => onSave({ arnId, accountingMonth: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`, data: formData, totalGross })}
            disabled={saving || isFetching || sortedAmcList.length === 0}
            className="w-full sm:w-auto bg-emerald-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg font-[1000] uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {saving ? <Loader2 className="animate-spin inline mr-2" size={16}/> : <CheckCircle2 className="inline mr-2" size={16}/>}
            Authorize Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionForm;