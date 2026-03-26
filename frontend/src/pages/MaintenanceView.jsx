import React from 'react';
import { Construction, Hammer, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust the path to your Navbar location

const MaintenanceView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar included directly in the view */}
      <Navbar />

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Animated Icon Header */}
          <div className="relative inline-block">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-8 rounded-[2.5rem] border border-amber-500/20 shadow-inner">
              <Construction size={58} className="text-amber-600 dark:text-amber-500 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
              <Hammer size={18} className="text-slate-500" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
              Vault Refurbishment
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              We are currently optimizing the Document Vault for the production environment. 
              The module is temporarily locked to ensure 100% data integrity during migration.
            </p>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Clock size={18} className="text-amber-500" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Under Service</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <ShieldCheck size={18} className="text-emerald-500" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-slate-400">Security</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Active & Safe</p>
              </div>
            </div>
          </div>

          {/* Quick Navigation Button */}
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl active:scale-95 transition-all"
          >
            Go to Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Subtle Footer Note */}
          <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] font-black pt-4">
            System Update v2.4.0 • Dalal Investment
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceView;