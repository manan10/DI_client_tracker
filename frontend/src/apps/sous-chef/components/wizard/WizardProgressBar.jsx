// src/apps/recipes/components/wizard/WizardProgressBar.jsx
import React from "react";
import { Check } from "lucide-react";

const WizardProgressBar = ({ steps, currentStep, onJumpToStep }) => {
  return (
    <div className="px-5 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111622] shrink-0">
      {/* Mobile Mini Progress Bar */}
      <div className="sm:hidden flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </span>
        <div className="flex items-center gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step.id === currentStep
                  ? "w-6 bg-amber-500"
                  : step.id < currentStep
                  ? "w-3 bg-emerald-500"
                  : "w-3 bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Step Nav Panel */}
      <div className="hidden sm:grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onJumpToStep(step.id)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                isActive
                  ? "bg-white dark:bg-[#161B26] border-amber-500 shadow-xs ring-1 ring-amber-500/20"
                  : isCompleted
                  ? "bg-white/60 dark:bg-[#131924]/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  : "bg-transparent border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-700"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-colors ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-black"
                    : isCompleted
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`block text-[11px] font-bold tracking-tight truncate ${
                    isActive ? "text-slate-900 dark:text-white" : ""
                  }`}
                >
                  {step.title}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {step.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgressBar;