import React, { useState, useEffect } from "react";
import { Plus, LayoutDashboard } from "lucide-react"; 
import DataUploader from "../components/Home/DataUploader";
import DirectoryBlock from "../components/Home/DirectoryBlock";
import InteractionTimeline from "../components/Home/InteractionTimeline";
import Navbar from "../components/Navbar";
import StatCards from "../components/Home/StatCards";
import InteractionModal from "../components/InteractionModal";
import FollowUpWidget from "../components/Home/FollowupWidget";
import UniversalSearch from "../components/Home/UniversalSearch"; 
import ClientDrawer from "../components/Directory/ClientDrawer/ClientDrawer";
import DormancyWidget from "../components/Home/DormancyWidget";
import { useApi } from "../hooks/useApi";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [thresholds, setThresholds] = useState(null);
  
  const { request } = useApi();

  // Fetch thresholds for dynamic widgets
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await request("/settings");
        if (data?.business?.thresholds) {
          setThresholds(data.business.thresholds);
        }
      } catch (err) {
        console.error("Dashboard init error", err);
      }
    };
    fetchSettings();
  }, [request]);

  const handleOpenDrawer = (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="w-full max-w-[98%] mx-auto px-4 sm:px-6 py-4 lg:py-6">
        
        {/* 1. TOP STATS BAR - Clean horizontal summary */}
        <div className="mb-8">
          <StatCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SEARCH & HEADER STRIP */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 px-1">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                   <LayoutDashboard size={18} />
                </div>
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                    Interaction Feed
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                    Latest Client Touches
                  </p>
                </div>
              </div>

              <div className="w-full md:max-w-md">
                 <UniversalSearch onClientSelect={handleOpenDrawer} />
              </div>
            </div>

            {/* Interaction Timeline Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <InteractionTimeline />
            </div>

            <DirectoryBlock clientCount="---" />
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            <FollowUpWidget />
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
        className="fixed bottom-8 right-8 z-50 bg-amber-600 text-white p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all border border-amber-500/20"
      >
        <Plus size={24} />
      </button>

      {/* Drawers and Modals */}
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