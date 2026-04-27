import React, { useState } from "react";
import { Kanban, Send, Lock, History } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../../components/Navbar";
import OperationsDashboard from "../../components/Operations/TaskBoard";
import Submissions from "../../components/Operations/Submissions";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("submissions");

  const tabs = [
    {
      id: "submissions",
      name: "Submissions",
      icon: Send,
      description: "Filing & Transaction Logs",
      isLocked: false,
    },
    {
      id: "dashboard",
      name: "Task Board",
      icon: Kanban,
      description: "Active Ticket Management",
      isLocked: false,
    },
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

      <main className="max-w-425 mx-auto px-6 sm:px-12 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              Operations{" "}
              <span className="text-emerald-500 italic">Center</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-emerald-500 rounded-full" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Submission Fulfillment & Task Registry
              </p>
            </div>
          </div>

          {/* Premium Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-white/3 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3 px-8 py-4 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 relative
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-2xl shadow-emerald-500/20 scale-[1.02] -translate-y-px"
                      : tab.isLocked
                        ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.isLocked ? (
                  <Lock size={12} className="opacity-40" />
                ) : (
                  <tab.icon
                    size={14}
                    strokeWidth={3}
                    className={activeTab === tab.id ? "animate-pulse" : ""}
                  />
                )}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out-expo">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* This is your existing Kanban Dashboard component */}
              <OperationsDashboard />
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-6">
              <Submissions />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Operations;
