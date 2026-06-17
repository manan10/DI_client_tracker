import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, CheckCircle2, Loader2, ArrowRight, ShieldCheck, 
  Search, ChevronDown, Coins, Receipt, Landmark, Layers, TrendingUp
} from 'lucide-react';
import { useApi } from '../../../../../hooks/useApi';
import { toast } from 'sonner';

const CommissionMapperModal = ({ isOpen, onClose, selection, commissionLines, formatINR, onSuccess }) => {
  const { request } = useApi();
  const [amcs, setAmcs] = useState([]);
  const [loadingAmcs, setLoadingAmcs] = useState(true);
  
  // Pipeline Execution States
  const [isSaving, setIsSaving] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [executionComplete, setExecutionComplete] = useState(false);

  const [mappings, setMappings] = useState([]);
  const [activeDropdownIdx, setActiveDropdownIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const monthName = useMemo(() => {
    return new Date(selection?.year || new Date().getFullYear(), (selection?.month || 1) - 1).toLocaleString('default', { month: 'long' });
  }, [selection?.month, selection?.year]);

  // Fetch Master AMCs from Database
  useEffect(() => {
    const fetchBackendAmcs = async () => {
      if (!isOpen) return;
      setLoadingAmcs(true);
      try {
        const res = await request('/amcs');
        const amcList = res?.data || res || [];
        setAmcs(amcList);
      } catch (err) {
        console.error("Master AMC Fetch Failure:", err);
        toast.error("Failed to synchronize local AMC database registries");
      } finally {
        setLoadingAmcs(false);
      }
    };

    fetchBackendAmcs();
  }, [isOpen, request]);

  // FIX: Robust Dropdown boundary click watcher
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pattern Matching Engine
  const findBestLiveAMCMatch = (ledgerName, activeAmcList) => {
    if (!ledgerName || !activeAmcList.length) return "";
    const normalizedLedger = ledgerName.toUpperCase();
    
    for (const amcObj of activeAmcList) {
      const amcName = amcObj.name || "";
      const cleanAmcToken = amcName.toUpperCase().replace("MUTUAL FUND", "").replace("MF", "").trim();
      
      if (normalizedLedger.includes(cleanAmcToken) || cleanAmcToken.includes(normalizedLedger)) {
        return amcName;
      }
    }
    return "";
  };

  // Group line items & Split Base vs GST Chronologically
  useEffect(() => {
    if (loadingAmcs || !amcs.length) return;

    // 1. Group strictly Commission transactions by Ledger
    const aggregated = commissionLines.reduce((acc, tx) => {
      // STRICT RULE: Only process lines marked as Commission
      if (!tx.isCommission) return acc;

      const ledgerName = tx.suggestedLedger || "UNKNOWN BROKER LEDGER";
      if (!acc[ledgerName]) {
        acc[ledgerName] = {
          ledgerName,
          transactions: [],
          matchedAmc: findBestLiveAMCMatch(ledgerName, amcs)
        };
      }
      acc[ledgerName].transactions.push(tx);
      return acc;
    }, {});

    // 2. Process chronological splits (1st is Base, 2nd is GST)
    const processedMappings = Object.values(aggregated).map(group => {
      const sortedTx = group.transactions.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

      let baseAmount = 0;
      let gstAmount = 0;
      let totalAmount = 0;
      let payoutDay = 10;

      sortedTx.forEach((tx, idx) => {
        const amt = Math.abs(tx.amount || 0);
        
        if (idx === 0) {
          baseAmount += amt;
        } else {
          gstAmount += amt;
        }
        totalAmount += amt;

        const txDay = tx.date ? new Date(tx.date).getDate() : payoutDay;
        if (txDay > payoutDay) payoutDay = txDay;
      });

      return {
        ledgerName: group.ledgerName,
        baseAmount,
        gstAmount,
        totalAmount,
        payoutDay,
        matchedAmc: group.matchedAmc
      };
    });

    // Sort mappings by total amount descending
    processedMappings.sort((a, b) => b.totalAmount - a.totalAmount);
    setMappings(processedMappings);
  }, [commissionLines, amcs, loadingAmcs]);

  // Aggregate Dashboard Totals
  const { totalBase, totalGst, totalGross } = useMemo(() => {
    return mappings.reduce((acc, m) => {
      acc.totalBase += m.baseAmount;
      acc.totalGst += m.gstAmount;
      acc.totalGross += m.totalAmount;
      return acc;
    }, { totalBase: 0, totalGst: 0, totalGross: 0 });
  }, [mappings]);

  const handleAmcSelect = (index, amcName) => {
    setMappings(prev => {
      const updated = [...prev];
      updated[index].matchedAmc = amcName;
      return updated;
    });
    setActiveDropdownIdx(null);
    setSearchQuery("");
  };

  const handlePayoutDayChange = (index, value) => {
    const day = Math.min(31, Math.max(1, parseInt(value) || 1));
    setMappings(prev => {
      const updated = [...prev];
      updated[index].payoutDay = day;
      return updated;
    });
  };

  const filteredAmcs = useMemo(() => {
    const query = searchQuery.toUpperCase();
    return amcs.filter(amc => (amc.name || "").toUpperCase().includes(query));
  }, [amcs, searchQuery]);

  // BATCH PROCESSOR PIPELINE (LIVE DB SAVE)
  const handleCommitPayload = async () => {
    const missingMaps = mappings.filter(m => !m.matchedAmc);
    if (missingMaps.length > 0) {
      toast.error(`Missing target for: ${missingMaps[0].ledgerName}`);
      return;
    }

    setIsSaving(true);
    setExecutionProgress(15);
    setExecutionLogs(["Securing commission records for synchronization..."]);

    try {
      const targetMonthStr = `${selection.year}-${String(selection.month).padStart(2, '0')}`;
      const dataPayload = {};
      
      mappings.forEach(m => {
        dataPayload[m.matchedAmc] = { 
            amount: m.totalAmount,
            day: m.payoutDay 
        };
      });

      await new Promise(r => setTimeout(r, 600));
      setExecutionProgress(50);
      setExecutionLogs(prev => [
        ...prev, 
        `Aggregated ${mappings.length} broker ledgers.`
      ]);

      await new Promise(r => setTimeout(r, 500));
      setExecutionProgress(80);
      setExecutionLogs(prev => [
        ...prev, 
        `Committing records to Master Dashboard for ${monthName} ${selection.year}...`
      ]);

      const response = await request('/commissions/save', 'POST', {
        arnId: selection?.arnId || selection?.audit?.arnId,
        accountingMonth: targetMonthStr,
        data: dataPayload
      });

      if (response?.success) {
        await new Promise(r => setTimeout(r, 500));
        setExecutionProgress(100);
        setExecutionLogs(prev => [
            ...prev, 
            `Successfully settled a gross revenue of ${formatINR(totalGross)}.`,
            `Advisory balances accurately updated.`
        ]);
        setExecutionComplete(true);
    
        if (onSuccess) onSuccess(); 
            toast.success("Commissions auto-logged successfully!");
        } else {
        throw new Error(response?.error || "Transaction could not be completed.");
      }
    } catch (err) {
      setExecutionLogs(prev => [...prev, `Posting stopped: ${err.message}`]);
      setIsSaving(false);
      toast.error("Failed to commit commission allocations");
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* ADDED: Clean scrollbar for the dropdowns */
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scroll::-webkit-scrollbar-thumb { background: #475569; }
      `}} />
      
      {/* Backdrop */}
      <div className="fixed inset-0 z-200 flex items-end lg:items-center justify-center lg:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        
        {/* MODAL WRAPPER */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B1120] w-full h-full lg:max-w-[95vw] xl:max-w-7xl rounded-t-3xl lg:rounded-2xl border-t lg:border border-slate-200 dark:border-slate-800 shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] flex flex-col lg:h-[90vh] lg:max-h-[90vh] overflow-hidden text-[12px] animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-300">
          
          {/* HEADER */}
          <div className="px-5 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0F172A] shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-31.25 h-31.25 bg-blue-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <h3 className="text-sm lg:text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400 rounded-lg">
                    <Layers size={20} strokeWidth={2.5}/>
                </div>
                Commission Logger
              </h3>
              <p className="text-[10px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 pl-1">
                <Landmark size={14}/> Auto-map bank statement ledgers to master AMC profiles and log advisory commissions in one click.
              </p>
            </div>
            {!isSaving && (
              <button onClick={onClose} className="z-10 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                <X size={24} strokeWidth={2.5}/>
              </button>
            )}
          </div>

          {/* CONDITION A: ACCOUNTING PROGRESS PANEL */}
          {isSaving ? (
            <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between overflow-hidden select-none relative bg-white/50 dark:bg-transparent">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-31.25 h-31.25 bg-blue-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="space-y-6 max-w-2xl mx-auto w-full pt-12 z-10">
                <div className="flex items-center justify-center gap-3 pb-6">
                  {!executionComplete ? (
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                        <Loader2 className="animate-spin text-blue-600 dark:text-indigo-400 shrink-0 relative z-10" size={40} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center ring-4 ring-emerald-500/20">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={40} />
                    </div>
                  )}
                </div>
                
                <h2 className="text-center text-sm lg:text-base uppercase font-black tracking-[0.2em] text-slate-800 dark:text-white mb-8">
                  {!executionComplete ? "Executing Batch Settlement" : "Settlement Completed"}
                </h2>

                <div className="space-y-5 max-w-md mx-auto text-left text-[12px] lg:text-[13px] font-bold text-slate-600 dark:text-slate-400">
                  {executionLogs.map((log, i) => (
                    <p key={i} className="tracking-wide flex items-start gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 dark:bg-indigo-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                      {log}
                    </p>
                  ))}
                </div>
              </div>

              <div className="max-w-md mx-auto w-full mt-8 space-y-3 shrink-0 pb-12 z-10">
                <div className="flex justify-between items-end font-black text-[11px] text-slate-400 uppercase tracking-widest">
                  <span>Integration Progress</span>
                  <span className="tabular-nums text-blue-600 dark:text-indigo-400">{executionProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className="bg-blue-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
                
                {executionComplete && (
                  <div className="pt-10 flex justify-center animate-in fade-in zoom-in-95 duration-500">
                    <button
                      onClick={onClose}
                      className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-[12px] uppercase tracking-[0.2em] px-12 py-4 rounded-xl shadow-xl transition-all active:scale-95"
                    >
                      Close Workflow
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* CONDITION B: EDITABLE ENTRY GRID MATRIX */
            <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Top Aggregate Summary Strip */}
              {!loadingAmcs && mappings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 p-4 lg:px-8 lg:py-5 shrink-0 bg-white/60 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 z-10">
                  <div className="bg-white dark:bg-[#111827] border border-blue-100 dark:border-indigo-500/20 p-5 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-blue-50 dark:from-indigo-500/10 to-transparent pointer-events-none"/>
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><Coins size={14} className="text-blue-500 dark:text-indigo-400"/> Total Base Comm</span>
                    <span className="text-xl lg:text-2xl font-[1000] text-slate-800 dark:text-white tabular-nums tracking-tight">{formatINR(totalBase)}</span>
                  </div>
                  
                  <div className="bg-white dark:bg-[#111827] border border-purple-100 dark:border-purple-500/20 p-5 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-purple-50 dark:from-purple-500/10 to-transparent pointer-events-none"/>
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><Receipt size={14} className="text-purple-500 dark:text-purple-400"/> Total GST Collected</span>
                    <span className="text-xl lg:text-2xl font-[1000] text-slate-800 dark:text-white tabular-nums tracking-tight">{formatINR(totalGst)}</span>
                  </div>

                  <div className="bg-emerald-50 dark:bg-[#0B1813] border border-emerald-200 dark:border-emerald-900/50 p-5 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-emerald-100/50 dark:from-emerald-500/10 to-transparent pointer-events-none"/>
                    <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-2.5"><TrendingUp size={14}/> Gross Settled</span>
                    <span className="text-xl lg:text-2xl font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">{formatINR(totalGross)}</span>
                  </div>
                </div>
              )}

              {loadingAmcs ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 opacity-60 bg-[#F8FAFC] dark:bg-[#0B1120]">
                  <Loader2 className="animate-spin text-blue-600 dark:text-indigo-400" size={32} />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center text-slate-500">Syncing Master Registry...</p>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW */}
                  <div className="lg:hidden flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32 custom-scroll">
                    {mappings.map((m, idx) => {
                      const isDropdownOpen = activeDropdownIdx === idx;
                      return (
                        <div 
                          key={idx} 
                          style={{ zIndex: isDropdownOpen ? 50 : 1, position: 'relative' }}
                          className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-all ${isDropdownOpen ? 'ring-2 ring-blue-500/50 dark:ring-indigo-500/50' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Statement Ledger</span>
                              <span className="text-[13px] font-black uppercase tracking-tight text-slate-800 dark:text-white leading-tight">{m.ledgerName}</span>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-[16px] font-[1000] text-emerald-600 dark:text-emerald-400 tabular-nums leading-none tracking-tight">{formatINR(m.totalAmount).replace('₹', '')}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Total Gross</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col px-1">
                                  <span className="text-[9px] font-black text-blue-600/70 dark:text-indigo-400/70 uppercase tracking-widest">Base Amount</span>
                                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 tabular-nums">{formatINR(m.baseAmount)}</span>
                              </div>
                              <div className="flex flex-col px-3 border-l border-slate-200 dark:border-slate-700">
                                  <span className="text-[9px] font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-widest">GST Collected</span>
                                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 tabular-nums">{formatINR(m.gstAmount)}</span>
                              </div>
                          </div>

                          {/* MOBILE REFINED COMBOBOX */}
                          <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
                            <div 
                              onClick={() => {
                                if (isDropdownOpen) {
                                  setActiveDropdownIdx(null);
                                } else {
                                  setActiveDropdownIdx(idx);
                                  setSearchQuery("");
                                }
                              }}
                              className={`w-full border ${m.matchedAmc ? 'border-blue-200 bg-blue-50 dark:border-indigo-500/30 dark:bg-indigo-500/10' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3.5 text-[12px] font-black uppercase tracking-wide flex items-center justify-between cursor-pointer transition-all select-none`}
                            >
                              <span className={m.matchedAmc ? 'text-blue-800 dark:text-indigo-300' : 'text-slate-400 font-medium'}>
                                {m.matchedAmc ? m.matchedAmc.toUpperCase() : 'Assign Master AMC'}
                              </span>
                              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white dark:bg-[#111827] border border-blue-200 dark:border-indigo-500/30 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60">
                                {/* Sticky Search Header */}
                                <div className="p-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
                                  <div className="relative flex items-center">
                                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder="Search AMC Database..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="w-full bg-white dark:bg-black/40 rounded-lg pl-9 pr-3 py-2.5 text-[11px] font-black tracking-wide text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 dark:focus:border-indigo-500 uppercase"
                                    />
                                  </div>
                                </div>
                                {/* Scrollable List */}
                                <div className="flex-1 overflow-y-auto custom-scroll p-1 space-y-0.5">
                                  {filteredAmcs.map((amcObj) => (
                                    <div
                                      key={amcObj._id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAmcSelect(idx, amcObj.name);
                                      }}
                                      className="px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-indigo-500/10 cursor-pointer text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                      {amcObj.name}
                                    </div>
                                  ))}
                                  {filteredAmcs.length === 0 && (
                                    <div className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                                      No matches found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center bg-transparent pt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Payout Day</span>
                            <input
                              type="number"
                              value={m.payoutDay}
                              onChange={(e) => handlePayoutDayChange(idx, e.target.value)}
                              className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 text-center text-[13px] font-black tabular-nums outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 transition-all"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP VIEW: PERFECTLY FIXED HEADER + SCROLLABLE BODY */}
                  <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
                    
                    <div className="grid grid-cols-12 gap-3 items-center px-8 py-3.5 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm z-20">
                      <div className="col-span-3 pl-2">Tally Ledger Source</div>
                      <div className="col-span-2 text-right pr-4 text-blue-600/70 dark:text-indigo-400/70">Base Commission</div>
                      <div className="col-span-1 text-right pr-4 text-purple-600/70 dark:text-purple-400/70">GST</div>
                      <div className="col-span-2 text-right pr-4 text-emerald-600 dark:text-emerald-500">Total Amount</div>
                      <div className="col-span-1 text-center">Day</div>
                      <div className="col-span-3 pl-6">Target AMC Master</div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3 custom-scroll bg-[#F8FAFC] dark:bg-[#0B1120] pb-32">
                      {mappings.map((m, idx) => {
                        const isDropdownOpen = activeDropdownIdx === idx;
                        return (
                          <div 
                            key={idx}
                            style={{ zIndex: isDropdownOpen ? 50 : 1, position: 'relative' }}
                            className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-[#111827] hover:border-blue-300 dark:hover:border-indigo-500/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group"
                          >
                            {/* Source Ledger */}
                            <div className="col-span-3 flex flex-col justify-center pl-3 pr-2 py-2 overflow-hidden">
                              <span className="uppercase tracking-tight font-black text-[12px] text-slate-800 dark:text-white truncate" title={m.ledgerName}>
                                {m.ledgerName}
                              </span>
                            </div>
                            
                            {/* Base Amount */}
                            <div className="col-span-2 text-right flex flex-col justify-center pr-4 border-l border-slate-100 dark:border-slate-800 pl-4">
                              <span className="tabular-nums text-[13px] font-bold text-slate-700 dark:text-slate-300 transition-transform group-hover:scale-105 origin-right">
                                {formatINR(m.baseAmount)}
                              </span>
                            </div>

                            {/* GST Amount */}
                            <div className="col-span-1 text-right flex flex-col justify-center pr-4 border-l border-slate-100 dark:border-slate-800 pl-2">
                              <span className="tabular-nums text-[13px] font-bold text-slate-500 dark:text-slate-400 transition-transform group-hover:scale-105 origin-right">
                                {formatINR(m.gstAmount)}
                              </span>
                            </div>

                            {/* Total Amount */}
                            <div className="col-span-2 text-right flex flex-col justify-center pr-4 border-l border-slate-100 dark:border-slate-800 pl-4 py-2.5 bg-emerald-50/50 dark:bg-[#0B1813] rounded-lg relative overflow-hidden">
                              <div className="absolute inset-0 bg-linear-to-r from-transparent to-emerald-100/50 dark:to-emerald-900/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="tabular-nums text-[14px] font-[1000] text-emerald-600 dark:text-emerald-500 relative z-10">
                                {formatINR(m.totalAmount)}
                              </span>
                            </div>

                            {/* Payout Day */}
                            <div className="col-span-1 border-l border-slate-100 dark:border-slate-800 pl-3 pr-3">
                              <input
                                type="number"
                                value={m.payoutDay}
                                onChange={(e) => handlePayoutDayChange(idx, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg py-2.5 text-center text-[13px] font-black tabular-nums outline-none focus:border-blue-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-500 transition-all"
                              />
                            </div>

                            {/* DESKTOP REFINED COMBOBOX */}
                            <div 
                              className="col-span-3 relative pl-3 pr-2 border-l border-slate-100 dark:border-slate-800"
                              ref={isDropdownOpen ? dropdownRef : null}
                            >
                              <div 
                                onClick={() => {
                                  if (isDropdownOpen) {
                                    setActiveDropdownIdx(null);
                                  } else {
                                    setActiveDropdownIdx(idx);
                                    setSearchQuery("");
                                  }
                                }}
                                className={`w-full bg-slate-50 dark:bg-slate-900 border ${m.matchedAmc ? 'border-blue-300 dark:border-indigo-500/50 bg-blue-50 dark:bg-indigo-500/10 text-blue-800 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-blue-400 dark:hover:border-indigo-400'} rounded-lg px-4 py-2.5 text-[11px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer transition-all select-none`}
                              >
                                <span className={m.matchedAmc ? 'truncate pr-2' : 'text-slate-400 font-bold'}>
                                  {m.matchedAmc ? m.matchedAmc.toUpperCase() : 'Select target'}
                                </span>
                                <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180 text-blue-500 dark:text-indigo-400' : ''}`} />
                              </div>

                              {/* Floating Menu aligned right */}
                              {isDropdownOpen && (
                                <div className="absolute right-2 top-[calc(100%+6px)] w-70 bg-white dark:bg-[#111827] border border-blue-200 dark:border-indigo-500/40 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64">
                                  {/* Sticky Search Header */}
                                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
                                    <div className="relative flex items-center">
                                      <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                                      <input
                                        type="text"
                                        autoFocus
                                        placeholder="SEARCH DATABASE..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-white dark:bg-black/40 rounded-lg pl-9 pr-3 py-2 text-[11px] font-black tracking-widest text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 dark:focus:border-indigo-500 uppercase"
                                      />
                                    </div>
                                  </div>
                                  {/* Scrollable List */}
                                  <div className="flex-1 overflow-y-auto custom-scroll p-1 space-y-0.5 min-h-0">
                                    {filteredAmcs.map((amcObj) => (
                                      <div
                                        key={amcObj._id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAmcSelect(idx, amcObj.name);
                                        }}
                                        className="px-4 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-indigo-500/20 cursor-pointer text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-colors truncate"
                                        title={amcObj.name}
                                      >
                                        {amcObj.name}
                                      </div>
                                    ))}
                                    {filteredAmcs.length === 0 && (
                                      <div className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                                        No matching entries
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* LOWER FOOTER */}
              <div className="px-5 lg:px-8 py-5 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center gap-5 lg:gap-0 shrink-0 z-10">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none text-center lg:text-left">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-blue-600 dark:text-indigo-400 shrink-0"/>
                  </div>
                  chronological splits active & verified.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-4 lg:py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  
                  <button
                    disabled={loadingAmcs || mappings.length === 0}
                    onClick={handleCommitPayload}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-black text-[11px] lg:text-[12px] uppercase tracking-widest px-8 py-4 lg:py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
                  >
                    Authorize & Post <ArrowRight size={18} strokeWidth={3} className="hidden lg:block"/>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CommissionMapperModal;