import React, { useState } from "react";
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

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-20 md:pb-0 relative">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-12">
        {/* Top Stats Overview */}
        <StatCards />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Main Feed Section (Col 8) */}
          <div className="order-1 lg:col-span-8 space-y-8">
            
            {/* SEARCH TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-amber-500 w-1.5 h-8 rounded-full"></div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
                    Interaction Feed
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Manage latest logs
                  </p>
                </div>
              </div>

              <div className="w-full md:max-w-md lg:max-w-lg">
                 <UniversalSearch onClientSelect={handleOpenDrawer} />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <InteractionTimeline />
            </div>

            <DirectoryBlock clientCount="443" />
          </div>

          {/* Sidebar Section (Col 4) */}
          <div className="order-2 lg:col-span-4 space-y-8">
            <FollowUpWidget />
            <DormancyWidget onClientClick={handleOpenDrawer} />
            <DataUploader />
          </div>
        </div>
      </main>

      {/* FAB - Logic remains same */}
      <button 
        onClick={() => {
          setSelectedClient(null); // Fresh log
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 z-50 bg-amber-600 text-white p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center gap-3 overflow-hidden"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest">
          New Interaction
        </span>
      </button>

      {/* Components called when searching */}
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