// src/apps/recipes/components/Recipies/RecipeListItem.jsx
import React from "react";
import { ChefHat, Play, Flame, ArrowUpRight } from "lucide-react";

const RecipeListItem = ({ item, dishNumber = "01", onOpenCookMode, onViewDetails }) => {
  const prepTime = item.prepTimeMinutes || 0;
  const cookTime = item.cookTimeMinutes || 0;
  const totalTime = prepTime + cookTime;
  const dietaryFlags = item.dietaryFlags || {};

  // Build authentic restaurant-menu ingredient line
  const ingredientNames = (item.ingredients || [])
    .slice(0, 6)
    .map((ing) => (typeof ing === "string" ? ing : ing.name))
    .filter(Boolean);

  return (
    <article
      onClick={onViewDetails}
      className="group relative flex items-start gap-3.5 sm:gap-4 py-3.5 sm:py-4 border-b border-stone-200/90 dark:border-stone-800/90 hover:border-stone-400 dark:hover:border-stone-600 transition-colors cursor-pointer select-none"
    >
      {/* Dish Portrait Thumbnail (Matches RecipeTitleHero Frame) */}
      <div className="relative shrink-0">
        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-600 bg-stone-900 shadow-xs">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 p-1">
              <ChefHat size={18} />
              <span className="text-[8px] uppercase tracking-widest text-stone-300 text-center font-mono">
                No Photo
              </span>
            </div>
          )}
        </div>

        {/* Plate Number Badge */}
        <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold tabular-nums bg-stone-900 dark:bg-stone-100 text-amber-400 dark:text-stone-900 border border-stone-700 dark:border-stone-300 shadow-2xs">
          {dishNumber}
        </span>

        {item.video?.embedUrl && (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs border border-white dark:border-stone-900"
            title="Video Guide Available"
          >
            <Play size={9} fill="currentColor" />
          </span>
        )}
      </div>

      {/* Menu Entry Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[5rem] sm:min-h-[6rem]">
        <div>
          {/* Row 1: Dish Title + Dotted Menu Leader + Total Time */}
          <div className="flex items-baseline gap-2">
            <h3 className="font-sans font-[1000] uppercase tracking-tighter text-base sm:text-lg text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors truncate leading-tight">
              {item.title}
            </h3>

            {/* Dotted Menu Leader */}
            <div className="flex-1 border-b border-dotted border-stone-400 dark:border-stone-600 min-w-[16px] relative -top-1" />

            {/* Time Column ("Menu Price" Slot) */}
            <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-700 dark:text-amber-300 tabular-nums shrink-0 leading-none">
              {totalTime > 0 ? `${totalTime} mins` : "—"}
            </span>
          </div>

          {/* Row 2: Monospace Ingredient Breakdown / Description */}
          <p className="text-xs font-mono text-stone-700 dark:text-stone-200 mt-1 line-clamp-2 leading-relaxed">
            {ingredientNames.length > 0
              ? ingredientNames.join(" • ")
              : item.description || "Signature house preparation."}
          </p>
        </div>

        {/* Row 3: Telemetry & Dietary Tags (Exact RecipeTitleHero Badges) + Cook Action */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600">
              {item.courseType || item.cuisine || "Main"}
            </span>

            <span className="text-[10px] font-mono font-extrabold text-stone-600 dark:text-stone-300 capitalize">
              {item.difficulty || "Medium"}
            </span>

            {dietaryFlags.isJain && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40">
                Jain
              </span>
            )}

            {dietaryFlags.isSwaminarayan && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                Swaminarayan
              </span>
            )}

            {dietaryFlags.isVegan && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-lime-500/15 dark:bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-500/30 dark:border-lime-400/40">
                Vegan
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCookMode();
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 hover:bg-[#f59e0b] text-amber-800 dark:text-amber-300 hover:text-[#140F0A] border border-amber-500/30 dark:border-amber-400/40 transition-colors cursor-pointer shrink-0"
            title="Start Cook Mode"
          >
            <Flame size={10} />
            <span>Cook</span>
            <ArrowUpRight size={10} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecipeListItem;