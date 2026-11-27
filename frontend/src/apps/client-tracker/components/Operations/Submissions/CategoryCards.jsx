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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:flex md:flex-row md:items-center overflow-x-auto no-scrollbar pb-1">
      {subTabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex-1 flex-col items-start p-3.5 md:p-4 rounded-lg border transition-colors outline-none text-left cursor-pointer
              last:col-span-2 sm:last:col-span-1 md:last:col-span-auto min-w-35
              ${isActive
                ? 'bg-sky-50/80 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40'
                : 'bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'}
            `}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <div
                className={`p-1.5 rounded-md border transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-400'
                    : 'bg-slate-50 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/70'
                }`}
              >
                <tab.icon size={15} strokeWidth={2.2} />
              </div>
              <span
                className={`sora-font text-base font-bold tabular-nums ${
                  isActive ? 'text-sky-600 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {counts[tab.id] || 0}
              </span>
            </div>
            <span
              className={`sora-font text-xs font-semibold block w-full truncate ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryCards;