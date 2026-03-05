import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react"; 
import DataUploader from "../components/Home/DataUploader";
import DirectoryBlock from "../components/Home/DirectoryBlock";
import InteractionTimeline from "../components/Home/InteractionTimeline";
import Navbar from "../components/Navbar";
import StatCards from "../components/Home/StatCards";
import InteractionModal from "../components/InteractionModal";
import FollowUpWidget from "../components/Home/FollowupWidget";
import UniversalSearch from "../components/Home/UniversalSearch"; 
import ClientDrawer from "../components/Directory/ClientDrawer";
import DormancyWidget from "../components/Home/DormancyWidget";
import MarketTicker from "../components/Home/MarketTicker"; // Import the ticker
import { useApi } from "../hooks/useApi"; // To fetch thresholds

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [thresholds, setThresholds] = useState(null);
  
  const { request } = useApi();

  // Fetch global settings to get thresholds for StatCards and Widgets
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await request("/settings");
        if (data?.business?.thresholds) {
          setThresholds(data.business.thresholds);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard settings", err);
      }
    };
    fetchSettings();
  }, [request]);

  const handleOpenDrawer = (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-200 font-sans pb-20 md:pb-0 relative transition-colors duration-300">
      <Navbar />
      
      <main className="w-full max-w-[98%] mx-auto px-4 sm:px-6 py-6 lg:py-10">
        
        {/* 1. Market Ticker (The Terminal Look) */}
        <MarketTicker />

        {/* 2. Business Stats - Thresholds passed for dynamic calc */}
        <StatCards thresholds={thresholds} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          <div className="order-1 lg:col-span-8 space-y-8">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-amber-500 w-1.5 h-8 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100 leading-none">
                    Interaction Feed
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Manage latest logs
                  </p>
                </div>
              </div>

              <div className="w-full md:max-w-md lg:max-w-lg">
                 <UniversalSearch onClientSelect={handleOpenDrawer} />
              </div>
            </div>

            {/* Timeline Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
              <InteractionTimeline />
            </div>

            <DirectoryBlock clientCount="---" /> {/* Updated via data later */}
          </div>

          {/* Sidebar Widgets */}
          <div className="order-2 lg:col-span-4 space-y-8">
            <FollowUpWidget />
            {/* Dormancy widget now reacts to dynamic high-priority definitions */}
            <DormancyWidget 
              onClientClick={handleOpenDrawer} 
              thresholds={thresholds} 
            />
            <DataUploader />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setSelectedClient(null); 
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 z-50 bg-amber-600 text-white p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center gap-3 overflow-hidden border border-amber-500/20"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out hidden group-hover:block text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          New Interaction
        </span>
      </button>

      {/* Overlays */}
      <ClientDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        client={selectedClient}
        onLogInteraction={() => {
          setIsDrawerOpen(false);
          setIsModalOpen(true);
        }}
      />

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