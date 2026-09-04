import React, { useState, useEffect, useCallback } from "react";
import { DatabaseZap, Loader2, Server, FileText } from "lucide-react";
import { useApi } from '../../../../shared/hooks/useApi';
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
    <div className="space-y-5 w-full">
      
      {/* WIDGET HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Server size={16} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
            System Bridge
          </h2>
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
            Local Tally ERP connection & sync queue
          </p>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* Card 1: Connection Status */}
        <div className="flex flex-col p-3.5 sm:p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <DatabaseZap size={16} className="text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
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
          <span className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
            isLoading ? "text-slate-400" :
            isTallyOnline ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-500"
          }`}>
            {isLoading ? "Polling..." : isTallyOnline ? "Connected" : "Offline"}
          </span>
        </div>

        {/* Card 2: Pending Audits */}
        <div className="flex flex-col p-3.5 sm:p-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <FileText size={16} className={`${pendingAudits > 0 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            Draft Dossiers
          </span>
          <span className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
            isLoading ? "text-slate-400" : 
            pendingAudits > 0 ? "text-amber-600 dark:text-amber-500" : "text-slate-900 dark:text-white"
          }`}>
            {isLoading ? "--" : pendingAudits > 0 ? `${pendingAudits} Pending` : "All Clear"}
          </span>
        </div>

      </div>
    </div>
  );
};

export default TallyPulse;