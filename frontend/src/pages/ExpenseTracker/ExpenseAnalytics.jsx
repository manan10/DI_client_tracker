import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom"; // For global refresh
import { RefreshCcw, Fingerprint, BarChart3, ShieldCheck, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import AnalyticsHero from "../../components/ExpenseTracker/Analytics/AnalyticsHero";
import { useApi } from "../../hooks/useApi";

const ExpenseAnalytics = () => {
  const { request } = useApi();
  // Get shared refresh trigger from Layout
  const { refreshKey } = useOutletContext();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const res = await request(`/spending/analytics?month=${month}&year=${year}`);
      if (res?.success) setData(res);
    } catch (e) {
      console.error("Sync Failed", e);
    } finally {
      setLoading(false);
    }
  }, [request, selectedDate]);

  // Runs on mount, date change, OR when a global expense is added
  useEffect(() => { 
    const timer = setTimeout(() => fetchAnalytics(), 0); 
    return () => clearTimeout(timer);
  }, [fetchAnalytics, refreshKey]);

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  if (loading && !data) return (
    <div className="fixed inset-0 bg-[#020617] z-100 flex flex-col items-center justify-center p-6">
      <Fingerprint className="text-[#10b981] animate-pulse mb-4" size={56} />
      <p className="text-[10px] font-black uppercase tracking-[1em] text-[#10b981]/40 text-center">Authorizing Audit</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-left transition-colors duration-500 pb-20">
      
      {/* --- THE EXECUTIVE COMMAND HEADER --- */}
      <header className="w-full pt-8 sm:pt-16 pb-8 sm:pb-12 relative overflow-hidden px-4 sm:px-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.03),transparent_40%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 sm:gap-12">
            
            {/* 1. TITLE BLOCK */}
            <div className="flex items-start gap-4 sm:gap-8">
              <div className="w-1.5 sm:w-2 h-12 sm:h-20 bg-[#10b981] rounded-full shadow-[0_0_20px_-2px_rgba(16,185,129,0.4)]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1 sm:mb-2">
                  <Activity size={14} className="text-[#10b981]" />
                  <span className="text-[8px] sm:text-[10px] font-[1000] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Intelligence Node</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                  Spend <span className="text-emerald-500">Analytics</span>
                </h1>
              </div>
            </div>

            {/* 2. THE TIMELINE SLIDER (Month Picker) */}
            <div className="flex flex-col items-start xl:items-end gap-2 w-full xl:w-auto">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic px-1 sm:px-2">Cycle Selection</p>
              
              <div className="relative group w-full sm:w-auto">
                <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative flex items-center justify-between sm:justify-start bg-slate-50 dark:bg-white/5 p-1.5 sm:p-2 rounded-2xl sm:rounded-4xl border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-xl">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="p-3 sm:p-4 hover:bg-white dark:hover:bg-white/10 rounded-xl sm:rounded-full text-slate-400 hover:text-[#10b981] transition-all active:scale-90"
                  >
                    <ChevronLeft size={24} sm:size={28} strokeWidth={3} />
                  </button>
                  
                  <div className="px-6 sm:px-12 flex flex-col items-center flex-1 sm:min-w-60 border-x border-slate-200 dark:border-white/10">
                    <span className="text-lg sm:text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic whitespace-nowrap">
                      {selectedDate.toLocaleString('default', { month: 'short' })}
                      <span className="text-slate-300 dark:text-slate-600 ml-2">{selectedDate.getFullYear()}</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => changeMonth(1)}
                    className="p-3 sm:p-4 hover:bg-white dark:hover:bg-white/10 rounded-xl sm:rounded-full text-slate-400 hover:text-[#10b981] transition-all active:scale-90"
                  >
                    <ChevronRight size={24} sm:size={28} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- DATA SUMMARY SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        
        <AnalyticsHero 
          data={data} 
          loading={loading} 
          selectedMonth={selectedDate.getMonth()} 
          selectedYear={selectedDate.getFullYear()} 
        />

        {/* --- DEEP ANALYTICS WORKSPACE --- */}
        <div className="mt-12 sm:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
            
            {/* Primary Analysis Slot */}
            <div className="lg:col-span-8 group order-2 lg:order-1">
                <div className="relative h-64 sm:h-full sm:min-h-150 rounded-4xl sm:rounded-[4rem] bg-slate-50/50 dark:bg-white/1 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-all duration-700 hover:border-indigo-500/20">
                    <BarChart3 size={48} sm:size={64} className="text-slate-200 dark:text-slate-800 animate-pulse mb-6 sm:mb-10" />
                    <h4 className="text-slate-400 font-[1000] text-[10px] sm:text-xs uppercase tracking-[0.5em] sm:tracking-[0.8em] mb-2 sm:mb-4 leading-none">Computational Matrix</h4>
                    <p className="text-slate-500 text-[9px] sm:text-[11px] uppercase font-bold italic tracking-widest sm:tracking-[0.2em] px-8 max-w-sm leading-relaxed">
                        Synthesizing Category-Level Data Streams...
                    </p>
                </div>
            </div>

            {/* Sidebar Context */}
            <div className="lg:col-span-4 space-y-6 sm:space-y-12 order-1 lg:order-2">
                <div className="p-8 sm:p-12 bg-slate-900 dark:bg-slate-900/80 rounded-[2.5rem] sm:rounded-[3.5rem] border-b-8 border-[#10b981] text-white shadow-2xl relative overflow-hidden group">
                    <ShieldCheck className="text-[#10b981] mb-6 sm:mb-10" size={32} />
                    <h5 className="text-2xl sm:text-4xl font-[1000] italic leading-tight text-white mb-4 sm:mb-6 uppercase tracking-tighter">Solvency<br/>Verified</h5>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed italic pr-4 sm:pr-6 font-medium">
                      All physical vaults and digital payment gateways are synchronized for this cycle.
                    </p>
                    <RefreshCcw size={160} className="absolute -bottom-10 -right-10 opacity-[0.03] text-white group-hover:rotate-180 transition-transform duration-3000" />
                </div>
                
                <button 
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 py-6 sm:py-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-400 hover:text-[#10b981] hover:border-[#10b981]/30 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> 
                    {loading ? "Re-syncing..." : "Force Recalculate"}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ExpenseAnalytics;