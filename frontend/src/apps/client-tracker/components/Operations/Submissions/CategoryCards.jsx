// src/components/Operations/Submissions/CategoryCards.jsx
import React from 'react';
import { Repeat, Wallet, LogOut, Layers, FileText } from 'lucide-react';

const subTabs = [
  { id: 'PURCHASE_SIP', name: 'SIPs', icon: Repeat },
  { id: 'PURCHASE_LUMPSUM', name: 'Lumpsum', icon: Wallet },
  { id: 'REDEMPTION', name: 'Redemptions', icon: LogOut },
  { id: 'SWP', name: 'SWP Outflows', icon: Layers },
  { id: 'NON_FINANCIAL', name: 'Services', icon: FileText },
];

const CategoryCards = ({ activeCategory, setActiveCategory, counts }) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-row md:items-center overflow-x-auto no-scrollbar pb-1">
      {subTabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex-1 flex-col items-start p-3 md:p-4 rounded-lg border transition-all duration-200 outline-none text-left
              last:col-span-2 sm:last:col-span-1 md:last:col-span-auto min-w-35
              ${isActive 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
            `}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                <tab.icon size={16} strokeWidth={2.5} />
              </div>
              <span className={`text-sm font-black tabular-nums ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {counts[tab.id] || 0}
              </span>
            </div>
            <span className={`text-[10px] font-[1000] uppercase tracking-widest block w-full truncate ${isActive ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-600 dark:text-slate-400'}`}>
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryCards;