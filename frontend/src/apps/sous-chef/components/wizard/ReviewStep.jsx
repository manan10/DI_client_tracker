// src/apps/recipes/components/wizard/ReviewStep.jsx
import React from "react";
import {
  Clock,
  Timer,
  Users,
  Flame,
  Check,
  Video,
  Sparkles,
  Leaf,
  Layers,
  UtensilsCrossed,
} from "lucide-react";

const ReviewStep = ({ formData }) => {
  const activeDietary = Object.entries(formData.dietaryFlags || {})
    .filter(([_, val]) => Boolean(val))
    .map(([key]) => {
      const labels = {
        isVegetarian: "Vegetarian",
        isJain: "Jain Friendly",
        isSwaminarayan: "No Onion/Garlic",
        isVegan: "Vegan",
        isGlutenFree: "Gluten-Free",
      };
      return labels[key] || key;
    });

  const validIngredients = (formData.ingredients || []).filter(
    (item) => item.name && item.name.trim().length > 0
  );
  const validInstructions = (formData.instructions || []).filter(
    (item) => item.instruction && item.instruction.trim().length > 0
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Ready Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {formData.title || "Untitled Recipe"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {formData.cuisine} • {formData.courseType} • {formData.difficulty}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <Check size={11} strokeWidth={2.5} />
          Ready
        </span>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
            <Users size={11} className="text-amber-500" /> Servings
          </span>
          <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
            {formData.baseServings}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
            <Clock size={11} className="text-amber-500" /> Prep
          </span>
          <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
            {formData.prepTimeMinutes}m
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
            <Timer size={11} className="text-amber-500" /> Cook
          </span>
          <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
            {formData.cookTimeMinutes}m
          </p>
        </div>
      </div>

      {/* Dietary Tags */}
      {activeDietary.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeDietary.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-800 dark:text-amber-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description Snippet (If Present) */}
      {formData.description && (
        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-[#131924] p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          "{formData.description}"
        </p>
      )}

      {/* Parsed Ingredients Snapshot */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Leaf size={12} className="text-emerald-500" />
            <span>Extracted Ingredients ({validIngredients.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {validIngredients.filter((i) => i.isPantryStaple).length} staples
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
          {validIngredients.length > 0 ? (
            validIngredients.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5"
              >
                <span>{item.name}</span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {item.quantity ? `${item.quantity} ${item.unit || ""}`.trim() : ""}
                </span>
                {item.isPantryStaple && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Pantry staple" />
                )}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">No ingredients extracted</span>
          )}
        </div>
      </div>

      {/* Parsed Steps Snapshot */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers size={12} className="text-amber-500" />
            <span>Cooking Steps ({validInstructions.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Auto-Indexed</span>
        </div>

        <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
          {validInstructions.length > 0 ? (
            validInstructions.map((step, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-50 dark:bg-[#101520] border border-slate-200/70 dark:border-slate-800/70 flex items-start gap-2 text-xs"
              >
                <span className="w-4 h-4 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {step.title && (
                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                      {step.title}
                    </span>
                  )}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {step.instruction}
                  </p>
                </div>
                {step.timerDurationSeconds > 0 && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {Math.round(step.timerDurationSeconds / 60)}m
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 italic">No steps extracted</span>
          )}
        </div>
      </div>

      {/* Video Attached Badge */}
      {formData.videoUrl && (
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#131924] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
            <Video size={13} className="text-red-500 shrink-0" />
            <span className="font-mono text-[11px] truncate">{formData.videoUrl}</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono shrink-0 ml-2">
            LINKED
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;