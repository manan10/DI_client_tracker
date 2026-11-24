import React, { useState } from "react";
import { ShieldCheck, Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

const RiskProfiler = () => {
  const [lang, setLang] = useState("en");

  return (
    <div className="space-y-6">
      {/* LANGUAGE & CLIENT CONTROL BAR */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Globe size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Assessment Language
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {LANGUAGES.map((item) => {
            const isSelected = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RISK PROFILER WORKSPACE STAGE */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-md mx-auto text-center py-8 space-y-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck size={20} strokeWidth={2} />
          </div>

          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            SEBI-Aligned Risk Questionnaire ({lang.toUpperCase()})
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multilingual investor risk scoring, recommended asset allocation split,
            and direct client profile update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskProfiler;