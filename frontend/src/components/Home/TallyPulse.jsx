import React, { useState, useEffect, useCallback } from "react";
import { DatabaseZap, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { tallyTemplates } from "../../utils/tallyTemplates";

const TallyPulse = () => {
  const { request } = useApi();
  
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
    <div className="hidden sm:flex items-center gap-3 md:gap-4 bg-white dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
      {/* SECTION 1: TALLY CONNECTION STATUS */}
      <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-4 border-r border-slate-200 dark:border-slate-700">
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        ) : isTallyOnline ? (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
        ) : (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </div>
        )}
        
        <div className="flex flex-col min-w-[75px]">
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-0.5">
            Tally Connection
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-wider leading-none ${
            isLoading ? "text-slate-400" :
            isTallyOnline ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}>
            {isLoading ? "POLLING..." : isTallyOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* SECTION 2: PENDING AUDIT DOSSIERS */}
      <div className="flex items-center gap-2 md:gap-3 pl-1">
        <div className={`p-1.5 rounded-md ${pendingAudits > 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
          <DatabaseZap size={14} strokeWidth={2.5} />
        </div>
        
        <div className="flex flex-col min-w-[90px]">
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-0.5">
            Pending Audits
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-wider leading-none ${
            isLoading ? "text-slate-400" : 
            pendingAudits > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
          }`}>
            {isLoading ? "--" : pendingAudits > 0 ? `${pendingAudits} IN DRAFT` : "ALL CLEAR"}
          </span>
        </div>
      </div>

    </div>
  );
};

export default TallyPulse;