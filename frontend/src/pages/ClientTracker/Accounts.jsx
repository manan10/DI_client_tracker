import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import AccountBalances from "../../components/Accounts/AccountBalances";
import Commissions from "../../components/Accounts/Commissions";
import AuditManager from "../../components/Accounts/AuditManager";
// import MatcherTestBench from "../../components/Accounts/MatcherTestBench";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../hooks/useAuth";
import { Wallet, PieChart, FileText, Lock } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("balances");

  const tabs = [
    { id: "audit", name: "Tally Sync", icon: FileText, isLocked: true },
    { id: "balances", name: "Account Balances", icon: Wallet, isLocked: false },
    { id: "commissions", name: "Commissions", icon: PieChart, isLocked: false },
    // { id: "matcher", name: "Matcher Test Bench", icon: FileText, isLocked: false },
  ];

  const handleTabClick = (tab) => {
    if (tab.isLocked) {
      toast.info("Tally Sync module is currently in final audit.", {
        description: "This feature will be enabled following system verification.",
      });
      return;
    }
    setActiveTab(tab.id);
  };

  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950">
        <Navbar />
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300 relative">
      <Navbar />

      <main className="max-w-400 mx-auto px-5 md:px-12 lg:px-20 pt-8 md:pt-16 pb-32 md:pb-20 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 md:mb-16 gap-6 md:gap-8 w-full">
          <div className="space-y-1.5 md:space-y-2 w-full xl:w-auto">
            <h1 className="text-3xl md:text-5xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter">
              Treasury <span className="text-emerald-500 italic">&</span> Performance
            </h1>
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Liquidity Tracking & Digital Accounting
            </p>
          </div>

          {/* ========================================== */}
          {/* DESKTOP VIEW: Horizontal Pill             */}
          {/* ========================================== */}
          <div className="hidden md:flex flex-row w-auto bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center justify-center gap-3 px-10 py-4 rounded-md text-[12px] font-black uppercase tracking-widest transition-all duration-300 relative outline-none
                  ${activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-lg scale-[1.02]"
                      : tab.isLocked
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60"
                        : "text-slate-400 hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.isLocked ? <Lock size={14} className="text-slate-300 dark:text-slate-700" /> : <tab.icon size={16} strokeWidth={2.5} />}
                {tab.name}
              </button>
            ))}
          </div>

          {/* ========================================== */}
          {/* MOBILE VIEW: iOS Stack                    */}
          {/* ========================================== */}
          <div className="md:hidden w-full">
            <div className="flex justify-between w-full bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all outline-none
                      ${isActive ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" : "text-slate-400"}
                      ${tab.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}
                    `}
                  >
                    {tab.isLocked ? <Lock size={18} /> : <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                    <span className="text-[8px] font-black uppercase tracking-widest text-center px-1 leading-tight">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {activeTab === "balances" && <AccountBalances />}
          {activeTab === "commissions" && <Commissions />}
          {activeTab === "audit" && <AuditManager />}
          {/* {activeTab === "matcher" && <MatcherTestBench />} */}
        </div>
      </main>
    </div>
  );
};

export default Accounts;