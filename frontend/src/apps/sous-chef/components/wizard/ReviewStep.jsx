// src/apps/recipes/components/wizard/ReviewStep.jsx
import React from "react";
import {
  Clock,
  Timer,
  Users,
  Check,
  Video,
  Leaf,
  Layers,
} from "lucide-react";

const ReviewStep = ({ formData }) => {
  const activeDietary = Object.entries(formData.dietaryFlags || {})
    .filter(([_, val]) => Boolean(val))
    .map(([key]) => {
      const labels = {
        isVegetarian: "[VEG] Vegetarian",
        isJain: "[J] Jain",
        isSwaminarayan: "[SW] Swaminarayan",
        isVegan: "[VG] Vegan",
        isGlutenFree: "[GF] Gluten-Free",
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
    <div className="space-y-4 font-mono">
      {/* Dish Summary Card */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
              {formData.cuisine} • {formData.courseType} • {formData.difficulty}
            </span>
            <h4 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-xl text-stone-900 dark:text-white leading-tight truncate">
              {formData.title || "Untitled Recipe"}
            </h4>
          </div>

          <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Check size={11} strokeWidth={2.5} />
            Ready
          </span>
        </div>

        {formData.description && (
          <p className="text-xs font-mono text-stone-600 dark:text-stone-300 leading-relaxed">
            {formData.description}
          </p>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-3 border border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#0E0C0A] divide-x divide-stone-200 dark:divide-stone-800">
          <div className="p-2 text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-1">
              <Users size={11} className="text-amber-700 dark:text-amber-400" /> Servings
            </span>
            <p className="text-xs font-mono font-extrabold text-stone-900 dark:text-white tabular-nums mt-0.5">
              {formData.baseServings}
            </p>
          </div>

          <div className="p-2 text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-1">
              <Clock size={11} className="text-amber-700 dark:text-amber-400" /> Prep
            </span>
            <p className="text-xs font-mono font-extrabold text-stone-900 dark:text-white tabular-nums mt-0.5">
              {formData.prepTimeMinutes}m
            </p>
          </div>

          <div className="p-2 text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-1">
              <Timer size={11} className="text-amber-700 dark:text-amber-400" /> Cook
            </span>
            <p className="text-xs font-mono font-extrabold text-stone-900 dark:text-white tabular-nums mt-0.5">
              {formData.cookTimeMinutes}m
            </p>
          </div>
        </div>

        {/* Dietary Codes */}
        {activeDietary.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeDietary.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Parsed Ingredients Snapshot */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Leaf size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Ingredients ({validIngredients.length})</span>
          </span>
          <span className="text-[10px] font-mono text-stone-400">
            {validIngredients.filter((i) => i.isPantryStaple).length} staples
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
          {validIngredients.length > 0 ? (
            validIngredients.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-[11px] font-mono bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 flex items-center gap-1.5"
              >
                <span>{item.name}</span>
                {item.quantity ? (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                    {`${item.quantity} ${item.unit || ""}`.trim()}
                  </span>
                ) : null}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-mono text-stone-400 italic">
              No ingredients imported (manual entry)
            </span>
          )}
        </div>
      </div>

      {/* Parsed Steps Snapshot */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Layers size={12} className="text-amber-700 dark:text-amber-400" />
            <span>Cooking Steps ({validInstructions.length})</span>
          </span>
          <span className="text-[10px] font-mono text-stone-400">Auto-Indexed</span>
        </div>

        <div className="divide-y divide-stone-200 dark:divide-stone-800 max-h-44 overflow-y-auto no-scrollbar">
          {validInstructions.length > 0 ? (
            validInstructions.map((step, idx) => (
              <div
                key={idx}
                className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 text-xs"
              >
                <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono font-extrabold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {step.title && (
                    <span className="font-bold text-stone-900 dark:text-stone-100 block truncate">
                      {step.title}
                    </span>
                  )}
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2">
                    {step.instruction}
                  </p>
                </div>
                {step.timerDurationSeconds > 0 && (
                  <span className="text-[10px] font-mono text-stone-400 shrink-0">
                    {Math.round(step.timerDurationSeconds / 60)}m
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-[11px] font-mono text-stone-400 italic">
              No steps imported (manual entry)
            </span>
          )}
        </div>
      </div>

      {/* Video Attached Badge */}
      {formData.videoUrl && (
        <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5 truncate">
            <Video size={13} className="text-rose-500 shrink-0" />
            <span className="text-[11px] truncate">{formData.videoUrl}</span>
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase shrink-0 ml-2">
            Linked
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;