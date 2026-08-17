import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import StatCards from "../../components/Home/StatCards";
import TallyPulse from "../../components/Home/TallyPulse"; 
import UniversalSearch from "../../components/Home/UniversalSearch";
import QuickActionsGrid from "../../components/Home/QuickActionsGrid"; 
import InteractionTimeline from "../../components/Home/InteractionTimeline";
import FollowUpWidget from "../../components/Home/FollowupWidget";
import ActiveTasksWidget from "../../components/Home/ActiveTasksWidget"; 
import DormancyWidget from "../../components/Home/DormancyWidget";
import InteractionModal from "../../components/InteractionModal";

import NewSubmission from "../../components/Operations/Submissions/NewSubmission";
import NewTicketPanel from "../../components/Operations/TaskBoard/NewTicketPanel";

import { Plus, Activity, Layers, Compass, Zap } from "lucide-react";

const Home = () => {
  // Drawer States
  const [selectedClient, setSelectedClient] = useState(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* --- AMBIENT BACKGROUND GLOW --- */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-200 pointer-events-none z-0">
        <div className="absolute -top-50 -left-50 w-200 h-200 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* --- MAIN WORKSPACE CONTAINER --- */}
        <main className="w-full max-w-384 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          
          {/* HEADER & SEARCH ROW */}
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 sm:mb-12">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                  Executive Workspace
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  Live System Overview
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
                Dalal Investment Portal
              </h1>
              
              <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Track investor relationships, monitor portfolio growth, and manage daily business operations from one centralized command hub.
              </p>
            </div>
            
            <div className="w-full lg:w-120 xl:w-135 shrink-0">
              <UniversalSearch />
            </div>
          </section>

          {/* KPI METRICS (Full Width) */}
          <section className="w-full mb-12 sm:mb-16">
            <StatCards />
          </section>

          {/* ========================================= */}
          {/* FLUID TWO-COLUMN LAYOUT                   */}
          {/* ========================================= */}
          <div className="flex flex-col xl:flex-row gap-10 xl:gap-16 items-start">
            
            {/* ------------------------------------- */}
            {/* LEFT COLUMN: CORE OPERATIONS (~65%)   */}
            {/* ------------------------------------- */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-12 sm:gap-16">
              
              {/* Quick Actions */}
              <div className="w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Zap size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none">
                      Quick Actions
                    </h2>
                  </div>
                </div>
                <QuickActionsGrid 
                  onLogInteraction={() => {
                    setSelectedClient(null);
                    setIsInteractionOpen(true);
                  }} 
                  onNewSubmission={() => setIsSubmissionOpen(true)}
                  onNewTask={() => setIsTaskOpen(true)}
                />
              </div>

              {/* Activity Feed */}
              <div className="w-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Activity size={16} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                      Global Activity Log
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 mt-1.5 truncate">
                      Real-time chronological feed of all client interactions
                    </p>
                  </div>
                </div>
                
                {/* Embedded Feed Container */}
                <div className="bg-white/60 dark:bg-[#0B1120]/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 min-h-125">
                  <InteractionTimeline />
                </div>
              </div>

            </div>

            {/* ------------------------------------- */}
            {/* RIGHT COLUMN: INTELLIGENCE RAIL (~35%)*/}
            {/* ------------------------------------- */}
            <aside className="w-full xl:w-105 2xl:w-115 shrink-0 flex flex-col gap-10">
              
              {/* Hardware / System Status */}
              <div className="w-full">
                <TallyPulse />
              </div>

              <hr className="border-slate-200 dark:border-white/10" />

              {/* Actionable Intelligence */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Compass size={16} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                      Actionable Intelligence
                    </h2>
                  </div>
                </div>
                
                <FollowUpWidget />
                <DormancyWidget />
              </div>

              <hr className="border-slate-200 dark:border-white/10" />

              {/* Active Operations */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Layers size={16} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                      Active Operations
                    </h2>
                  </div>
                </div>
                
                <ActiveTasksWidget />
              </div>

            </aside>

          </div>
        </main>
      </div>

      {/* MOBILE FAB */}
      <button
        onClick={() => {
          setSelectedClient(null);
          setIsInteractionOpen(true);
        }}
        className="fixed bottom-8 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:bg-emerald-500 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all xl:hidden border border-emerald-400/50"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* ======================= */}
      {/* GLOBAL DRAWERS & MODALS */}
      {/* ======================= */}
      
      <InteractionModal
        key={selectedClient?._id || "new-interaction"}
        isOpen={isInteractionOpen}
        onClose={() => setIsInteractionOpen(false)}
        initialClient={selectedClient}
      />

      <NewSubmission 
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
        onCreated={() => {
          // Trigger a refresh logic if needed
        }}
      />

      <NewTicketPanel  
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onCreated={() => {
          // Trigger a refresh logic if needed
        }}
      />

    </div>
  );
};

export default Home;