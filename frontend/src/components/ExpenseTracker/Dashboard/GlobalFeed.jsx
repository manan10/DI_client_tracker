import React from "react";
import { Link } from "react-router-dom";
import { 
  History, Banknote, MoveUpRight, Zap, Coins, 
  MessageSquare, ArrowRight, Calendar, CreditCard 
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={20} className={className} />;
};

const GlobalFeed = ({ history, wallets }) => {
  const getWalletDetails = (source) => {
    if (source && typeof source === 'object') {
      return { name: source.walletName || "Unknown", isVirtual: !!source.isVirtual };
    }
    const localMatch = wallets?.find((w) => w._id === source);
    return { name: localMatch ? localMatch.walletName : "System", isVirtual: localMatch ? !!localMatch.isVirtual : false };
  };

  const recentHistory = history?.slice(0, 10) || [];

  return (
    <div className="space-y-5">
      
      {/* HEADER STRIP - Sharp Industrial Aesthetic */}
      <div className="flex justify-between items-end px-1 pb-3 border-b border-slate-300 dark:border-slate-800">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 dark:bg-white p-1.5 rounded-sm shrink-0 shadow-[4px_4px_0px_rgba(16,185,129,1)]">
              <History size={16} className="text-emerald-400 dark:text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">
              Active Ledger
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] pl-11">
            Live Transaction Feed
          </p>
        </div>
        
        <Link to="/expenses/history" className="group flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-900 dark:bg-slate-900 dark:hover:bg-emerald-500 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-emerald-400 rounded-sm transition-all duration-200">
          <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-white uppercase tracking-widest transition-colors">Archive</span>
          <MoveUpRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* FEED LIST - Sharp, Striking, High-Contrast Rows */}
      <div className="space-y-3">
        {recentHistory.map((item) => {
          const isPopulated = item.category && typeof item.category === 'object';
          const categoryLabel = isPopulated ? item.category.label : (item.category || "System");
          const categoryIcon = isPopulated ? item.category.icon : "Banknote";
          const subCategory = item.subCategory;
          
          const sourceInfo = getWalletDetails(item.sourceWallet);
          const isVirt = sourceInfo.isVirtual;
          const comments = item.description || "";
          const isDebit = item.type === "DEBIT";
          
          const hasBalances = item.balanceBefore !== undefined && item.balanceAfter !== undefined;

          return (
            <div 
              key={item._id} 
              className={`group relative bg-white dark:bg-[#080C14] border-y border-r border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-3 rounded-sm transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#0B1120] hover:z-10 ${
                isDebit 
                  ? "border-l-4 border-l-rose-500 hover:border-slate-300 dark:hover:border-rose-900/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]" 
                  : "border-l-4 border-l-emerald-500 hover:border-slate-300 dark:hover:border-emerald-900/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              }`}
            >
              {/* LEFT HALF: Identity, Narration & Meta */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                
                {/* Sharp Glowing Icon Block */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  isDebit 
                    ? "bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-rose-500 group-hover:text-white dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:group-hover:bg-rose-500 dark:group-hover:text-white group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:group-hover:bg-emerald-500 dark:group-hover:text-white group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                }`}>
                  <IconRenderer iconName={categoryIcon} className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Core Info Stack */}
                <div className="flex flex-col min-w-0 justify-center space-y-1">
                  
                  {/* Category Title Row */}
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {categoryLabel}
                    </h4>
                    {subCategory && (
                      <span className="px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700 text-[9px] font-bold bg-slate-100 dark:bg-[#111827] text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate shrink-0 hidden sm:block">
                        {subCategory}
                      </span>
                    )}
                  </div>
                  
                  {/* Narration Row */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MessageSquare size={10} className="shrink-0 opacity-60" />
                    <span className="truncate text-[11px] font-medium" title={comments || "Standard transfer"}>
                      {comments || <span className="italic opacity-50">Standard transfer</span>}
                    </span>
                  </div>

                  {/* High-Density Meta Row (Date + Wallet) */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                      isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {isVirt ? <Zap size={10} /> : <Coins size={10} />}
                      <span className="truncate max-w-20 sm:max-w-none">{sourceInfo.name}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT HALF: Amount & Balances */}
              <div className="flex flex-col items-end justify-center shrink-0 pl-3">
                <span className={`text-base sm:text-xl font-black tabular-nums tracking-tighter leading-none drop-shadow-sm ${
                  isDebit ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {isDebit ? "-" : "+"}₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                
                {/* Minimal Balance Pipeline - Sharp Tags */}
                {hasBalances ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] sm:text-[10px] px-1.5 py-0.5 font-mono text-slate-400 line-through rounded-sm">
                      {item.balanceBefore.toLocaleString('en-IN')}
                    </span>
                    <ArrowRight size={10} className={isDebit ? "text-rose-400/50" : "text-emerald-400/50"} />
                    <span className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 text-[9px] sm:text-[10px] px-1.5 py-0.5 font-mono font-bold rounded-sm shadow-sm">
                      {item.balanceAfter.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-sm">
                    <CreditCard size={10} /> No Data
                  </div>
                )}
              </div>

            </div>
          );
        })}
        
        {/* Empty State */}
        {recentHistory.length === 0 && (
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-800 rounded-sm border-dashed">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-sm mb-4 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.05)]">
              <History size={20} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Blank Canvas</p>
              <p className="text-xs font-bold mt-1.5 text-slate-400 uppercase tracking-wider">Active ledger is empty</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFeed;