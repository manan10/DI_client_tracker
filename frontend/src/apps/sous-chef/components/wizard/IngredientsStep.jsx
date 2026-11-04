// src/apps/recipes/components/wizard/IngredientsStep.jsx
import React from "react";
import { Plus, Trash2 } from "lucide-react";

const IngredientsStep = ({
  ingredients,
  validCount,
  onAddIngredient,
  onRemoveIngredient,
  onIngredientChange,
}) => {
  return (
    <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Ingredients Checklist ({validCount} item{validCount === 1 ? "" : "s"})
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Provide ingredient names and measures. Items marked as staple won't trigger missing grocery alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddIngredient}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {ingredients.map((ing, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 w-5 text-center">
                {idx + 1}.
              </span>
              <input
                required
                type="text"
                placeholder="Ingredient name (e.g. Besan / Gram Flour)"
                value={ing.name}
                onChange={(e) => onIngredientChange(idx, "name", e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <button
                type="button"
                onClick={() => onRemoveIngredient(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                title="Remove ingredient"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pl-7">
              <input
                required
                type="number"
                step="0.05"
                min="0"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => onIngredientChange(idx, "quantity", e.target.value)}
                className="bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />

              <input
                type="text"
                placeholder="Unit (tsp, cup, gm)"
                value={ing.unit}
                onChange={(e) => onIngredientChange(idx, "unit", e.target.value)}
                className="bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />

              <label className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ing.isPantryStaple}
                  onChange={(e) => onIngredientChange(idx, "isPantryStaple", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                  Staple
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientsStep;