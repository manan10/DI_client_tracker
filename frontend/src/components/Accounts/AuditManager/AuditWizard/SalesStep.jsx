import React, { useState, useMemo, useCallback } from 'react';
import { 
  Layers, Keyboard, Check, Edit3 
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../../../hooks/useApi';

import BankCountRail from './SalesStep/BankCountRail';
import SalesAccordionList from './SalesStep/SalesAccordionList';
import SalesHudEditor from './SalesStep/SalesHudEditor';
import GlobalLedgerModal from './SalesStep/GlobalLedgerModal';
import SalesDatePickerModal from './SalesStep/SalesDatePickerModal';
import KeyboardShortcutsModal from './SalesStep/KeyboardShortcutsModal';

const SalesStep = ({ 
  selection, 
  setSelection, 
  masterLedgers = [], 
  arns = [] 
}) => {
  const { request } = useApi();

  // 1. ISOLATED LOCAL STATE (Zero effect triggers to parent)
  const [localTransactions, setLocalTransactions] = useState(() => {
    return selection.stagedData?.transactions || [];
  });

  const [globalSalesLedger, setGlobalSalesLedger] = useState(() => {
    return selection.salesIncomeLedger || "";
  });

  // Navigation & UI States
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Search & Modal States
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerModalMode, setLedgerModalMode] = useState(null);
  const [showAllLedgers, setShowAllLedgers] = useState(false);

  // Date Picker States
  const [activePickerId, setActivePickerId] = useState(null);
  const [pickerNav, setPickerNav] = useState({ 
    month: selection.month || 1, 
    year: selection.year || 2026 
  });

  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const isTrue = (val) => val === true || String(val).toLowerCase() === 'true';

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Robust ARN Resolution
  const activeArnId = useMemo(() => {
    const raw = selection.arnId || selection.arn || selection.audit?.arnId;
    if (typeof raw === 'object' && raw !== null) return raw._id || raw.arnCode || raw.arn;
    return raw;
  }, [selection.arnId, selection.arn, selection.audit?.arnId]);

  const activeArnObject = useMemo(() => {
    if (!activeArnId || !arns.length) return null;
    return arns.find(a => 
      String(a._id) === String(activeArnId) || 
      String(a.arnCode) === String(activeArnId) ||
      String(a.arn) === String(activeArnId)
    );
  }, [arns, activeArnId]);

  const isGstCompliant = !!activeArnObject?.gstCompliant;

  // Master Ledgers
  const allCompanyLedgers = useMemo(() => {
    return masterLedgers
      .filter(l => l.tallyCompanyName === selection.tallyCompany)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [masterLedgers, selection.tallyCompany]);

  const companyLedgers = useMemo(() => {
    return allCompanyLedgers.filter(l => l.name.toLowerCase().includes("mf com"));
  }, [allCompanyLedgers]);

  // Transform Staged Transactions into Sales Matrix Records
  const salesTransactions = useMemo(() => {
    return localTransactions
      .filter(t => t && isTrue(t.isSales) && t.type === 'RECEIPT')
      .map(tx => {
        const netAmount = tx.amount || 0; 
        const activeSalesLedger = tx.individualSalesLedger || globalSalesLedger || tx.suggestedLedger || tx.partyLedger || "SUSPENSE SALES LEDGER";
        
        const isLocalAmc = activeSalesLedger.toUpperCase().includes("NJ") || 
                           activeSalesLedger.toUpperCase().includes("LOCAL") || 
                           activeSalesLedger.toUpperCase().includes("STATE");

        let baseAmount = (tx.baseAmount !== undefined && tx.baseAmount !== null) ? Number(tx.baseAmount) : netAmount;
        let cgst = 0, sgst = 0, igst = 0, grossVoucherTotal = netAmount;

        const applyCGST = tx.applyCGST !== undefined && tx.applyCGST !== null ? isTrue(tx.applyCGST) : (isGstCompliant && isLocalAmc);
        const applySGST = tx.applySGST !== undefined && tx.applySGST !== null ? isTrue(tx.applySGST) : (isGstCompliant && isLocalAmc);
        const applyIGST = tx.applyIGST !== undefined && tx.applyIGST !== null ? isTrue(tx.applyIGST) : (isGstCompliant && !isLocalAmc);

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
            // fallback
          }
        }

        return {
          ...tx,
          narration: tx.narration || tx.description || tx.particulars || "",
          suggestedLedger: tx.suggestedLedger || tx.partyLedger || tx.ledgerName || tx.partyName || "",
          activeSalesLedger,
          applyCGST, applySGST, applyIGST,
          baseAmount, cgst, sgst, igst, grossVoucherTotal,
          invoiceBillingDate: defaultDate
        };
      });
  }, [localTransactions, isGstCompliant, globalSalesLedger]);

  // Banks & Aggregates
  const availableBanks = useMemo(() => {
    const banks = [...new Set(salesTransactions.map(t => t.bank).filter(Boolean))];
    return banks.length > 0 ? banks : ["Default Bank"];
  }, [salesTransactions]);

  const currentBank = useMemo(() => {
    if (selectedBank && availableBanks.includes(selectedBank)) return selectedBank;
    return availableBanks.length > 0 ? availableBanks[0] : "";
  }, [selectedBank, availableBanks]);

  const bankCounts = useMemo(() => {
    const stats = {};
    availableBanks.forEach(b => {
      stats[b] = { total: 0, pending: 0, verified: 0, totalAmount: 0 };
    });
    salesTransactions.forEach(tx => {
      const b = tx.bank || "Default Bank";
      if (!stats[b]) stats[b] = { total: 0, pending: 0, verified: 0, totalAmount: 0 };
      stats[b].total += 1;
      stats[b].totalAmount += tx.grossVoucherTotal;
      if (isTrue(tx.isSalesApproved)) {
        stats[b].verified += 1;
      } else {
        stats[b].pending += 1;
      }
    });
    return stats;
  }, [salesTransactions, availableBanks]);

  const displayTransactions = useMemo(() => {
    let filtered = salesTransactions.filter(t => t.bank === currentBank || !t.bank);

    if (txSearchQuery.trim() !== "") {
      const q = txSearchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.narration || "").toLowerCase().includes(q) || 
        (t.suggestedLedger || "").toLowerCase().includes(q) || 
        (t.activeSalesLedger || "").toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [salesTransactions, currentBank, txSearchQuery]);

  const currentTxId = useMemo(() => {
    if (selectedTxId && displayTransactions.some(t => t._id === selectedTxId)) return selectedTxId;
    return displayTransactions.length > 0 ? displayTransactions[0]._id : null;
  }, [selectedTxId, displayTransactions]);

  const activeTx = useMemo(() => {
    return displayTransactions.find(t => t._id === currentTxId);
  }, [displayTransactions, currentTxId]);

  const globalTotals = useMemo(() => {
    return salesTransactions.reduce((acc, curr) => acc + curr.grossVoucherTotal, 0);
  }, [salesTransactions]);

  const bankTotals = useMemo(() => {
    return displayTransactions.reduce((acc, curr) => acc + curr.grossVoucherTotal, 0);
  }, [displayTransactions]);

  // Update Handlers (Updates purely local state and triggers background DB update)
  const handleUpdate = useCallback(async (txId, payload) => {
    setLocalTransactions(prev => {
      const updated = prev.map(t => {
        if (t._id === txId) {
          const isConfigChange = ('individualSalesLedger' in payload) || 
                                 ('applyCGST' in payload) || 
                                 ('applySGST' in payload) || 
                                 ('applyIGST' in payload);
          
          let finalApprovalState = t.isSalesApproved;
          if ('isSalesApproved' in payload) {
            finalApprovalState = payload.isSalesApproved;
          } else if (isConfigChange) {
            finalApprovalState = false;
            payload.isSalesApproved = false;
          }

          return { ...t, ...payload, isSalesApproved: finalApprovalState };
        }
        return t;
      });

      // Synchronize back to parent silently
      setSelection(p => ({
        ...p,
        salesIncomeLedger: globalSalesLedger,
        stagedData: {
          ...p.stagedData,
          transactions: updated
        }
      }));

      return updated;
    });

    try {
      await request(`/audit/transactions/${txId}`, 'PUT', payload);
    } catch {
      // Silent catch
    }
  }, [request, globalSalesLedger, setSelection]);

  const getLockedTaxPayload = useCallback((tx) => ({
    applyCGST: tx.applyCGST,
    applySGST: tx.applySGST,
    applyIGST: tx.applyIGST,
    baseAmount: tx.baseAmount,
    cgst: tx.cgst,
    sgst: tx.sgst,
    igst: tx.igst
  }), []);

  const handleVerifyAndNext = useCallback(() => {
    if (!activeTx) return;
    
    handleUpdate(activeTx._id, { 
      isSalesApproved: true,
      ...getLockedTaxPayload(activeTx)
    });
    
    const currentIndex = displayTransactions.findIndex(t => t._id === currentTxId);
    let nextUnverifiedId = null;
    
    for (let i = currentIndex + 1; i < displayTransactions.length; i++) {
      if (!isTrue(displayTransactions[i].isSalesApproved)) {
        nextUnverifiedId = displayTransactions[i]._id;
        break;
      }
    }

    if (!nextUnverifiedId) {
      for (let i = 0; i < currentIndex; i++) {
        if (!isTrue(displayTransactions[i].isSalesApproved)) {
          nextUnverifiedId = displayTransactions[i]._id;
          break;
        }
      }
    }
    
    if (nextUnverifiedId) {
      setSelectedTxId(nextUnverifiedId);
    } else {
      toast.success(`All sales vouchers for ${currentBank} verified!`);
    }
  }, [activeTx, displayTransactions, currentTxId, currentBank, handleUpdate, getLockedTaxPayload]);

  const handleSelectAll = async () => {
    if (!displayTransactions.length) return;
    const isAllSelected = displayTransactions.every(tx => isTrue(tx.isSalesApproved));
    const targetState = !isAllSelected;

    setLocalTransactions(prev => {
      const updated = prev.map(t => {
        const dTx = displayTransactions.find(d => d._id === t._id);
        if (dTx) {
          return targetState 
            ? { ...t, isSalesApproved: true, ...getLockedTaxPayload(dTx) } 
            : { ...t, isSalesApproved: false };
        }
        return t;
      });

      setSelection(p => ({
        ...p,
        salesIncomeLedger: globalSalesLedger,
        stagedData: {
          ...p.stagedData,
          transactions: updated
        }
      }));

      return updated;
    });

    toast.success(targetState ? `Approved all sales in view` : `Unapproved all sales in view`);

    try {
      if (targetState) {
        await Promise.all(displayTransactions.map(tx => 
          request(`/audit/transactions/${tx._id}`, 'PUT', {
            isSalesApproved: true,
            ...getLockedTaxPayload(tx)
          })
        ));
      } else {
        const targetIds = displayTransactions.map(t => t._id);
        await request('/audit/transactions/bulk-update', 'PUT', {
          transactionIds: targetIds,
          updateData: { isSalesApproved: false }
        });
      }
    } catch {
      // Silent catch
    }
  };

  const handleLedgerSelect = async (ledgerName) => {
    if (ledgerModalMode === 'GLOBAL' || !globalSalesLedger) {
      setGlobalSalesLedger(ledgerName);
      setSelection(prev => ({ ...prev, salesIncomeLedger: ledgerName }));
      toast.success("Global sales income ledger locked");
      if (selection.audit?._id) {
        try {
          await request(`/audit/${selection.audit._id}`, 'PUT', { salesIncomeLedger: ledgerName });
        } catch {
          // Silent catch
        }
      }
    } else if (ledgerModalMode === 'INDIVIDUAL' && activeTx) {
      handleUpdate(activeTx._id, { individualSalesLedger: ledgerName });
    }
    
    setLedgerModalMode(null);
    setSearchQuery("");
    setShowAllLedgers(false);
  };

  const filteredLedgers = useMemo(() => {
    const baseSource = showAllLedgers ? allCompanyLedgers : companyLedgers;
    return baseSource.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.groupName && l.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 100); 
  }, [allCompanyLedgers, companyLedgers, searchQuery, showAllLedgers]);

  // Date Picker
  const handleOpenPickerContext = useCallback(() => {
    if (!activeTx) return;
    if (activeTx?.invoiceBillingDate) {
      const [y, m] = activeTx.invoiceBillingDate.split('-');
      setPickerNav({ month: parseInt(m), year: parseInt(y) });
    } else {
      setPickerNav({ month: selection.month || 1, year: selection.year || 2026 });
    }
    setActivePickerId(activeTx._id);
  }, [activeTx, selection.month, selection.year]);

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

  const handleUpdateTax = useCallback((taxType) => {
    if (!activeTx) return;
    if (taxType === 'CGST') {
      handleUpdate(activeTx._id, {
        applyCGST: !activeTx.applyCGST,
        applySGST: activeTx.applySGST,
        applyIGST: activeTx.applyIGST,
        baseAmount: activeTx.baseAmount,
        cgst: !activeTx.applyCGST ? activeTx.baseAmount * 0.09 : 0,
        sgst: activeTx.sgst,
        igst: activeTx.igst
      });
    } else if (taxType === 'SGST') {
      handleUpdate(activeTx._id, {
        applySGST: !activeTx.applySGST,
        applyCGST: activeTx.applyCGST,
        applyIGST: activeTx.applyIGST,
        baseAmount: activeTx.baseAmount,
        cgst: activeTx.cgst,
        sgst: !activeTx.applySGST ? activeTx.baseAmount * 0.09 : 0,
        igst: activeTx.igst
      });
    } else if (taxType === 'IGST') {
      handleUpdate(activeTx._id, {
        applyIGST: !activeTx.applyIGST,
        applyCGST: activeTx.applyCGST,
        applySGST: activeTx.applySGST,
        baseAmount: activeTx.baseAmount,
        cgst: activeTx.cgst,
        sgst: activeTx.sgst,
        igst: !activeTx.applyIGST ? activeTx.baseAmount * 0.18 : 0
      });
    }
  }, [activeTx, handleUpdate]);

  const isAllDisplayedChecked = displayTransactions.length > 0 && displayTransactions.every(tx => isTrue(tx.isSalesApproved));

  // 1. EMPTY SALES SCREEN
  if (salesTransactions.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans select-none">
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
            No Sales Vouchers Found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are no transactions marked as sales/commission for this month. You can proceed directly to the batch summary.
          </p>
        </div>
        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Tally Company: <span className="text-indigo-600 dark:text-indigo-400 font-black">{selection.tallyCompany}</span>
        </div>
      </div>
    );
  }

  // 2. MANDATORY GLOBAL LEDGER SELECTION GATE
  if (!globalSalesLedger) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/30 font-sans">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Configure Global Sales Ledger
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Before inspecting the {salesTransactions.length} sales vouchers, select the default income account for <span className="font-bold text-slate-700 dark:text-slate-300">{selection.tallyCompany}</span>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Default Sales Ledger
            </label>
            <div className="relative">
              <select
                value={globalSalesLedger || ""}
                onChange={(e) => {
                  if (e.target.value) handleLedgerSelect(e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-black uppercase text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Click to choose Tally Ledger --</option>
                {allCompanyLedgers.map(l => (
                  <option key={l._id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN WORKBENCH
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="flex flex-col h-full w-full overflow-hidden absolute inset-0 min-w-0 font-sans">
        
        <header className="flex flex-col shrink-0 z-20 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 min-w-0">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Sales <span className="text-indigo-500">Validation</span>
                </span>
                {isGstCompliant ? (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">GST Compliant</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Non-GST</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setLedgerModalMode('GLOBAL')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 hover:border-indigo-500 text-xs text-left cursor-pointer transition-all"
                title="Change Global Sales Income Ledger"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Global Sales Fallback</span>
                  <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 truncate max-w-44">
                    {globalSalesLedger || "Choose Ledger..."}
                  </span>
                </div>
                <Edit3 size={12} className="text-indigo-500 opacity-70" />
              </button>

              <div className="flex items-center border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 px-3 py-1.5 text-xs">
                <div className="flex flex-col text-right pr-3 border-r border-slate-200 dark:border-white/10">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Global Sales Total</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatINR(globalTotals)}</span>
                </div>
                <div className="flex flex-col text-left pl-3">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{currentBank} Total</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatINR(bankTotals)}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="View Keyboard Hotkeys (?)"
              >
                <Keyboard size={13} />
                <span>Shortcuts</span>
              </button>
            </div>

          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 flex overflow-hidden w-full relative min-w-0">
          
          <BankCountRail
            availableBanks={availableBanks}
            currentBank={currentBank}
            bankCounts={bankCounts}
            salesTransactions={salesTransactions}
            onSelectBank={setSelectedBank}
            formatINR={formatINR}
            isTrue={isTrue}
          />

          <section className="flex-1 flex flex-col bg-white dark:bg-[#07090E] relative min-w-0 overflow-hidden">
            
            <div className="px-4 py-2 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
              <button 
                type="button"
                onClick={() => setIsListDrawerOpen(prev => !prev)}
                className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Layers size={14} className="text-indigo-500" />
                <span>{displayTransactions.length} Vouchers in {currentBank}</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[9px] font-mono">A</kbd>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleSelectAll}
                  className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                    isAllDisplayedChecked 
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Check size={11} strokeWidth={3} /> {isAllDisplayedChecked ? 'All Verified' : 'Verify All in Bank'}
                </button>
              </div>
            </div>

            {isListDrawerOpen && (
              <SalesAccordionList
                displayTransactions={displayTransactions}
                currentTxId={currentTxId}
                txSearchQuery={txSearchQuery}
                onSearchChange={setTxSearchQuery}
                onSelectTx={setSelectedTxId}
                formatINR={formatINR}
                isTrue={isTrue}
              />
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 min-w-0">
              <SalesHudEditor
                activeTx={activeTx}
                onOpenLedgerModal={() => setLedgerModalMode('INDIVIDUAL')}
                onOpenDatePicker={handleOpenPickerContext}
                onUpdateTax={handleUpdateTax}
                onVerifyAndNext={handleVerifyAndNext}
                formatINR={formatINR}
                isTrue={isTrue}
              />
            </div>

          </section>
        </main>

        <GlobalLedgerModal
          ledgerModalMode={ledgerModalMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredLedgers={filteredLedgers}
          selection={{ ...selection, salesIncomeLedger: globalSalesLedger }}
          activeTx={activeTx}
          showAllLedgers={showAllLedgers}
          onToggleShowAll={() => setShowAllLedgers(prev => !prev)}
          onSelectLedger={handleLedgerSelect}
          onClearOverride={() => {
            if (activeTx) handleUpdate(activeTx._id, { individualSalesLedger: "" });
            setLedgerModalMode(null);
          }}
          onClose={() => { setLedgerModalMode(null); setSearchQuery(""); setShowAllLedgers(false); }}
        />

        <SalesDatePickerModal
          activePickerId={activePickerId}
          pickerNav={pickerNav}
          monthsList={monthsList}
          weekDays={weekDays}
          calendarGridData={calendarGridData}
          activeTx={activeTx}
          onShiftMonth={shiftMonthNavigation}
          onSelectDate={(dateStr) => {
            handleUpdate(activePickerId, { invoiceBillingDate: dateStr });
            setActivePickerId(null);
          }}
          onClose={() => setActivePickerId(null)}
        />

        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />

      </div>
    </>
  );
};

export default SalesStep;