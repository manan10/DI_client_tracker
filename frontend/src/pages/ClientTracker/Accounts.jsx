import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import AccountBalances from "../../components/Accounts/AccountBalances";
import Commissions from "../../components/Accounts/Commissions";
import AuditManager from "../../components/Accounts/AuditManager";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../hooks/useAuth";
import { Wallet, PieChart, FileText, Lock } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("balances");

  const tabs = [
    { id: "audit", name: "Audit Manager", icon: FileText, isLocked: true },
    { id: "balances", name: "Account Balances", icon: Wallet, isLocked: false },
    { id: "commissions", name: "Commissions", icon: PieChart, isLocked: false },
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
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* INCREASED PADDING: px-6 md:px-12 lg:px-20 ensures the content is never cramped */}
      <main className="max-w-400 mx-auto px-6 md:px-12 lg:px-20 pt-10 md:pt-16 pb-32 md:pb-20 w-full">
        
        {/* INCREASED GAP: mb-16 creates a clear separation between the header and the modules */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-8 w-full">
          <div className="space-y-2 w-full xl:w-auto">
            <h1 className="text-4xl md:text-5xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter">
              Treasury <span className="text-emerald-500 italic">&</span> Performance
            </h1>
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Liquidity Tracking & Digital Accounting
            </p>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto bg-slate-100 dark:bg-slate-900/50 p-2 md:p-1.5 rounded-2xl md:rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm gap-2 md:gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center justify-start md:justify-center gap-3 px-6 md:px-10 py-5 md:py-4 rounded-xl md:rounded-md text-[11px] md:text-[12px] font-black uppercase tracking-widest transition-all duration-300 relative w-full md:w-auto
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-md md:shadow-lg shadow-emerald-500/5 scale-[1.01] md:scale-[1.02]"
                      : tab.isLocked
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60"
                        : "text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 md:hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.isLocked ? (
                  <Lock size={14} className="text-slate-300 dark:text-slate-700" />
                ) : (
                  <tab.icon size={16} strokeWidth={2.5} className="md:w-4 md:h-4" />
                )}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area with extra top-padding provided by parent */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          {activeTab === "balances" && <AccountBalances />}
          {activeTab === "commissions" && <Commissions />}
          {activeTab === "audit" && <AuditManager />}
        </div>
      </main>
    </div>
  );
};

export default Accounts;