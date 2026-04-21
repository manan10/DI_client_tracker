import React from "react";
import { 
  BarChart2, 
  TrendingUp, 
  ChevronLeft, 
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import ExpenseNavbar from "../../components/ExpenseNavbar";

const ExpenseAnalytics = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-left">
      <ExpenseNavbar />
      
      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* TOP BADGE */}
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
            Coming Soon: Intelligent Insights
          </span>
        </div>

        <div className="text-center max-w-3xl space-y-12">
          
          {/* MAIN TYPOGRAPHY */}
          <div className="space-y-6">
            <h1 className="text-6xl sm:text-8xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9] italic">
              Advanced <br /> 
              <span className="text-emerald-500">Visualization</span>
            </h1>
            <p className="text-sm sm:text-lg font-medium text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              We're building a smarter way to track your capital flow. Soon, you'll be able to visualize spending patterns with institutional-grade precision.
            </p>
          </div>

          {/* VISUAL PREVIEW CARDS (The "Teaser") */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4 hover:border-emerald-500/30 transition-colors duration-500">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <BarChart2 size={20} className="text-emerald-500" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Cashflow Velocity</h3>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-2/3" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4 hover:border-emerald-500/30 transition-colors duration-500">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp size={20} className="text-emerald-500" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Pattern Recognition</h3>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-1/2" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4 hover:border-emerald-500/30 transition-colors duration-500">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <Layers size={20} className="text-emerald-500" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Vault Analytics</h3>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4" />
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all cursor-pointer group shadow-xl"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Ledger
            </button>
            
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-6">
              <ArrowUpRight size={14} className="text-emerald-500" />
              Project Status: Development
            </div>
          </div>
        </div>

        {/* SUBTLE FOOTER */}
        <div className="mt-20 border-t border-slate-100 dark:border-slate-800 w-full max-w-md pt-8 text-center">
          <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em]">
            Precision Audit Framework &copy; 2026
          </p>
        </div>

      </main>
    </div>
  );
};

export default ExpenseAnalytics;