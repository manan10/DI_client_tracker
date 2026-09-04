import React from "react";
import { 
  ShieldCheck, Loader2, AlertCircle, ArrowDownCircle, 
  ArrowUpRight, Landmark, Wallet, ArrowDown, ArrowRight
} from "lucide-react";

const MonthlyRefill = ({ wallets, onRefill, loading }) => {
  const drawer = wallets.find(w => w.isGeneralPool);
  const recipients = wallets.filter(w => !w.isGeneralPool && w.targetAllowance > 0);
  const totalMemberOutflow = recipients.reduce((sum, w) => sum + w.targetAllowance, 0);

  return (
    <div className="animate-in fade-in duration-500 text-left pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Monthly Top-up</h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Sequential Refill Protocol</p>
        </div>
      </div>

      <div className="relative">
        
        {/* PHASE 1: DRAWER INFLOW */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle size={16} className="text-blue-500" strokeWidth={2.5} />
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Phase 1: Source Replenishment</span>
          </div>
          
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0B1120] rounded-4xl border-2 border-blue-100 dark:border-blue-900/40 flex justify-between items-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-50/80 to-transparent dark:from-blue-900/10 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm shrink-0 border border-blue-100 dark:border-blue-500/20">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{drawer?.walletName || 'The Drawer'}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-blue-400 uppercase mt-1 tracking-widest">Replenishing Master Fund</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <span className="text-xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                +₹{drawer?.targetAllowance?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* TRANSITION PIPELINE */}
        <div className="relative h-16 sm:h-20">
          {/* Vertical Track bridging Phase 1 & 2 */}
          <div className="absolute left-10.25 sm:left-11.25 top-0 h-full w-0.5 bg-linear-to-b from-blue-400 to-emerald-400 dark:from-blue-500/50 dark:to-emerald-500/50" />
          
          {/* Funds Flow Indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 left-6.25 sm:left-7.25 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm">
              <ArrowDown size={14} className="text-emerald-500" strokeWidth={3} />
              <span>Funds Allocated To</span>
            </div>
          </div>
        </div>

        {/* PHASE 2: MEMBER OUTFLOW */}
        <div className="relative">
          {/* Phase 2 Header & Track */}
          <div className="relative pl-16 sm:pl-20 pb-4">
            <div className="absolute left-10.25 sm:left-11.25 top-0 h-full w-0.5 bg-emerald-400/50 dark:bg-emerald-500/30" />
            <div className="flex items-center gap-2 relative z-10">
              <ArrowUpRight size={16} className="text-emerald-500" strokeWidth={2.5} />
              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Phase 2: Member Distribution</span>
            </div>
          </div>
          
          <div className="space-y-0">
            {recipients.length > 0 ? (
              recipients.map((wallet, index) => {
                const isLast = index === recipients.length - 1;
                return (
                  <div key={wallet._id} className="relative pl-16 sm:pl-20 pb-4 group">
                    
                    {/* Vertical Track Segment (stops halfway on the last item) */}
                    <div className={`absolute left-10.25 sm:left-11.25 top-0 w-0.5 bg-emerald-400/50 dark:bg-emerald-500/30 transition-all duration-500 ${isLast ? 'h-1/2' : 'h-full'}`} />
                    
                    {/* Horizontal Branch with Directing Arrow */}
                    <div className="absolute left-10.75 sm:left-11.75 top-1/2 -translate-y-1/2 w-5.25 sm:w-8.25 flex items-center">
                      <div className="w-full h-0.5 bg-emerald-400/50 dark:bg-emerald-500/30 transition-colors duration-300 group-hover:bg-emerald-500" />
                      <div className="absolute right-0 text-emerald-500 dark:text-emerald-400 translate-x-1 transition-transform duration-300 group-hover:translate-x-1.5">
                         <ArrowRight size={14} strokeWidth={3} />
                      </div>
                    </div>

                    {/* Member Wallet Card */}
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors shadow-sm relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 transition-all shadow-sm">
                          <Wallet size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{wallet.walletName}</p>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allocation</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                          +₹{wallet.targetAllowance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="relative pl-16 sm:pl-20 pb-4">
                <div className="absolute left-10.25 sm:left-11.25 top-0 h-1/2 w-0.5 bg-slate-300 dark:bg-slate-700" />
                <div className="absolute left-10.75 sm:left-11.75 top-1/2 -translate-y-1/2 w-5.25 sm:w-8.25 flex items-center">
                  <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="p-4 sm:p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm relative z-10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No allocations pending</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="mt-8 flex items-start sm:items-center gap-3 p-4 sm:p-5 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg shrink-0 mt-0.5 sm:mt-0 border border-slate-100 dark:border-slate-700">
            <AlertCircle size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest leading-relaxed">
            System will credit <span className="text-blue-500 dark:text-blue-400">₹{drawer?.targetAllowance?.toLocaleString() || "0"}</span> to the Master Pool, 
            then distribute <span className="text-emerald-500 dark:text-emerald-400">₹{totalMemberOutflow.toLocaleString()}</span> to member wallets.
          </p>
        </div>

        {/* EXECUTION BUTTON */}
        <button 
          onClick={onRefill}
          disabled={loading || !drawer}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white py-4 sm:py-5 rounded-2xl font-[1000] uppercase text-xs tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(16,185,129,0.2)] active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <ShieldCheck size={20} strokeWidth={2.5} />
              <span>Authorize Protocol</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MonthlyRefill;