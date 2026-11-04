// src/apps/recipes/components/wizard/CookingStepsStep.jsx
import React from "react";
import { Plus, Trash2, Timer, Check } from "lucide-react";

const CookingStepsStep = ({
  instructions,
  validCount,
  onAddStep,
  onRemoveStep,
  onStepChange,
  recipeTitle,
  totalIngredients,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Cooking Directions ({validCount} step{validCount === 1 ? "" : "s"})
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Write clear step directives with optional timers for cooking mode.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddStep}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Add Step</span>
        </button>
      </div>

      <div className="space-y-3">
        {instructions.map((step, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-md bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/20">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="Stage heading (e.g. Sauté Aromatics)"
                  value={step.title}
                  onChange={(e) => onStepChange(idx, "title", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                  <Timer size={11} className="text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Sec"
                    value={step.timerDurationSeconds || ""}
                    onChange={(e) =>
                      onStepChange(
                        idx,
                        "timerDurationSeconds",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-10 bg-transparent text-[11px] font-mono text-center font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">s</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveStep(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove step"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <textarea
              required
              rows={2}
              placeholder="Detailed cooking instructions for this phase..."
              value={step.instruction}
              onChange={(e) => onStepChange(idx, "instruction", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
            />

            <input
              type="text"
              placeholder="Chef's Tip / Pro Tip (Optional)"
              value={step.chefTip || ""}
              onChange={(e) => onStepChange(idx, "chefTip", e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121620] border border-slate-200/60 dark:border-slate-800/60 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-400 italic focus:outline-none focus:border-amber-500"
            />
          </div>
        ))}
      </div>

      {/* Verification Card */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200 space-y-1">
        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Check size={13} strokeWidth={2.5} />
          Ready to Save
        </span>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          {recipeTitle || "Untitled Recipe"} • {totalIngredients} ingredients configured • {validCount} instructions ready.
        </p>
      </div>
    </div>
  );
};

export default CookingStepsStep;