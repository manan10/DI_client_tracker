// src/apps/recipes/components/Recipies/RecipeCardItem.jsx
import React from "react";
import { ChefHat, Play, Flame, ArrowUpRight } from "lucide-react";

const RecipeCardItem = ({ item, dishNumber = "01", onOpenCookMode, onViewDetails }) => {
  const prepTime = item.prepTimeMinutes || 0;
  const cookTime = item.cookTimeMinutes || 0;
  const totalTime = prepTime + cookTime;
  const dietaryFlags = item.dietaryFlags || {};

  const ingredientNames = (item.ingredients || [])
    .slice(0, 5)
    .map((ing) => (typeof ing === "string" ? ing : ing.name))
    .filter(Boolean);

  return (
    <article
      onClick={onViewDetails}
      className="group flex flex-col justify-between border-b-2 border-stone-200 dark:border-stone-800 hover:border-amber-500/60 dark:hover:border-amber-400/60 pb-4 transition-colors cursor-pointer select-none"
    >
      <div>
        {/* Framed Dish Photograph */}
        <div className="relative h-48 sm:h-52 w-full rounded-xl overflow-hidden border border-stone-300 dark:border-stone-600 bg-stone-900 shadow-sm mb-3.5">
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 p-2">
              <ChefHat size={26} />
              <span className="text-[9px] uppercase tracking-widest text-stone-300 text-center font-mono">
                No Photo
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

          {/* Top Left Plate Number */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold tabular-nums bg-black/80 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
            NO. {dishNumber}
          </span>

          {/* Top Right Video Badge */}
          {item.video?.embedUrl && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              <Play size={9} fill="currentColor" />
              Video
            </span>
          )}

          {/* Bottom Image Tags */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-white border border-stone-600 backdrop-blur-xs">
                {item.courseType || item.cuisine || "Main"}
              </span>
              {dietaryFlags.isJain && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-400/40">
                  Jain
                </span>
              )}
              {dietaryFlags.isSwaminarayan && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-400/40">
                  Swaminarayan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title + Dotted Menu Leader + Total Time */}
        <div className="flex items-baseline gap-2">
          <h3 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-xl text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors truncate leading-tight">
            {item.title}
          </h3>

          <div className="flex-1 border-b border-dotted border-stone-400 dark:border-stone-600 min-w-[16px] relative -top-1" />

          <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-700 dark:text-amber-300 tabular-nums shrink-0">
            {totalTime} mins
          </span>
        </div>

        {/* Monospace Ingredient Notes */}
        <p className="text-xs font-mono text-stone-700 dark:text-stone-200 mt-1.5 line-clamp-2 leading-relaxed">
          {ingredientNames.length > 0
            ? ingredientNames.join(" • ")
            : item.description || "Signature house preparation."}
        </p>
      </div>

      {/* Mini Telemetry Strip & Cook Mode Trigger */}
      <div className="flex items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <span>
            Prep:{" "}
            <strong className="font-extrabold text-stone-900 dark:text-white tabular-nums">
              {prepTime}m
            </strong>
          </span>
          <span>•</span>
          <span>
            Level:{" "}
            <strong className="font-extrabold text-stone-900 dark:text-white capitalize">
              {item.difficulty || "Medium"}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCookMode();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 hover:bg-[#f59e0b] text-amber-800 dark:text-amber-300 hover:text-[#140F0A] border border-amber-500/30 dark:border-amber-400/40 transition-colors cursor-pointer"
        >
          <Flame size={11} />
          <span>Cook Mode</span>
          <ArrowUpRight size={11} />
        </button>
      </div>
    </article>
  );
};

export default RecipeCardItem;