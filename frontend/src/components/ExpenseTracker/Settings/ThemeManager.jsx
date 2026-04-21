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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500 text-left">
      <div className="text-left">
        <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">Appearance</h3>
        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-3 italic leading-none">Visual Configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => {
              if ((theme.id === "dark" && !isDark) || (theme.id === "light" && isDark)) {
                onToggle();
              }
            }}
            className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 group ${
              theme.active 
                ? "bg-slate-900 dark:bg-white border-transparent shadow-2xl scale-[1.02]" 
                : "bg-slate-50 dark:bg-[#161B22]/50 border-slate-100 dark:border-slate-800 hover:border-amber-500/30"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl transition-colors ${
                theme.active 
                  ? "bg-white/10 dark:bg-slate-900/5 text-white dark:text-slate-900" 
                  : "bg-white dark:bg-slate-800 text-slate-400"
              }`}>
                <theme.icon size={28} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-[1000] uppercase tracking-widest ${
                  theme.active ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
                }`}>
                  {theme.label}
                </p>
                <p className={`text-[9px] font-bold uppercase tracking-tight mt-1 ${
                  theme.active ? "opacity-60 text-white dark:text-slate-900" : "text-slate-400"
                }`}>
                  {theme.desc}
                </p>
              </div>
            </div>

            {theme.active && (
              <div className="bg-amber-500 p-2 rounded-full text-white">
                <Check size={16} strokeWidth={4} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-center gap-4">
        <Monitor className="text-amber-500 shrink-0" size={20} />
        <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
          System will store your preference locally to maintain consistency across family sessions.
        </p>
      </div>
    </div>
  );
};

export default ThemeManager;