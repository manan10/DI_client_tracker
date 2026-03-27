import React from 'react';
import { Moon, Sun, Globe } from 'lucide-react';

const AppearanceConfig = ({ isDark, onToggleTheme }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
    <header className="mb-12">
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Appearance</h3>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Customise your digital workspace</p>
    </header>

    <div className="space-y-6">
      <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex items-center justify-center text-emerald-600">
            {isDark ? <Moon size={32} /> : <Sun size={32} />}
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Interface Theme</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currently set to {isDark ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
        </div>
        <button 
          onClick={onToggleTheme}
          className="w-20 h-10 bg-slate-200 dark:bg-emerald-600 rounded-full p-1 relative transition-colors duration-500"
        >
          <div className={`absolute top-1 bottom-1 w-8 bg-white rounded-full shadow-lg transition-all duration-500 ${isDark ? 'left-11' : 'left-1'}`} />
        </button>
      </div>

      <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-4 mb-6">
           <Globe size={18} className="text-slate-400" />
           <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Regional Settings</p>
         </div>
         <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Currency Format</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">INR (₹ Lakhs/Crores)</span>
         </div>
         <div className="flex justify-between items-center py-4">
            <span className="text-xs font-bold text-slate-500 uppercase">Timezone</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">IST (UTC+5:30)</span>
         </div>
      </div>
    </div>
  </div>
);

export default AppearanceConfig;