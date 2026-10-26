import React from "react";
import { Moon, Sun, Check, Sparkles } from "lucide-react";
import PageHeader from "../../../components/Auth/PageHeader";

const ThemeManager = ({ isDark, onToggle }) => {
  const themes = [
    {
      id: "light",
      label: "Light Mode",
      desc: "Clean, bright background designed for comfortable daytime reading.",
      icon: Sun,
      active: !isDark,
      iconColor: "text-amber-500",
      activeBorder: "border-amber-400 dark:border-amber-500/60",
      activeBg: "bg-amber-50/60 dark:bg-amber-500/10",
      badgeBg: "bg-amber-500 text-white",
    },
    {
      id: "dark",
      label: "Dark Mode",
      desc: "Deep, glare-free dark slate background that is easy on the eyes at night.",
      icon: Moon,
      active: isDark,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      activeBorder: "border-emerald-500 dark:border-emerald-400",
      activeBg: "bg-emerald-50/60 dark:bg-emerald-500/10",
      badgeBg: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 text-left antialiased animate-in fade-in duration-300 min-w-0 pb-16">
      
      {/* Universal PageHeader */}
      <PageHeader 
        title="Display"
        accent="Theme"
        description="Choose between a light or dark screen style. Your preference is automatically saved on this device."
      />

      {/* Theme Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                if (
                  (theme.id === "dark" && !isDark) ||
                  (theme.id === "light" && isDark)
                ) {
                  onToggle();
                }
              }}
              className={`flex items-start justify-between p-5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer active:scale-[0.99] outline-none shadow-xs ${
                theme.active
                  ? `bg-white dark:bg-[#0B1120] ${theme.activeBorder} ring-2 ring-slate-900/5 dark:ring-white/10`
                  : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 pr-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                    theme.active
                      ? `${theme.activeBg} border-slate-200 dark:border-white/10`
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5"
                  }`}
                >
                  <Icon
                    size={20}
                    className={theme.iconColor}
                    strokeWidth={2.3}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {theme.label}
                    </span>
                    {theme.active && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        In Use
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {theme.desc}
                  </p>
                </div>
              </div>

              {/* Status Radio Check */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  theme.active
                    ? `${theme.badgeBg} border-transparent shadow-xs`
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                {theme.active && <Check size={12} strokeWidth={3.5} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helpful Storage Note */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10">
        <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Changes take effect instantly and stay saved even if you log out or refresh your browser.
        </p>
      </div>
    </div>
  );
};

export default ThemeManager;