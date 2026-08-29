import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar";
import AccountBalances from "../../components/Accounts/AccountBalances";
import Commissions from "../../components/Accounts/Commissions";
import AuditManager from "../../components/Accounts/AuditManager";
import Insurance from "../../components/Accounts/Insurance";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../hooks/useAuth";
import { Wallet, PieChart, FileText, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "balances",
  );

  const tabs = [
    { id: "balances", name: "Account Balances", icon: Wallet, isLocked: false },
    { id: "insurance", name: "Insurance", icon: ShieldCheck, isLocked: false },
    { id: "commissions", name: "Commissions", icon: PieChart, isLocked: false },
    { id: "audit", name: "Tally Zone", icon: FileText, isLocked: false },
  ];

  const handleTabClick = (tab) => {
    if (tab.isLocked) {
      toast.info("Tally Sync module is currently in final audit.", {
        description:
          "This feature will be enabled following system verification.",
      });
      return;
    }
    setActiveTab(tab.id);
  };

  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300">
        <Navbar />
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300 relative">
      <Navbar />

      {/* CONTINUOUS FLUID DOCUMENT WORKSPACE */}
      <main className="w-full max-w-384 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 pb-32">
        
        {/* BORDERLESS COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end pb-8 mb-8 border-b border-slate-200 dark:border-white/10 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
              Accounting Hub
            </h1>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                Accounting Ledger
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Liquidity Tracking & Digital Accounting Suite
              </p>
            </div>
          </div>

          {/* ========================================== */}
          {/* CONTINUOUS ENTERPRISE NAVIGATION           */}
          {/* ========================================== */}
          <div className="w-full lg:w-auto">
            
            {/* Desktop & Tablet: Clean Underline-Border Tabs */}
            <nav className="hidden sm:flex items-center gap-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`
                      flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative outline-none cursor-pointer
                      ${
                        isActive
                          ? "text-slate-900 dark:text-white font-black"
                          : tab.isLocked
                            ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }
                    `}
                  >
                    {tab.isLocked ? (
                      <Lock size={14} strokeWidth={2.5} />
                    ) : (
                      <tab.icon size={15} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                    )}
                    <span>{tab.name}</span>

                    {/* Active Bottom Indicator Line */}
                    {isActive && (
                      <span className="absolute -bottom-8 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 animate-in fade-in duration-200" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile View: High-Visibility Equal-Width Grid */}
            <div className="sm:hidden grid grid-cols-4 gap-1 bg-slate-100 dark:bg-white/3 p-1 rounded-xl border border-slate-200 dark:border-white/10 w-full">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`
                      flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all outline-none cursor-pointer
                      ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-black"
                          : tab.isLocked
                            ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                            : "text-slate-600 dark:text-slate-400 font-bold"
                      }
                    `}
                  >
                    {tab.isLocked ? (
                      <Lock size={14} strokeWidth={2.5} />
                    ) : (
                      <tab.icon size={15} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"} />
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-center leading-tight truncate w-full">
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* CONTENT AREA (Continuous Document Flow) */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out w-full min-w-0">
          {activeTab === "balances" && <AccountBalances />}
          {activeTab === "commissions" && <Commissions />}
          {activeTab === "audit" && <AuditManager />}
          {activeTab === "insurance" && <Insurance />}
        </div>

      </main>
    </div>
  );
};

export default Accounts;