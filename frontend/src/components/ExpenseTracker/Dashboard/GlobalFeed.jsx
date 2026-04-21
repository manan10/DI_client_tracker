import React from "react";
import { History, Banknote, MoveUpRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

const IconRenderer = ({ iconName, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Banknote;
  return <IconComponent size={18} className={className} />;
};

const GlobalFeed = ({ history, wallets }) => {
  const getWalletName = (id) => {
    const wallet = wallets.find((w) => w._id === id);
    return wallet ? wallet.walletName : "System";
  };

  // Strictly 10 records for the dashboard snapshot
  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* INTEGRATED HEADER & ACTION */}
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History size={14} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Recent Spends
            </h2>
          </div>
          <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none">
            Last 10 transactions
          </p>
        </div>
        
        {/* REFINED GHOST ACTION BUTTON */}
        <button className="group relative flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-95">
          <span className="text-[10px] font-black text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 uppercase tracking-widest">
            View All
          </span>
          <MoveUpRight size={12} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          
          {/* Subtle "Scanner" line animation on hover */}
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-500 rounded-full" />
        </button>
      </div>

      {/* THE FEED LEDGER */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {recentHistory.map((item) => {
            const isPopulated = item.category && typeof item.category === 'object';
            const categoryLabel = isPopulated ? item.category.label : "Miscellaneous";
            const categoryIcon = isPopulated ? item.category.icon : "Banknote";

            return (
              <div
                key={item._id}
                className="group flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/1 transition-colors"
              >
                <div className="flex items-center gap-4 text-left min-w-0">
                  {/* Category Visual - Minimalist */}
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all">
                    <IconRenderer iconName={categoryIcon} className="group-hover:text-emerald-500 transition-colors" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">
                        {categoryLabel}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter shrink-0">
                        {getWalletName(item.sourceWallet)}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">
                      {item.description || "System Verified"}
                    </p>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="text-right shrink-0 ml-4">
                  <p className={`text-lg font-[1000] italic leading-none mb-1.5 tracking-tighter tabular-nums ${
                    item.type === "DEBIT" ? "text-red-500" : "text-emerald-500"
                  }`}>
                    {item.type === "DEBIT" ? "-" : "+"}₹{item.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-none">
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}

          {recentHistory.length === 0 && (
            <div className="p-16 text-center">
              <Banknote size={28} className="mx-auto text-slate-100 dark:text-slate-800 mb-3" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent spending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalFeed;