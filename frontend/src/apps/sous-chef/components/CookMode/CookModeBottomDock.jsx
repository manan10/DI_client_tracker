// src/apps/recipes/components/CookMode/CookModeBottomDock.jsx
import React from "react";
import {
  Scale,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const CookModeBottomDock = ({
  currentStepIndex,
  totalSteps,
  nextStepTitle,
  checkedIngredientsCount,
  totalIngredientsCount,
  onOpenIngredients,
  onPrevStep,
  onNextStep,
  onFinishDish,
}) => {
  return (
    <footer className="px-3.5 sm:px-8 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#14110E]/95 backdrop-blur-md shrink-0 z-30">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenIngredients}
          className="lg:hidden h-13 px-3 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-mono font-extrabold text-xs flex flex-col items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
          title="Open Ingredients Checklist"
        >
          <Scale size={14} />
          <span className="text-[10px] tabular-nums mt-0.5">
            {checkedIngredientsCount}/{totalIngredientsCount}
          </span>
        </button>

        <button
          type="button"
          disabled={currentStepIndex === 0}
          onClick={onPrevStep}
          className="h-13 px-3.5 sm:px-5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#1C1814] text-stone-800 dark:text-stone-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer active:scale-95 transition-transform shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {currentStepIndex < totalSteps - 1 ? (
          <button
            type="button"
            onClick={onNextStep}
            className="flex-1 h-13 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-between gap-3 shadow-md shadow-amber-500/20 cursor-pointer active:scale-98 transition-transform min-w-0"
          >
            <div className="text-left min-w-0">
              <span className="block text-[9px] uppercase tracking-widest opacity-75">
                Next • Step {currentStepIndex + 2}
              </span>
              <span className="block font-sans font-[1000] text-sm truncate">
                {nextStepTitle || "Continue Cooking"}
              </span>
            </div>
            <ChevronRight size={20} strokeWidth={2.8} className="shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinishDish}
            className="flex-1 h-13 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-98 transition-transform"
          >
            <CheckCircle2 size={18} strokeWidth={2.8} />
            <span>Finish Dish</span>
          </button>
        )}
      </div>
    </footer>
  );
};

export default CookModeBottomDock;