import React, { useState, useEffect, useCallback } from "react";
import { RefreshCcw, Fingerprint, BarChart3, ShieldCheck, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import ExpenseNavbar from "../../components/ExpenseNavbar";
import AnalyticsHero from "../../components/ExpenseTracker/Analytics/AnalyticsHero";
import { useApi } from "../../hooks/useApi";

const ExpenseAnalytics = () => {
  const { request } = useApi();
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

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  if (loading && !data) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center">
      <Fingerprint className="text-[#10b981] animate-pulse mb-4" size={56} />
      <p className="text-[10px] font-black uppercase tracking-[1em] text-[#10b981]/40">Authorizing Audit</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-left transition-colors duration-500 font-sans">
      <ExpenseNavbar />
      
      {/* --- THE EXECUTIVE COMMAND HEADER --- */}
      <header className="w-full pt-16 pb-12 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.03),transparent_40%)] pointer-events-none" />

        <div className="max-w-400 mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12">
            
            {/* 1. TITLE BLOCK */}
            <div className="flex items-start gap-8">
              <div className="w-2 h-20 bg-[#10b981] rounded-full shadow-[0_0_20px_-2px_rgba(16,185,129,0.4)]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={14} className="text-[#10b981]" />
                  <span className="text-[10px] font-[1000] uppercase tracking-[0.5em] text-slate-400">Intelligence Node</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                  Spend <span className="text-emerald-500 dark:text-emerald-800">Analytics</span>
                </h1>
              </div>
            </div>

            {/* 2. THE TIMELINE SLIDER (Month Picker) */}
            <div className="flex flex-col items-start xl:items-end gap-2 w-full xl:w-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic px-2">Cycle Selection</p>
              
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative flex items-center bg-slate-50 dark:bg-white/3 p-2 rounded-4xl border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-xl shadow-black/5">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="p-4 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-[#10b981] transition-all active:scale-90"
                  >
                    <ChevronLeft size={28} strokeWidth={3} />
                  </button>
                  
                  <div className="px-12 flex flex-col items-center min-w-70 border-x border-slate-200 dark:border-white/10">
                    <span className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
                      {selectedDate.toLocaleString('default', { month: 'long' })}
                      <span className="text-slate-300 dark:text-slate-700 ml-3">{selectedDate.getFullYear()}</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => changeMonth(1)}
                    className="p-4 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-[#10b981] transition-all active:scale-90"
                  >
                    <ChevronRight size={28} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- DATA SUMMARY SECTION --- */}
      <main className="max-w-400 mx-auto px-6 lg:px-12 pb-24">
        
        <AnalyticsHero 
          data={data} 
          loading={loading} 
          selectedMonth={selectedDate.getMonth()} 
          selectedYear={selectedDate.getFullYear()} 
        />

        {/* --- DEEP ANALYTICS WORKSPACE --- */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Primary Analysis Slot */}
            <div className="lg:col-span-8 group">
                <div className="relative h-full min-h-150 rounded-[4rem] bg-slate-50/50 dark:bg-white/1 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-all duration-700 hover:border-indigo-500/20">
                    <BarChart3 size={64} className="text-slate-200 dark:text-slate-800 animate-pulse mb-10" />
                    <h4 className="text-slate-400 font-[1000] text-xs uppercase tracking-[0.8em] mb-4 leading-none">Computational Matrix</h4>
                    <p className="text-slate-500 text-[11px] uppercase font-bold italic tracking-[0.2em] max-w-sm leading-relaxed">
                        Synthesizing Category-Level Data Streams...
                    </p>
                </div>
            </div>

            {/* Sidebar Context */}
            <div className="lg:col-span-4 space-y-12">
                <div className="p-12 bg-slate-900 rounded-[3.5rem] border-b-8 border-[#10b981] text-white shadow-2xl relative overflow-hidden group">
                    <ShieldCheck className="text-[#10b981] mb-10" size={32} />
                    <h5 className="text-4xl font-[1000] italic leading-tight text-white mb-6 uppercase tracking-tighter">Solvency<br/>Verified</h5>
                    <p className="text-slate-400 text-sm leading-relaxed italic pr-6 font-medium">
                      All physical vaults and digital payment gateways are reporting synchronized balances for the current cycle.
                    </p>
                    <RefreshCcw size={160} className="absolute -bottom-10 -right-10 opacity-[0.03] text-white group-hover:rotate-180 transition-transform duration-2000" />
                </div>
                
                <button 
                  onClick={fetchAnalytics}
                  className="w-full flex items-center justify-center gap-5 py-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-[#10b981] hover:border-[#10b981]/30 transition-all active:scale-95 shadow-xl"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Force Recalculate
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ExpenseAnalytics;