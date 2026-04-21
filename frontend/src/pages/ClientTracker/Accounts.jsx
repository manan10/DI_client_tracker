import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import AccountBalances from "../../components/Accounts/AccountBalances";
import Commissions from "../../components/Accounts/Commissions";
import StatementReview from "../../components/Accounts/StatementReview";
import { Wallet, PieChart, FileText, Lock } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const [activeTab, setActiveTab] = useState("balances");

  const tabs = [
    { id: "balances", name: "Account Balances", icon: Wallet, isLocked: false },
    { id: "commissions", name: "Commissions", icon: PieChart, isLocked: false },
    {
      id: "ledger",
      name: "Audit & Tally Sync",
      icon: FileText,
      isLocked: true,
    }, // Logic-locked
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

  const handleLedgerComplete = (fileGroups) => {
    console.log("Finalized Data for Export:", fileGroups);
    toast.success("Ledger Exported successfully for Tally!");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-425 mx-auto px-6 sm:px-12 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter">
              Treasury <span className="text-emerald-500 italic">&</span>{" "}
              Performance
            </h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Liquidity Tracking & Digital Accounting
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-lg shadow-emerald-500/5 scale-[1.02]"
                      : tab.isLocked
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.isLocked ? (
                  <Lock
                    size={12}
                    className="text-slate-300 dark:text-slate-700"
                  />
                ) : (
                  <tab.icon size={14} strokeWidth={2.5} />
                )}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          {activeTab === "balances" && <AccountBalances />}
          {activeTab === "commissions" && <Commissions />}
          {/* Even if activeTab were 'ledger', it wouldn't be accessible via the UI */}
          {activeTab === "ledger" && (
            <StatementReview onComplete={handleLedgerComplete} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Accounts;
