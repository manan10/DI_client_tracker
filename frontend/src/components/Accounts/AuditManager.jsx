import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, ArrowRight, Zap, CheckCircle2, Landmark, Inbox, 
  ArrowUpRight, ArrowDownLeft, Trash2, Calendar, 
  RefreshCw, Wifi, WifiOff, Database, Loader2, Check, X, Building2, Activity
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates'; 
import AuditWizard from './AuditManager/AuditWizard';

const AuditManager = () => {
  const { request } = useApi();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState('current'); 
  const [arns, setArns] = useState([]);
  

  // Tally Sync States
  const [isTallyOnline, setIsTallyOnline] = useState(false);
  const [activeFirms, setActiveFirms] = useState([]);
  const [syncState, setSyncState] = useState({ 
    isOpen: false, 
    isComplete: false, 
    logs: [], 
    currentFirm: '', 
    progress: 0 
  });
  const [lastGlobalSync, setLastGlobalSync] = useState(localStorage.getItem('last_global_sync') || 'Never');
  
  const now = new Date();
  const currentMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const currentYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [selection, setSelection] = useState({
    arn: null, account: null, month: currentMonth, year: currentYear,
    files: [], stagedData: null, audit: null, verifiedIds: [], isFreshStart: false
  });

  const checkConnection = useCallback(async () => {
    try {
      const res = await request("/tally/proxy", "POST", { xml: tallyTemplates.getCompanies() });
      if (res) {
        const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
        const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
        setActiveFirms(filtered);
        setIsTallyOnline(filtered.length > 0);
      } else {
        setIsTallyOnline(false);
        setActiveFirms([]);
      }
    } catch { 
      setIsTallyOnline(false); 
      setActiveFirms([]);
    }
  }, [request]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [arnRes] = await Promise.all([
        request('/arns')
      ]);
      setArns(arnRes?.data || []);
    } catch { // Silent catch - we'll show errors during sync if ARNs are missing
    }
  }, [request]);

  useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

  useEffect(() => {
    request('/audit/summary-list').then(res => res?.success && setAudits(res.data));
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [request, checkConnection]);

const handleGlobalSync = async () => {
    setSyncState({ isOpen: true, isComplete: false, logs: ["Initiating secure connection..."], currentFirm: '', progress: 5 });
    try {
      const companyRes = await request("/tally/proxy", "POST", { xml: tallyTemplates.getCompanies() });
      const matches = [...companyRes.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
      const activeFirmsList = [...new Set(matches)].filter(n => !n.includes('migrated-to'));

      if (activeFirmsList.length === 0) {
        setSyncState(prev => ({ ...prev, logs: [...prev.logs, "No active companies found in Tally."] }));
        return;
      }

      for (let i = 0; i < activeFirmsList.length; i++) {
        const firm = activeFirmsList[i];
        
        // --- NEW LOGIC: Resolve ARN for this firm ---
        // 'arns' should be the state/variable containing your list of ARNs fetched from the backend
        const matchedArn = arns.find(a => a.linkedTallyFirms?.includes(firm));

        if (!matchedArn) {
          setSyncState(prev => ({ 
            ...prev, 
            logs: [...prev.logs, `⚠️ Skipped ${firm}: No ARN link found in Settings.`] 
          }));
          continue; // Skip this firm and move to the next
        }
        // --------------------------------------------

        setSyncState(prev => ({ ...prev, currentFirm: firm, logs: [...prev.logs, `Synchronizing: ${firm}`] }));
        
        const ledgerRes = await request("/tally/proxy", "POST", { xml: tallyTemplates.getLedgers(firm) });
        const ledgerMatches = [...ledgerRes.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>[\s\S]*?<PARENT[^>]*>(.*?)<\/PARENT>/g)];
        const mapped = ledgerMatches.map(m => ({ name: m[1], parent: m[2] }));

        // Pass the arnId to the backend
        await request("/ledgers/bulk-sync", "POST", { 
            ledgers: mapped, 
            company: firm,
            arnId: matchedArn._id // NOW THE BACKEND IS HAPPY (200 OK)
        });

        setSyncState(prev => ({ 
            ...prev, 
            progress: ((i + 1) / activeFirmsList.length) * 100,
            logs: [...prev.logs, `Successfully updated ${mapped.length} accounts from ${firm}`] 
        }));
      }

      const time = new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      setLastGlobalSync(time);
      localStorage.setItem('last_global_sync', time);
      setSyncState(prev => ({ ...prev, isComplete: true, logs: [...prev.logs, "All registries are up to date."] }));
    } catch (err) {
      console.error("Sync Error:", err);
      setSyncState(prev => ({ ...prev, logs: [...prev.logs, "Connection to Bridge failed."] }));
    }
  };

  const displayAudits = useMemo(() => {
    return audits.filter(a => activeTab === 'current' ? a.status === 'DRAFT' : a.status === 'EXPORTED');
  }, [audits, activeTab]);

  return (
    <div className="min-h-screen w-full bg-[#FBFBFC] dark:bg-[#050607] flex flex-col font-sans text-left overflow-hidden">
      
      {/* 1. PROFESSIONAL HEADER */}
      <header className="w-full px-12 pt-14 pb-10 flex flex-col md:flex-row justify-between items-end gap-6 bg-white dark:bg-black/20 border-b border-slate-100 dark:border-white/5 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className={`px-5 py-2 rounded-2xl flex items-center gap-3 border-2 transition-all shadow-sm ${isTallyOnline ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-black uppercase tracking-widest">{isTallyOnline ? 'Tally Link Active' : 'Tally Offline'}</span>
            </div>
            <button 
              onClick={handleGlobalSync}
              disabled={!isTallyOnline || syncState.isSyncing}
              className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-30"
            >
              <RefreshCw size={16} className={`${syncState.isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
              Sync Ledgers
            </button>
          </div>
          <h1 className="text-7xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
            Tally <span className="text-emerald-500">DataSync</span>
          </h1>
        </div>

        <button 
          onClick={() => { setSelection({ ...selection, isFreshStart: true, account: null }); setIsWizardOpen(true); }} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-6 rounded-4xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
        >
          <Plus size={20} strokeWidth={4} className="inline mr-3" /> Start New Audit
        </button>
      </header>

      {/* 2. MAIN SPLIT CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* VERTICAL BRIDGE STATUS SIDEBAR */}
        <aside className="w-80 border-r border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 p-8 overflow-y-auto no-scrollbar hidden lg:flex flex-col gap-8">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bridge Intelligence</h2>
            <p className="text-xs font-bold text-slate-500 italic">Currently Loaded Entities</p>
          </div>

          <div className="space-y-3">
            {activeFirms.length > 0 ? activeFirms.map((firm, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                   <Building2 size={16} className="text-emerald-500" />
                   <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest">Live</div>
                </div>
                <p className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase italic leading-tight">{firm}</p>
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Tally ERP 9 Connection</p>
              </div>
            )) : (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl opacity-40">
                <WifiOff size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Scanning Bridge for open firms...</p>
              </div>
            )}
          </div>

          <div className="mt-auto p-5 bg-slate-900 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">System Health</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 leading-relaxed uppercase">The registry syncs master ledgers from all live companies listed above.</p>
          </div>
        </aside>

        {/* MAIN PIPELINE AREA */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* SUB-NAV */}
          <div className="px-12 py-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white/50 backdrop-blur-md">
            <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl">
              <button onClick={() => setActiveTab('current')} className={`px-12 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Incomplete Audits</button>
              <button onClick={() => setActiveTab('history')} className={`px-12 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Completed Archives</button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">Global Sync Cycle</span>
              <span className="text-slate-900 dark:text-white text-[11px] font-[1000] italic uppercase">{lastGlobalSync}</span>
            </div>
          </div>

          {/* STRIPS LIST */}
          <main className="flex-1 px-12 py-10 overflow-y-auto no-scrollbar space-y-4">
            {displayAudits.length > 0 ? displayAudits.map(audit => (
              <AuditStrip key={audit._id} audit={audit} isOnline={isTallyOnline} onAction={() => {
                if (audit.status === 'EXPORTED') return;
                setSelection({ audit, account: audit.accountId, arn: audit.arnId, month: audit.month, year: audit.year, stagedData: null, verifiedIds: [], isFreshStart: false });
                setIsWizardOpen(true);
              }} />
            )) : (
              <div className="h-64 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] mt-10">
                <Inbox size={60} strokeWidth={1} />
                <p className="text-xs font-black uppercase tracking-[0.5em] mt-6">Workspace Clear</p>
              </div>
            )}
          </main>
        </section>
      </div>

      {/* 3. SYNC OVERLAY */}
      {syncState.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-white/90 dark:bg-[#050607]/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl text-center space-y-12 p-16">
                <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                    {syncState.isComplete ? (
                        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl relative z-10 animate-in zoom-in">
                            <Check size={48} strokeWidth={4} />
                        </div>
                    ) : (
                        <Loader2 className="animate-spin text-emerald-500 relative z-10" size={96} strokeWidth={1.5} />
                    )}
                </div>
                <div className="space-y-4">
                    <h3 className="text-5xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                        {syncState.isComplete ? 'Sync Finished' : 'Syncing Data'}
                    </h3>
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em]">
                        {syncState.isComplete ? 'All Tally instances reconciled' : `Processing ${syncState.currentFirm || 'Connecting'}...`}
                    </p>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-md mx-auto shadow-inner">
                    <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${syncState.progress}%` }} />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-3 px-4">
                    {syncState.logs.map((log, i) => (
                        <p key={i} className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-center italic animate-in fade-in slide-in-from-bottom-1">{log}</p>
                    ))}
                </div>
                <button 
                  onClick={() => setSyncState({ isOpen: false, isComplete: false, logs: [], currentFirm: '', progress: 0 })}
                  className={`w-full max-w-sm py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl ${syncState.isComplete ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                >
                  {syncState.isComplete ? 'Close Workspace' : 'Processing Bridge...'}
                </button>
           </div>
        </div>
      )}

      {isWizardOpen && (
        <AuditWizard onClose={() => { setIsWizardOpen(false); }} initialSelection={selection} existingAudits={audits} isTallyOnline={isTallyOnline} />
      )}
    </div>
  );
};


const AuditStrip = ({ audit, onAction, isOnline }) => {
  const isDraft = audit?.status === 'DRAFT' || audit?.status === 'Draft';

  // Calculate totals dynamically using staged data arrays to bypass empty audit.summary properties
  const processedSummary = useMemo(() => {
    if (audit?.summary && Object.keys(audit.summary).length > 0) {
      return {
        count: (audit.summary.receiptCount || 0) + (audit.summary.paymentCount || 0),
        inflow: audit.summary.totalReceipts || 0,
        outflow: audit.summary.totalPayments || 0
      };
    }

    const txList = (audit?.stagedData?.transactions || []).filter(t => t && t.narration !== "EMPTY_FILE_MARKER");
    
    if (txList.length > 0) {
      const receipts = txList.filter(t => t.type === 'RECEIPT');
      const payments = txList.filter(t => t.type === 'PAYMENT');
      
      return {
        count: txList.length,
        inflow: receipts.reduce((sum, t) => sum + (t.amount || 0), 0),
        outflow: payments.reduce((sum, t) => sum + (t.amount || 0), 0),
      };
    }

    return { count: 0, inflow: 0, outflow: 0 };
  }, [audit]);

  const formatINRValue = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div 
      onClick={onAction} 
      className={`group w-full bg-white dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 pr-8 flex items-center gap-8 transition-all cursor-pointer ${
        isDraft 
          ? 'hover:border-emerald-500/40 hover:bg-slate-50/50 shadow-sm opacity-100' 
          : 'opacity-75 hover:opacity-100'
      }`}
    >
      {/* FIXED: Balanced side indicator bar sizing to fit the row naturally without text clipping */}
      <div className={`w-1.5 self-stretch rounded-full shrink-0 ${isDraft ? 'bg-amber-400' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`} />
      
      {/* FIXED: Removed line-height throttling (leading-none) and added py-1 to prevent text clipping at the bottom */}
      <div className="flex-1 min-w-0 text-left py-1">
        <h3 className="text-xl font-[1000] uppercase text-slate-900 dark:text-white tracking-tight italic break-words leading-tight mb-1.5">
          {audit?.tallyCompanyName || audit?.clientName || "Client Accounts A/C"}
        </h3>
        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
          {audit?.arnId?.nickname || "Direct Brokerage A/C"} <span className="mx-1 text-slate-200 dark:text-slate-800">•</span> {audit?.month || 1}/{audit?.year || 2026}
        </p>
      </div>

      <div className="flex items-center gap-10 shrink-0 select-none">
        <div className="text-right min-w-[50px]">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic tracking-widest">Entries</p>
          <p className="text-lg font-[1000] text-slate-900 dark:text-white italic tabular-nums leading-none">
            {processedSummary.count}
          </p>
        </div>

        <div className="flex items-center gap-10 px-10 border-x border-slate-100 dark:border-white/5">
          {/* INFLOW COMPONENT */}
          <div className="text-right min-w-[130px]">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <ArrowDownLeft size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Inflow</span>
            </div>
            <p className="text-lg font-[1000] italic leading-none tabular-nums text-emerald-600">
              ₹{formatINRValue(processedSummary.inflow)}
            </p>
          </div>

          {/* OUTFLOW COMPONENT */}
          <div className="text-right min-w-[130px]">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <ArrowUpRight size={14} className="text-rose-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Outflow</span>
            </div>
            <p className="text-lg font-[1000] italic leading-none tabular-nums text-rose-600">
              ₹{formatINRValue(processedSummary.outflow)}
            </p>
          </div>
        </div>
      </div>

      {/* FIXED: Reduced padded radius sizes slightly to look modern and sharp inside the card layout */}
      <div className={`px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 ${
        isDraft 
          ? (isOnline ? 'bg-slate-950 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed') 
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      }`}>
        {isDraft ? (
          isOnline ? (
            <>Open <ArrowRight size={16} strokeWidth={3} /></>
          ) : (
            <>Tally Offline</>
          )
        ) : (
          <><CheckCircle2 size={16} strokeWidth={3} /> Finalized</>
        )}
      </div>

    </div>
  );
};

export default AuditManager;