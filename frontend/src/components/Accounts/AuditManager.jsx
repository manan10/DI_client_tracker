import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, ArrowRight, CheckCircle2, Inbox, 
  ArrowUpRight, ArrowDownLeft, RefreshCw, WifiOff, 
  Loader2, Check, Building2, Activity, ShieldCheck
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
    } catch { // Silent catch
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
        const matchedArn = arns.find(a => a.linkedTallyFirms?.includes(firm));

        if (!matchedArn) {
          setSyncState(prev => ({ 
            ...prev, 
            logs: [...prev.logs, `⚠️ Skipped ${firm}: No ARN link found in Settings.`] 
          }));
          continue; 
        }

        setSyncState(prev => ({ ...prev, currentFirm: firm, logs: [...prev.logs, `Synchronizing: ${firm}`] }));
        
        const ledgerRes = await request("/tally/proxy", "POST", { xml: tallyTemplates.getLedgers(firm) });
        const ledgerMatches = [...ledgerRes.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>[\s\S]*?<PARENT[^>]*>(.*?)<\/PARENT>/g)];
        const mapped = ledgerMatches.map(m => ({ name: m[1], parent: m[2] }));

        await request("/ledgers/bulk-sync", "POST", { 
            ledgers: mapped, 
            company: firm,
            arnId: matchedArn._id 
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
    <>
      {/* GLOBAL STYLE TO ENFORCE HIDDEN SCROLLBARS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="min-h-screen w-full bg-[#FBFBFC] dark:bg-[#050607] flex flex-col font-sans text-left overflow-x-hidden">
        
        {/* HEADER */}
        <header className="w-full px-4 md:px-12 pt-6 md:pt-14 pb-4 md:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 bg-white dark:bg-black/20 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="space-y-4 md:space-y-6 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 border md:border-2 transition-all shadow-sm ${isTallyOnline ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{isTallyOnline ? 'Tally Active' : 'Offline'}</span>
              </div>
              <button 
                onClick={handleGlobalSync}
                disabled={!isTallyOnline || syncState.isSyncing}
                className="group flex items-center gap-1.5 md:gap-2.5 text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-30"
              >
                <RefreshCw size={14} className={`md:w-4 md:h-4 ${syncState.isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
                Sync Ledgers
              </button>
            </div>
            <h1 className="text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none wrap-break-word">
              Tally <span className="text-emerald-500">DataSync</span>
            </h1>
          </div>

          <button 
            onClick={() => { setSelection({ ...selection, isFreshStart: true, account: null }); setIsWizardOpen(true); }} 
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-5 md:px-12 py-3 md:py-6 rounded-xl md:rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:hover:scale-105 active:scale-95 transition-all shadow-lg md:shadow-2xl flex justify-center items-center shrink-0"
          >
            <Plus size={16} md:size={20} strokeWidth={4} className="inline mr-2 md:mr-3" /> Start Audit
          </button>
        </header>

        {/* MAIN SPLIT CONTENT AREA */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* MOBILE BRIDGE INTELLIGENCE - USING GRID TO PREVENT HORIZONTAL SCROLL */}
          <div className="lg:hidden w-full border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/10 p-4 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                 <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Bridge Intelligence</h2>
                 <div className="flex items-center gap-1">
                   <Activity size={10} className="text-emerald-500" />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Health OK</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                 {activeFirms.length > 0 ? activeFirms.map((firm, idx) => (
                   <div key={idx} className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm space-y-1.5 overflow-hidden">
                     <div className="flex items-center justify-between">
                        <Building2 size={12} className="text-emerald-500" />
                        <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[7px] font-black uppercase tracking-widest">Live</div>
                     </div>
                     <p className="text-[10px] font-[1000] text-slate-900 dark:text-white uppercase italic leading-tight truncate">{firm}</p>
                   </div>
                 )) : (
                   <div className="col-span-2 py-3 px-4 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-xl opacity-50">
                     <p className="text-[8px] font-black uppercase tracking-widest">Scanning Bridge...</p>
                   </div>
                 )}
              </div>
          </div>

          {/* DESKTOP BRIDGE STATUS SIDEBAR */}
          <aside className="w-80 border-r border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 p-8 overflow-y-auto no-scrollbar hidden lg:flex flex-col gap-8 shrink-0">
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
          <section className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
            {/* SUB-NAV */}
            <div className="px-4 md:px-12 py-3 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 bg-white/50 backdrop-blur-md shrink-0">
              <div className="flex w-full sm:w-auto p-1 bg-slate-100 dark:bg-white/5 rounded-lg md:rounded-2xl">
                <button onClick={() => setActiveTab('current')} className={`flex-1 sm:flex-none text-center px-4 md:px-12 py-2 md:py-3 rounded-md md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm md:shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Incomplete</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 sm:flex-none text-center px-4 md:px-12 py-2 md:py-3 rounded-md md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm md:shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Archives</button>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                <span className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Global Sync</span>
                <span className="text-slate-900 dark:text-white text-[9px] md:text-[11px] font-[1000] italic uppercase">{lastGlobalSync}</span>
              </div>
            </div>

            {/* STRIPS LIST */}
            <main className="flex-1 px-4 md:px-12 py-4 md:py-10 overflow-y-auto no-scrollbar space-y-3 md:space-y-4">
              {displayAudits.length > 0 ? displayAudits.map(audit => (
                <AuditStrip key={audit._id} audit={audit} isOnline={isTallyOnline} onAction={() => {
                  if (audit.status === 'EXPORTED') return;
                  setSelection({ audit, account: audit.accountId, arn: audit.arnId, month: audit.month, year: audit.year, stagedData: null, verifiedIds: [], isFreshStart: false });
                  setIsWizardOpen(true);
                }} />
              )) : (
                <div className="h-48 md:h-64 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[4rem] mt-6 md:mt-10 mx-auto max-w-lg">
                  <Inbox size={40} md:size={60} strokeWidth={1} />
                  <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.5em] mt-4 md:mt-6 text-center">Workspace Clear</p>
                </div>
              )}
            </main>
          </section>
        </div>

        {/* SYNC OVERLAY */}
        {syncState.isOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-white/90 dark:bg-[#050607]/95 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-w-2xl text-center space-y-6 md:space-y-12 p-6 md:p-16">
                  <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                      {syncState.isComplete ? (
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl relative z-10 animate-in zoom-in">
                              <Check size={32} md:size={48} strokeWidth={4} />
                          </div>
                      ) : (
                          <Loader2 className="animate-spin text-emerald-500 relative z-10 w-16 h-16 md:w-24 md:h-24" strokeWidth={1.5} />
                      )}
                  </div>
                  <div className="space-y-2 md:space-y-4 px-4">
                      <h3 className="text-2xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none wrap-break-word">
                          {syncState.isComplete ? 'Sync Finished' : 'Syncing Data'}
                      </h3>
                      <p className="text-[10px] md:text-sm font-black text-emerald-600 uppercase tracking-[0.2em] md:tracking-[0.4em] wrap-break-word">
                          {syncState.isComplete ? 'All Tally instances reconciled' : `Processing ${syncState.currentFirm || 'Connecting'}...`}
                      </p>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-md mx-auto shadow-inner">
                      <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${syncState.progress}%` }} />
                  </div>
                  <div className="max-h-32 md:max-h-48 overflow-y-auto space-y-2 md:space-y-3 px-2 md:px-4 no-scrollbar">
                      {syncState.logs.map((log, i) => (
                          <p key={i} className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-center italic animate-in fade-in slide-in-from-bottom-1 wrap-break-word">{log}</p>
                      ))}
                  </div>
                  <button 
                    onClick={() => setSyncState({ isOpen: false, isComplete: false, logs: [], currentFirm: '', progress: 0 })}
                    className={`w-full max-w-sm py-3 md:py-6 rounded-xl md:rounded-3xl font-black uppercase text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] transition-all shadow-xl mx-auto block ${syncState.isComplete ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
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
    </>
  );
};

const AuditStrip = ({ audit, onAction, isOnline }) => {
  const isDraft = audit?.status === 'DRAFT' || audit?.status === 'Draft';

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
      maximumFractionDigits: 2,
      notation: "compact", 
      compactDisplay: "short"
    }).format(amount || 0);
  };

  return (
    <div 
      onClick={onAction} 
      className={`group w-full bg-white dark:bg-white/2 border border-slate-100 dark:border-white/5 rounded-2xl md:rounded-4xl p-4 md:p-6 lg:pr-8 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8 transition-all cursor-pointer overflow-hidden ${
        isDraft 
          ? 'hover:border-emerald-500/40 hover:bg-slate-50/50 shadow-sm opacity-100' 
          : 'opacity-75 hover:opacity-100'
      }`}
    >
      {/* TOP SECTION: Indicator + Title */}
      <div className="flex items-stretch gap-3 w-full lg:w-auto lg:flex-1 min-w-0">
        <div className={`w-1.5 self-stretch rounded-full shrink-0 ${isDraft ? 'bg-amber-400' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`} />
        
        <div className="flex-1 min-w-0 text-left py-0.5">
          <h3 className="text-sm md:text-xl font-[1000] uppercase text-slate-900 dark:text-white tracking-tight italic wrap-break-word leading-tight md:mb-1.5">
            {audit?.tallyCompanyName || audit?.clientName || "Client Accounts A/C"}
          </h3>
          <p className="text-[9px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate mt-0.5 md:mt-0">
            {audit?.arnId?.nickname || "Direct Brokerage A/C"} <span className="mx-1 text-slate-200 dark:text-slate-800">•</span> {audit?.month || 1}/{audit?.year || 2026}
          </p>
        </div>
      </div>

      {/* STATS BLOCK - GRID FOR MOBILE TO PREVENT HORIZONTAL SCROLL */}
      <div className="grid grid-cols-3 gap-2 w-full lg:w-auto lg:flex lg:flex-row items-center justify-between lg:justify-end lg:gap-10 shrink-0 select-none bg-slate-50 dark:bg-white/5 lg:bg-transparent rounded-xl p-2.5 lg:p-0 my-1 lg:my-0 border border-slate-100 dark:border-transparent lg:border-none">
        
        {/* ENTRIES */}
        <div className="text-center lg:text-right min-w-0 flex flex-col items-center lg:items-end">
          <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5 md:mb-1 italic tracking-widest">Entries</p>
          <p className="text-xs md:text-lg font-[1000] text-slate-900 dark:text-white italic tabular-nums leading-none">
            {processedSummary.count}
          </p>
        </div>

        {/* INFLOW */}
        <div className="text-center lg:text-right min-w-0 flex flex-col items-center lg:items-end border-l border-slate-200 dark:border-white/10 lg:border-none lg:pl-10 lg:border-l lg:border-slate-100 lg:dark:border-white/5">
          <div className="flex items-center justify-center lg:justify-end gap-1 mb-0.5 md:mb-1">
            <ArrowDownLeft size={10} md:size={14} className="text-emerald-500 shrink-0" />
            <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">Inflow</span>
          </div>
          <p className="text-xs md:text-lg font-[1000] italic leading-none tabular-nums text-emerald-600 truncate">
            ₹{formatINRValue(processedSummary.inflow)}
          </p>
        </div>

        {/* OUTFLOW */}
        <div className="text-center lg:text-right min-w-0 flex flex-col items-center lg:items-end border-l border-slate-200 dark:border-white/10 lg:border-none lg:pl-10">
          <div className="flex items-center justify-center lg:justify-end gap-1 mb-0.5 md:mb-1">
            <ArrowUpRight size={10} md:size={14} className="text-rose-500 shrink-0" />
            <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">Outflow</span>
          </div>
          <p className="text-xs md:text-lg font-[1000] italic leading-none tabular-nums text-rose-600 truncate">
            ₹{formatINRValue(processedSummary.outflow)}
          </p>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED BUTTON */}
      <div className={`w-full lg:w-auto justify-center lg:justify-start px-4 md:px-8 py-3 rounded-lg md:rounded-2xl flex items-center gap-2 md:gap-3 font-black text-[9px] md:text-xs uppercase tracking-widest transition-all shadow-sm md:shadow-md active:scale-95 shrink-0 ${
        isDraft 
          ? (isOnline ? 'bg-slate-950 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed') 
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      }`}>
        {isDraft ? (
          isOnline ? (
            <>Open <ArrowRight size={12} md:size={16} strokeWidth={3} /></>
          ) : (
            <>Tally Offline</>
          )
        ) : (
          <><CheckCircle2 size={12} md:size={16} strokeWidth={3} /> Finalized</>
        )}
      </div>

    </div>
  );
};

export default AuditManager;