// src/apps/recipes/components/CookMode/MiseEnPlaceList.jsx
import React from "react";
import { Check } from "lucide-react";

const MiseEnPlaceList = ({
  groupedIngredients,
  checkedIngredients,
  onToggleIngredient,
  formatScaledQty,
}) => {
  return (
    <div className="space-y-4">
      {groupedIngredients.map((group) => {
        const GroupIcon = group.Icon;
        return (
          <div key={group.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-sans font-[1000] uppercase tracking-tight text-stone-600 dark:text-stone-300 px-0.5">
              <div className="flex items-center gap-1.5">
                <GroupIcon size={13} className={group.iconColor} />
                <span>{group.title}</span>
              </div>
              <span className="font-mono text-[10px] opacity-70">
                {group.items.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {group.items.map((ing) => {
                const isChecked = Boolean(checkedIngredients[ing.originalIdx]);
                const qty = formatScaledQty(ing.quantity);

                return (
                  <button
                    key={ing.originalIdx}
                    type="button"
                    onClick={() => onToggleIngredient(ing.originalIdx)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left text-xs font-mono transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500/30 opacity-50 line-through"
                        : "bg-white dark:bg-[#1B1714] border-stone-200 dark:border-stone-800 hover:border-amber-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-stone-400 dark:border-stone-600"
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1">
                            ({ing.notes})
                          </span>
                        )}
                      </div>
                    </div>

                    {(qty !== "" || ing.unit) && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-extrabold shrink-0 tabular-nums border ${group.badgeClass}`}
                      >
                        {qty} {ing.unit}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiseEnPlaceList;