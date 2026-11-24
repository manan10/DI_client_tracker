// src/apps/recipes/components/CookMode/CookModeStepStage.jsx
import React from "react";
import {
  CheckCircle2,
  Lightbulb,
  Clock,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { getStepPhase, getIngredientMeta, formatTimer } from "./cookModeUtils";

const CookModeStepStage = ({
  currentStep,
  currentStepIndex,
  isStepCompleted,
  onToggleStepDone,
  largeText,
  servings,
  stepIngredients,
  formatScaledQty,
  currentStepTimerObj,
  onStartOrToggleStepTimer,
  onAddMinuteToTimer,
  onResetTimerById,
  onTouchStart,
  onTouchEnd,
}) => {
  const stepPhase = getStepPhase(
    `${currentStep.title || ""} ${currentStep.instruction || ""}`
  );
  const PhaseIcon = stepPhase.Icon;

  return (
    <main
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="flex-1 overflow-y-auto px-3.5 sm:px-8 py-4 sm:py-6 flex flex-col justify-between max-w-3xl mx-auto w-full no-scrollbar"
    >
      <div className="space-y-4">
        {/* Step Badge + Explicit "Mark Done" Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-mono font-extrabold text-sm flex items-center justify-center shadow-xs">
              {String(currentStep.stepNumber || currentStepIndex + 1).padStart(
                2,
                "0"
              )}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${stepPhase.badgeClass}`}
            >
              <PhaseIcon size={11} />
              <span>{stepPhase.label}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStepDone(currentStepIndex)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              isStepCompleted
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-white dark:bg-[#1B1714] border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-emerald-500"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isStepCompleted ? "Completed" : "Mark Done"}</span>
          </button>
        </div>

        {/* Step Heading */}
        {currentStep.title && (
          <h2
            className={`font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-tight ${
              largeText ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl"
            }`}
          >
            {currentStep.title}
          </h2>
        )}

        {/* Instruction Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#161310] border-2 border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <p
            className={`font-mono text-stone-800 dark:text-stone-100 leading-relaxed ${
              largeText
                ? "text-lg sm:text-2xl leading-relaxed"
                : "text-sm sm:text-lg"
            }`}
          >
            {currentStep.instruction}
          </p>

          {/* Contextual "For This Step" Scaled Ingredients */}
          {stepIngredients.length > 0 && (
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <span className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                For This Step ({servings}p):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stepIngredients.map((item, i) => {
                  const qty = formatScaledQty(item.quantity);
                  const meta = getIngredientMeta(item);
                  const ItemIcon = meta.Icon;

                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#FAF9F6] dark:bg-[#211C18] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    >
                      <ItemIcon size={12} className={meta.iconColor} />
                      <span>{item.name}</span>
                      {(qty !== "" || item.unit) && (
                        <span className="text-amber-700 dark:text-amber-300 font-extrabold tabular-nums">
                          {qty} {item.unit}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chef's Note Callout */}
          {currentStep.chefTip && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 border-l-4 border-l-amber-500 flex items-start gap-2.5 text-xs sm:text-sm font-mono text-stone-800 dark:text-amber-100">
              <Lightbulb
                size={15}
                className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              />
              <div className="leading-relaxed">
                <strong className="uppercase text-[10px] tracking-wider text-amber-800 dark:text-amber-300 mr-1.5">
                  Chef's Note:
                </strong>
                <span>{currentStep.chefTip}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step-Specific Countdown Timer Card */}
      {currentStep.timerDurationSeconds > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#181410] border-2 border-amber-500/40 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                currentStepTimerObj?.isRunning
                  ? "bg-amber-500 text-stone-950 animate-pulse"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              <Clock size={22} />
            </div>
            <div>
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Step Timer
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums text-stone-900 dark:text-white">
                {formatTimer(
                  currentStepTimerObj
                    ? currentStepTimerObj.remainingSeconds
                    : currentStep.timerDurationSeconds
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onStartOrToggleStepTimer}
              className={`h-11 px-4 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 ${
                currentStepTimerObj?.isRunning
                  ? "bg-rose-600 text-white"
                  : "bg-amber-500 text-stone-950"
              }`}
            >
              {currentStepTimerObj?.isRunning ? (
                <>
                  <Pause size={15} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  <span>
                    {!currentStepTimerObj ||
                    currentStepTimerObj.remainingSeconds ===
                      currentStepTimerObj.totalSeconds
                      ? "Start"
                      : "Resume"}
                  </span>
                </>
              )}
            </button>

            {currentStepTimerObj && (
              <>
                <button
                  type="button"
                  onClick={() => onAddMinuteToTimer(currentStepTimerObj.id)}
                  className="h-11 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#221D18] text-xs font-mono font-bold cursor-pointer"
                >
                  +1m
                </button>
                <button
                  type="button"
                  onClick={() => onResetTimerById(currentStepTimerObj.id)}
                  className="h-11 w-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#221D18] flex items-center justify-center text-stone-500 cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default CookModeStepStage;