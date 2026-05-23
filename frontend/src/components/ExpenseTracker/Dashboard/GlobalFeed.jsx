import React from "react";
import { Link } from "react-router-dom";
import { History, Banknote, MoveUpRight, Globe, Zap, Coins } from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={18} className={className} />;
};

const GlobalFeed = ({ history, wallets }) => {
  
  // CRITICAL FIX: Ensure we detect virtuality even if the backend 
  // only sends an ID or a partially populated object.
  const getWalletDetails = (source) => {
    // 1. Check if source is already a populated object from the backend
    if (source && typeof source === 'object') {
      return {
        name: source.walletName || "Unknown",
        isVirtual: !!source.isVirtual
      };
    }

    // 2. Fallback: Find the wallet in our local 'wallets' state
    const localMatch = wallets.find((w) => w._id === source);
    return {
      name: localMatch ? localMatch.walletName : "System",
      isVirtual: localMatch ? !!localMatch.isVirtual : false
    };
  };

  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History size={14} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Active Ledger
            </h2>
          </div>
          <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
            Cross-Node Transaction Feed
          </p>
        </div>
        
        <Link to="/expenses/history" className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:border-emerald-500/50">
          <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-600 uppercase tracking-widest">Archive</span>
          <MoveUpRight size={12} className="text-slate-300 group-hover:text-emerald-500" />
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {recentHistory.map((item) => {
            const isPopulated = item.category && typeof item.category === 'object';
            const categoryLabel = isPopulated ? item.category.label : "Misc";
            const categoryIcon = isPopulated ? item.category.icon : "Banknote";
            
            // Get the Wallet data using our fixed helper
            const sourceInfo = getWalletDetails(item.sourceWallet);
            const isVirt = sourceInfo.isVirtual;

            return (
              <div key={item._id} className="group relative flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-all">
                
                {/* 1. THE VERTICAL CUE: Indigo (Virtual) vs Emerald (Cash) */}
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all ${
                  isVirt ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" : "bg-emerald-500"
                }`} />

                <div className="flex items-center gap-4 text-left min-w-0 ml-2">
                  {/* 2. ICON BOX: Swaps color theme based on isVirt */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isVirt 
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20" 
                      : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                  }`}>
                    <IconRenderer iconName={categoryIcon} className={!isVirt ? "group-hover:text-emerald-500" : ""} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                        {categoryLabel}
                      </h4>
                      {/* 3. TYPE BADGE: High-contrast pill for Virtual */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        isVirt 
                          ? "bg-indigo-100 text-indigo-600 border border-indigo-200" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}>
                        {isVirt ? <Zap size={8} fill="currentColor" /> : <Coins size={8} />}
                        {sourceInfo.name}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                      {item.description || "System Verified"}
                    </p>
                  </div>
                </div>

                {/* 4. AMOUNT: Color coded for Digital Drain */}
                <div className="text-right shrink-0 ml-4">
                  <div className="flex flex-col items-end gap-1">
                    <p className={`text-lg font-[1000] italic leading-none tracking-tighter tabular-nums ${
                      item.type === "DEBIT" 
                        ? (isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-red-500") 
                        : "text-emerald-500"
                    }`}>
                      {item.type === "DEBIT" ? "-" : "+"}₹{item.amount.toLocaleString('en-IN')}
                    </p>
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest leading-none ${
                       isVirt ? "text-indigo-400" : "text-slate-300 dark:text-slate-700"
                    }`}>
                       {isVirt && <Globe size={8} className="animate-pulse" />}
                       {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
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