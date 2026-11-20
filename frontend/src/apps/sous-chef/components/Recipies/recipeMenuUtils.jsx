// src/apps/recipes/components/Recipies/recipeMenuUtils.jsx
import React from "react";

export const PANTRY_STAPLES = new Set([
  "water",
  "warm water",
  "hot water",
  "cold water",
  "salt",
  "rock salt",
  "black salt",
  "oil",
  "cooking oil",
  "vegetable oil",
  "sunflower oil",
  "refined oil",
  "butter",
  "ghee",
  "sugar",
  "ice",
]);

export const slugifySection = (str) =>
  `menu-sec-${String(str || "section")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

export const getDishSubtext = (item) => {
  if (item.description && item.description.trim()) {
    return item.description.trim();
  }

  const heroIngredients = (item.ingredients || [])
    .map((ing) => (typeof ing === "string" ? ing : ing.name || "").trim())
    .filter((name) => name && !PANTRY_STAPLES.has(name.toLowerCase()))
    .slice(0, 5);

  if (heroIngredients.length > 0) {
    return `Prepared with ${heroIngredients.join(", ")}.`;
  }

  return "Signature house preparation.";
};

export const getCarteIngredientsLine = (item) => {
  const heroIngredients = (item.ingredients || [])
    .map((ing) => (typeof ing === "string" ? ing : ing.name || "").trim())
    .filter((name) => name && !PANTRY_STAPLES.has(name.toLowerCase()))
    .slice(0, 5);

  if (heroIngredients.length > 0) {
    return heroIngredients.join(" · ");
  }
  if (item.description && item.description.trim()) {
    return item.description.trim();
  }
  return item.courseType || "House Preparation";
};

export const formatDurationCompact = (item) => {
  const total = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);
  if (total <= 0) return "Quick";
  return `${total}m`;
};

export const formatDurationFull = (item) => {
  const total = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);
  if (total <= 0) return "Quick Prep";
  return `${total} mins`;
};

export const renderDietaryCodes = (item) => {
  const flags = item.dietaryFlags || {};
  return (
    <span className="inline-flex items-center gap-1 ml-1.5 align-middle">
      {flags.isJain && (
        <span
          className="px-1 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
          title="Jain Preparation"
        >
          J
        </span>
      )}
      {flags.isSwaminarayan && (
        <span
          className="px-1 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30"
          title="Swaminarayan"
        >
          SW
        </span>
      )}
      {flags.isVegan && (
        <span
          className="px-1 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase bg-lime-500/15 dark:bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-500/30"
          title="Vegan"
        >
          VG
        </span>
      )}
      {flags.isGlutenFree && (
        <span
          className="px-1 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30"
          title="Gluten-Free"
        >
          GF
        </span>
      )}
    </span>
  );
};