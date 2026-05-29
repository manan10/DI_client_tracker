import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, FileSpreadsheet, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Search, ChevronDown } from 'lucide-react';
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

  // Dropdown boundary click watcher
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

  // Group line items
  useEffect(() => {
    if (loadingAmcs || !amcs.length) return;

    const aggregated = commissionLines.reduce((acc, tx) => {
      const ledgerName = tx.suggestedLedger || "UNKNOWN BROKER LEDGER";
      const txDay = tx.date ? new Date(tx.date).getDate() : 10;
      
      if (!acc[ledgerName]) {
        acc[ledgerName] = {
          ledgerName,
          amount: 0,
          payoutDay: txDay,
          matchedAmc: findBestLiveAMCMatch(ledgerName, amcs)
        };
      } else {
        if (txDay > acc[ledgerName].payoutDay) acc[ledgerName].payoutDay = txDay;
      }
      acc[ledgerName].amount += tx.amount || 0;
      return acc;
    }, {});

    setMappings(Object.values(aggregated));
  }, [commissionLines, amcs, loadingAmcs]);

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

  // BATCH PROCESSOR PIPELINE
  const handleCommitPayload = async () => {
    const missingMaps = mappings.filter(m => !m.matchedAmc);
    if (missingMaps.length > 0) {
      toast.error(`Please assign a master AMC target mapping for: ${missingMaps[0].ledgerName}`);
      return;
    }

    setIsSaving(true);
    setExecutionProgress(15);
    setExecutionLogs(["Preparing commission data for entry synchronization..."]);

    try {
      const targetMonthStr = `${selection.year}-${String(selection.month).padStart(2, '0')}`;
      const dataPayload = {};
      mappings.forEach(m => {
        dataPayload[m.matchedAmc] = { amount: m.amount, day: m.payoutDay };
      });

      await new Promise(r => setTimeout(r, 600));
      setExecutionProgress(50);
      setExecutionLogs(prev => [
        ...prev, 
        `Aggregated ${mappings.length} broker ledger accounts into individual AMC summaries.`
      ]);

      await new Promise(r => setTimeout(r, 500));
      setExecutionProgress(80);
      setExecutionLogs(prev => [
        ...prev, 
        `Posting commission entries to dashboard records for period: ${monthName} ${selection.year}...`
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
            `Successfully saved total gross revenue of ${formatINR(mappings.reduce((s, m) => s + m.amount, 0))}.`,
            `Advisory dashboard balances successfully updated and closed.`
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
      `}} />
      <div className="fixed inset-0 z-200 flex items-end lg:items-center justify-center lg:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
        
        {/* MODAL WRAPPER - Full screen mobile, floating box desktop */}
        <div className="bg-white dark:bg-[#0B0C10] w-full h-full lg:max-w-5xl rounded-t-3xl lg:rounded-xl border-t lg:border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col lg:h-[70vh] lg:max-h-[70vh] overflow-hidden text-[12px] animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-200">
          
          {/* HEADER */}
          <div className="px-4 lg:px-8 py-4 lg:py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/10 shrink-0">
            <div className="space-y-0.5">
              <h3 className="text-xs lg:text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-emerald-600"/> Commission Auto-Logging Assistant
              </h3>
              <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                Verify and align bank line streams with core master AMC accounts
              </p>
            </div>
            {!isSaving && (
              <button onClick={onClose} className="p-2 lg:p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-all active:scale-95 bg-slate-100 lg:bg-transparent dark:bg-white/5"><X size={16} className="lg:w-4 lg:h-4"/></button>
            )}
          </div>

          {/* CONDITION A: ACCOUNTING PROGRESS PANEL */}
          {isSaving ? (
            <div className="flex-1 bg-white dark:bg-[#0B0C10] p-6 lg:p-8 flex flex-col justify-between overflow-hidden select-none">
              <div className="space-y-6 max-w-2xl mx-auto w-full pt-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  {!executionComplete ? (
                    <Loader2 className="animate-spin text-emerald-600 shrink-0" size={20} />
                  ) : (
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                  )}
                  <span className="text-[10px] lg:text-[11px] uppercase font-black tracking-wider text-slate-400">
                    {!executionComplete ? "Processing Revenue Records" : "Ledger Entry Processing Complete"}
                  </span>
                </div>
                
                {/* STATUS LOG DETAILS */}
                <div className="space-y-3.5 pl-4 lg:pl-8 text-left text-[10px] lg:text-[12px] font-bold text-slate-600 dark:text-slate-300">
                  {executionLogs.map((log, i) => (
                    <p key={i} className="tracking-tight uppercase flex items-center gap-2 animate-in fade-in duration-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {log}
                    </p>
                  ))}
                </div>
              </div>

              {/* PROGRESS VISUAL */}
              <div className="max-w-2xl mx-auto w-full mt-8 space-y-3 shrink-0 pb-6">
                <div className="flex justify-between items-end font-black text-[9px] lg:text-[10px] text-slate-400 uppercase tracking-widest">
                  <span>Advisory Balance Integration Progress</span>
                  <span className="tabular-nums text-slate-900 dark:text-white font-black text-xs">{executionProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 lg:h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
                
                {executionComplete && (
                  <div className="pt-6 flex justify-center animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 lg:py-3 rounded-xl lg:rounded-lg shadow-md transition-transform active:scale-95"
                    >
                      Close Assistant
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* CONDITION B: EDITABLE ENTRY GRID MATRIX */
            <>
              <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 no-scrollbar min-h-0 relative bg-white dark:bg-[#0B0C10]">
                {loadingAmcs ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-center">Querying live backend<br/>AMC parameters...</p>
                  </div>
                ) : (
                  <>
                    {/* MOBILE VIEW: MAPPING CARDS */}
                    <div className="lg:hidden space-y-4 pb-12">
                      {mappings.map((m, idx) => {
                        const isDropdownOpen = activeDropdownIdx === idx;
                        return (
                          <div 
                            key={idx} 
                            style={{ zIndex: isDropdownOpen ? 50 : 1 }}
                            className={`bg-slate-50 dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative transition-all ${isDropdownOpen ? 'ring-1 ring-emerald-500' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 flex-1 leading-tight">{m.ledgerName}</span>
                              <span className="text-[13px] font-[1000] text-emerald-600 tabular-nums shrink-0 leading-none">{formatINR(m.amount).replace('₹', '')}</span>
                            </div>

                            {/* COMBOBOX POPUP DROPDOWN (MOBILE) */}
                            <div className="relative">
                              <div 
                                onClick={() => {
                                  setActiveDropdownIdx(isDropdownOpen ? null : idx);
                                  setSearchQuery("");
                                }}
                                className={`w-full bg-white dark:bg-[#1A1C20] border ${m.matchedAmc ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-tight flex items-center justify-between cursor-pointer transition-all select-none`}
                              >
                                <span className={m.matchedAmc ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 font-medium'}>
                                  {m.matchedAmc ? m.matchedAmc.toUpperCase() : '-- Assign AMC --'}
                                </span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                              </div>

                              {isDropdownOpen && (
                                <div 
                                  ref={dropdownRef}
                                  className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white dark:bg-[#1A1C20] border border-emerald-500/50 rounded-xl shadow-2xl z-50 flex flex-col p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-48"
                                >
                                  <div className="relative flex items-center shrink-0">
                                    <Search size={12} className="absolute left-3 text-slate-400 pointer-events-none" />
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder="Search Live Master..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full bg-slate-50 dark:bg-[#121318] rounded-lg pl-8 pr-3 py-2 text-[10px] font-black tracking-wide text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 outline-none focus:border-emerald-500 uppercase"
                                    />
                                  </div>
                                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 min-h-0">
                                    {filteredAmcs.map((amcObj) => (
                                      <div
                                        key={amcObj._id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAmcSelect(idx, amcObj.name);
                                        }}
                                        className="px-3 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer text-[9px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 transition-colors"
                                      >
                                        {amcObj.name}
                                      </div>
                                    ))}
                                    {filteredAmcs.length === 0 && (
                                      <div className="text-center py-4 text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                                        No parameters match
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center bg-white dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-transparent">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Payout Day</span>
                              <input
                                type="number"
                                value={m.payoutDay}
                                onChange={(e) => handlePayoutDayChange(idx, e.target.value)}
                                className="w-16 bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg py-1.5 text-center text-[11px] font-black tabular-nums outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP VIEW: TABLE */}
                    <div className="hidden lg:block overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse table-fixed relative">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#0B0C10] z-20">
                            <th className="pb-3 w-12 text-center">Sr. No.</th>
                            <th className="pb-3 w-[38%] pl-2">Tally Statement String Source</th>
                            <th className="pb-3 text-right pr-12 w-[18%]">Total Credits</th>
                            <th className="pb-3 w-[24%]">Target Master AMC Account</th>
                            <th className="pb-3 text-center w-[10%]">Payout Day</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                          {mappings.map((m, idx) => {
                            const isDropdownOpen = activeDropdownIdx === idx;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-white/2 transition-colors">
                                <td className="py-3 text-center text-[10px] tabular-nums text-slate-400 font-bold bg-slate-50/40 dark:bg-transparent rounded-l-md w-12">
                                  {idx + 1}
                                </td>
                                <td className="py-3 uppercase tracking-tight font-black text-slate-900 dark:text-slate-100 truncate pr-6 pl-2">
                                  {m.ledgerName}
                                </td>
                                <td className="py-3 text-right tabular-nums pr-12 text-emerald-600 font-[1000] text-[13px]">
                                  {formatINR(m.amount).replace('₹', '')}
                                </td>
                                
                                {/* COMBOBOX POPUP DROPDOWN (DESKTOP) */}
                                <td className="py-1.5 pr-4 relative">
                                  <div 
                                    onClick={() => {
                                      setActiveDropdownIdx(isDropdownOpen ? null : idx);
                                      setSearchQuery("");
                                    }}
                                    className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-tight flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-all select-none"
                                  >
                                    <span className={m.matchedAmc ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-medium'}>
                                      {m.matchedAmc ? m.matchedAmc.toUpperCase() : '-- Assign AMC --'}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                                  </div>

                                  {isDropdownOpen && (
                                    <div 
                                      ref={dropdownRef}
                                      className="absolute left-0 right-4 top-[calc(100%+4px)] bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 flex flex-col p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-44"
                                    >
                                      <div className="relative flex items-center shrink-0">
                                        <Search size={12} className="absolute left-3 text-slate-400 pointer-events-none" />
                                        <input
                                          type="text"
                                          autoFocus
                                          placeholder="Search Live Master..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full bg-slate-50 dark:bg-white/2 rounded-lg pl-8 pr-3 py-1.5 text-[10px] font-black tracking-wide text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 outline-none focus:border-emerald-500 uppercase"
                                        />
                                      </div>
                                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 min-h-0">
                                        {filteredAmcs.map((amcObj) => (
                                          <div
                                            key={amcObj._id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAmcSelect(idx, amcObj.name);
                                            }}
                                            className="px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 transition-colors"
                                          >
                                            {amcObj.name}
                                          </div>
                                        ))}
                                        {filteredAmcs.length === 0 && (
                                          <div className="text-center py-4 text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                                            No parameters match input
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </td>

                                <td className="py-1.5 px-4">
                                  <input
                                    type="number"
                                    value={m.payoutDay}
                                    onChange={(e) => handlePayoutDayChange(idx, e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-lg py-2 text-center text-[11px] font-black tabular-nums border-none outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* LOWER FOOTER */}
              <div className="px-4 lg:px-8 py-4 bg-slate-50 dark:bg-black/10 border-t border-slate-100 dark:border-white/5 flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-0 shrink-0">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none text-center lg:text-left">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0"/> Batch verified. Ready to sync dashboards.
                </div>
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 lg:py-2.5 rounded-xl lg:rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-200/50 dark:bg-white/5 lg:bg-transparent lg:dark:bg-transparent hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loadingAmcs || mappings.length === 0}
                    onClick={handleCommitPayload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 lg:py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-40 border border-emerald-700/20"
                  >
                    Confirm and Log <ArrowRight size={14} strokeWidth={3} className="hidden lg:block"/>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default CommissionMapperModal;