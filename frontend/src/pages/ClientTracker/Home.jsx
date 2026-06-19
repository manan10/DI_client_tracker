import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import StatCards from "../../components/Home/StatCards";
import TallyPulse from "../../components/Home/TallyPulse"; 
import UniversalSearch from "../../components/Home/UniversalSearch";
import QuickActionsGrid from "../../components/Home/QuickActionsGrid"; 
import InteractionTimeline from "../../components/Home/InteractionTimeline";
import FollowUpWidget from "../../components/Home/FollowupWidget";
import StuckSubmissionsWidget from "../../components/Home/StuckSubmissionsWidget"; 
import ActiveTasksWidget from "../../components/Home/ActiveTasksWidget"; 
import DormancyWidget from "../../components/Home/DormancyWidget";
import InteractionModal from "../../components/InteractionModal";

import NewSubmission from "../../components/Operations//Submissions/NewSubmission";
import NewTicketPanel from "../../components/Operations/TaskBoard/NewTicketPanel";

import { Plus, Activity, Zap, Layers } from "lucide-react";

const Home = () => {
  // Drawer States
  const [selectedClient, setSelectedClient] = useState(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />

      {/* FIXED STATS HEADER */}
      <div className="top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b-2 border-slate-200 dark:border-white/10 shadow-md">
        <div className="max-w-450 mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <StatCards />
          <TallyPulse />
        </div>
      </div>

      <main className="max-w-450 mx-auto flex flex-col xl:flex-row pb-28">
        
        {/* LEFT COLUMN: PRIMARY FEED */}
        <div className="flex-1 px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 border-r-0 xl:border-r-2 border-slate-100 dark:border-white/5">
          
          <section className="mb-6">
            <div className="p-1.5 sm:p-2 bg-slate-100 dark:bg-white/5 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-white/10 shadow-inner">
              <UniversalSearch />
            </div>
          </section>

          {/* QUICK ACTIONS GRID */}
          <section className="mb-10 sm:mb-16">
            <QuickActionsGrid 
               onLogInteraction={() => {
                 setSelectedClient(null);
                 setIsInteractionOpen(true);
               }} 
               onNewSubmission={() => setIsSubmissionOpen(true)}
               onNewTask={() => setIsTaskOpen(true)}
            />
          </section>

          <section className="space-y-6 sm:space-y-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <Activity size={16} sm:size={18} className="text-blue-600" strokeWidth={3} />
              <h2 className="text-[10px] sm:text-[12px] font-[1000] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-900 dark:text-slate-400">
                Activity stream
              </h2>
              <div className="flex-1 h-0.5 bg-slate-100 dark:bg-white/5" />
            </div>
            <div className="relative">
              <InteractionTimeline />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ALERTS & NOTIFICATIONS */}
        <aside className="w-full xl:w-100 bg-slate-50/50 dark:bg-slate-950/50 p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-12">
          
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <Zap size={16} sm:size={18} className="text-amber-500" strokeWidth={3} />
              <h2 className="text-[10px] sm:text-[12px] font-[1000] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-900 dark:text-slate-400">
                Priority Alerts
              </h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <FollowUpWidget />
              <StuckSubmissionsWidget />
              <DormancyWidget />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <Layers size={16} sm:size={18} className="text-emerald-500" strokeWidth={3} />
              <h2 className="text-[10px] sm:text-[12px] font-[1000] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-900 dark:text-slate-400">
                Ops Taskboard
              </h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <ActiveTasksWidget />
            </div>
          </div>

        </aside>
      </main>

      {/* MOBILE FAB */}
      <button
        onClick={() => {
          setSelectedClient(null);
          setIsInteractionOpen(true);
        }}
        className="fixed bottom-24 right-6 sm:bottom-22 sm:right-8 z-50 bg-slate-950 dark:bg-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
      >
        <Plus size={24} sm:size={28} strokeWidth={4} />
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
        onCreated={(newSub) => {
          // You could optionally trigger a refresh of your StuckSubmissionsWidget here
        }}
      />

      <NewTicketPanel  
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onCreated={(newTask) => {
          // You could optionally trigger a refresh of your ActiveTasksWidget here
        }}
      />

    </div>
  );
};

export default Home;