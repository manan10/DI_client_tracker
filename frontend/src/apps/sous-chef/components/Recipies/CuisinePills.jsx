// src/apps/recipes/components/Recipies/CuisinePills.jsx
import React from "react";

const CuisinePills = ({ cuisines, selectedCuisine, onSelectCuisine }) => {
  return (
    <div className="w-full pt-1">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mr-1 shrink-0 select-none">
          Menu Section:
        </span>
        {cuisines.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              type="button"
              onClick={() => onSelectCuisine(cuisine)}
              className={`px-3 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-amber-500/20 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 dark:border-amber-400/50 font-extrabold shadow-2xs"
                  : "bg-stone-200/70 dark:bg-[#2A2520] text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CuisinePills;