// src/apps/recipes/components/Recipies/CuisinePills.jsx
import React from "react";

const CuisinePills = ({ cuisines, selectedCuisine, onSelectCuisine }) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {cuisines.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              type="button"
              onClick={() => onSelectCuisine(cuisine)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#f59e0b] text-[#151311] shadow-xs"
                  : "bg-white dark:bg-[#151311] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#2C241E] hover:bg-stone-50 dark:hover:bg-white/5"
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