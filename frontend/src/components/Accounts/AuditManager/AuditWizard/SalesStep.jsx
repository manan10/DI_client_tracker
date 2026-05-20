import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Info, Check, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

// FIXED: Calling onUpdateTransaction straight out of the destructured top-level prop array parameters cleanly
const SalesStep = ({ selection, arns = [], onUpdateTransaction }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePickerId, setActivePickerId] = useState(null);

  const [pickerNav, setPickerNav] = useState({ month: selection.month, year: selection.year });
  const [pickerCoords, setPickerCoords] = useState({ top: 0, left: 0 });

  const pickerRef = useRef(null);
  const activeTriggerRef = useRef(null);

  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setActivePickerId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (activePickerId && activeTriggerRef.current) {
      const updatePosition = () => {
        const rect = activeTriggerRef.current.getBoundingClientRect();
        let targetLeft = rect.right + window.scrollX + 12;
        let targetTop = rect.top + window.scrollY - 100;

        if (targetLeft + 288 > window.innerWidth) {
          targetLeft = rect.left + window.scrollX - 300;
        }
        if (targetTop + 280 > window.innerHeight + window.scrollY) {
          targetTop = window.innerHeight + window.scrollY - 300;
        }
        if (targetTop < window.scrollY) {
          targetTop = window.scrollY + 16;
        }
        setPickerCoords({ top: targetTop, left: targetLeft });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [activePickerId]);

  const formatINR = (amount) => {
    if (!amount) return "0.00";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount).replace('₹', '');
  };

  const activeArnObject = useMemo(() => {
    return arns.find(a => a._id === selection.arnId || a.arnCode === selection.arnId);
  }, [arns, selection.arnId]);

  const isGstCompliant = !!activeArnObject?.gstCompliant;

  const rawSalesRows = useMemo(() => {
    const txList = (selection.stagedData?.transactions || []).filter(t => t && t.isCommission && t.type === 'RECEIPT');
    
    return txList.map(tx => {
      const netAmount = tx.amount || 0; 
      const ledgerName = tx.suggestedLedger || "SUSPENSE SALES LEDGER";
      const normalizedLedger = ledgerName.toUpperCase();
      
      const isLocalAmc = normalizedLedger.includes("NJ") || normalizedLedger.includes("LOCAL") || normalizedLedger.includes("STATE");

      let baseAmount = netAmount;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      let grossVoucherTotal = netAmount;

      if (isGstCompliant) {
        if (isLocalAmc) {
          cgst = netAmount * 0.09;
          sgst = netAmount * 0.09;
          grossVoucherTotal = baseAmount + cgst + sgst;
        } else {
          igst = netAmount * 0.18;
          grossVoucherTotal = baseAmount + igst;
        }
      }

      return {
        ...tx,
        ledgerName,
        isLocalAmc,
        netAmount,          
        baseAmount,         
        cgst,               
        sgst,               
        igst,               
        grossVoucherTotal   
      };
    });
  }, [selection.stagedData?.transactions, isGstCompliant]);

  const filteredAndSortedRows = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return [...rawSalesRows]
      .filter(r => r.ledgerName.toLowerCase().includes(query) || r.narration.toLowerCase().includes(query))
      .sort((a, b) => a.ledgerName.localeCompare(b.ledgerName));
  }, [rawSalesRows, searchQuery]);

  const approvedCount = useMemo(() => {
    return filteredAndSortedRows.filter(r => r.isSalesApproved).length;
  }, [filteredAndSortedRows]);

  const handleOpenPickerContext = (e, row) => {
    e.stopPropagation();
    activeTriggerRef.current = e.currentTarget;
    if (row.invoiceBillingDate) {
      const [y, m] = row.invoiceBillingDate.split('-');
      setPickerNav({ month: parseInt(m), year: parseInt(y) });
    } else {
      setPickerNav({ month: selection.month, year: selection.year });
    }
    setActivePickerId(activePickerId === row._id ? null : row._id);
  };

  const shiftMonthNavigation = (direction) => {
    let nextMonth = pickerNav.month + direction;
    let nextYear = pickerNav.year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setPickerNav({ month: nextMonth, year: nextYear });
  };

  const calendarGridData = useMemo(() => {
    const totalDays = new Date(pickerNav.year, pickerNav.month, 0).getDate();
    const firstDayOffset = new Date(pickerNav.year, pickerNav.month - 1, 1).getDay();
    return { totalDays, firstDayOffset };
  }, [pickerNav.month, pickerNav.year]);

  return (
    <div className="h-full w-full bg-white dark:bg-[#08090A] flex flex-col overflow-hidden text-left text-slate-800 dark:text-slate-200 font-sans">
      
      {/* SEARCH AND FILTER SUBBAR */}
      <div className="px-12 py-5 bg-slate-50/80 dark:bg-[#0B0C10]/40 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div className="space-y-1">
          <h2 className="text-base font-[1000] uppercase tracking-tight text-slate-900 dark:text-white italic">
            Sales Voucher Validation Workbench
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            Compliance Profile: 
            <span className={`font-black px-2 py-0.5 rounded text-[9px] ${isGstCompliant ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'}`}>
              {isGstCompliant ? `GST COMPLIANT (${activeArnObject?.nickname || 'ACTIVE'})` : "NON-GST EXEMPT"}
            </span>
          </p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search mutual fund broker accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-[11px] font-black uppercase tracking-wider outline-none focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* COMPACT SUMMARY CONSOLE TOP COUNTER BAR */}
      <div className="px-12 py-3 bg-slate-100/40 dark:bg-white/1 flex justify-between items-center shrink-0 border-b border-slate-200/50 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> {approvedCount} Vouchers Staged</span>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <span>{filteredAndSortedRows.length} Items Listed</span>
        </div>
        <span className="italic font-bold text-slate-400/60 dark:text-slate-500 font-mono">Accrual Match Studio v5.3</span>
      </div>

      {/* SPREADSHEET TABLE GRID */}
      <div className="flex-1 overflow-y-auto px-12 py-6 no-scrollbar min-h-0 relative">
        {filteredAndSortedRows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-2">
            <Info size={28} strokeWidth={1.5} />
            <p className="text-[11px] font-black uppercase tracking-widest">No matching records found.</p>
          </div>
        ) : (
          <table className="w-full border-collapse table-fixed text-[12px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-4 bg-white dark:bg-[#08090A] z-20 select-none">
                <th className="pb-4 w-16 text-center">Selection</th>
                <th className="pb-4 w-[24%] pl-2 text-left tracking-wider">Mutual Fund Company Particulars</th>
                <th className="pb-4 text-center w-[18%] tracking-wider">Invoice Billing Date</th>
                <th className="pb-4 text-right pr-4 w-[11%] tracking-wider">Base Comm</th>
                <th className="pb-4 text-right pr-4 w-[11%] tracking-wider">CGST (9%)</th>
                <th className="pb-4 text-right pr-4 w-[11%] tracking-wider">SGST (9%)</th>
                <th className="pb-4 text-right pr-4 w-[11%] tracking-wider">IGST (18%)</th>
                <th className="pb-4 text-right w-[12%] tracking-wider">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
              {filteredAndSortedRows.map((row) => {
                return (
                  <tr key={row._id} className="bg-transparent hover:bg-slate-50/40 dark:hover:bg-white/1">
                    <td className="py-5 text-center">
                      <button 
                        disabled={!row.invoiceBillingDate}
                        // FIXED: Re-targeted target callback pointer directly onto the uninsulated prop
                        onClick={() => onUpdateTransaction(row._id, { isSalesApproved: !row.isSalesApproved })} 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          row.isSalesApproved 
                            ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow-md shadow-emerald-500/20 active:scale-95' 
                            : !row.invoiceBillingDate 
                              ? 'bg-slate-100 border-slate-200 dark:bg-white/5 dark:border-white/5 text-transparent cursor-not-allowed opacity-50' 
                              : 'bg-white border-slate-300 dark:bg-[#121318] dark:border-white/20 text-transparent hover:border-slate-400 dark:hover:border-white/40 active:scale-90 cursor-pointer'
                        }`}
                      >
                        <Check size={12} strokeWidth={4} className={row.isSalesApproved ? "block" : "hidden"} />
                      </button>
                    </td>

                    <td className="py-5 pl-2 text-left truncate">
                      <span className={`uppercase font-[1000] tracking-tight block truncate text-[12.5px] font-sans transition-colors ${row.isSalesApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{row.ledgerName}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mt-0.5 truncate max-w-xs font-mono">{row.narration}</span>
                    </td>

                    <td className="py-5 text-center">
                      <div className="inline-block">
                        <button
                          onClick={(e) => handleOpenPickerContext(e, row)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all select-none hover:scale-[1.02] active:scale-95 ${
                            row.invoiceBillingDate 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-white dark:bg-[#121318] text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm'
                          }`}
                        >
                          <CalendarIcon size={11} className={row.invoiceBillingDate ? "text-emerald-500" : "opacity-40"} />
                          {row.invoiceBillingDate ? row.invoiceBillingDate : "Select Date"}
                        </button>

                        {activePickerId === row._id && createPortal(
                          <div 
                            ref={pickerRef} 
                            style={{ position: 'absolute', top: `${pickerCoords.top}px`, left: `${pickerCoords.left}px`, zIndex: 999999 }}
                            className="bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] w-72 animate-in fade-in zoom-in-95 duration-100 text-left font-sans"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3 select-none">
                              <button onClick={() => shiftMonthNavigation(-1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors">
                                <ChevronLeft size={14} strokeWidth={2.5} />
                              </button>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                                {monthsList[pickerNav.month - 1]} {pickerNav.year}
                              </span>
                              <button onClick={() => shiftMonthNavigation(1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors">
                                <ChevronRight size={14} strokeWidth={2.5} />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 mb-2 select-none">
                              {weekDays.map(d => <div key={d}>{d}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: calendarGridData.firstDayOffset }).map((_, emptyIdx) => (
                                <div key={`empty-${emptyIdx}`} className="p-2" />
                              ))}
                              {Array.from({ length: calendarGridData.totalDays }).map((_, dIdx) => {
                                const dayNum = dIdx + 1;
                                return (
                                  <button
                                    key={dayNum}
                                    // FIXED: Re-targeted picker apply logic to fire up straight into prop stream cleanly
                                    onClick={() => {
                                      const paddedMonth = String(pickerNav.month).padStart(2, '0');
                                      const paddedDay = String(dayNum).padStart(2, '0');
                                      const computedFullString = `${pickerNav.year}-${paddedMonth}-${paddedDay}`;
                                      onUpdateTransaction(row._id, { invoiceBillingDate: computedFullString });
                                      setActivePickerId(null);
                                    }}
                                    className="p-2 text-[10px] font-mono font-[1000] rounded-lg border border-transparent hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-center transition-all bg-slate-50/40 dark:bg-white/2 text-slate-700 dark:text-slate-300 active:scale-90"
                                  >
                                    {dayNum}
                                  </button>
                                );
                              })}
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    </td>

                    <td className="py-5 text-right font-mono text-[11px] tabular-nums text-slate-600 dark:text-slate-400 pr-4 select-all">{formatINR(row.baseAmount)}</td>
                    <td className="py-5 text-right font-mono text-[11px] tabular-nums pr-4 select-all">
                      {row.cgst > 0 ? <span className="text-amber-600 dark:text-amber-400 font-black">{formatINR(row.cgst)}</span> : <span className="text-slate-300 dark:text-slate-700 font-medium opacity-40">——</span>}
                    </td>
                    <td className="py-5 text-right font-mono text-[11px] tabular-nums pr-4 select-all">
                      {row.sgst > 0 ? <span className="text-amber-600 dark:text-amber-400 font-black">{formatINR(row.sgst)}</span> : <span className="text-slate-300 dark:text-slate-700 font-medium opacity-40">——</span>}
                    </td>
                    <td className="py-5 text-right font-mono text-[11px] tabular-nums pr-4 select-all">
                      {row.igst > 0 ? <span className="text-blue-600 dark:text-blue-400 font-black">{formatINR(row.igst)}</span> : <span className="text-slate-300 dark:text-slate-700 font-medium opacity-40">——</span>}
                    </td>
                    <td className={`py-5 text-right tabular-nums font-[1000] text-[13px] font-sans pr-1 select-all transition-colors ${row.isSalesApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatINR(row.grossVoucherTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-12 py-4 bg-slate-50 dark:bg-[#0B0C10] border-t border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 select-none shrink-0">
        <AlertCircle size={14} className="text-slate-400 shrink-0"/> 
        Vouchers compile dynamically onto downstream summary maps based on individual invoice row definitions.
      </div>
    </div>
  );
};

export default SalesStep;