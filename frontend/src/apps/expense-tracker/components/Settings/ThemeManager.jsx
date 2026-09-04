import React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";

const ThemeManager = ({ isDark, onToggle }) => {
  const themes = [
    { 
      id: "light", 
      label: "Light Mode", 
      icon: Sun, 
      active: !isDark,
      desc: "High clarity for daylight usage" 
    },
    { 
      id: "dark", 
      label: "Dark Mode", 
      icon: Moon, 
      active: isDark,
      desc: "OLED optimized for low light" 
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 text-left pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Appearance</h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Visual Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => {
              if ((theme.id === "dark" && !isDark) || (theme.id === "light" && isDark)) {
                onToggle();
              }
            }}
            className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 w-full text-left group active:scale-[0.98] ${
              theme.active 
                ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-lg" 
                : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                theme.active 
                  ? "bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900" 
                  : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 group-hover:text-amber-500 transition-colors"
              }`}>
                <theme.icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className={`text-xs sm:text-sm font-black uppercase tracking-widest ${
                  theme.active ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
                }`}>
                  {theme.label}
                </p>
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 ${
                  theme.active ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
                }`}>
                  {theme.desc}
                </p>
              </div>
            </div>

            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              theme.active ? "bg-amber-500 text-white scale-100 opacity-100" : "scale-50 opacity-0"
            }`}>
              <Check size={14} strokeWidth={4} />
            </div>
          </button>
        ))}
      </div>

      {/* INFO BANNER */}
      <div className="mt-6 flex items-start sm:items-center gap-3 p-4 sm:p-5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm">
        <div className="p-2 bg-white dark:bg-amber-500/20 rounded-lg shrink-0 mt-0.5 sm:mt-0 border border-amber-200 dark:border-amber-500/30">
          <Monitor size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold tracking-widest leading-relaxed">
          System will store your preference locally to maintain consistency across family sessions.
        </p>
      </div>
    </div>
  );
};

export default ThemeManager;