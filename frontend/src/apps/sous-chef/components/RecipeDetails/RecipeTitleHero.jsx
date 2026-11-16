// src/apps/recipes/components/RecipeDetails/RecipeTitleHero.jsx
import React from "react";
import { ChefHat } from "lucide-react";

const RecipeTitleHero = ({ recipe }) => {
  const prepTime = recipe.prepTimeMinutes || 0;
  const cookTime = recipe.cookTimeMinutes || 0;
  const totalTime = prepTime + cookTime;
  const servings = recipe.baseServings || 4;
  const difficulty = recipe.difficulty || "Medium";
  const cuisine = recipe.cuisine || "Indian";
  const courseType = recipe.courseType || "Main Course";
  const dietaryFlags = recipe.dietaryFlags || {};

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex flex-row items-start gap-3.5 sm:gap-5 md:gap-6">
        {/* Thumbnail Frame */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-36 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-600 bg-stone-900 shadow-md">
            {recipe.coverImage ? (
              <img
                src={recipe.coverImage}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 p-2">
                <ChefHat size={24} />
                <span className="text-[9px] uppercase tracking-widest text-stone-300 text-center font-mono">
                  No Photo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details Block */}
        <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
              {cuisine}
            </span>

            <span className="px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600">
              {courseType}
            </span>

            {dietaryFlags?.isJain && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40">
                Jain
              </span>
            )}
            {dietaryFlags?.isSwaminarayan && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                Swaminarayan
              </span>
            )}
            {dietaryFlags?.isVegetarian && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40">
                Vegetarian
              </span>
            )}
            {dietaryFlags?.isVegan && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-lime-500/15 dark:bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-500/30 dark:border-lime-400/40">
                Vegan
              </span>
            )}
            {dietaryFlags?.isGlutenFree && (
              <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 dark:border-sky-400/40">
                Gluten-Free
              </span>
            )}
          </div>

          {/* Heavy Impact Title */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-[1.05]">
            {recipe.title}
          </h1>

          {/* High-Contrast Monospace Description */}
          {recipe.description && (
            <p className="text-xs sm:text-sm font-mono text-stone-700 dark:text-stone-200 leading-relaxed max-w-4xl line-clamp-3 sm:line-clamp-none">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="py-2.5 sm:py-3 border-y border-stone-200 dark:border-stone-700/80">
        {/* Mobile View: 3-column top + 2-column bottom */}
        <div className="grid grid-cols-3 sm:hidden gap-y-2 gap-x-2 text-left">
          <div className="flex flex-col">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Prep</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {prepTime} mins
            </span>
          </div>

          <div className="flex flex-col border-l border-stone-200 dark:border-stone-700 pl-2">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Cook</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {cookTime} mins
            </span>
          </div>

          <div className="flex flex-col border-l border-stone-200 dark:border-stone-700 pl-2">
            <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px]">Total</span>
            <span className="font-extrabold text-amber-700 dark:text-amber-300 text-xs font-mono tabular-nums">
              {totalTime} mins
            </span>
          </div>

          <div className="flex flex-col pt-1.5 border-t border-stone-200 dark:border-stone-700">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Servings</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {servings} people
            </span>
          </div>

          <div className="flex flex-col pt-1.5 border-t border-stone-200 dark:border-stone-700 border-l pl-2 col-span-2">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Level</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs capitalize">
              {difficulty}
            </span>
          </div>
        </div>

        {/* Desktop View: Horizontal Rail */}
        <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-none">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Prep:</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {prepTime} mins
            </span>
            <span className="text-[9px] text-stone-300 dark:text-stone-500 select-none ml-1.5">•</span>
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Cook:</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {cookTime} mins
            </span>
            <span className="text-[9px] text-stone-300 dark:text-stone-500 select-none ml-1.5">•</span>
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap text-amber-700 dark:text-amber-300 font-bold">
            <span className="font-mono text-[11px]">Total Duration:</span>
            <span className="font-extrabold font-mono text-xs tabular-nums">{totalTime} mins</span>
            <span className="text-[9px] text-stone-300 dark:text-stone-500 select-none ml-1.5 font-normal">•</span>
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Servings:</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs tabular-nums">
              {servings}
            </span>
            <span className="text-[9px] text-stone-300 dark:text-stone-500 select-none ml-1.5">•</span>
          </div>

          <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">Level:</span>
            <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs capitalize">
              {difficulty}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeTitleHero;