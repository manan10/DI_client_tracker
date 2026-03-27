import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Landmark, CheckCircle2, IndianRupee, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

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

const CommissionForm = ({ isOpen, onClose, arnName, arnNickname, arnId, amcList, onSave, saving }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeDayPicker, setActiveDayPicker] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState(() => {
    const baseData = {};
    if (amcList) {
      amcList.forEach(amc => {
        baseData[amc.name] = { amount: '', day: null };
      });
    }
    return baseData;
  });

  useEffect(() => {
    if (!isOpen || !arnId) return;

    const fetchExistingRecord = async () => {
      setIsFetching(true);
      try {
        const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const response = await fetch(`/api/commissions/${arnId}/${monthStr}`);
        const result = await response.json();

        const newFormData = {};
        amcList.forEach(amc => {
            newFormData[amc.name] = { amount: '', day: null };
        });

        if (result.success && result.data?.entries) {
          result.data.entries.forEach(entry => {
            newFormData[entry.amcName] = { 
                amount: entry.amount.toString(), 
                day: entry.payoutDay 
            };
          });
        }
        setFormData(newFormData);
      } catch (error) {
        console.error("Error fetching existing records:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingRecord();
  }, [selectedMonth, selectedYear, arnId, isOpen, amcList]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const totalGross = useMemo(() => {
    return Object.values(formData).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [formData]);

  if (!isOpen) return null;

  const handleDaySelect = (amcName, day) => {
    setFormData(prev => ({ ...prev, [amcName]: { ...prev[amcName], day: day } }));
    setActiveDayPicker(null);
  };

  const handleAmountChange = (amcName, e) => {
    const target = e.target;
    const originalValue = target.value;
    const unformattedValue = unformatNumber(originalValue);
    if (!/^\d*\.?\d*$/.test(unformattedValue)) return;

    setFormData(prev => ({ ...prev, [amcName]: { ...prev[amcName], amount: unformattedValue } }));
    
    const formattedValue = formatIndianNumber(unformattedValue);
    const cursorPosition = target.selectionStart;
    const digitsBeforeCursor = unformatNumber(originalValue.slice(0, cursorPosition)).length;

    requestAnimationFrame(() => {
      target.value = formattedValue;
      let newCursorPos = 0;
      let digitsCount = 0;
      for (let i = 0; i < formattedValue.length; i++) {
        if (formattedValue[i] !== ',') digitsCount++;
        if (digitsCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
      target.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 md:p-6">
      {/* Inline style for scrollbar only */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #64748b; border-radius: 10px; }
      `}</style>

      {/* Removed ledger-paper-slate class */}
      <div className="bg-white dark:bg-slate-950 w-full md:max-w-6xl h-full md:h-[92vh] md:rounded-lg border-0 md:border-2 border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 md:px-12 py-6 md:py-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 z-100">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 dark:bg-emerald-500 rounded-lg flex items-center justify-center text-white dark:text-slate-900 shadow-lg rotate-3">
              <Landmark size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl md:text-3xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter italic">{ arnName } </h2>
                <span className="px-3 py-1 bg-slate-100 dark:bg-emerald-500/10 text-slate-600 dark:text-emerald-500 text-[10px] font-black rounded-full border border-slate-200 dark:border-emerald-500/20 tracking-widest uppercase italic">{arnNickname}</span>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Financial Reconciliation Matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <button 
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="w-full flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-900 px-5 py-3 rounded-sm text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest ring-2 ring-slate-200 dark:ring-slate-800 transition-all hover:ring-emerald-500/50"
                >
                  <Calendar size={14} className="text-emerald-500" />
                  {MONTHS[selectedMonth]} {selectedYear}
                  <ChevronDown size={14} className={showMonthPicker ? 'rotate-180' : ''} />
                </button>

                {showMonthPicker && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#0f172a] border-2 border-slate-800 rounded-lg shadow-2xl p-5 z-1001 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <button onClick={() => setSelectedYear(y => y-1)}><ChevronLeft size={18}/></button>
                      <span className="font-black text-slate-900 dark:text-white">{selectedYear}</span>
                      <button onClick={() => setSelectedYear(y => y+1)}><ChevronRight size={18}/></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS.map((m, idx) => (
                        <button
                          刻ey={m}
                          onClick={() => { setSelectedMonth(idx); setShowMonthPicker(false); }}
                          className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all ${selectedMonth === idx ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>
             <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={20} strokeWidth={3} /></button>
          </div>
        </div>

        {/* Content Area with Loading Overlay */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-[#010413]">
          {isFetching && (
            <div className="absolute inset-0 z-50 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
                    <Loader2 className="animate-spin text-emerald-500" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Synchronizing...</span>
                </div>
            </div>
          )}
          
          <div className="p-4 md:p-10 grid grid-cols-1 gap-3 max-w-5xl mx-auto">
            {amcList.map((amc) => (
              <div 
                key={amc._id} 
                className={`group relative flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-300 ${activeDayPicker === amc.name ? 'z-90' : 'z-10'} hover:border-slate-400 dark:hover:border-slate-700`}
              >
                <div className="flex-1 pl-4">
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight italic">{amc.name}</h3>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDayPicker(activeDayPicker === amc.name ? null : amc.name)}
                      className={`w-full md:w-48 flex items-center justify-between px-5 py-3.5 rounded-lg text-[13px] font-black transition-all border-2 ${
                        formData[amc.name]?.day 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className={formData[amc.name]?.day ? 'text-emerald-500' : 'text-slate-400/60'} />
                        <span>{formData[amc.name]?.day ? `${formData[amc.name].day} ${MONTHS[selectedMonth]}` : 'Set Date'}</span>
                      </div>
                      <ChevronDown size={14} className={activeDayPicker === amc.name ? 'rotate-180' : ''} />
                    </button>

                    {activeDayPicker === amc.name && (
                      <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-[#0f172a] border-2 border-slate-800 rounded-lg shadow-2xl p-4 z-1000 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-7 gap-1">
                          {[...Array(daysInMonth)].map((_, i) => (
                            <button
                              key={i+1}
                              onClick={() => handleDaySelect(amc.name, i+1)}
                              className={`h-8 w-8 text-[11px] font-black rounded-sm transition-all ${
                                formData[amc.name]?.day === i+1 ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/40 dark:text-indigo-400/30 font-black italic text-sm">₹</span>
                    <input 
                      type="text"
                      placeholder="0.00"
                      value={formData[amc.name] ? formatIndianNumber(formData[amc.name].amount) : ''}
                      onChange={(e) => handleAmountChange(amc.name, e)}
                      className="w-full md:w-56 pl-10 pr-6 py-4 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-lg text-right text-xl font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-12 py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0 z-100">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-slate-50 dark:bg-indigo-500/5 rounded-lg border border-slate-200 dark:border-indigo-500/20">
               <IndianRupee className="text-slate-900 dark:text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Liquidity</p>
              <div className="flex items-baseline gap-2">
                <span className="text-indigo-500 dark:text-emerald-500 font-black italic text-xl">₹</span>
                <span className="text-4xl font-[1000] text-slate-950 dark:text-white tracking-tighter italic">
                  {totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onSave({ 
              arnId, 
              accountingMonth: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`, 
              data: formData,
              totalGross
            })}
            disabled={saving || isFetching}
            className="w-full md:w-auto flex items-center justify-center gap-4 px-16 py-5 bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-lg font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-800 dark:hover:bg-emerald-400 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? "Processing..." : <><CheckCircle2 size={18} /> Authorize Ledger</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionForm;