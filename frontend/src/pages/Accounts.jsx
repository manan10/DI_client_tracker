import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AccountBalances from '../components/Accounts/AccountBalances';
import Commissions from '../components/Accounts/Commissions'; // Import the new component
import { Wallet, PieChart } from 'lucide-react';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('balances');

  const tabs = [
    { id: 'balances', name: 'Account Balances', icon: Wallet },
    { id: 'commissions', name: 'Commissions', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-425 mx-auto px-6 sm:px-12 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter">
              Treasury <span className="text-amber-500 italic">&</span> Performance
            </h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Liquidity Tracking & Commission Analytics
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-lg shadow-amber-500/5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon size={14} strokeWidth={2.5} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          {activeTab === 'balances' ? (
            <AccountBalances />
          ) : (
            <Commissions />
          )}
        </div>
      </main>
    </div>
  );
};

export default Accounts;