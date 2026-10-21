import React, { useState } from "react";
import { Kanban, Send, Lock, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../components/Shared/Navbar";
import OperationsDashboard from "../components/Operations/TaskBoard";
import Submissions from "../components/Operations/Submissions";
import FormsVault from "../components/Operations/FormsVault";
import PageHeader from "../../../shared/components/Auth/PageHeader";
// import FolioReconciler from "../components/Operations/FolioReconciler";
// import ArnTransferReconciler from "../components/Operations/ArnTransferReconciler";
// import BrokerageAuditor from "../components/Operations/BrokerageAuditor";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("submissions");

  const tabs = [
    { id: "submissions", name: "Submissions", icon: Send, isLocked: false },
    { id: "dashboard", name: "Task Board", icon: Kanban, isLocked: false },
    { id: "forms", name: "Forms Vault", icon: FileText, isLocked: false },
    // { id: "folio", name: "Folio Reconciler", icon: Send, isLocked: false },
    // { id: "arn", name: "ARN Reconciler", icon: Mail, isLocked: false },
    // { id: "brokerage", name: "Brokerage Auditor", icon: Mail, isLocked: false },
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300 relative">
      <Navbar />

      {/* CONTINUOUS FLUID DOCUMENT WORKSPACE */}
      <main className="w-full max-w-384 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 pb-32">
        
        {/* BORDERLESS COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end pb-8 mb-8 border-b border-slate-200 dark:border-white/10 gap-6">
          <PageHeader
            title="Operations"
            accent="Center"
            description="Manage submission fulfillment, track operational tasks, and access regulatory forms from one centralized hub."
          />

          {/* CONTINUOUS ENTERPRISE NAVIGATION */}
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

            {/* Mobile View: High-End Native Select Command Bar */}
            <div className="sm:hidden w-full relative">
              <div className="relative w-full">
                <select
                  value={activeTab}
                  onChange={(e) => {
                    const selected = tabs.find(t => t.id === e.target.value);
                    if (selected) handleTabClick(selected);
                  }}
                  className="w-full appearance-none bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 pr-10 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id} disabled={tab.isLocked}>
                      {tab.name} {tab.isLocked ? "(Locked)" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={16} strokeWidth={2.5} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out w-full min-w-0">
          {activeTab === "submissions" && <Submissions />}
          {activeTab === "dashboard" && <OperationsDashboard />}
          {activeTab === "forms" && <FormsVault />}
          {/* {activeTab === "brokerage" && <BrokerageAuditor />} */}
        </div>

      </main>
    </div>
  );
};

export default Operations;