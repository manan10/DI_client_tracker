import React, { useState } from "react";
import Navbar from "../components/Navbar";
import StatCards from "../components/Home/StatCards";
import UniversalSearch from "../components/Home/UniversalSearch"; 
import InteractionTimeline from "../components/Home/InteractionTimeline";
import FollowUpWidget from "../components/Home/FollowupWidget";
import DormancyWidget from "../components/Home/DormancyWidget";
import DataUploader from "../components/Home/DataUploader";
import DirectoryBlock from "../components/Home/DirectoryBlock";
import ClientDrawer from "../components/Directory/ClientDrawer/ClientDrawer";
import InteractionModal from "../components/InteractionModal";
import { Plus, Terminal as TerminalIcon, Shield, Activity, Zap, BookOpen } from "lucide-react";

const Home = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#05070a] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />

      {/* 1. TOP PULSE - Fixed High-Contrast Header */}
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-[#080a0f]/90 backdrop-blur-xl border-b-2 border-slate-200 dark:border-white/10 shadow-md">
        <div className="max-w-450 mx-auto px-6 py-3">
          <StatCards />
        </div>
      </div>

      <main className="max-w-450 mx-auto flex flex-col xl:flex-row">
        
        {/* LEFT COLUMN: PRIMARY STREAM (Expanded Width) */}
        <div className="flex-1 px-6 lg:px-12 pt-10 pb-32 border-r-0 xl:border-r-2 border-slate-100 dark:border-white/5">
          
          {/* COMMAND CENTER */}
          <section className="mb-16 max-w-5xl">


            {/* Elevated Search Track */}
            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-3xl border-2 border-slate-200 dark:border-white/10 shadow-inner">
              <UniversalSearch onClientSelect={(c) => { setSelectedClient(c); setIsDrawerOpen(true); }} />
            </div>
          </section>

          {/* ACTIVITY STREAM */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <Activity size={18} className="text-blue-600" strokeWidth={3} />
              <h2 className="text-[12px] font-[1000] uppercase tracking-[0.4em] text-slate-900 dark:text-slate-400">Activity stream</h2>
              <div className="flex-1 h-0.5 bg-slate-100 dark:bg-white/5" />
            </div>
            
            {/* The "Track": A vertical line that anchors the timeline */}
            <div className="relative">
              <InteractionTimeline />
            </div>
          </section>

          {/* MASTER DIRECTORY */}
          <section className="mt-24 space-y-10">
            <div className="flex items-center gap-4">
              <BookOpen size={18} className="text-emerald-600" strokeWidth={3} />
              <h2 className="text-[12px] font-[1000] uppercase tracking-[0.4em] text-slate-900 dark:text-slate-400">Master Directory</h2>
              <div className="flex-1 h-0.5 bg-slate-100 dark:bg-white/5" />
            </div>
            <DirectoryBlock clientCount="---" />
          </section>
        </div>

        {/* RIGHT COLUMN: PRIORITY SIDEBAR (Visible Separation) */}
        <aside className="w-full xl:w-100 bg-slate-50/50 dark:bg-black/20 p-8 lg:p-10 space-y-12">
          
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-amber-500" strokeWidth={3} />
              <h2 className="text-[12px] font-[1000] uppercase tracking-[0.4em] text-slate-900 dark:text-slate-400">Priority Alerts</h2>
            </div>
            
            {/* These widgets now sit on a distinct sidebar surface */}
            <div className="space-y-6">
              <FollowUpWidget />
              <DormancyWidget onClientClick={(c) => { setSelectedClient(c); setIsDrawerOpen(true); }} />
            </div>
          </div>

          <div className="pt-10 border-t-2 border-slate-200 dark:border-white/10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">System Terminal</h3>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-white/10 shadow-xl">
              <DataUploader />
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE FAB */}
      <button 
        onClick={() => { setSelectedClient(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 z-50 bg-slate-950 dark:bg-orange-600 text-white p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
      >
        <Plus size={28} strokeWidth={4} />
      </button>

      <ClientDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} client={selectedClient} />
      <InteractionModal key={selectedClient?._id || 'new'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialClient={selectedClient} />
    </div>
  );
};

export default Home;