import React, { useState } from "react";
import Navbar from "../components/Shared/Navbar";
import WorkspaceShell from "../../../shared/components/WorkspaceShell";
import InteractionModal from "../components/Shared/InteractionModal";

import StatCards from "../components/Home/StatCards";
import TallyPulse from "../components/Home/TallyPulse";
import UniversalSearch from "../components/Home/UniversalSearch";
import QuickActionsGrid from "../components/Home/QuickActionsGrid";
import InteractionTimeline from "../components/Home/InteractionTimeline";
import FollowUpWidget from "../components/Home/FollowupWidget";
import ActiveTasksWidget from "../components/Home/ActiveTasksWidget";
import DormancyWidget from "../components/Home/DormancyWidget";

import NewSubmission from "../components/Operations/Submissions/NewSubmission";
import NewTicketPanel from "../components/Operations/TaskBoard/NewTicketPanel";

import { Plus, Activity, Layers, Compass, Zap, LayoutDashboard } from "lucide-react";

const Home = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <WorkspaceShell
        navbar={<Navbar />}
        badge="Executive Workspace • Live Overview"
        badgeIcon={LayoutDashboard}
        title="Dalal Investment"
        accent="Co-Pilot"
        description="Track investor relationships, monitor portfolio growth, and manage daily business operations from one centralized command hub."
        rightSlot={
          <div className="w-full lg:w-[28rem] xl:w-[32rem]">
            <UniversalSearch />
          </div>
        }
      >
        {/* KPI METRICS (Full Width) */}
        <section className="w-full mb-8 sm:mb-10">
          <StatCards refreshKey={refreshKey} />
        </section>

        {/* FLUID TWO-COLUMN LAYOUT */}
        <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start">
          {/* LEFT COLUMN: CORE OPERATIONS (~65%) */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-8 sm:gap-10">
            {/* Quick Actions */}
            <div className="w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
                  <Zap size={16} strokeWidth={2.25} />
                </div>
                <div>
                  <h2 className="sora-font text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
                  <Activity size={16} strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <h2 className="sora-font text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                    Global Activity Log
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                    Real-time chronological feed of all client interactions
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 sm:p-6 min-h-96 shadow-xs">
                <InteractionTimeline refreshKey={refreshKey} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTELLIGENCE RAIL (~35%) */}
          <aside className="w-full xl:w-96 2xl:w-[420px] shrink-0 flex flex-col gap-8">
            <div className="w-full">
              <TallyPulse />
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
                  <Compass size={16} strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <h2 className="sora-font text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                    Actionable Intelligence
                  </h2>
                </div>
              </div>

              <FollowUpWidget refreshKey={refreshKey} />
              <DormancyWidget />
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
                  <Layers size={16} strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <h2 className="sora-font text-[13px] font-bold uppercase tracking-widest text-slate-900 dark:text-white leading-none truncate">
                    Active Operations
                  </h2>
                </div>
              </div>

              <ActiveTasksWidget refreshKey={refreshKey} />
            </div>
          </aside>
        </div>
      </WorkspaceShell>

      {/* MOBILE FAB */}
      <button
        type="button"
        onClick={() => {
          setSelectedClient(null);
          setIsInteractionOpen(true);
        }}
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-sky-600 text-white rounded-full shadow-[0_8px_30px_rgba(14,165,233,0.4)] hover:bg-sky-500 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all xl:hidden border border-sky-400/50 cursor-pointer"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* GLOBAL DRAWERS & MODALS */}
      <InteractionModal
        key={selectedClient?._id || "new-interaction"}
        isOpen={isInteractionOpen}
        onClose={() => setIsInteractionOpen(false)}
        onRefresh={triggerRefresh}
        initialClient={selectedClient}
      />

      <NewSubmission
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
        onCreated={triggerRefresh}
      />

      <NewTicketPanel
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onCreated={triggerRefresh}
      />
    </>
  );
};

export default Home;