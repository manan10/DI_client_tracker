import React from 'react';
import { Moon, Sun, Globe, Clock, Calendar, IndianRupee } from 'lucide-react';

const AppearanceConfig = ({ isDark, onToggleTheme }) => (
  <div className="w-full max-w-4xl pb-32 space-y-6 animate-in fade-in duration-300">
    
    {/* Mobile-Only Header */}
    <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
      <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Appearance</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customize your digital workspace.</p>
    </div>

    {/* THEME PREFERENCES */}
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
         <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Interface Theme</h3>
      </div>
      
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Color Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Currently using the {isDark ? 'Dark' : 'Light'} appearance.</p>
          </div>
        </div>
        
        <button 
          onClick={onToggleTheme}
          className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120] shrink-0
            ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>

    {/* REGIONAL SETTINGS (Read-Only State) */}
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
         <Globe size={16} className="text-slate-500 dark:text-slate-400" />
         <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Regional Formatting</h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2">
            <div className="flex items-center gap-3">
               <IndianRupee size={16} className="text-slate-400" />
               <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Currency Format</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-sm">INR (₹ Lakhs/Crores)</span>
         </div>
         
         <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2">
            <div className="flex items-center gap-3">
               <Clock size={16} className="text-slate-400" />
               <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Timezone</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-sm">IST (UTC+5:30)</span>
         </div>
         
         <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2">
            <div className="flex items-center gap-3">
               <Calendar size={16} className="text-slate-400" />
               <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date Format</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-sm">DD/MM/YYYY</span>
         </div>
      </div>
    </div>
    
  </div>
);

export default AppearanceConfig;