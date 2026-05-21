import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import StatCards from "../../components/Home/StatCards";
import UniversalSearch from "../../components/Home/UniversalSearch";
import InteractionTimeline from "../../components/Home/InteractionTimeline";
import FollowUpWidget from "../../components/Home/FollowupWidget";
import DormancyWidget from "../../components/Home/DormancyWidget";
import DirectoryBlock from "../../components/Home/DirectoryBlock";
import InteractionModal from "../../components/InteractionModal";
import { Plus, Activity, Zap, BookOpen } from "lucide-react";

const Home = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />

      {/* FIXED STATS HEADER */}
      <div className="top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b-2 border-slate-200 dark:border-white/10 shadow-md">
        <div className="max-w-450 mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <StatCards />
        </div>
      </div>

      {/* pb-28 applied here to the wrapper to cover both columns */}
      <main className="max-w-450 mx-auto flex flex-col xl:flex-row pb-28">
        {/* LEFT COLUMN: PRIMARY FEED */}
        <div className="flex-1 px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 border-r-0 xl:border-r-2 border-slate-100 dark:border-white/5">
          <section className="mb-10 sm:mb-16">
            <div className="p-1.5 sm:p-2 bg-slate-100 dark:bg-white/5 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-white/10 shadow-inner">
              <UniversalSearch />
            </div>
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

          <section className="mt-16 sm:mt-24 space-y-6 sm:space-y-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <BookOpen size={16} sm:size={18} className="text-emerald-600" strokeWidth={3} />
              <h2 className="text-[10px] sm:text-[12px] font-[1000] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-900 dark:text-slate-400">
                Master Directory
              </h2>
              <div className="flex-1 h-0.5 bg-slate-100 dark:bg-white/5" />
            </div>
            <div className="relative">
              <DirectoryBlock />
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
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE FAB */}
      <button
        onClick={() => {
          setSelectedClient(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-6 sm:bottom-22 sm:right-8 z-50 bg-slate-950 dark:bg-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
      >
        <Plus size={24} sm:size={28} strokeWidth={4} />
      </button>

      <InteractionModal
        key={selectedClient?._id || "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialClient={selectedClient}
      />
    </div>
  );
};

export default Home;