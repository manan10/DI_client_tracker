import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Check, Landmark, FileText, ChevronLeft, 
  FastForward, Edit3, X, FileSpreadsheet, 
  Calendar as CalendarIcon, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const SalesStep = ({ selection, setSelection, masterLedgers = [], arns = [] }) => {
  // Base Interaction States
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedTxId, setSelectedTxId] = useState(null);
  
  // Editor & Dropdown States
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [ledgerModalMode, setLedgerModalMode] = useState(null);

  // Date Picker States
  const [activePickerId, setActivePickerId] = useState(null);
  const [pickerNav, setPickerNav] = useState({ month: selection.month, year: selection.year });

  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const activeArnObject = useMemo(() => {
    return arns.find(a => a._id === selection.arnId || a.arnCode === selection.arnId);
  }, [arns, selection.arnId]);

  const isGstCompliant = !!activeArnObject?.gstCompliant;

  const companyLedgers = useMemo(() => {
    return masterLedgers
      .filter(l => l.tallyCompanyName === selection.tallyCompany)
      .filter(l => l.name.toLowerCase().includes("mf com"))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [masterLedgers, selection.tallyCompany]);

  // Core Data Parsing
  const salesTransactions = useMemo(() => {
    return (selection.stagedData?.transactions || [])
      .filter(t => t && t.isSales && t.type === 'RECEIPT')
      .map(tx => {
        const netAmount = tx.amount || 0; 
        const activeSalesLedger = tx.individualSalesLedger || selection.salesIncomeLedger || tx.suggestedLedger || "SUSPENSE SALES LEDGER";
        
        const isLocalAmc = activeSalesLedger.toUpperCase().includes("NJ") || activeSalesLedger.toUpperCase().includes("LOCAL") || activeSalesLedger.toUpperCase().includes("STATE");

        let baseAmount = netAmount;
        let cgst = 0, sgst = 0, igst = 0, grossVoucherTotal = netAmount;

        const applyCGST = tx.applyCGST !== undefined ? tx.applyCGST : (isGstCompliant && isLocalAmc);
        const applySGST = tx.applySGST !== undefined ? tx.applySGST : (isGstCompliant && isLocalAmc);
        const applyIGST = tx.applyIGST !== undefined ? tx.applyIGST : (isGstCompliant && !isLocalAmc);

        if (applyCGST) cgst = baseAmount * 0.09;
        if (applySGST) sgst = baseAmount * 0.09;
        if (applyIGST) igst = baseAmount * 0.18;

        grossVoucherTotal = baseAmount + cgst + sgst + igst;

        let defaultDate = tx.invoiceBillingDate || "";
        if (!defaultDate && tx.date) {
          try {
            const d = new Date(tx.date);
            defaultDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } catch {
            // Error
          }
        }

        return {
          ...tx,
          activeSalesLedger,
          applyCGST, applySGST, applyIGST,
          baseAmount, cgst, sgst, igst, grossVoucherTotal,
          invoiceBillingDate: defaultDate
        };
      });
  }, [selection.stagedData?.transactions, isGstCompliant, selection.salesIncomeLedger]);

  // Bank & Filtering Logic
  const availableBanks = useMemo(() => {
    const banks = [...new Set(salesTransactions.map(t => t.bank).filter(Boolean))];
    return banks.length > 0 ? banks : ["Default Bank"];
  }, [salesTransactions]);

  const currentBank = useMemo(() => {
    if (selectedBank && availableBanks.includes(selectedBank)) return selectedBank;
    return availableBanks.length > 0 ? availableBanks[0] : "";
  }, [selectedBank, availableBanks]);

  const displayTransactions = useMemo(() => {
    return salesTransactions
      .filter(t => t.bank === currentBank || !t.bank)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [salesTransactions, currentBank]);

  const currentTxId = useMemo(() => {
    if (selectedTxId && displayTransactions.some(t => t._id === selectedTxId)) return selectedTxId;
    return displayTransactions.length > 0 ? displayTransactions[0]._id : null;
  }, [selectedTxId, displayTransactions]);

  const activeTx = useMemo(() => {
    return displayTransactions.find(t => t._id === currentTxId);
  }, [displayTransactions, currentTxId]);

  // Header Totals
  const globalTotals = useMemo(() => {
    return salesTransactions.reduce((acc, curr) => acc + curr.grossVoucherTotal, 0);
  }, [salesTransactions]);

  const bankTotals = useMemo(() => {
    return displayTransactions.reduce((acc, curr) => acc + curr.grossVoucherTotal, 0);
  }, [displayTransactions]);

  const unverifiedPerBank = useMemo(() => {
    const counts = {};
    availableBanks.forEach(b => counts[b] = 0);
    salesTransactions.forEach(tx => {
      if (!tx.isSalesApproved) {
        if (tx.bank) counts[tx.bank] = (counts[tx.bank] || 0) + 1;
      }
    });
    return counts;
  }, [salesTransactions, availableBanks]);

  // Update Handlers
  const handleUpdate = (txId, payload) => {
    setSelection(prev => {
      const updatedTxs = (prev.stagedData?.transactions || []).map(t => {
        if (t._id === txId) {
          const isConfigChange = payload.individualSalesLedger !== undefined || payload.applyCGST !== undefined || payload.applySGST !== undefined || payload.applyIGST !== undefined;
          return {
            ...t,
            ...payload,
            isSalesApproved: isConfigChange ? false : (payload.isSalesApproved !== undefined ? payload.isSalesApproved : t.isSalesApproved)
          };
        }
        return t;
      });
      return { ...prev, stagedData: { ...prev.stagedData, transactions: updatedTxs } };
    });
  };

  const handleVerifyAndNext = () => {
    if (!activeTx) return;
    handleUpdate(activeTx._id, { isSalesApproved: true });
    
    const currentIndex = displayTransactions.findIndex(t => t._id === currentTxId);
    let nextUnverifiedId = null;
    
    for (let i = currentIndex + 1; i < displayTransactions.length; i++) {
      if (!displayTransactions[i].isSalesApproved) {
        nextUnverifiedId = displayTransactions[i]._id;
        break;
      }
    }
    
    if (nextUnverifiedId) {
      setSelectedTxId(nextUnverifiedId);
    } else {
      toast.success(`All sales vouchers for this bank are verified!`);
      setIsMobileEditorOpen(false);
    }
  };

  const handleSelectAll = () => {
    if (!displayTransactions.length) return;
    const isAllSelected = displayTransactions.every(tx => tx.isSalesApproved);
    const targetState = !isAllSelected;

    setSelection(prev => {
      const currentTxs = prev.stagedData?.transactions || [];
      const updatedTxs = currentTxs.map(t => 
        displayTransactions.some(d => d._id === t._id) ? { ...t, isSalesApproved: targetState } : t
      );
      return { ...prev, stagedData: { ...prev.stagedData, transactions: updatedTxs } };
    });
    toast.success(targetState ? `Approved all sales in view` : `Unapproved all sales in view`);
  };

  const handleLedgerSelect = (ledgerName) => {
    if (ledgerModalMode === 'GLOBAL') {
      setSelection(prev => ({ ...prev, salesIncomeLedger: ledgerName }));
      toast.success("Global sales ledger updated");
    } else if (ledgerModalMode === 'INDIVIDUAL' && activeTx) {
      handleUpdate(activeTx._id, { individualSalesLedger: ledgerName });
    }
    setLedgerModalMode(null);
    setSearchQuery("");
  };

  const isAllDisplayedChecked = displayTransactions.length > 0 && displayTransactions.every(tx => tx.isSalesApproved);

  const filteredLedgers = useMemo(() => {
    return companyLedgers.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.groupName && l.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 100); 
  }, [companyLedgers, searchQuery]);

  // Date Picker Helpers
  const handleOpenPickerContext = () => {
    if (activeTx?.invoiceBillingDate) {
      const [y, m] = activeTx.invoiceBillingDate.split('-');
      setPickerNav({ month: parseInt(m), year: parseInt(y) });
    } else {
      setPickerNav({ month: selection.month, year: selection.year });
    }
    setActivePickerId(activeTx._id);
  };

  const shiftMonthNavigation = (direction) => {
    let nextMonth = pickerNav.month + direction;
    let nextYear = pickerNav.year;
    if (nextMonth > 12) { nextMonth = 1; nextYear += 1; } 
    else if (nextMonth < 1) { nextMonth = 12; nextYear -= 1; }
    setPickerNav({ month: nextMonth, year: nextYear });
  };

  const calendarGridData = useMemo(() => {
    const totalDays = new Date(pickerNav.year, pickerNav.month, 0).getDate();
    const firstDayOffset = new Date(pickerNav.year, pickerNav.month - 1, 1).getDay();
    return { totalDays, firstDayOffset };
  }, [pickerNav.month, pickerNav.year]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />

      <div className="flex flex-col h-full w-full bg-[#FBFBFC] dark:bg-[#050607] overflow-hidden absolute inset-0">
        
        {/* =====================================================================
            GLOBAL HEADER: BANK TABS & DUAL DASHBOARD
            ===================================================================== */}
        <header className="flex flex-col shrink-0 z-20 bg-white dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 shadow-sm">
          <div className="px-4 lg:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full lg:w-auto min-w-0">
              <div className="space-y-0.5 shrink-0 hidden xl:block">
                <h2 className="text-xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                  Sales <span className="text-indigo-500">Validation</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{selection.tallyCompany}</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar">
                {availableBanks.map(bank => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`cursor-pointer flex-1 lg:flex-none flex items-center justify-center px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                      currentBank === bank 
                        ? 'bg-white dark:bg-[#1A1C20] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-white/10' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
                    }`}
                  >
                    <Landmark size={12} className="inline mr-1.5 opacity-70 mb-0.5" /> 
                    <span>{bank}</span>
                    {unverifiedPerBank[bank] > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[8px] font-black leading-none ${
                        currentBank === bank 
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {unverifiedPerBank[bank]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar">
              
              {/* GLOBAL LEDGER SELECTION BUTTON */}
              {salesTransactions.length > 0 && (
                <button
                  onClick={() => setLedgerModalMode('GLOBAL')}
                  className={`flex flex-col text-left border-2 rounded-xl px-4 py-1.5 transition-all outline-none min-w-[200px] shadow-sm ${selection.salesIncomeLedger ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-400' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 border-dashed hover:border-indigo-400'}`}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Global Ledger Fallback</span>
                  <span className={`text-[10px] font-[1000] uppercase tracking-wider truncate block w-full mt-0.5 ${selection.salesIncomeLedger ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                    {selection.salesIncomeLedger || "Select Global Ledger..."}
                  </span>
                </button>
              )}

              <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-2 shrink-0">
                <div className="flex flex-col text-right pr-4 border-r border-slate-200 dark:border-white/10">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Global Gross</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums italic leading-none">{formatINR(globalTotals)}</span>
                </div>
                <div className="flex flex-col text-left pl-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{currentBank} Gross</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums italic leading-none">{formatINR(bankTotals)}</span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* =====================================================================
            SPLIT PANE WORKSPACE
            ===================================================================== */}
        <main className="flex-1 flex overflow-hidden w-full relative">
          
          {/* -----------------------------------------------------
              LEFT: THE MASTER LIST
              ----------------------------------------------------- */}
          <section className={`w-full lg:w-[32%] xl:w-[28%] flex flex-col border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#08090A] ${isMobileEditorOpen ? 'hidden lg:flex' : 'flex'} z-10 shrink-0`}>
            
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                {displayTransactions.length} Sales Items
              </span>
              <button 
                onClick={handleSelectAll}
                className={`cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${isAllDisplayedChecked ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
              >
                <Check size={12} strokeWidth={4} /> {isAllDisplayedChecked ? 'All Verified' : 'Verify All'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
              {displayTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                  <FileText size={32} className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">No sales found.</p>
                </div>
              ) : (
                displayTransactions.map((tx) => {
                  const isChecked = tx.isSalesApproved;
                  const isActive = currentTxId === tx._id;
                  
                  return (
                    <div 
                      key={tx._id} 
                      onClick={() => { setSelectedTxId(tx._id); setIsMobileEditorOpen(true); }}
                      className={`cursor-pointer flex flex-col gap-2 p-3.5 rounded-xl transition-all border ${
                        isActive 
                          ? 'bg-slate-900 border-slate-900 shadow-xl scale-[1.02] z-10 relative dark:bg-[#15171A] dark:border-white/10' 
                          : isChecked 
                            ? 'bg-emerald-50/40 dark:bg-transparent border-transparent opacity-60 hover:opacity-100'
                            : 'bg-white dark:bg-[#111214] border-slate-200 dark:border-white/5 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdate(tx._id, { isSalesApproved: !isChecked }); }}
                          className={`cursor-pointer w-5 h-5 shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'border-slate-600 text-transparent hover:border-white' : 'border-slate-300 dark:border-white/20 text-transparent hover:border-emerald-500'}`}
                        >
                          <Check size={10} strokeWidth={4} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] lg:text-xs font-bold leading-snug line-clamp-2 uppercase ${isActive ? 'text-white' : isChecked ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.narration}
                          </p>
                          {/* NEW: Party Ledger Display in List */}
                          {tx.suggestedLedger && (
                            <p className={`text-[9px] font-black tracking-widest uppercase mt-1.5 truncate flex items-center gap-1 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                              <Landmark size={10} /> {tx.suggestedLedger}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-[1000] tabular-nums italic shrink-0 ${isActive ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {formatINR(tx.grossVoucherTotal)}
                        </span>
                      </div>

                      <div className="pl-8 flex flex-col gap-2">
                        <div className={`text-[10px] font-black uppercase tracking-widest leading-relaxed wrap-break-word ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                          {tx.activeSalesLedger}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                          
                          <div className="flex flex-wrap gap-1">
                            {tx.applyCGST && <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>C</span>}
                            {tx.applySGST && <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>S</span>}
                            {tx.applyIGST && <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>I</span>}
                            {(!tx.applyCGST && !tx.applySGST && !tx.applyIGST) && <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-600'}`}>No Tax</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* -----------------------------------------------------
              RIGHT: HUD EDITOR (Zero Scroll Layout)
              ----------------------------------------------------- */}
          <section className={`absolute inset-0 z-50 lg:relative lg:z-auto flex-1 flex flex-col bg-white dark:bg-[#050607] transition-transform duration-300 w-full h-full ${isMobileEditorOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            
            <div className="lg:hidden px-4 py-3 bg-white dark:bg-[#111218] border-b border-slate-200 dark:border-white/5 flex items-center gap-3 shrink-0">
              <button onClick={() => setIsMobileEditorOpen(false)} className="cursor-pointer p-2 -ml-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 border border-slate-200 dark:border-transparent">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Back to List</span>
            </div>

            {!activeTx ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                <Search size={48} className="text-slate-400" strokeWidth={1} />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-center">Select a sales transaction<br/>to open the editor</p>
              </div>
            ) : (
              // FLEX-1 CONTAINER: NO OVERFLOW, EVERYTHING STRETCHES TO FIT
              <div className="flex-1 flex flex-col w-full h-full max-w-5xl mx-auto p-4 lg:p-6 gap-4">
                
                {/* 1. HUD Header - Streamlined and Compact */}
                <div className="shrink-0 pb-3 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex flex-col gap-2 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                         {new Date(activeTx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                         SALES VOUCHER
                       </span>
                    </div>
                    <h2 className="text-sm lg:text-base font-bold uppercase text-slate-800 dark:text-slate-200 leading-snug wrap-break-word">
                      {activeTx.narration}
                    </h2>
                    
                    {/* NEW: Party Ledger Display in HUD */}
                    {activeTx.suggestedLedger && (
                      <div className="flex items-center gap-1.5 mt-1">
                         <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max">
                           <Landmark size={12} className="text-slate-400" /> Party: {activeTx.suggestedLedger}
                         </span>
                      </div>
                    )}
                  </div>
                  
                  {/* COMPACT TOTAL VOUCHER DISPLAY */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Voucher Total</span>
                    <span className="text-xl lg:text-2xl font-[1000] tabular-nums italic tracking-tight text-emerald-600 dark:text-emerald-400 leading-none">
                      {formatINR(activeTx.grossVoucherTotal)}
                    </span>
                  </div>
                </div>

                {/* 2. Columns Section - Flexes to available height */}
                <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
                  
                  {/* LEFT COLUMN: Configuration */}
                  <div className="w-full lg:w-[45%] flex flex-col gap-4 shrink-0 lg:shrink">
                    
                    {/* Individual Ledger Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Landmark size={14} className="text-indigo-500" /> Target Sales Ledger
                      </label>
                      <button 
                        onClick={() => setLedgerModalMode('INDIVIDUAL')}
                        className={`cursor-pointer w-full rounded-2xl border-2 transition-all group outline-none flex items-center justify-between p-3 lg:p-4 text-left shadow-sm ${activeTx.individualSalesLedger ? 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/5 hover:border-indigo-500' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/2 hover:border-indigo-400'}`}
                      >
                        <div className="flex flex-col min-w-0 pr-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {activeTx.individualSalesLedger ? 'Explicit Override' : 'Fallback Active'}
                          </span>
                          <span className={`text-base lg:text-lg font-[1000] uppercase tracking-tight wrap-break-word whitespace-normal leading-tight ${activeTx.individualSalesLedger ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {activeTx.activeSalesLedger}
                          </span>
                        </div>
                        <div className="shrink-0 p-1.5 lg:px-3 lg:py-1.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-sm flex items-center gap-1.5">
                          <Edit3 size={12} /> <span className="hidden sm:inline">Change</span>
                        </div>
                      </button>
                    </div>

                    {/* Invoice Billing Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-indigo-500" /> Invoice Billing Date
                      </label>
                      <button 
                        onClick={handleOpenPickerContext}
                        className={`cursor-pointer w-full flex items-center justify-between p-3 lg:p-4 rounded-xl border-2 transition-all text-left shadow-sm ${activeTx.invoiceBillingDate ? 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:border-indigo-400' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}
                      >
                        <span className="text-xs lg:text-sm font-black uppercase tracking-wider">
                          {activeTx.invoiceBillingDate ? activeTx.invoiceBillingDate : 'Select Document Date...'}
                        </span>
                        <CalendarIcon size={16} className={activeTx.invoiceBillingDate ? 'text-indigo-500' : ''}/>
                      </button>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: HORIZONTALLY DENSE GST MATRIX */}
                  <div className="w-full lg:w-[55%] flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between shrink-0">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileSpreadsheet size={14} className="text-amber-500" /> GST Split Matrix
                      </label>
                      
                      {/* TOGGLES DOCKED IN TITLE BAR - MASSIVE SPACE SAVER */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                         <button onClick={() => handleUpdate(activeTx._id, { applyCGST: !activeTx.applyCGST })} className={`cursor-pointer px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${activeTx.applyCGST ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>CGST</button>
                         <button onClick={() => handleUpdate(activeTx._id, { applySGST: !activeTx.applySGST })} className={`cursor-pointer px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${activeTx.applySGST ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>SGST</button>
                         <button onClick={() => handleUpdate(activeTx._id, { applyIGST: !activeTx.applyIGST })} className={`cursor-pointer px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${activeTx.applyIGST ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>IGST</button>
                      </div>
                    </div>

                    {/* Matrix Box - Stretches to fill space */}
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 lg:p-6 flex-1 flex flex-col justify-between shadow-inner">
                      
                      {/* Side-by-side Layout: Base Amount <--> Breakdown List */}
                      <div className="flex justify-between items-start pt-2">
                         
                         {/* Base Amount */}
                         <div className="flex flex-col min-w-0 pr-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Amount</span>
                            <span className="text-2xl lg:text-3xl font-mono font-bold text-slate-800 dark:text-slate-200 leading-none truncate">{formatINR(activeTx.baseAmount)}</span>
                         </div>
                         
                         {/* Breakdown List */}
                         <div className="flex flex-col gap-2.5 text-right border-l border-slate-200 dark:border-white/10 pl-5 shrink-0 min-w-[140px] lg:min-w-[160px]">
                           <div className={`flex justify-between items-center text-xs font-mono font-bold transition-opacity ${activeTx.applyCGST ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 opacity-50'}`}>
                             <span className="mr-4">+ CGST</span><span>{activeTx.applyCGST ? formatINR(activeTx.cgst) : '—'}</span>
                           </div>
                           <div className={`flex justify-between items-center text-xs font-mono font-bold transition-opacity ${activeTx.applySGST ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 opacity-50'}`}>
                             <span className="mr-4">+ SGST</span><span>{activeTx.applySGST ? formatINR(activeTx.sgst) : '—'}</span>
                           </div>
                           <div className={`flex justify-between items-center text-xs font-mono font-bold transition-opacity ${activeTx.applyIGST ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 opacity-50'}`}>
                             <span className="mr-4">+ IGST</span><span>{activeTx.applyIGST ? formatINR(activeTx.igst) : '—'}</span>
                           </div>
                         </div>
                      </div>

                      <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-4 shrink-0" />

                      {/* Integrated Total at the bottom */}
                      <div className="flex justify-between items-end pb-1">
                        <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">Calculated Gross</span>
                        <span className="text-3xl lg:text-4xl font-[1000] tabular-nums italic text-indigo-600 dark:text-indigo-400 leading-none">
                          {formatINR(activeTx.grossVoucherTotal)}
                        </span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 3. Footer Action - Strict shrink-0 at bottom */}
                <div className="shrink-0 pt-1 lg:pt-2">
                  <button 
                    onClick={handleVerifyAndNext}
                    className="cursor-pointer w-full py-4 lg:py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl lg:rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-linear-to-t from-emerald-600 to-emerald-500"
                  >
                    <FastForward size={16} strokeWidth={3} />
                    Verify & Next Sales Item
                  </button>
                </div>

              </div>
            )}
          </section>
        </main>

        {/* =========================================
            THE CENTERED LEDGER MAPPING MODAL 
            ========================================= */}
        {ledgerModalMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0B0C10] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="p-5 lg:p-6 bg-slate-900 dark:bg-black flex flex-col gap-2 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 text-indigo-500">
                  <FileSpreadsheet size={120} className="-mt-4 -mr-4" />
                </div>
                <div className="relative z-10 flex justify-between items-start gap-4">
                  <div className="space-y-1.5 pr-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                       {ledgerModalMode === 'GLOBAL' ? 'Global Default Fallback' : 'Sales Ledger Override'}
                    </span>
                    <p className="text-sm font-bold text-white uppercase leading-snug wrap-break-word">
                      {ledgerModalMode === 'GLOBAL' ? 'Select a fallback ledger for unmapped sales items' : activeTx?.narration}
                    </p>
                  </div>
                  <button onClick={() => { setLedgerModalMode(null); setSearchQuery(""); }} className="cursor-pointer p-2 shrink-0 text-slate-400 hover:text-white bg-white/10 hover:bg-rose-500 transition-colors rounded-lg border border-white/10">
                    <X size={16} />
                  </button>
                </div>
                {ledgerModalMode === 'INDIVIDUAL' && activeTx && (
                  <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-3 mt-1">
                    <span className="text-lg font-[1000] tabular-nums italic text-indigo-400">
                      {formatINR(activeTx.baseAmount)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50 dark:bg-white/2">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      autoFocus 
                      placeholder="SEARCH TALLY LEDGERS..." 
                      className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-black uppercase outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  {ledgerModalMode === 'INDIVIDUAL' && activeTx?.individualSalesLedger && (
                    <button 
                      onClick={() => {
                        handleUpdate(activeTx._id, { individualSalesLedger: "" });
                        setLedgerModalMode(null);
                      }}
                      className="cursor-pointer px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors shrink-0"
                    >
                      Clear override
                    </button>
                  )}
                  {ledgerModalMode === 'GLOBAL' && selection.salesIncomeLedger && (
                     <button 
                       onClick={() => {
                         setSelection(prev => ({ ...prev, salesIncomeLedger: "" }));
                         setLedgerModalMode(null);
                       }}
                       className="cursor-pointer px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors shrink-0"
                     >
                       Clear Global
                     </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                {filteredLedgers.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3 opacity-50">
                    <Search size={32} />
                    <p className="text-[11px] font-black uppercase tracking-widest">No ledgers match "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredLedgers.map(l => {
                    const isSelected = ledgerModalMode === 'GLOBAL' 
                      ? selection.salesIncomeLedger === l.name 
                      : activeTx?.activeSalesLedger === l.name;
                      
                    return (
                      <button 
                        key={l._id} 
                        onClick={() => handleLedgerSelect(l.name)} 
                        className={`cursor-pointer w-full text-left px-5 py-4 rounded-xl text-xs font-[1000] uppercase transition-colors flex items-center justify-between group ${isSelected ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      >
                        <span className="truncate pr-4 leading-none">{l.name}</span>
                        <span className={`text-[9px] font-black tracking-widest shrink-0 leading-none ${isSelected ? 'text-indigo-600/60' : 'text-slate-400 group-hover:text-slate-500'}`}>
                          {l.groupName || 'PRIMARY'}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PORTAL: DATE PICKER (FIXED CENTRALLY)
            ========================================================================= */}
        {activePickerId && createPortal(
          <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-default" 
              onClick={() => setActivePickerId(null)} 
            />
            
            <div className="relative bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl w-[90%] max-w-[320px] animate-in fade-in zoom-in-95 duration-100 text-left font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4 select-none">
                <button onClick={() => shiftMonthNavigation(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors cursor-pointer">
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                  {monthsList[pickerNav.month - 1]} {pickerNav.year}
                </span>
                <button onClick={() => shiftMonthNavigation(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors cursor-pointer">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 mb-3 select-none">
                {weekDays.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: calendarGridData.firstDayOffset }).map((_, emptyIdx) => (
                  <div key={`empty-${emptyIdx}`} className="p-2" />
                ))}
                {Array.from({ length: calendarGridData.totalDays }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        const computedFullString = `${pickerNav.year}-${String(pickerNav.month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        handleUpdate(activePickerId, { invoiceBillingDate: computedFullString });
                        setActivePickerId(null);
                      }}
                      className="cursor-pointer p-2.5 text-xs font-mono font-[1000] rounded-xl border border-transparent hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-center transition-all bg-slate-50/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 active:scale-95"
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default SalesStep;