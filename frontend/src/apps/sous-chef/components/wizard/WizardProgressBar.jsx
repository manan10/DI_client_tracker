// src/apps/recipes/components/wizard/WizardProgressBar.jsx
import React from "react";
import { Check } from "lucide-react";

const WizardProgressBar = ({ steps, currentStep, onJumpToStep }) => {
  const currentStepData = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shrink-0 select-none">
      {/* MOBILE PROGRESS BAR (Story-Style Clean Segmented Track) */}
      <div className="sm:hidden px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {currentStepData.title}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              ({currentStepData.subtitle})
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            {currentStep} of {steps.length}
          </span>
        </div>

        {/* 4 Clean Story Segment Bars */}
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onJumpToStep(step.id)}
                className="h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 transition-all cursor-pointer"
                title={step.title}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 w-full"
                      : isCurrent
                      ? "bg-amber-500 w-full"
                      : "w-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP PROGRESS BAR (Integrated Minimalist Step Rail) */}
      <div className="hidden sm:flex items-center justify-between px-6 py-2.5">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onJumpToStep(step.id)}
                className={`flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-left transition-all cursor-pointer group outline-none ${
                  isCurrent
                    ? "bg-slate-100 dark:bg-slate-800/80"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Step Circle / Badge */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono transition-colors shrink-0 ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-amber-500 text-slate-950 font-black ring-2 ring-amber-500/20"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : step.id}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col leading-tight">
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-slate-900 dark:text-white font-bold"
                        : isCompleted
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {step.subtitle}
                  </span>
                </div>
              </button>

              {/* Connecting Divider Line Between Steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 mx-3" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgressBar;