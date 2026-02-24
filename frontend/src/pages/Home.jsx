import React, { useState } from "react";
import DataUploader from "../components/Home/DataUploader";
import DirectoryBlock from "../components/Home/DirectoryBlock";
import InteractionTimeline from "../components/Home/InteractionTimeline";
import Navbar from "../components/Navbar";
import StatCards from "../components/Home/StatCards";
import QuickLogModal from "../components/Home/QuickLog";
import InteractionModal from "../components/InteractionModal";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-12">
        <StatCards />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          <div className="order-1 lg:col-span-8 space-y-8">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 border-l-4 border-amber-500 pl-3">
                  Interaction Feed
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-4">
                  Manage your latest 842+ logs
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-amber-600 text-white px-8 py-4 sm:py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-200 active:scale-95 transition-all hover:bg-amber-700"
              >
                + Log New Interaction
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <InteractionTimeline />
            </div>

            <DirectoryBlock clientCount="443" />
          </div>

          <div className="order-2 lg:col-span-4">
            <DataUploader />
          </div>
        </div>
      </main>

      {/* This is now the universal modal for all interaction logging */}
      <InteractionModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
export default Home;