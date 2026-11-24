// src/apps/recipes/components/RecipeDetails/RecipeTitleHero.jsx
import React from "react";
import { ChefHat, Camera, Pencil } from "lucide-react";

const RecipeTitleHero = ({ recipe, onEditSection }) => {
  const prepTime = recipe.prepTimeMinutes || 0;
  const cookTime = recipe.cookTimeMinutes || 0;
  const totalTime = prepTime + cookTime;
  const servings = recipe.baseServings || 4;
  const difficulty = recipe.difficulty || "Medium";
  const cuisine = recipe.cuisine || "Indian";
  const courseType = recipe.courseType || "Main Course";
  const dietaryFlags = recipe.dietaryFlags || {};

  return (
    <section className="space-y-3.5 sm:space-y-4">
      {/* Top Identity Row: Thumbnail + Title & Badges */}
      <div className="flex items-start gap-3 sm:gap-5">
        {/* Square Thumbnail Frame */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-600 bg-stone-900 shadow-sm relative">
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
              <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 gap-1 p-1.5">
                <ChefHat size={22} />
                <span className="text-[8px] uppercase tracking-widest text-stone-300 text-center font-mono leading-tight">
                  No Photo
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onEditSection("photo")}
              title="Update Cover Photo"
              className="absolute bottom-1 right-1 p-1.5 rounded-md bg-stone-950/85 hover:bg-amber-500 text-white hover:text-stone-950 border border-white/15 transition-colors cursor-pointer"
            >
              <Camera size={11} />
            </button>
          </div>
        </div>

        {/* Title, Badges & Edit Trigger */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top Metadata Strip + Compact Edit Button */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                {cuisine}
              </span>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600">
                {courseType}
              </span>

              {dietaryFlags?.isJain && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40">
                  Jain
                </span>
              )}
              {dietaryFlags?.isSwaminarayan && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                  Swaminarayan
                </span>
              )}
              {dietaryFlags?.isVegetarian && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40">
                  Veg
                </span>
              )}
              {dietaryFlags?.isVegan && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-lime-500/15 dark:bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-500/30 dark:border-lime-400/40">
                  Vegan
                </span>
              )}
              {dietaryFlags?.isGlutenFree && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 dark:border-sky-400/40">
                  GF
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onEditSection("details")}
              title="Edit Recipe Details"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer shrink-0"
            >
              <Pencil size={10} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* Heavy Impact Recipe Title */}
          <h1 className="text-lg sm:text-3xl lg:text-4xl font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-[1.08]">
            {recipe.title}
          </h1>

          {/* Desktop Description (Shown inline on sm+) */}
          {recipe.description && (
            <p className="hidden sm:block text-sm font-mono text-stone-700 dark:text-stone-200 leading-relaxed max-w-4xl pt-0.5">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* Mobile Full-Width Description (Prevents narrow cramped text beside thumbnail) */}
      {recipe.description && (
        <p className="sm:hidden text-xs font-mono text-stone-700 dark:text-stone-200 leading-relaxed line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Unified Telemetry Strip (Balanced 4-Col on Mobile, Single Rail on Desktop) */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700/80 bg-white/70 dark:bg-[#221E1A]/80 px-3 py-2 sm:px-4 sm:py-2.5">
        {/* Mobile Layout: Clean 4-Column Metrics + Compact Sub-bar */}
        <div className="sm:hidden space-y-2">
          <div className="grid grid-cols-4 divide-x divide-stone-200 dark:divide-stone-700 text-center">
            <div className="pr-1.5">
              <span className="block font-mono text-[10px] uppercase text-stone-500 dark:text-stone-400">
                Prep
              </span>
              <span className="font-mono font-extrabold text-xs text-stone-900 dark:text-white tabular-nums">
                {prepTime}m
              </span>
            </div>

            <div className="px-1.5">
              <span className="block font-mono text-[10px] uppercase text-stone-500 dark:text-stone-400">
                Cook
              </span>
              <span className="font-mono font-extrabold text-xs text-stone-900 dark:text-white tabular-nums">
                {cookTime}m
              </span>
            </div>

            <div className="px-1.5">
              <span className="block font-mono text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                Total
              </span>
              <span className="font-mono font-extrabold text-xs text-amber-700 dark:text-amber-300 tabular-nums">
                {totalTime}m
              </span>
            </div>

            <div className="pl-1.5">
              <span className="block font-mono text-[10px] uppercase text-stone-500 dark:text-stone-400">
                Yield
              </span>
              <span className="font-mono font-extrabold text-xs text-stone-900 dark:text-white tabular-nums">
                {servings}p
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-stone-200/80 dark:border-stone-700/70 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">Level:</span>
              <span className="font-extrabold text-stone-900 dark:text-white capitalize">
                {difficulty}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onEditSection("stats")}
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
            >
              <Pencil size={10} />
              <span>Edit Timings</span>
            </button>
          </div>
        </div>

        {/* Desktop Layout: Single Horizontal Telemetry Rail */}
        <div className="hidden sm:flex items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="inline-flex items-center gap-1.5">
              <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">
                Prep:
              </span>
              <span className="font-mono font-extrabold text-stone-900 dark:text-white tabular-nums">
                {prepTime} mins
              </span>
            </div>

            <span className="text-stone-300 dark:text-stone-600">•</span>

            <div className="inline-flex items-center gap-1.5">
              <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">
                Cook:
              </span>
              <span className="font-mono font-extrabold text-stone-900 dark:text-white tabular-nums">
                {cookTime} mins
              </span>
            </div>

            <span className="text-stone-300 dark:text-stone-600">•</span>

            <div className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
              <span className="font-mono text-[11px]">Total:</span>
              <span className="font-mono font-extrabold tabular-nums">
                {totalTime} mins
              </span>
            </div>

            <span className="text-stone-300 dark:text-stone-600">•</span>

            <div className="inline-flex items-center gap-1.5">
              <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">
                Servings:
              </span>
              <span className="font-mono font-extrabold text-stone-900 dark:text-white tabular-nums">
                {servings}
              </span>
            </div>

            <span className="text-stone-300 dark:text-stone-600">•</span>

            <div className="inline-flex items-center gap-1.5">
              <span className="font-mono text-stone-500 dark:text-stone-300 text-[11px]">
                Level:
              </span>
              <span className="font-mono font-extrabold text-stone-900 dark:text-white capitalize">
                {difficulty}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEditSection("stats")}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Pencil size={10} />
            <span>Edit Timings</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecipeTitleHero;