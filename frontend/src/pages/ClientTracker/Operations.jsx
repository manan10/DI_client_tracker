import React, { useState } from "react";
import { Kanban, Send, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../../components/Navbar";
import OperationsDashboard from "../../components/Operations/TaskBoard";
import Submissions from "../../components/Operations/Submissions";
import FolioReconciler from "../../components/Operations/FolioReconciler";
import ArnTransferReconciler from "../../components/Operations/ArnTransferReconciler";
import BrokerageAuditor from "../../components/Operations/BrokerageAuditor";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("submissions");

  const tabs = [
    { id: "submissions", name: "Submissions", icon: Send, isLocked: false },
    { id: "dashboard", name: "Task Board", icon: Kanban, isLocked: false },
    // { id: "folio", name: "Folio Reconciler", icon: Send, isLocked: false },
    // { id: "arn", name: "ARN Reconciler", icon: Mail, isLocked: false },
    { id: "brokerage", name: "Brokerage Auditor", icon: Mail, isLocked: false },
  ];

  const handleTabClick = (tab) => {
    if (tab.isLocked) {
      toast.info("Audit Vault is currently restricted.", {
        description: "This module requires Senior Partner authorization.",
      });
      return;
    }
    setActiveTab(tab.id);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-400 mx-auto px-5 md:px-12 lg:px-20 pt-8 md:pt-16 pb-32 md:pb-20 w-full">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 md:mb-16 gap-6 md:gap-8 w-full">
          <div className="space-y-1.5 md:space-y-2 w-full xl:w-auto">
            <h1 className="text-3xl md:text-5xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter">
              Operations <span className="text-emerald-500 italic">Center</span>
            </h1>
            <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Submission Fulfillment & Task Registry
            </p>
          </div>

          {/* DESKTOP VIEW: Horizontal Pill */}
          <div className="hidden md:flex flex-row w-auto bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center justify-center gap-3 px-10 py-4 rounded-md text-[12px] font-black uppercase tracking-widest transition-all duration-300 relative outline-none
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-lg scale-[1.02]"
                      : tab.isLocked
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60"
                        : "text-slate-400 hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.isLocked ? (
                  <Lock size={14} />
                ) : (
                  <tab.icon size={16} strokeWidth={2.5} />
                )}
                {tab.name}
              </button>
            ))}
          </div>

          {/* MOBILE VIEW: iOS Stack */}
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
                      ${tab.isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}
                    `}
                  >
                    {tab.isLocked ? (
                      <Lock size={18} />
                    ) : (
                      <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-widest text-center px-1 leading-tight">
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {activeTab === "submissions" && <Submissions />}
          {activeTab === "dashboard" && <OperationsDashboard />}
          {/* {activeTab === "folio" && <FolioReconciler />}
          {activeTab === "arn" && <ArnTransferReconciler />} */}
          {activeTab === "brokerage" && <BrokerageAuditor />}
        </div>
      </main>
    </div>
  );
};

export default Operations;
