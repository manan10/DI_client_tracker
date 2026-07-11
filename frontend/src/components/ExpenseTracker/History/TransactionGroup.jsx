import React from "react";
import { 
  Edit3, Trash2, Wallet, 
  ArrowUpRight, ArrowDownLeft, Clock, Globe,
  MessageSquare, ArrowRight, CreditCard, Banknote, Zap, Coins
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Dynamic Icon Renderer matching the GlobalFeed standard
const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={20} className={className} />;
};

const TransactionGroup = ({ date, transactions = [], onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="w-full mb-6 lg:mb-8">
      {/* SHARP LEDGER HEADER (Date Grouping) */}
      <div className="flex items-center gap-3 lg:gap-4 mb-4">
        <div className="flex items-baseline gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 border border-slate-900 dark:border-white rounded-sm shadow-[4px_4px_0px_rgba(15,23,42,0.15)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
          <h2 className="text-xl font-black tracking-tighter leading-none">
            {d.getDate().toString().padStart(2, '0')} 
          </h2>
          <span className="font-bold text-xs uppercase tracking-[0.2em] opacity-90 leading-none">
            {d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* TRANSACTION CARDS LIST - HIGH DENSITY */}
      <div className="space-y-3">
        {transactions.map((t) => {
          // Normalize Data Extraction
          const isPopulated = t.category && typeof t.category === 'object';
          const categoryLabel = isPopulated ? t.category.label : (t.category || "System");
          const categoryIcon = isPopulated ? t.category.icon : "Banknote";
          const subCategory = t.subCategory;
          
          const sourceInfo = { name: t.sourceWallet?.walletName || "Unknown", isVirtual: !!t.sourceWallet?.isVirtual };
          const isVirt = sourceInfo.isVirtual;
          const comments = t.description || "";
          
          const isInflow = t.type === 'CREDIT' || t.type === 'TOP_UP';
          const isDebit = !isInflow;
          
          const hasBalances = t.balanceBefore !== undefined && t.balanceAfter !== undefined;

          return (
            <div 
              key={t._id} 
              className={`group relative bg-white dark:bg-[#080C14] border-y border-r border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#0B1120] hover:z-10 ${
                isDebit 
                  ? "border-l-4 border-l-rose-500 hover:border-slate-300 dark:hover:border-rose-900/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]" 
                  : "border-l-4 border-l-emerald-500 hover:border-slate-300 dark:hover:border-emerald-900/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              }`}
            >
              {/* LEFT HALF: Identity, Narration & Meta */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                
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

                  {/* High-Density Meta Row (Time + Wallet) */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={10} />
                      {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                      isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {isVirt ? <Globe size={10} /> : <Wallet size={10} />}
                      <span className="truncate max-w-20 sm:max-w-none">{sourceInfo.name}</span>
                    </div>
                  </div>

                  {/* Mobile Only Subcategory */}
                  {subCategory && (
                    <span className="mt-1 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700 w-fit text-[8px] font-bold bg-slate-100 dark:bg-[#111827] text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate shrink-0 sm:hidden">
                      {subCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT HALF: Amount, Balances & Actions */}
              <div className="flex items-center sm:items-stretch justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800/60 pt-3 sm:pt-0 mt-1 sm:mt-0">
                
                {/* Financial Data */}
                <div className="flex flex-col items-start sm:items-end justify-center pr-4 sm:pr-5">
                  <span className={`text-base sm:text-xl font-black tabular-nums tracking-tighter leading-none drop-shadow-sm ${
                    isDebit ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {isInflow ? "+" : "-"}₹{t.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  
                  {/* Minimal Balance Pipeline */}
                  {hasBalances ? (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] sm:text-[10px] px-1.5 py-0.5 font-mono text-slate-400 line-through rounded-sm">
                        {t.balanceBefore.toLocaleString('en-IN')}
                      </span>
                      <ArrowRight size={10} className={isDebit ? "text-rose-400/50" : "text-emerald-400/50"} />
                      <span className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 text-[9px] sm:text-[10px] px-1.5 py-0.5 font-mono font-bold rounded-sm shadow-sm">
                        {t.balanceAfter.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2 text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-sm">
                      <CreditCard size={10} /> No Data
                    </div>
                  )}
                </div>

                {/* Vertical Divider (Desktop) / Action Wrapper */}
                <div className="flex flex-row sm:flex-col items-center justify-center gap-1.5 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-3 relative z-10">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(t);
                    }} 
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-indigo-500 dark:text-slate-500 dark:hover:bg-indigo-500 dark:hover:text-white rounded-sm transition-all active:scale-90 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm cursor-pointer"
                    title="Edit Transaction"
                  >
                    <Edit3 size={12} className="pointer-events-none" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(t);
                    }} 
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-rose-500 dark:text-slate-500 dark:hover:bg-rose-500 dark:hover:text-white rounded-sm transition-all active:scale-90 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-rose-500 shadow-sm cursor-pointer"
                    title="Delete Transaction"
                  >
                    <Trash2 size={12} className="pointer-events-none" />
                  </button>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionGroup;