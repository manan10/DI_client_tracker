import React from "react";
import { Link } from "react-router-dom";
import { History, Banknote, MoveUpRight, Zap, Coins, MessageSquare, ArrowRight, Calendar, Clock } from "lucide-react";
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
    const localMatch = wallets.find((w) => w._id === source);
    return { name: localMatch ? localMatch.walletName : "System", isVirtual: localMatch ? !!localMatch.isVirtual : false };
  };

  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* HEADER STRIP */}
      <div className="flex justify-between items-end px-1 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-emerald-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Active Ledger</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-6">
            Cross-Node Transaction Feed
          </p>
        </div>
        
        <Link to="/expenses/history" className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 uppercase tracking-widest transition-colors">Full Archive</span>
          <MoveUpRight size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>

      {/* FEED LIST */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
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
              <div key={item._id} className="group p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                
                {/* COLUMN 1: CONTEXT (Icon, Category, Narration) */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    isVirt 
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" 
                      : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  }`}>
                    <IconRenderer iconName={categoryIcon} />
                  </div>

                  <div className="flex flex-col min-w-0 pt-0.5 space-y-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight truncate">
                        {categoryLabel}
                      </h4>
                      {subCategory && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider truncate mt-0.5">
                          ↳ {subCategory}
                        </p>
                      )}
                    </div>

                    {comments ? (
                      <div className="flex items-start gap-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-md py-1.5 px-2.5 w-max max-w-full">
                        <MessageSquare size={12} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate" title={comments}>
                          {comments}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-600 italic font-medium">No narration provided</p>
                    )}
                  </div>
                </div>

                {/* DESKTOP DIVIDER */}
                <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* COLUMN 2: METADATA (Date, Node) */}
                <div className="flex flex-row md:flex-col justify-between md:justify-center gap-3 md:w-48 shrink-0">
                  
                  {/* Node */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">Node</p>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${
                      isVirt 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                    }`}>
                      {isVirt ? <Zap size={12} /> : <Coins size={12} />}
                      {sourceInfo.name}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-1 flex flex-col items-end md:items-start text-right md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">Timestamp</p>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="opacity-60" />
                        <span>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="opacity-60" />
                        <span>{new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                </div>

                {/* DESKTOP DIVIDER */}
                <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* COLUMN 3: FINANCIALS */}
                <div className="flex flex-col justify-center shrink-0 md:w-56 bg-slate-50 dark:bg-slate-900/50 md:bg-transparent rounded-xl p-3 md:p-0 border border-slate-100 dark:border-slate-800/80 md:border-none">
                  
                  {/* Amount Entry */}
                  <div className="flex justify-between md:flex-col md:items-end md:justify-start w-full mb-2 md:mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest md:hidden">Amount</span>
                    <p className={`text-base font-black tabular-nums tracking-tight ${
                      isDebit 
                        ? (isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400") 
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {isDebit ? "-" : "+"}₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Explicit Balance Tracker */}
                  <div className="flex flex-col w-full border-t border-slate-200 dark:border-slate-800 md:border-none pt-2 md:pt-0">
                    {hasBalances ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-sans font-bold tracking-wider">Previous</span>
                          <span className="text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600">₹{item.balanceBefore.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono bg-white dark:bg-slate-800 md:bg-slate-50 md:dark:bg-slate-800/50 p-1 md:p-1.5 rounded border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-600 dark:text-slate-300 uppercase text-[10px] font-sans font-black tracking-wider flex items-center gap-1">
                            <ArrowRight size={10} className="text-emerald-500" /> Closing
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">₹{item.balanceAfter.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs font-mono bg-white dark:bg-slate-800 md:bg-slate-50 md:dark:bg-slate-800/50 p-1 md:p-1.5 rounded border border-slate-100 dark:border-slate-700">
                        <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-sans font-bold tracking-wider">Closing</span>
                        <span className="text-slate-400 dark:text-slate-600 italic">N/A</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
          
          {recentHistory.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <History size={24} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">No Transactions Found</p>
                <p className="text-xs font-medium mt-1">Your active ledger currently has no recorded spending or transfers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalFeed;