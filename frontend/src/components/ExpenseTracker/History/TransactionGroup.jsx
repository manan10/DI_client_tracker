import React from "react";
import { 
  Edit3, Trash2, Wallet, 
  ArrowRight, Clock, Globe,
  MessageSquare, CreditCard, Banknote
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Dynamic Icon Renderer matching the GlobalFeed standard
const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={16} className={className} />;
};

const TransactionGroup = ({ date, transactions = [], onEdit, onDelete }) => {
  const d = new Date(date);
  
  return (
    <div className="w-full mb-6 lg:mb-8 min-w-0">
      {/* SHARP LEDGER HEADER (Date Grouping) */}
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="flex items-baseline gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 border border-slate-200 dark:border-white/10 rounded-md shadow-sm shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight">
            {d.getDate().toString().padStart(2, '0')} 
          </h2>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
            {d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
      </div>

      {/* TRANSACTION CARDS LIST */}
      <div className="flex flex-col gap-2.5 min-w-0">
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
              className={`group bg-white dark:bg-[#0B1120] border-y border-r border-l-2 border-slate-200 dark:border-white/10 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:shadow-sm hover:border-r-slate-300 dark:hover:border-r-white/20 min-w-0 ${
                isDebit 
                  ? "border-l-rose-500" 
                  : "border-l-emerald-500"
              }`}
            >
              {/* LEFT HALF: Identity, Narration & Meta */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                
                {/* Crisp Icon Block */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center shrink-0 border ${
                  isDebit 
                    ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                }`}>
                  <IconRenderer iconName={categoryIcon} />
                </div>

                {/* Core Info Stack */}
                <div className="flex flex-col min-w-0 w-full space-y-1">
                  
                  {/* Category Title Row */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {subCategory || categoryLabel}
                    </h4>
                    {subCategory && (
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate mt-0.5 sm:mt-0">
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                  
                  {/* Narration Row */}
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MessageSquare size={10} className="shrink-0 opacity-50" />
                    <span className="truncate text-xs font-medium" title={comments || "Standard transfer"}>
                      {comments || <span className="italic opacity-50">Standard transfer</span>}
                    </span>
                  </div>

                  {/* High-Density Meta Row (Time + Wallet) */}
                  <div className="flex items-center gap-2.5 pt-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      <Clock size={10} />
                      {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-px h-2.5 bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest min-w-0 ${
                      isVirt ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
                    }`}>
                      {isVirt ? <Globe size={10} className="shrink-0" /> : <Wallet size={10} className="shrink-0" />}
                      <span className="truncate">{sourceInfo.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT HALF: Amount, Balances & Actions */}
              <div className="flex items-center sm:items-stretch justify-between sm:justify-end w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 pt-3 sm:pt-0 mt-1 sm:mt-0 gap-4">
                
                {/* Financial Data */}
                <div className="flex flex-col items-start sm:items-end justify-center">
                  <span className={`text-base sm:text-lg font-bold tabular-nums tracking-tight leading-none ${
                    isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {isInflow ? "+" : "-"}₹{t.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                  
                  {/* Minimal Balance Pipeline */}
                  {hasBalances ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-[9px] px-1 py-0.5 font-mono text-slate-400 dark:text-slate-500 line-through rounded-sm shrink-0">
                        {t.balanceBefore.toLocaleString('en-IN')}
                      </span>
                      <ArrowRight size={10} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] px-1 py-0.5 font-mono font-bold rounded-sm border border-slate-200 dark:border-white/10 shrink-0">
                        {t.balanceAfter.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1.5 text-[8px] text-slate-400 font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 px-1 py-0.5 rounded-sm">
                      <CreditCard size={9} /> No Data
                    </div>
                  )}
                </div>

                {/* Permanent Action Controls */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-md border border-slate-200 dark:border-white/5 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(t);
                    }} 
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    title="Edit Transaction"
                  >
                    <Edit3 size={14} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(t);
                    }} 
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                    title="Delete Transaction"
                  >
                    <Trash2 size={14} />
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