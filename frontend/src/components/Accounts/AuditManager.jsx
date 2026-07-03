import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, ArrowRight, CheckCircle2, Inbox, 
  RefreshCw, WifiOff, Loader2, Check, 
  Building2, Activity, Trash2, AlertTriangle, 
  CloudSync, LayoutList, ChevronDown, ChevronRight
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates'; 
import AuditWizard from './AuditManager/AuditWizard';
import { toast } from 'sonner';

const AuditManager = () => {
  const { request } = useApi();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState('current'); 
  const [arns, setArns] = useState([]);
  
  // Custom Delete Modal State
  const [auditToDelete, setAuditToDelete] = useState(null);

  // Tally Sync States
  const [isTallyOnline, setIsTallyOnline] = useState(false);
  const [activeFirms, setActiveFirms] = useState([]);
  const [syncState, setSyncState] = useState({ 
    isOpen: false, 
    isComplete: false, 
    logs: [], 
    currentFirm: '', 
    progress: 0,
    isSyncing: false
  });
  const [lastGlobalSync, setLastGlobalSync] = useState(localStorage.getItem('last_global_sync') || 'Never');
  
  const now = new Date();
  const currentMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const currentYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [selection, setSelection] = useState({
    arn: null, tallyCompanyName: null, month: currentMonth, year: currentYear,
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

  const refreshData = useCallback(async () => {
    try {
      const res = await request('/audit/summary-list');
      if (res?.success) setAudits(res.data);
      await checkConnection();
      await fetchMasterData();
    } catch (err) {
      console.error("Error refreshing data", err);
    }
  }, [request, checkConnection, fetchMasterData]);

  // Initial load & polling
  useEffect(() => { 
    refreshData();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [refreshData, checkConnection]);

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return;
    
    try {
      const res = await request(`/audit/${auditToDelete}`, 'DELETE');
      if (res?.success) {
        setAudits(prev => prev.filter(a => a._id !== auditToDelete));
        toast.success("Company dossier deleted successfully.");
      } else {
        toast.error("Failed to delete dossier.");
      }
    } catch (err) {
      console.error("Delete Audit Error:", err);
      toast.error(err.message || "An error occurred while deleting.");
    } finally {
      setAuditToDelete(null);
    }
  };

  const handleSync = async (targetFirm = null) => {
    setSyncState({ isOpen: true, isComplete: false, logs: ["Initiating secure connection..."], currentFirm: '', progress: 5, isSyncing: true });
    try {
      const companyRes = await request("/tally/proxy", "POST", { xml: tallyTemplates.getCompanies() });
      const matches = [...companyRes.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
      const activeFirmsList = [...new Set(matches)].filter(n => !n.includes('migrated-to'));

      if (activeFirmsList.length === 0) {
        setSyncState(prev => ({ ...prev, logs: [...prev.logs, "No active companies found in Tally."], isSyncing: false }));
        return;
      }

      const firmsToSync = targetFirm ? activeFirmsList.filter(f => f === targetFirm) : activeFirmsList;

      if (firmsToSync.length === 0 && targetFirm) {
         setSyncState(prev => ({ ...prev, logs: [...prev.logs, `⚠️ ${targetFirm} is no longer open in Tally.`], isSyncing: false }));
         return;
      }

      for (let i = 0; i < firmsToSync.length; i++) {
        const firm = firmsToSync[i];
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
        
        const ledgerMatches = [...ledgerRes.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>([\s\S]*?)<\/LEDGER>/g)];
        
        const mapped = ledgerMatches.map(m => {
            const name = tallyTemplates.unescapeXml(m[1]);
            const block = m[2]; 
            
            const parentMatch = block.match(/<PARENT[^>]*>(.*?)<\/PARENT>/i);
            const stateMatch = block.match(/<(?:LED)?STATENAME[^>]*>(.*?)<\/(?:LED)?STATENAME>/i);
            const gstinMatch = block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i);
            const countryMatch = block.match(/<COUNTRY(?:NAME|OFRESIDENCE)[^>]*>(.*?)<\/COUNTRY(?:NAME|OFRESIDENCE)>/i);
            
            const addressMatches = [...block.matchAll(/<ADDRESS[^>]*>(.*?)<\/ADDRESS>/gi)];
            const addressList = addressMatches.map(a => tallyTemplates.unescapeXml(a[1]));

            return { 
                name: name, 
                parent: parentMatch ? tallyTemplates.unescapeXml(parentMatch[1]) : '',
                stateName: stateMatch ? tallyTemplates.unescapeXml(stateMatch[1]) : '',
                country: countryMatch ? tallyTemplates.unescapeXml(countryMatch[1]) : '',
                gstin: gstinMatch ? tallyTemplates.unescapeXml(gstinMatch[1]) : '',
                address: addressList
            };
        });

        await request("/ledgers/bulk-sync", "POST", { 
            ledgers: mapped, 
            company: firm,
            arnId: matchedArn._id 
        });

        setSyncState(prev => ({ 
            ...prev, 
            progress: ((i + 1) / firmsToSync.length) * 100,
            logs: [...prev.logs, `Successfully updated ${mapped.length} accounts from ${firm}`] 
        }));
      }

      const time = new Date().toLocaleString('en-IN', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
      });
      setLastGlobalSync(time);
      localStorage.setItem('last_global_sync', time);
      setSyncState(prev => ({ ...prev, isComplete: true, isSyncing: false, logs: [...prev.logs, "Sync operation finalized successfully."] }));
    } catch (err) {
      console.error("Sync Error:", err);
      setSyncState(prev => ({ ...prev, isSyncing: false, logs: [...prev.logs, "Connection to Bridge failed."] }));
    }
  };

  const displayAudits = useMemo(() => {
    return audits.filter(a => activeTab === 'current' ? a.status === 'DRAFT' : a.status === 'EXPORTED');
  }, [audits, activeTab]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="min-h-screen w-full bg-[#FBFBFC] dark:bg-[#050607] flex flex-col font-sans text-left overflow-x-hidden">
        
        <header className="w-full px-4 md:px-12 pt-6 md:pt-14 pb-4 md:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 bg-white dark:bg-black/20 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="space-y-4 md:space-y-6 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 border md:border-2 transition-all shadow-sm ${isTallyOnline ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{isTallyOnline ? 'Tally Active' : 'Offline'}</span>
              </div>
              
              <button 
                onClick={refreshData}
                disabled={syncState.isSyncing}
                className="group flex items-center gap-1.5 md:gap-2.5 text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-30"
              >
                <RefreshCw size={14} className={`md:w-4 md:h-4 ${syncState.isSyncing ? 'animate-spin' : 'group-active:rotate-180 transition-transform duration-500'}`} /> 
                Refresh
              </button>
            </div>
            <h1 className="text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none wrap-break-word">
              Tally <span className="text-emerald-500">DataSync</span>
            </h1>
          </div>

          <button 
            onClick={() => { setSelection({ ...selection, isFreshStart: true, tallyCompanyName: null, audit: null }); setIsWizardOpen(true); }} 
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-5 md:px-12 py-3 md:py-6 rounded-xl md:rounded-4xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:hover:scale-105 active:scale-95 transition-all shadow-lg md:shadow-2xl flex justify-center items-center shrink-0"
          >
            <Plus size={16} md:size={20} strokeWidth={4} className="inline mr-2 md:mr-3" /> Start Audit
          </button>
        </header>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* MOBILE SIDEBAR REPLACEMENT */}
          <div className="lg:hidden w-full border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/10 p-4 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                 <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Bridge Intelligence</h2>
                 <button 
                   onClick={() => handleSync(null)} 
                   disabled={!isTallyOnline || activeFirms.length === 0} 
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
                 >
                    <CloudSync size={12} /> Sync All
                 </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                 {activeFirms.length > 0 ? activeFirms.map((firm, idx) => (
                   <div key={idx} className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm space-y-1.5 overflow-hidden">
                     <div className="flex items-center justify-between">
                        <Building2 size={12} className="text-emerald-500" />
                        <button 
                          onClick={() => handleSync(firm)} 
                          className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                           <RefreshCw size={10} />
                        </button>
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

          {/* DESKTOP SIDEBAR */}
          <aside className="w-80 border-r border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 p-8 overflow-y-auto no-scrollbar hidden lg:flex flex-col gap-8 shrink-0">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bridge Intelligence</h2>
                <p className="text-xs font-bold text-slate-500 italic">Open Entities</p>
              </div>
              <button 
                onClick={() => handleSync(null)}
                disabled={!isTallyOnline || activeFirms.length === 0}
                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <CloudSync size={14} /> Sync All
              </button>
            </div>

            <div className="space-y-3">
              {activeFirms.length > 0 ? activeFirms.map((firm, idx) => (
                <div key={idx} className="group p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <Building2 size={16} className="text-emerald-500" />
                         <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest">Live</div>
                     </div>
                     
                     <button 
                       onClick={() => handleSync(firm)}
                       className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-500/20 transition-all shadow-sm active:scale-95"
                       title={`Sync ${firm} Ledgers`}
                     >
                        <RefreshCw size={12} />
                     </button>
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
                <p className="text-[8px] font-bold text-slate-400 leading-relaxed uppercase">Update master ledgers to ensure accuracy before processing bank statements.</p>
            </div>
          </aside>

          <section className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
            <div className="px-4 md:px-12 py-3 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 bg-white/50 backdrop-blur-md shrink-0">
              <div className="flex w-full sm:w-auto p-1 bg-slate-100 dark:bg-white/5 rounded-lg md:rounded-2xl">
                <button onClick={() => setActiveTab('current')} className={`flex-1 sm:flex-none text-center px-4 md:px-12 py-2 md:py-3 rounded-md md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm md:shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Incomplete</button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 sm:flex-none text-center px-4 md:px-12 py-2 md:py-3 rounded-md md:rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm md:shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Archives</button>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                <span className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Last Master Sync</span>
                <span className="text-slate-900 dark:text-white text-[9px] md:text-[11px] font-[1000] italic uppercase">{lastGlobalSync}</span>
              </div>
            </div>

            <main className="flex-1 px-4 md:px-12 py-4 md:py-10 overflow-y-auto no-scrollbar space-y-4 md:space-y-6">
              
              {/* AUDIT MASTER TABLE */}
              {displayAudits.length > 0 ? (
                <div className="w-full overflow-x-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-5">Entity & Period</th>
                        <th className="px-6 py-5 text-center">Process Stage</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {displayAudits.map(audit => (
                        <AuditTableRow 
                          key={audit._id} 
                          audit={audit} 
                          isOnline={isTallyOnline} 
                          onAction={() => {
                            if (audit.status === 'EXPORTED') return;
                            setSelection({ 
                              audit, 
                              tallyCompanyName: audit.tallyCompanyName, 
                              arn: audit.arnId, 
                              month: audit.month, 
                              year: audit.year, 
                              stagedData: null, 
                              verifiedIds: [], 
                              isFreshStart: false 
                            });
                            setIsWizardOpen(true);
                          }}
                          onDelete={() => setAuditToDelete(audit._id)} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-48 md:h-64 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[4rem] mt-6 md:mt-10 mx-auto max-w-lg">
                  <Inbox size={40} md:size={60} strokeWidth={1} />
                  <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.5em] mt-4 md:mt-6 text-center">Workspace Clear</p>
                </div>
              )}
            </main>
          </section>
        </div>

        {/* SYNC OVERLAY & CUSTOM DELETE MODAL REMAIN UNCHANGED */}
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
                         {syncState.isComplete ? 'Bridge operations reconciled' : `Processing ${syncState.currentFirm || 'Connecting'}...`}
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
                   onClick={() => setSyncState({ isOpen: false, isComplete: false, logs: [], currentFirm: '', progress: 0, isSyncing: false })}
                   className={`w-full max-w-sm py-3 md:py-6 rounded-xl md:rounded-3xl font-black uppercase text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] transition-all shadow-xl mx-auto block ${syncState.isComplete ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                 >
                   {syncState.isComplete ? 'Close Workspace' : 'Processing Bridge...'}
                 </button>
             </div>
          </div>
        )}

        {auditToDelete && (
          <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111214] border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-500/20 text-rose-500">
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-[1000] text-slate-900 dark:text-white uppercase tracking-tight mb-2">Delete Dossier</h3>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6 whitespace-normal">
                Are you sure you want to permanently delete this company dossier? This action cannot be undone and will erase all synced bank ledgers for this month.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAuditToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteAudit}
                  className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isWizardOpen && (
          <AuditWizard 
            onClose={() => { setIsWizardOpen(false); refreshData(); }} 
            initialSelection={selection} 
            existingAudits={audits} 
            isTallyOnline={isTallyOnline} 
          />
        )}
      </div>
    </>
  );
};


const AuditTableRow = ({ audit, onAction, onDelete, isOnline }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraft = audit?.status === 'DRAFT' || audit?.status === 'Draft';
  const bankSummaries = audit?.bankSummaries || [];

  const formatINRValue = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      notation: "compact", 
      compactDisplay: "short"
    }).format(amount || 0);
  };

  // Maps the current state directly to the Step it will open in the AuditWizard
  const getStageDisplay = () => {
    if (!isDraft) return { label: 'Step 6: Audit Result (Exported)', color: 'bg-emerald-500 text-white' };
    if (bankSummaries.length > 0) return { label: 'Step 3-5: Verification / Matrix', color: 'bg-blue-500/10 text-blue-600' };
    return { label: 'Step 2: Data Ingestion (Awaiting Uploads)', color: 'bg-amber-500/10 text-amber-600' };
  };

  const stage = getStageDisplay();

  return (
    <React.Fragment>
      {/* PARENT ROW */}
      <tr className={`group transition-all cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-white/2' : 'hover:bg-slate-50 dark:hover:bg-white/2'} ${!isDraft && 'opacity-75 hover:opacity-100'}`} onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* ENTITY & PERIOD */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="p-1 rounded bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-emerald-500 transition-colors">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className={`w-1.5 h-8 rounded-full shrink-0 ${isDraft ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <div>
              <h3 className="text-base font-[1000] uppercase text-slate-900 dark:text-white tracking-tight italic leading-none mb-1">
                {audit?.tallyCompanyName || audit?.clientName || "Client Accounts A/C"}
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded tracking-widest uppercase">
                Period: {audit?.month || 1}/{audit?.year || 2026} • {bankSummaries.length} Bank Statements
              </span>
            </div>
          </div>
        </td>

        {/* STATUS / PROCESS STAGE */}
        <td className="px-6 py-4 text-center">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${stage.color}`}>
            {stage.label}
          </div>
        </td>

        {/* ACTIONS */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete Audit"
              className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-rose-500 bg-rose-50/50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onAction(); }}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 shrink-0 ${
              isDraft 
                ? (isOnline ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed') 
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
            }`}>
              {isDraft ? (
                isOnline ? <><LayoutList size={14} /> Open Dossier <ArrowRight size={14} /></> : <>Tally Offline</>
              ) : (
                <><CheckCircle2 size={14} /> View Exported</>
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* NESTED ACCORDION TABLE (CHILD ROW) */}
      {isExpanded && (
        <tr>
          <td colSpan="3" className="p-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
            <div className="w-full px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {bankSummaries.length > 0 ? (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0B0C10] shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-4 py-3">Bank Ledger</th>
                        <th className="px-4 py-3 text-right">Total Receipts</th>
                        <th className="px-4 py-3 text-right">Sales (isSales)</th>
                        <th className="px-4 py-3 text-right">Total Payments</th>
                        <th className="px-4 py-3 text-right">Total Inflow</th>
                        <th className="px-4 py-3 text-right">Total Outflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {bankSummaries.map((bank, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3 text-xs font-[1000] italic uppercase text-slate-700 dark:text-slate-300">
                            {bank.tallyLedgerName}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-500">
                            {bank.receiptCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5">
                            {bank.salesCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-500">
                            {bank.paymentCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-black italic tabular-nums text-emerald-600">
                            ₹{formatINRValue(bank.totalReceipts)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-black italic tabular-nums text-rose-600">
                            ₹{formatINRValue(bank.totalPayments)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* GRAND TOTAL */}
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-white/5 border-t-2 border-slate-200 dark:border-white/10">
                        <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                          Grand Total
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-[1000] tabular-nums text-slate-900 dark:text-white">
                          {audit?.summary?.receiptCount || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-[1000] tabular-nums text-indigo-600">
                          {audit?.summary?.salesCount || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-[1000] tabular-nums text-slate-900 dark:text-white">
                          {audit?.summary?.paymentCount || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-[1000] italic tabular-nums text-emerald-600">
                          ₹{formatINRValue(audit?.summary?.totalReceipts)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-[1000] italic tabular-nums text-rose-600">
                          ₹{formatINRValue(audit?.summary?.totalPayments)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="w-full p-4 bg-white dark:bg-[#0B0C10] border border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No Data Parsed For This Dossier Yet</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default AuditManager;