import React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";

const ThemeManager = ({ isDark, onToggle }) => {
  const themes = [
    {
      id: "light",
      label: "Light Mode",
      desc: "Clean daylight clarity with balanced contrast",
      icon: Sun,
      active: !isDark,
      iconColor: "text-amber-500",
      activeBorder: "border-amber-400/80 dark:border-amber-500/50",
      activeBg: "bg-amber-50/50 dark:bg-amber-500/5",
      checkBg: "bg-amber-600 border-amber-600 text-white",
    },
    {
      id: "dark",
      label: "Dark Mode",
      desc: "OLED-optimized slate theme for low-light environments",
      icon: Moon,
      active: isDark,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      activeBorder: "border-emerald-500/80 dark:border-emerald-400",
      activeBg: "bg-emerald-50/50 dark:bg-emerald-500/5",
      checkBg: "bg-emerald-600 border-emerald-600 text-white",
    },
  ];

  return (
    <div className="space-y-6 text-left antialiased">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Appearance & <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Theme</span>
          </h2>
          <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Choose your preferred display mode across desktop and mobile views.
          </p>
        </div>

        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
          <Monitor size={13} className="text-slate-400" />
          <span>{isDark ? "Dark theme active" : "Light theme active"}</span>
        </span>
      </div>

      {/* THEME SELECTION TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              className={`flex items-start justify-between p-4 rounded-lg border-2 text-left transition-all duration-150 cursor-pointer active:scale-[0.99] outline-none ${
                theme.active
                  ? `bg-white dark:bg-[#0B1120] ${theme.activeBorder} shadow-xs ring-1 ring-slate-200/50 dark:ring-white/5`
                  : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <div
                  className={`p-2 rounded-md border shrink-0 transition-colors ${
                    theme.active
                      ? `${theme.activeBg} border-slate-200 dark:border-white/10`
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5"
                  }`}
                >
                  <Icon
                    size={18}
                    className={theme.iconColor}
                    strokeWidth={2.3}
                  />
                </div>

                <div className="min-w-0">
                  <span className="text-sm font-sans font-semibold text-slate-900 dark:text-slate-100 block truncate">
                    {theme.label}
                  </span>
                  <span className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5 block leading-relaxed">
                    {theme.desc}
                  </span>
                </div>
              </div>

              {/* Status Radio Check */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  theme.active
                    ? theme.checkBg
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                {theme.active && <Check size={11} strokeWidth={3.5} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER INFO NOTE */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
        <Monitor size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
          Your choice is saved to local browser storage and applied automatically whenever you log in.
        </p>
      </div>
    </div>
  );
};

export default ThemeManager;