import React from "react";
import { ShieldCheck, Loader2, AlertCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const MonthlyRefill = ({ wallets, onRefill, loading }) => {
  const drawer = wallets.find(w => w.isGeneralPool);
  const recipients = wallets.filter(w => !w.isGeneralPool && w.targetAllowance > 0);
  const totalMemberOutflow = recipients.reduce((sum, w) => sum + w.targetAllowance, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500 text-left">
      <div className="text-left">
        <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">Monthly Top-up</h3>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-3 italic leading-none">Sequential Refill Protocol</p>
      </div>

      <div className="bg-slate-50 dark:bg-[#161B22]/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        
        {/* PHASE 1: DRAWER INFLOW */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 1: Source Replenishment</span>
          </div>
          <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{drawer?.walletName || 'The Drawer'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Replenishing Master Fund</p>
            </div>
            <span className="text-lg font-[1000] text-blue-500 italic">+₹{drawer?.targetAllowance?.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-8 border-dashed border-t border-transparent" />

        {/* PHASE 2: MEMBER OUTFLOW */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 2: Member Distribution</span>
          </div>
          <div className="space-y-3">
            {recipients.map((wallet) => (
              <div key={wallet._id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {wallet.walletName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">From Drawer</span>
                  <span className="text-sm font-[1000] text-emerald-500 italic">+₹{wallet.targetAllowance.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EXECUTION BUTTON */}
        <button 
          onClick={onRefill}
          disabled={loading || !drawer}
          className="w-full bg-emerald-500 text-white h-24 rounded-3xl font-[1000] uppercase text-sm tracking-[0.4em] transition-all flex flex-col items-center justify-center shadow-2xl active:scale-95 disabled:opacity-30"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} strokeWidth={3} />
                <span>Authorize Protocol</span>
              </div>
              <span className="text-[8px] opacity-60 tracking-[0.2em] mt-1 font-black">Sequential Execution</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-start gap-4 px-6 text-[9px] text-slate-400 dark:text-slate-600 uppercase font-bold tracking-widest leading-relaxed">
        <AlertCircle size={14} className="shrink-0" />
        <p>
          System will first credit <span className="text-blue-500">₹{drawer?.targetAllowance?.toLocaleString()}</span> to the Master Pool, 
          then distribute <span className="text-emerald-500">₹{totalMemberOutflow.toLocaleString()}</span> to member wallets.
        </p>
      </div>
    </div>
  );
};

export default MonthlyRefill;