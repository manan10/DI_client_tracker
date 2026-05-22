import React from 'react';
import { Moon, Sun, Globe, Check } from 'lucide-react';

const AppearanceConfig = ({ isDark, onToggleTheme }) => (
  <div className="max-w-3xl mx-auto py-8 px-4 md:px-8 pb-64 md:pb-10">
    
    {/* HEADER */}
    <header className="mb-12 border-b border-slate-100 pb-8">
      <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">Appearance</h3>
      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Customise your digital workspace</p>
    </header>

    <div className="space-y-12">
      
      {/* THEME TOGGLE */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Interface Theme</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Currently set to {isDark ? 'Dark Mode' : 'Light Mode'}</p>
          </div>
        </div>
        
        <button 
          onClick={onToggleTheme}
          className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${isDark ? 'bg-emerald-600' : 'bg-slate-200'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* REGIONAL SETTINGS */}
      <div className="border-t border-slate-100 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <Globe size={16} className="text-slate-400" />
          <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Regional Settings</p>
        </div>

        <div className="grid gap-6">
           <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency Format</span>
              <span className="text-[11px] font-black text-slate-900 uppercase">INR (₹ Lakhs/Crores)</span>
           </div>
           <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timezone</span>
              <span className="text-[11px] font-black text-slate-900 uppercase">IST (UTC+5:30)</span>
           </div>
           <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Format</span>
              <span className="text-[11px] font-black text-slate-900 uppercase">DD/MM/YYYY</span>
           </div>
        </div>
      </div>
      
    </div>
  </div>
);

export default AppearanceConfig;