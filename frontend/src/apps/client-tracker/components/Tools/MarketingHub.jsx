import React, { useState } from "react";
import { Share2, UserPlus, CalendarCheck, Sparkles, Megaphone } from "lucide-react";

const MARKETING_MODES = [
  {
    id: "referral",
    name: "Referral Outreach",
    description: "Warm WhatsApp templates to request introductions from happy clients.",
    icon: UserPlus,
  },
  {
    id: "review",
    name: "Portfolio Review Invite",
    description: "Re-engagement pitches for dormant investors or annual checkups.",
    icon: CalendarCheck,
  },
  {
    id: "awareness",
    name: "Investor Awareness",
    description: "SIP discipline, market dip reassurance, and FD-to-MF broadcast notes.",
    icon: Sparkles,
  },
  {
    id: "proposal",
    name: "Quick Pitch Builder",
    description: "Branded Dalal Investments summary note for new prospects.",
    icon: Share2,
  },
];

const MarketingHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("referral");

  const activeCategory =
    MARKETING_MODES.find((m) => m.id === selectedCategory) || MARKETING_MODES[0];

  return (
    <div className="space-y-6">
      {/* CATEGORY SELECTOR BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MARKETING_MODES.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCategory(item.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer outline-none flex flex-col gap-2 ${
                isSelected
                  ? "bg-white dark:bg-[#0B1120] border-emerald-500 dark:border-emerald-400 shadow-xs ring-1 ring-emerald-500/20"
                  : "bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon
                  size={16}
                  strokeWidth={2.2}
                  className={
                    isSelected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }
                />
                {isSelected && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                )}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {item.name}
              </h3>
            </button>
          );
        })}
      </div>

      {/* MARKETING WORKSPACE STAGE */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-md mx-auto text-center py-8 space-y-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Megaphone size={20} strokeWidth={2} />
          </div>

          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {activeCategory.name}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeCategory.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingHub;