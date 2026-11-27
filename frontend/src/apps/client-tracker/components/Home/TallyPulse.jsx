import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DatabaseZap, Loader2, Server, FileText, ArrowUpRight } from "lucide-react";
import { useApi } from '../../../../shared/hooks/useApi';
import { tallyTemplates } from "../../utils/tallyTemplates";

const TallyPulse = () => {
  const { request } = useApi();
  const navigate = useNavigate();
  
  const [isTallyOnline, setIsTallyOnline] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tally Bridge Connection Poller
  const checkConnection = useCallback(async () => {
    try {
      const res = await request("/tally/proxy", "POST", { xml: tallyTemplates.getCompanies() });
      if (res) {
        const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
        const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
        setIsTallyOnline(filtered.length > 0);
      } else {
        setIsTallyOnline(false);
      }
    } catch { 
      setIsTallyOnline(false); 
    }
  }, [request]);

  // 2. Fetch Draft Audits Count
  const fetchAudits = useCallback(async () => {
    try {
      const res = await request('/audit/summary-list');
      if (res?.success) {
        const draftCount = res.data.filter(a => a.status === 'DRAFT').length;
        setPendingAudits(draftCount);
      }
    } catch (err) {
      console.error("Failed to fetch audits for Pulse:", err);
    }
  }, [request]);

  // 3. Initialize and set polling interval
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      await Promise.all([checkConnection(), fetchAudits()]);
      if (isMounted) setIsLoading(false);
    };

    initData();

    // Ping Tally every 30 seconds
    const interval = setInterval(checkConnection, 30000); 
    
    return () => { 
      isMounted = false;
      clearInterval(interval); 
    };
  }, [checkConnection, fetchAudits]);

  return (
    <div className="space-y-4 w-full">
      
      {/* WIDGET HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
          <Server size={16} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <h2 className="sora-font text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
            System Bridge
          </h2>
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
            Local Tally ERP connection & sync queue
          </p>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Card 1: Connection Status */}
        <div className="flex flex-col p-3.5 sm:p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <DatabaseZap size={16} className="text-slate-400 dark:text-slate-500" strokeWidth={2.25} />
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : isTallyOnline ? (
              <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            ) : (
              <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            Local Node
          </span>
          <span className={`text-sm sm:text-base font-bold tracking-tight truncate ${
            isLoading ? "text-slate-400" :
            isTallyOnline ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}>
            {isLoading ? "Polling..." : isTallyOnline ? "Connected" : "Offline"}
          </span>
        </div>

        {/* Card 2: Pending Audits */}
        <button
          type="button"
          onClick={() => navigate('/accounts', { state: { activeTab: 'audit' } })}
          className="group flex flex-col p-3.5 sm:p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/50 rounded-lg shadow-xs transition-all duration-200 text-left cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <FileText size={16} className={`${pendingAudits > 0 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={2.25} />
            <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            Draft Dossiers
          </span>
          <span className={`font-mono text-sm sm:text-base font-bold tracking-tight truncate ${
            isLoading ? "text-slate-400" : 
            pendingAudits > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
          }`}>
            {isLoading ? "--" : pendingAudits > 0 ? `${pendingAudits} Pending` : "All Clear"}
          </span>
        </button>

      </div>
    </div>
  );
};

export default TallyPulse;