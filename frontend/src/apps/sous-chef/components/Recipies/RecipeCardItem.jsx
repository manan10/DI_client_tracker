// src/apps/recipes/components/Recipies/RecipeCardItem.jsx
import React from "react";
import { Clock, Play, UtensilsCrossed, ChevronRight } from "lucide-react";

const RecipeCardItem = ({ item, onOpenCookMode, onViewDetails }) => {
  const totalTime = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#151311] border border-stone-200/90 dark:border-[#2C241E] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Banner Thumbnail */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-100 dark:bg-[#1E1915] overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <UtensilsCrossed size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

        {item.video?.embedUrl && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs backdrop-blur-xs">
            <Play size={10} fill="currentColor" />
            Video
          </span>
        )}

        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/65 text-white backdrop-blur-xs">
          {item.cuisine || "General"}
        </span>
      </div>

      {/* Details Body */}
      <div className="p-4 sm:p-4.5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={onViewDetails}
            className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-[#f59e0b] transition-colors line-clamp-1 cursor-pointer"
          >
            {item.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-2">
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock size={12} className="text-amber-600 dark:text-amber-500" />
              {totalTime} mins
            </span>
            <span>•</span>
            <span className="capitalize">{item.difficulty || "Easy"}</span>
            <span>•</span>
            <span>{item.ingredients?.length || 0} ingredients</span>
          </div>
        </div>

        {/* Scaled Ingredients Snapshot */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="pt-2.5 border-t border-stone-100 dark:border-[#2C241E] flex flex-wrap gap-1">
            {item.ingredients.slice(0, 3).map((ing, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-300 font-medium"
              >
                {typeof ing === "string" ? ing : ing.name}
              </span>
            ))}
            {item.ingredients.length > 3 && (
              <span className="text-[10px] text-stone-400 self-center font-medium">
                +{item.ingredients.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-stone-50/70 dark:bg-white/[0.02] border-t border-stone-100 dark:border-[#2C241E] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenCookMode}
          className="text-xs font-serif italic text-amber-800 dark:text-[#f59e0b] hover:underline font-bold py-1.5 px-1 cursor-pointer"
        >
          Cook Mode
        </button>

        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-[#f59e0b] transition-all cursor-pointer active:scale-95"
        >
          <span>View Recipe</span>
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default RecipeCardItem;