import React from "react";
import { Link } from "react-router-dom";
import { 
  History, Banknote, MoveUpRight, Zap, Coins, 
  MessageSquare, ArrowRight, Calendar, CreditCard 
} from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={18} className={className} />;
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
    <div className="w-full flex flex-col gap-4 min-w-0">
      
      {/* HEADER COMMAND STRIP */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md shrink-0">
              <History size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
              Active Ledger
            </h2>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-9 truncate mt-0.5">
            Live Transaction Feed
          </p>
        </div>
        
        <Link 
          to="/expenses/history" 
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-md transition-all duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            Archive
          </span>
          <MoveUpRight size={12} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* FEED LIST */}
      <div className="flex flex-col gap-2 min-w-0">
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
              className={`group flex items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#0B1120] border-l-2 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-white/5 dark:border-r-white/5 rounded-lg transition-all duration-200 hover:shadow-sm min-w-0 ${
                isDebit ? "border-l-rose-500 hover:border-r-slate-300 dark:hover:border-r-white/10" : "border-l-emerald-500 hover:border-r-slate-300 dark:hover:border-r-white/10"
              }`}
            >
              {/* LEFT: Identity & Meta */}
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                
                {/* Icon Block */}
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
                  isDebit 
                    ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                }`}>
                  <IconRenderer iconName={categoryIcon} />
                </div>

                {/* Info Stack */}
                <div className="flex flex-col min-w-0">
                  
                  {/* Category & SubCategory */}
                  <div className="flex flex-col min-w-0">
                    {subCategory ? (
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {subCategory}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate mt-0.5 sm:mt-0">
                          {categoryLabel}
                        </span>
                      </div>
                    ) : (
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {categoryLabel}
                      </h4>
                    )}
                  </div>
                  
                  {/* Narration */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                    <MessageSquare size={10} className="shrink-0 opacity-50" />
                    <span className="text-[10px] sm:text-xs truncate font-medium">
                      {comments || <span className="italic opacity-50">Standard transfer</span>}
                    </span>
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="w-px h-2.5 bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest min-w-0 ${
                      isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
                    }`}>
                      {isVirt ? <Zap size={10} className="shrink-0" /> : <Coins size={10} className="shrink-0" />}
                      <span className="truncate">{sourceInfo.name}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT: Amounts */}
              <div className="flex flex-col items-end shrink-0 pl-3">
                <span className={`text-sm sm:text-base font-bold tabular-nums tracking-tight ${
                  isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {isDebit ? "-" : "+"}₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                
                {/* Micro Balances */}
                {hasBalances ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[9px] font-mono text-slate-400 line-through">
                      {item.balanceBefore.toLocaleString('en-IN')}
                    </span>
                    <ArrowRight size={10} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 rounded-sm">
                      {item.balanceAfter.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1.5 text-[8px] text-slate-400 font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 px-1 rounded-sm">
                    <CreditCard size={9} /> No Data
                  </div>
                )}
              </div>

            </div>
          );
        })}
        
        {/* Empty State */}
        {recentHistory.length === 0 && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
            <div className="w-10 h-10 bg-white dark:bg-[#0B1120] flex items-center justify-center border border-slate-200 dark:border-white/10 rounded-md mb-3 shadow-sm">
              <History size={16} className="text-slate-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Blank Canvas</p>
            <p className="text-[10px] font-semibold mt-1 text-slate-400 uppercase tracking-widest">Active ledger is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFeed;