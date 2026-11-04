// src/apps/recipes/components/Recipies/RecipeListItem.jsx
import React from "react";
import { Clock, Play, UtensilsCrossed, ChevronRight } from "lucide-react";

const RecipeListItem = ({ item, onOpenCookMode, onViewDetails }) => {
  const totalTime = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 sm:py-3 hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.06] transition-colors gap-3">
      {/* Thumbnail & Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          onClick={onViewDetails}
          className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-stone-100 dark:bg-[#1E1915] overflow-hidden shrink-0 border border-stone-200 dark:border-[#2C241E] flex items-center justify-center cursor-pointer"
        >
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <UtensilsCrossed size={18} className="text-stone-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              onClick={onViewDetails}
              className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-[#f59e0b] cursor-pointer truncate"
            >
              {item.title}
            </h4>
            {item.video?.embedUrl && (
              <span className="p-1 rounded-full bg-rose-600 text-white shrink-0" title="Video Available">
                <Play size={8} fill="currentColor" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span className="font-semibold text-amber-600 dark:text-[#f59e0b]">
              {item.cuisine || "General"}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock size={11} />
              {totalTime}m
            </span>
            <span>•</span>
            <span className="capitalize">{item.difficulty || "Easy"}</span>
          </div>
        </div>
      </div>

      {/* Key Ingredients (Hidden on small mobile screens) */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-sm truncate text-xs text-stone-500 dark:text-stone-400">
        <span className="font-semibold text-stone-400">Ingredients:</span>
        <span className="truncate">
          {(item.ingredients || [])
            .slice(0, 4)
            .map((ing) => (typeof ing === "string" ? ing : ing.name))
            .join(", ") || "—"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={onOpenCookMode}
          className="px-3 py-1.5 text-xs font-serif italic font-bold text-amber-800 dark:text-[#f59e0b] hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
        >
          Cook Mode
        </button>

        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
        >
          <span>View</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RecipeListItem;