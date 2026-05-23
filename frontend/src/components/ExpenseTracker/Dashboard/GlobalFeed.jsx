import React from "react";
import { Link } from "react-router-dom";
import { History, Banknote, MoveUpRight, Globe, Zap, Coins } from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={16} className={className} />; // Balanced size
};

const GlobalFeed = ({ history, wallets }) => {
  const getWalletDetails = (source) => {
    if (source && typeof source === 'object') {
      return { name: source.walletName || "Unknown", isVirtual: !!source.isVirtual };
    }
    const localMatch = wallets.find((w) => w._id === source);
    return { name: localMatch ? localMatch.walletName : "System", isVirtual: localMatch ? !!localMatch.isVirtual : false };
  };

  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History size={14} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Active Ledger</h2>
          </div>
          <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Cross-Node Transaction Feed</p>
        </div>
        
        <Link to="/expenses/history" className="group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all hover:border-emerald-500/50">
          <span className="text-[9px] font-black text-slate-500 group-hover:text-emerald-600 uppercase tracking-widest">Archive</span>
          <MoveUpRight size={10} className="text-slate-300 group-hover:text-emerald-500" />
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {recentHistory.map((item) => {
            const isPopulated = item.category && typeof item.category === 'object';
            const categoryLabel = isPopulated ? item.category.label : "Misc";
            const categoryIcon = isPopulated ? item.category.icon : "Banknote";
            const sourceInfo = getWalletDetails(item.sourceWallet);
            const isVirt = sourceInfo.isVirtual;

            return (
              <div key={item._id} className="group relative flex items-center justify-between p-3 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-all">
                
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all ${
                  isVirt ? "bg-indigo-500" : "bg-emerald-500"
                }`} />

                <div className="flex items-center gap-3 sm:gap-4 text-left min-w-0 ml-2">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isVirt ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                  }`}>
                    <IconRenderer iconName={categoryIcon} className={!isVirt ? "group-hover:text-emerald-500" : ""} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-[11px] sm:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                      {categoryLabel}
                    </h4>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {isVirt ? <Zap size={7} /> : <Coins size={7} />}
                      {sourceInfo.name}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p className={`text-sm sm:text-lg font-[1000] italic leading-none tabular-nums ${
                    item.type === "DEBIT" ? (isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-red-500") : "text-emerald-500"
                  }`}>
                    {item.type === "DEBIT" ? "-" : "+"}₹{item.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase mt-1">
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalFeed;