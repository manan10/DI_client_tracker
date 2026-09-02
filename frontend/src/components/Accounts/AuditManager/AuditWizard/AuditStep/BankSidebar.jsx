import React, { useState } from 'react';
import { 
  Landmark, Keyboard, Check, TrendingUp, TrendingDown, 
  Scale, ArrowDownLeft, ArrowUpRight, RefreshCw, X,
  Loader2
} from 'lucide-react';
import { useApi } from '../../../../../hooks/useApi';
import { tallyTemplates } from '../../../../../utils/tallyTemplates';
import { toast } from 'sonner';

const BankSidebar = ({
  companyName,
  bankDirectory = [],
  grandTotals = {
    verifiedCount: 0,
    totalCount: 0,
    verifiedReceipts: 0,
    receiptCount: 0,
    receiptTotal: 0,
    verifiedPayments: 0,
    paymentCount: 0,
    paymentTotal: 0
  },
  currentBank,
  activeTab,
  onSelectBank,
  onSelectTab,
  onOpenShortcuts,
  formatINR,
  arns: passedArns = [],
  onSyncSuccess
}) => {
  const { request } = useApi();
  
  const [syncState, setSyncState] = useState({
    isOpen: false,
    isSyncing: false,
    isComplete: false,
    currentFirm: '',
    progress: 0,
    logs: []
  });

  // Execute sync on demand only without polling or mounting fetches
  const handleSyncCompany = async (targetFirm = companyName) => {
    if (!targetFirm) {
      toast.error("No company selected for synchronization.");
      return;
    }

    setSyncState({
      isOpen: true,
      isComplete: false,
      logs: ["Initiating secure connection to Tally..."],
      currentFirm: targetFirm,
      progress: 10,
      isSyncing: true
    });

    try {
      // 1. Fetch live open companies list from Tally Bridge
      const companyRes = await request("/tally/proxy", "POST", { 
        xml: tallyTemplates.getCompanies() 
      });

      const rawCompanyXml = typeof companyRes === 'string' 
        ? companyRes 
        : companyRes?.data || companyRes?.xml || '';

      if (!rawCompanyXml) {
        throw new Error("Empty XML response received from Tally Bridge.");
      }

      const matches = [...rawCompanyXml.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
      const activeFirmsList = [...new Set(matches)].filter(n => !n.includes('migrated-to'));

      if (activeFirmsList.length === 0) {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          logs: [...prev.logs, "❌ No active companies detected in Tally ERP / Prime."]
        }));
        return;
      }

      if (!activeFirmsList.includes(targetFirm)) {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          logs: [
            ...prev.logs, 
            `⚠️ Company "${targetFirm}" is not open in Tally.`,
            `Open companies: ${activeFirmsList.join(', ')}`
          ]
        }));
        return;
      }

      // 2. Resolve ARN configuration on demand
      let currentArns = passedArns;
      if (!currentArns || currentArns.length === 0) {
        const arnRes = await request('/arns', 'GET');
        currentArns = arnRes?.data || (Array.isArray(arnRes) ? arnRes : []);
      }

      const matchedArn = currentArns.find(a => a.linkedTallyFirms?.includes(targetFirm));
      if (!matchedArn) {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          logs: [
            ...prev.logs, 
            `⚠️ Skipped ${targetFirm}: No linked ARN configuration found in Settings.`
          ]
        }));
        return;
      }

      setSyncState(prev => ({
        ...prev,
        progress: 40,
        logs: [...prev.logs, `Synchronizing master accounts for: ${targetFirm}`]
      }));

      // 3. Request Ledgers XML for target firm
      const ledgerRes = await request("/tally/proxy", "POST", { 
        xml: tallyTemplates.getLedgers(targetFirm) 
      });

      const rawLedgerXml = typeof ledgerRes === 'string' 
        ? ledgerRes 
        : ledgerRes?.data || ledgerRes?.xml || '';

      const ledgerMatches = [...rawLedgerXml.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>([\s\S]*?)<\/LEDGER>/gi)];

      const mapped = ledgerMatches.map(m => {
        const name = tallyTemplates.unescapeXml(m[1]);
        const block = m[2];

        const parentMatch = block.match(/<PARENT[^>]*>(.*?)<\/PARENT>/i);
        const stateMatch = block.match(/<(?:LED)?STATENAME[^>]*>(.*?)<\/(?:LED)?STATENAME>/i) ||
                           block.match(/<PRIORSTATENAME[^>]*>(.*?)<\/PRIORSTATENAME>/i);
        const countryMatch = block.match(/<COUNTRY(?:NAME|OFRESIDENCE)[^>]*>(.*?)<\/COUNTRY(?:NAME|OFRESIDENCE)>/i);

        // 1. Root-level GSTIN extraction
        const rootGstinMatch = block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i) ||
                               block.match(/<GSTIN[^>]*>(.*?)<\/GSTIN>/i);
        let gstin = rootGstinMatch ? tallyTemplates.unescapeXml(rootGstinMatch[1]).trim() : '';

        // 2. Sub-collection fallback (TallyPrime 3.0+ multi-GST effective registrations)
        if (!gstin) {
          const nestedGstinMatch = block.match(/<GSTREGISTRATIONDETAILS[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTREGISTRATIONDETAILS>/i) ||
                                   block.match(/<LEDGSTREGDETAILS\.LIST[^>]*>[\s\S]*?<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>[\s\S]*?<\/LEDGSTREGDETAILS\.LIST>/i) ||
                                   block.match(/<GSTDETAILS\.LIST[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTDETAILS\.LIST>/i);
          if (nestedGstinMatch && nestedGstinMatch[1].trim()) {
            gstin = tallyTemplates.unescapeXml(nestedGstinMatch[1]).trim();
          }
        }

        // 3. GST Registration Type
        const regTypeMatch = block.match(/<GSTREGISTRATIONTYPE[^>]*>(.*?)<\/GSTREGISTRATIONTYPE>/i) ||
                             block.match(/<REGISTRATIONTYPE[^>]*>(.*?)<\/REGISTRATIONTYPE>/i);
        const gstRegistrationType = regTypeMatch 
          ? tallyTemplates.unescapeXml(regTypeMatch[1]).trim() 
          : (gstin ? 'Regular' : 'Unregistered');

        const addressMatches = [...block.matchAll(/<ADDRESS[^>]*>(.*?)<\/ADDRESS>/gi)];
        const addressList = addressMatches.map(a => tallyTemplates.unescapeXml(a[1]).trim()).filter(Boolean);

        return {
          name: name,
          parent: parentMatch ? tallyTemplates.unescapeXml(parentMatch[1]).trim() : '',
          stateName: stateMatch ? tallyTemplates.unescapeXml(stateMatch[1]).trim() : '',
          country: countryMatch ? tallyTemplates.unescapeXml(countryMatch[1]).trim() : 'India',
          gstin: gstin,
          gstRegistrationType: gstRegistrationType,
          address: addressList
        };
      });

      setSyncState(prev => ({
        ...prev,
        progress: 75,
        logs: [...prev.logs, `Parsed ${mapped.length} accounts from Tally. Updating database...`]
      }));

      // 4. Bulk update master ledgers
      await request("/ledgers/bulk-sync", "POST", {
        ledgers: mapped,
        company: targetFirm,
        arnId: matchedArn._id
      });

      const time = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      localStorage.setItem('last_global_sync', time);

      setSyncState(prev => ({
        ...prev,
        progress: 100,
        isComplete: true,
        isSyncing: false,
        logs: [
          ...prev.logs, 
          `✅ Successfully updated ${mapped.length} accounts from ${targetFirm}.`,
          "Sync operation finalized successfully."
        ]
      }));

      toast.success(`Synced ${mapped.length} ledgers for ${targetFirm}`);

      if (onSyncSuccess) {
        onSyncSuccess(mapped);
      }
    } catch (err) {
      console.error("BankSidebar Sync Error:", err);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        logs: [
          ...prev.logs, 
          `❌ Connection to Bridge failed: ${err.message || 'Unknown network error.'}`
        ]
      }));
    }
  };

  return (
    <aside className="w-full lg:w-[40%] xl:w-[38%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0A0D14] shrink-0 min-w-0 h-full overflow-hidden relative">
      
      {/* Header Title Strip */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 shadow-2xs gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Landmark size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Statement Reconciliation</span>
          </div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
            {companyName}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSyncCompany(companyName)}
            disabled={syncState.isSyncing}
            className="px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Sync Tally Ledgers"
          >
            <RefreshCw size={12} className={syncState.isSyncing ? "animate-spin text-emerald-500" : ""} />
            <span className="hidden sm:inline">Sync Tally</span>
          </button>

          <button 
            type="button"
            onClick={onOpenShortcuts}
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={13} />
            <span>Keys</span>
          </button>
        </div>
      </div>

      {/* Grand Totals Dashboard Block */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Scale size={12} className="text-indigo-500" /> Grand Totals (All Banks)
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {grandTotals.verifiedCount}/{grandTotals.totalCount} Verified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1">
                <ArrowDownLeft size={12} /> Inflow (Rx)
              </span>
              <span className="font-mono text-[9px]">{grandTotals.verifiedReceipts}/{grandTotals.receiptCount}</span>
            </div>
            <p className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums truncate">
              {formatINR(grandTotals.receiptTotal)}
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300">
              <span className="flex items-center gap-1">
                <ArrowUpRight size={12} /> Outflow (Px)
              </span>
              <span className="font-mono text-[9px]">{grandTotals.verifiedPayments}/{grandTotals.paymentCount}</span>
            </div>
            <p className="text-sm font-mono font-black text-rose-700 dark:text-rose-400 tabular-nums truncate">
              {formatINR(grandTotals.paymentTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Bank Accounts & Receipts/Payments Directory */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 min-w-0">
        {bankDirectory.map((b) => {
          const isSelectedBank = currentBank === b.bankName;
          const percent = Math.round((b.verifiedTxs / (b.totalTxs || 1)) * 100);

          return (
            <div 
              key={b.bankName} 
              className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelectedBank 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div 
                onClick={() => { onSelectBank(b.bankName); }}
                className="p-3.5 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    b.isCompleted 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : isSelectedBank 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {b.isCompleted ? <Check size={16} strokeWidth={3} /> : <Landmark size={15} />}
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-black uppercase truncate ${
                      isSelectedBank ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {b.bankName}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {b.verifiedTxs} of {b.totalTxs} Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    b.isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                      : percent > 0 
                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Receipts / Payments */}
              <div className="p-2.5 grid grid-cols-2 gap-2 bg-slate-100/40 dark:bg-black/30">
                <button
                  type="button"
                  onClick={() => {
                    onSelectBank(b.bankName);
                    onSelectTab('RECEIPT');
                  }}
                  className={`cursor-pointer p-2.5 rounded-lg border-2 text-left flex flex-col justify-between transition-all ${
                    isSelectedBank && activeTab === 'RECEIPT' 
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" /> Receipts
                    </span>
                    {b.receipts?.pending > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {b.receipts.pending} Left
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                    <span className="text-[9px] font-bold text-slate-400">{b.receipts?.verified || 0}/{b.receipts?.total || 0}</span>
                    <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatINR(b.receipts?.amount || 0)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectBank(b.bankName);
                    onSelectTab('PAYMENT');
                  }}
                  className={`cursor-pointer p-2.5 rounded-lg border-2 text-left flex flex-col justify-between transition-all ${
                    isSelectedBank && activeTab === 'PAYMENT' 
                      ? 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase flex items-center gap-1.5">
                      <TrendingDown size={12} className="text-rose-600 dark:text-rose-400" /> Payments
                    </span>
                    {b.payments?.pending > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                        {b.payments.pending} Left
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-slate-400">{b.payments?.verified || 0}/{b.payments?.total || 0}</span>
                    <span className="text-xs font-mono font-black text-rose-700 dark:text-rose-400 tabular-nums">
                      {formatINR(b.payments?.amount || 0)}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SYNC PROGRESS & STATUS MODAL */}
      {syncState.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E131F] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Landmark size={16} className="text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Tally Master Synchronization
                </span>
              </div>
              {!syncState.isSyncing && (
                <button
                  type="button"
                  onClick={() => setSyncState(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <span>Target Entity: {syncState.currentFirm}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{Math.round(syncState.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${syncState.progress}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto no-scrollbar border border-slate-800 shadow-inner">
                {syncState.logs.map((log, index) => (
                  <p key={index} className="leading-relaxed">
                    <span className="text-slate-500 mr-2">&gt;</span>
                    {log}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end">
              {syncState.isSyncing ? (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Loader2 size={14} className="animate-spin text-emerald-500" />
                  <span>Syncing with Tally Bridge...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSyncState(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </aside>
  );
};

export default BankSidebar;