import React, { useState, useMemo } from 'react';
import { 
  Search, Check, Landmark, CheckCircle2, 
  AlertCircle, FileText, ChevronLeft, FastForward, 
  Edit3, X, FileSpreadsheet, Building2, Tag, ShieldAlert, MessageSquare
} from 'lucide-react';
import { useApi } from '../../../../hooks/useApi';
import { toast } from 'sonner';

const AuditStep = ({ selection, setSelection, masterLedgers }) => {
  const { request } = useApi();
  
  // Base Interaction States
  const [activeTab, setActiveTab] = useState('RECEIPT'); 
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedTxId, setSelectedTxId] = useState(null);
  
  // Editor & Dropdown States
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const companyLedgers = useMemo(() => {
    return masterLedgers.filter(l => l.tallyCompanyName === selection.tallyCompany);
  }, [masterLedgers, selection.tallyCompany]);

  const transactions = useMemo(() => {
    return (selection.stagedData?.transactions || []).filter(t => t.narration !== "EMPTY_FILE_MARKER");
  }, [selection.stagedData]);

  const availableBanks = useMemo(() => {
    const banks = [...new Set(transactions.map(t => t.bank).filter(Boolean))];
    return banks.length > 0 ? banks : ["Default Bank"];
  }, [transactions]);

  const currentBank = useMemo(() => {
    if (selectedBank && availableBanks.includes(selectedBank)) return selectedBank;
    return availableBanks.length > 0 ? availableBanks[0] : "";
  }, [selectedBank, availableBanks]);

  const displayTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === activeTab && (t.bank === currentBank || !t.bank))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, activeTab, currentBank]);

  const currentTxId = useMemo(() => {
    if (selectedTxId && displayTransactions.some(t => t._id === selectedTxId)) return selectedTxId;
    return displayTransactions.length > 0 ? displayTransactions[0]._id : null;
  }, [selectedTxId, displayTransactions]);

  const activeTx = useMemo(() => {
    return displayTransactions.find(t => t._id === currentTxId);
  }, [displayTransactions, currentTxId]);

  const globalTotals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'RECEIPT') acc.receipts += Math.abs(curr.amount);
      if (curr.type === 'PAYMENT') acc.payments += Math.abs(curr.amount);
      return acc;
    }, { receipts: 0, payments: 0 });
  }, [transactions]);

  const bankTotals = useMemo(() => {
    return transactions.filter(t => t.bank === currentBank).reduce((acc, curr) => {
      if (curr.type === 'RECEIPT') acc.receipts += Math.abs(curr.amount);
      if (curr.type === 'PAYMENT') acc.payments += Math.abs(curr.amount);
      return acc;
    }, { receipts: 0, payments: 0 });
  }, [transactions, currentBank]);

  const unverifiedPerBank = useMemo(() => {
    const counts = {};
    availableBanks.forEach(b => counts[b] = 0);
    transactions.forEach(tx => {
      if (!(selection.verifiedIds || []).includes(tx._id)) {
        if (tx.bank) counts[tx.bank] = (counts[tx.bank] || 0) + 1;
      }
    });
    return counts;
  }, [transactions, selection.verifiedIds, availableBanks]);

  const unverifiedPerType = useMemo(() => {
    const counts = { RECEIPT: 0, PAYMENT: 0 };
    transactions.forEach(tx => {
      if ((tx.bank === currentBank || !tx.bank) && !(selection.verifiedIds || []).includes(tx._id)) {
        if (counts[tx.type] !== undefined) {
          counts[tx.type]++;
        }
      }
    });
    return counts;
  }, [transactions, currentBank, selection.verifiedIds]);

  // OPTIMISTIC UPDATE IMPLEMENTATION
  const handleUpdate = async (txId, payload, silent = false) => {
    // 1. Capture the original state for rollback
    const originalTx = transactions.find(t => t._id === txId);
    const wasVerified = (selection.verifiedIds || []).includes(txId);

    // 2. Immediately update local state (Zero UI Lag)
    setSelection(prev => {
      const updatedTransactions = (prev.stagedData?.transactions || []).map(t => 
        t._id === txId ? { ...t, ...payload } : t
      );
      let newVerified = [...(prev.verifiedIds || [])];
      if (payload.isChecked !== undefined) {
        newVerified = payload.isChecked 
          ? [...new Set([...newVerified, txId])]
          : newVerified.filter(id => id !== txId);
      }
      return {
        ...prev,
        verifiedIds: newVerified,
        stagedData: { ...prev.stagedData, transactions: updatedTransactions }
      };
    });

    // 3. Perform network request in background
    try {
      const res = await request(`/audit/transactions/${txId}`, 'PATCH', payload);
      if (!res.success) throw new Error("API Update Failed");
    } catch {
      // 4. Rollback to original state if network fails
      if (!silent) toast.error("Database sync failed. Reverting changes.");
      setSelection(prev => {
        const revertedTransactions = (prev.stagedData?.transactions || []).map(t => 
          t._id === txId ? { ...t, ...originalTx } : t
        );
        let revertedVerified = [...(prev.verifiedIds || [])];
        if (payload.isChecked !== undefined) {
          revertedVerified = wasVerified 
            ? [...new Set([...revertedVerified, txId])]
            : revertedVerified.filter(id => id !== txId);
        }
        return {
          ...prev,
          verifiedIds: revertedVerified,
          stagedData: { ...prev.stagedData, transactions: revertedTransactions }
        };
      });
    }
  };

  const toggleComm = () => {
    if (!activeTx) return;
    const payload = { isCommission: !activeTx.isCommission };
    if (!activeTx.isCommission) payload.isSales = true; 
    handleUpdate(activeTx._id, payload);
  };

  const handleVerifyAndNext = () => {
    if (!activeTx) return;
    handleUpdate(activeTx._id, { isChecked: true }, true);
    
    const currentIndex = displayTransactions.findIndex(t => t._id === currentTxId);
    let nextUnverifiedId = null;
    
    for (let i = currentIndex + 1; i < displayTransactions.length; i++) {
      if (!(selection.verifiedIds || []).includes(displayTransactions[i]._id)) {
        nextUnverifiedId = displayTransactions[i]._id;
        break;
      }
    }
    
    if (nextUnverifiedId) {
      setSelectedTxId(nextUnverifiedId);
    } else {
      toast.success(`All ${activeTab.toLowerCase()}s for this bank are verified!`);
      setIsMobileEditorOpen(false);
    }
  };

  const handleSelectAll = async () => {
    if (!displayTransactions.length) return;
    const allDisplayedIds = displayTransactions.map(tx => tx._id);
    const currentlyVerified = selection.verifiedIds || [];
    const isAllSelected = allDisplayedIds.every(id => currentlyVerified.includes(id));
    const targetState = !isAllSelected;

    // Optimistic Bulk Update
    setSelection(prev => {
      let newVerified = [...(prev.verifiedIds || [])];
      if (targetState) {
        newVerified = [...new Set([...newVerified, ...allDisplayedIds])];
      } else {
        newVerified = newVerified.filter(id => !allDisplayedIds.includes(id));
      }
      const updatedTxs = (prev.stagedData?.transactions || []).map(t => 
        allDisplayedIds.includes(t._id) ? { ...t, isChecked: targetState } : t
      );
      return { ...prev, verifiedIds: newVerified, stagedData: { ...prev.stagedData, transactions: updatedTxs } };
    });

    try {
      const idsToUpdate = allDisplayedIds.filter(id => currentlyVerified.includes(id) !== targetState);
      if (idsToUpdate.length > 0) {
        await Promise.all(idsToUpdate.map(id => request(`/audit/transactions/${id}`, 'PATCH', { isChecked: targetState })));
        toast.success(targetState ? `Verified all records` : `Unverified all records`);
      }
    } catch {
      toast.error("Sync failed for some transactions. Please refresh.");
    }
  };

  const isAllDisplayedChecked = displayTransactions.length > 0 && displayTransactions.every(tx => (selection.verifiedIds || []).includes(tx._id));

  const filteredLedgers = useMemo(() => {
    return companyLedgers.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.groupName && l.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 100); 
  }, [companyLedgers, searchQuery]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />

      <div className="flex flex-col h-full w-full bg-[#FBFBFC] dark:bg-[#050607] overflow-hidden absolute inset-0">
        
        {/* =====================================================================
            GLOBAL HEADER: BANK TABS & DUAL DASHBOARD
            ===================================================================== */}
        <header className="flex flex-col shrink-0 z-20 bg-white dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 shadow-sm">
          <div className="px-4 lg:px-6 py-3 lg:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full lg:w-auto min-w-0">
              <div className="space-y-0.5 shrink-0 hidden xl:block">
                <h2 className="text-xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                  Audit <span className="text-emerald-500">Workspace</span>
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
                        ? 'bg-white dark:bg-[#1A1C20] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-white/10' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
                    }`}
                  >
                    <Landmark size={12} className="inline mr-1.5 opacity-70 mb-0.5" /> 
                    <span>{bank}</span>
                    {unverifiedPerBank[bank] > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[8px] font-black leading-none ${
                        currentBank === bank 
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {unverifiedPerBank[bank]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-2 shrink-0">
                <div className="flex flex-col text-right pr-4 border-r border-slate-200 dark:border-white/10">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Global Rx</span>
                  <span className="text-xs font-black text-emerald-600 tabular-nums italic leading-none">{formatINR(globalTotals.receipts)}</span>
                </div>
                <div className="flex flex-col text-left pl-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Global Px</span>
                  <span className="text-xs font-black text-rose-600 tabular-nums italic leading-none">{formatINR(globalTotals.payments)}</span>
                </div>
              </div>

              <div className="flex items-center border border-slate-300 dark:border-white/20 rounded-xl bg-slate-900 dark:bg-white/10 px-4 py-2 shrink-0">
                <div className="flex flex-col text-right pr-4 border-r border-slate-700 dark:border-white/20">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{currentBank} Rx</span>
                  <span className="text-xs font-black text-emerald-400 tabular-nums italic leading-none">{formatINR(bankTotals.receipts)}</span>
                </div>
                <div className="flex flex-col text-left pl-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{currentBank} Px</span>
                  <span className="text-xs font-black text-rose-400 tabular-nums italic leading-none">{formatINR(bankTotals.payments)}</span>
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
            
            <div className="p-3 bg-white dark:bg-black/20 border-b border-slate-200 dark:border-white/5 shrink-0">
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-full">
                {['RECEIPT', 'PAYMENT'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{tab}S</span>
                    {unverifiedPerType[tab] > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black leading-none ${
                        activeTab === tab 
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {unverifiedPerType[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                {displayTransactions.length} Items Found
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">No {activeTab.toLowerCase()}s found.</p>
                </div>
              ) : (
                displayTransactions.map((tx) => {
                  const isChecked = (selection.verifiedIds || []).includes(tx._id);
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
                          onClick={(e) => { e.stopPropagation(); handleUpdate(tx._id, { isChecked: !isChecked }); }}
                          className={`cursor-pointer w-5 h-5 shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'border-slate-600 text-transparent hover:border-white' : 'border-slate-300 dark:border-white/20 text-transparent hover:border-emerald-500'}`}
                        >
                          <Check size={10} strokeWidth={4} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] lg:text-xs font-bold leading-snug line-clamp-2 uppercase ${isActive ? 'text-white' : isChecked ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.narration}
                          </p>
                        </div>
                        <span className={`text-xs font-[1000] tabular-nums italic shrink-0 ${isActive ? 'text-emerald-400' : activeTab === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatINR(Math.abs(tx.amount))}
                        </span>
                      </div>

                      <div className="pl-8 flex flex-col gap-2">
                        {tx.suggestedLedger ? (
                          <div className={`text-[10px] font-black uppercase tracking-widest leading-relaxed wrap-break-word ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                            {tx.suggestedLedger}
                          </div>
                        ) : (
                          <div className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                            UNMAPPED
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                          
                          <div className="flex flex-wrap gap-1">
                            {tx.isSales && <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20'}`}>Sales</span>}
                            {tx.isCommission && <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20'}`}>Comm</span>}
                            {tx.isMarkedForManualEntry && <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/20'}`}>Man</span>}
                            {tx.customNarration && <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10'}`}>Note</span>}
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
              RIGHT: HUD EDITOR (Horizontal Stacking, Zero Scroll)
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-center">Select a transaction<br/>to open the editor</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col w-full h-full max-w-4xl mx-auto p-4 lg:p-6 gap-4 overflow-hidden">
                
                <div className="shrink-0 pb-4 border-b border-slate-200 dark:border-white/10 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {new Date(activeTx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'RECEIPT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {activeTab}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <h2 className="text-sm lg:text-base font-bold uppercase text-black-800 dark:text-slate-200 leading-snug wrap-break-word">
                      {activeTx.narration}
                    </h2>
                    <h1 className={`text-3xl lg:text-4xl font-[1000] tabular-nums italic tracking-tighter shrink-0 ${activeTab === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatINR(Math.abs(activeTx.amount))}
                    </h1>
                  </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">
                  
                  {/* LEFT COLUMN: Ledger Mapping */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-2 shrink-0 lg:shrink">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                      <Landmark size={14} className="text-emerald-500" /> Target Ledger Mapping
                    </label>
                    <button 
                      onClick={() => setLedgerModalOpen(true)}
                      className={`cursor-pointer flex-1 w-full rounded-2xl border-2 transition-all group outline-none flex items-center justify-between p-5 lg:p-6 text-left shadow-sm min-h-30 ${activeTx.suggestedLedger ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5 hover:border-emerald-500' : 'border-slate-200 dark:border-white/10 border-dashed bg-white dark:bg-white/2 hover:border-emerald-400'}`}
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        {activeTx.suggestedLedger ? (
                          <>
                            <span className="text-xl lg:text-2xl font-[1000] text-emerald-700 dark:text-emerald-400 uppercase tracking-tight wrap-break-word whitespace-normal leading-tight">
                              {activeTx.suggestedLedger}
                            </span>
                            {activeTx.confidence > 0 && (
                              <span className={`text-[10px] font-black uppercase tracking-widest mt-2.5 px-2.5 py-1 rounded-md w-max ${activeTx.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                                {Math.round(activeTx.confidence * 100)}% Auto-Match
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xl font-black text-rose-500 uppercase tracking-tight">
                            Select Ledger...
                          </span>
                        )}
                      </div>
                      <div className="shrink-0 px-4 py-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all shadow-sm flex items-center gap-1.5">
                        <Edit3 size={12} /> <span className="hidden sm:inline">Change</span>
                      </div>
                    </button>
                  </div>

                  {/* RIGHT COLUMN: Flags & Notes */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-4 min-h-0">
                    
                    <div className="flex flex-col gap-2 shrink-0">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Flags</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdate(activeTx._id, { isSales: !activeTx.isSales })}
                          className={`cursor-pointer flex-1 h-12 rounded-lg border-2 flex items-center justify-center gap-1.5 transition-all ${activeTx.isSales ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-indigo-300'}`}
                        >
                          {activeTx.isSales ? <CheckCircle2 size={14} /> : <Tag size={14} className="opacity-40" />}
                          <span className="text-[9px] font-black uppercase tracking-widest">Sales</span>
                        </button>
                        
                        <button 
                          onClick={toggleComm}
                          className={`cursor-pointer flex-1 h-12 rounded-lg border-2 flex items-center justify-center gap-1.5 transition-all ${activeTx.isCommission ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500 dark:text-blue-400 shadow-sm' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-300'}`}
                        >
                          {activeTx.isCommission ? <CheckCircle2 size={14} /> : <FileText size={14} className="opacity-40" />}
                          <span className="text-[9px] font-black uppercase tracking-widest">Comm</span>
                        </button>
                        
                        <button 
                          onClick={() => handleUpdate(activeTx._id, { isMarkedForManualEntry: !activeTx.isMarkedForManualEntry })}
                          className={`cursor-pointer flex-1 h-12 rounded-lg border-2 flex items-center justify-center gap-1.5 transition-all ${activeTx.isMarkedForManualEntry ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-400 shadow-sm' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-amber-300'}`}
                        >
                          {activeTx.isMarkedForManualEntry ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} className="opacity-40" />}
                          <span className="text-[9px] font-black uppercase tracking-widest">Manual</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 min-h-20">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare size={12}/> Internal Auditor Note
                      </label>
                      <textarea 
                        value={activeTx.customNarration || ""}
                        onChange={(e) => handleUpdate(activeTx._id, { customNarration: e.target.value }, true)}
                        placeholder="Add a remark for your records..."
                        className="w-full h-full flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold uppercase focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-3 lg:pt-4 border-t border-slate-200 dark:border-white/5 mt-auto">
                  <button 
                    onClick={handleVerifyAndNext}
                    className="cursor-pointer w-full py-4 lg:py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-linear-to-t from-emerald-600 to-emerald-500"
                  >
                    <FastForward size={16} strokeWidth={3} />
                    Verify & Next
                  </button>
                </div>

              </div>
            )}
          </section>
        </main>

        {/* =========================================
            THE CENTERED LEDGER MAPPING MODAL 
            ========================================= */}
        {ledgerModalOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0B0C10] w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="p-5 lg:p-6 bg-slate-900 dark:bg-black flex flex-col gap-2 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 text-emerald-500">
                  <FileSpreadsheet size={120} className="-mt-4 -mr-4" />
                </div>
                <div className="relative z-10 flex justify-between items-start gap-4">
                  <div className="space-y-1.5 pr-4">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                       Mapping Transaction
                    </span>
                    <p className="text-sm font-bold text-white uppercase leading-snug wrap-break-word">
                      {activeTx?.narration}
                    </p>
                  </div>
                  <button onClick={() => { setLedgerModalOpen(false); setSearchQuery(""); }} className="cursor-pointer p-2 shrink-0 text-slate-400 hover:text-white bg-white/10 hover:bg-rose-500 transition-colors rounded-lg border border-white/10">
                    <X size={16} />
                  </button>
                </div>
                <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-3 mt-1">
                  <span className={`text-lg font-[1000] tabular-nums italic ${activeTab === 'RECEIPT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatINR(Math.abs(activeTx?.amount || 0))}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/10 px-2 py-1 rounded">
                    {new Date(activeTx?.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50 dark:bg-white/2">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    autoFocus 
                    placeholder="SEARCH TALLY LEDGERS..." 
                    className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-black uppercase outline-none focus:border-emerald-500 transition-all text-slate-900 dark:text-white" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
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
                    const isSelected = activeTx?.suggestedLedger === l.name;
                    return (
                      <button 
                        key={l._id} 
                        onClick={() => {
                          handleUpdate(activeTx._id, { suggestedLedger: l.name });
                          setLedgerModalOpen(false);
                          setSearchQuery("");
                        }} 
                        className={`cursor-pointer w-full text-left px-5 py-4 rounded-xl text-xs font-[1000] uppercase transition-colors flex items-center justify-between group ${isSelected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      >
                        <span className="truncate pr-4 leading-none">{l.name}</span>
                        <span className={`text-[9px] font-black tracking-widest shrink-0 leading-none ${isSelected ? 'text-emerald-600/60' : 'text-slate-400 group-hover:text-slate-500'}`}>
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

      </div>
    </>
  );
};

export default AuditStep;