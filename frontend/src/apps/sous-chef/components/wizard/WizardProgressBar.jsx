// src/apps/recipes/components/wizard/WizardProgressBar.jsx
import React from "react";
import { Check, Wand2, ArrowLeft } from "lucide-react";

const WizardProgressBar = ({
  steps,
  currentStep,
  onJumpToStep,
  isImportOpen,
  onCloseImport,
}) => {
  // When in the Import sub-screen, show a clean contextual return bar instead of the stepper
  if (isImportOpen) {
    return (
      <div className="px-5 sm:px-6 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-[#F3F1EC] dark:bg-[#14110E] flex items-center justify-between gap-3 shrink-0 font-mono">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          <Wand2 size={13} className="text-amber-600 dark:text-amber-400" />
          <span>Import from Link or Text</span>
        </div>

        <button
          type="button"
          onClick={onCloseImport}
          className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Back to Details</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#14110E] shrink-0 font-mono">
      {/* Mobile Compact Progress Strip */}
      <div className="sm:hidden px-5 py-2.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400" />
          <span>
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-1 transition-all duration-200 ${
                step.id === currentStep
                  ? "w-6 bg-amber-600 dark:bg-amber-400"
                  : step.id < currentStep
                  ? "w-3 bg-emerald-600 dark:bg-emerald-500"
                  : "w-3 bg-stone-300 dark:bg-stone-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop 2-Tab Editorial Rail */}
      <div className="hidden sm:grid grid-cols-2 px-6 divide-x divide-stone-200/70 dark:divide-stone-800/70">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onJumpToStep(step.id)}
              className={`relative py-2.5 px-3 first:pl-0 last:pr-0 text-left transition-colors cursor-pointer flex items-center gap-2.5 outline-none ${
                isActive
                  ? "text-stone-900 dark:text-white"
                  : isCompleted
                  ? "text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                  : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400"
              }`}
            >
              <div
                className={`w-6 h-6 border flex items-center justify-center shrink-0 text-[10px] font-mono font-bold transition-colors ${
                  isActive
                    ? "border-amber-600/50 dark:border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-300"
                    : isCompleted
                    ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0E0C0A] text-stone-400 dark:text-stone-500"
                }`}
              >
                {isCompleted ? <Check size={11} strokeWidth={2.8} /> : <Icon size={11} />}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`block text-[11px] uppercase tracking-wider truncate ${
                    isActive ? "font-extrabold" : "font-bold"
                  }`}
                >
                  0{step.id}. {step.title}
                </span>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 truncate">
                  {step.subtitle}
                </span>
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-900 dark:bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgressBar;