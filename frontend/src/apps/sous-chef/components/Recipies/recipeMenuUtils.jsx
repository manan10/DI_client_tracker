// src/apps/recipes/components/Recipies/recipeMenuUtils.jsx
import React from "react";

const PANTRY_STAPLES = new Set([
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

export const SUBGROUP_THRESHOLD = 7;

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

// Classifies a recipe strictly by dish identity (title first, cuisine fallback)
export const classifyMenuSection = (recipe) => {
  const title = (recipe.title || "").toLowerCase().trim();
  const cuisine = (recipe.cuisine || "").toLowerCase().trim();

  // 1. Frankies & Wraps (Exclude main curries served "with ... roll")
  if (
    /\b(frankie|wrap)\b/.test(title) ||
    (!/\bwith\b/.test(title) && /\broll\b/.test(title))
  ) {
    return "Frankies & Wraps";
  }

  // 2. Sandwiches & Loaded Toasts
  if (/\b(sandwich|sandwiches|sandwitches|toast)\b/.test(title)) {
    return "Sandwiches & Loaded Toasts";
  }

  // 3. Burgers, Puffs & Bakes
  if (/\b(burger|puff|garlic bread|au gratin)\b/.test(title)) {
    return "Burgers, Puffs & Bakes";
  }

  // 4. Italian & Pasta (Separate from Continental)
  if (
    /\b(pasta|spaghetti|spagetti|penne|macaroni|arrabiata|marinara|pesto|lasagna|risotto)\b/.test(
      title
    ) ||
    cuisine === "italian"
  ) {
    return "Italian & Pasta";
  }

  // 5. Continental & Sizzlers
  if (
    /\b(paprika sauce|tandoori sauce|sizzler|fondue)\b/.test(title) ||
    cuisine === "continental"
  ) {
    return "Continental & Sizzlers";
  }

  // 6. Indo-Chinese & Asian
  if (
    /\b(manchurian|schezwan|hakka|noodle|noodles|fried rice|burnt garlic|burnt chilli|paneer chilli|chilli paneer|spring roll|momos)\b/.test(
      title
    ) ||
    cuisine === "asian" ||
    cuisine === "chinese" ||
    cuisine === "indo-chinese"
  ) {
    return "Indo-Chinese & Asian";
  }

  // 7. Mexican
  if (
    /\b(mexican|burrito|nachos|taco|tacos|quesadilla|enchilada)\b/.test(title) ||
    cuisine === "mexican"
  ) {
    return "Mexican";
  }

  // 8. South Indian
  if (
    /\b(dosa|idli|uttapam|sambhar|sambar|medu vada|appe|appam)\b/.test(title) ||
    cuisine === "south indian"
  ) {
    return "South Indian";
  }

  // 9. Gujarati Farsan & Steamed Snacks
  if (
    /\b(dhokla|khaman|khandvi|locho|idla|patra|handvo|muthiya|farsan)\b/.test(
      title
    )
  ) {
    return "Gujarati Farsan & Steamed Snacks";
  }

  // 10. Mumbai Street Food & Pav
  if (
    /\b(pav bhaji|pav bhaaji|vadapav|vada pav|dabeli|thecha|masala pav|misal pav)\b/.test(
      title
    )
  ) {
    return "Mumbai Street Food & Pav";
  }

  // 11. Chaat & Quick Tiffin
  if (
    /\b(chaat|pani puri|aloopuri|aloo puri|sev puri|bhel|dahi puri|ragda|maggi|fries|collegian|chapata chana|chana dal)\b/.test(
      title
    )
  ) {
    return "Chaat & Quick Tiffin";
  }

  // 12. Breakfast, Chilla & Waffles
  if (
    /\b(poha|waffle|waffles|pancake|pancakes|chilla|oats|bread butter|nutella|paratha|parantha|upma|thepla)\b/.test(
      title
    )
  ) {
    return "Breakfast, Chilla & Waffles";
  }

  // 13. Mithai & Desserts
  if (
    /\b(halwa|kheer|laddoo|ladoo|sweet|dessert|mithai|cake|shrikhand|basundi|gulab jamun|rasmalai)\b/.test(
      title
    )
  ) {
    return "Mithai & Desserts";
  }

  // 14. Rice, Pulao & Khichdi (Checked BEFORE Dals so "Dal Khichdi" goes into Khichdi/Rice, while "Dal Tadka Aur Jeera Rice" stays in Dals)
  if (
    /\b(khichdi|pulao|biryani|vagharelo bhaat|bhaat|rice)\b/.test(title) &&
    !/\bdal tadka\b/.test(title)
  ) {
    return "Rice, Pulao & Khichdi";
  }

  // 15. Dals (Pure Dal section without Kadhi)
  if (/\b(dal|daal)\b/.test(title)) {
    return "Dals";
  }

  // 16. North Indian Curries
  if (
    /\b(paneer|curry|masala|makhani|lababdar|angara|changezi|lasooni|methi malai|patiala|tikka|shahi|hyderabadi|ghotalo|bhurji|kofta|angoori|kaju|mushroom|handi|kadai)\b/.test(
      title
    )
  ) {
    return "North Indian Curries";
  }

  // 17. Chole, Rajma & Pulses
  if (
    /\b(chole|chana masala|pindi chole|rajma|moong|sev usal|sprout|lobia|kathol)\b/.test(
      title
    )
  ) {
    return "Chole, Rajma & Pulses";
  }

  // 18. Ghar Nu Shaak (Daily Home Vegetable Sabjis)
  if (
    /\b(shaak|sabji|bhindi|kanda bataka|sev tameta|cauliflower|cabbage|lauki|dudhi|mix veg|baingan|gobi|methi|tinda|parwal|karela|valor|tuvar)\b/.test(
      title
    )
  ) {
    return "Ghar Nu Shaak (Daily Sabjis)";
  }

  return "House Specialties";
};

// Sub-group classifier used automatically when a single group has >= SUBGROUP_THRESHOLD dishes
const getSubGroupLabel = (recipe, groupBy, parentGroupName = "") => {
  const title = (recipe.title || "").toLowerCase().trim();
  const cuisine = (recipe.cuisine || "").toLowerCase().trim();

  if (groupBy === "CUISINE") {
    // 1. Format checks FIRST (so "Pav Bhaji Masala Toast" & "Paneer Chilli" don't leak into North Indian Curries!)
    if (/\b(sandwich|sandwiches|sandwitches|toast)\b/.test(title)) {
      return "Sandwiches & Loaded Toasts";
    }
    if (/\b(frankie|wrap)\b/.test(title)) {
      return "Frankies & Wraps";
    }
    if (/\b(burger|puff)\b/.test(title)) {
      return "Burgers & Puffs";
    }
    if (/\b(pav|dabeli|vadapav|vada pav)\b/.test(title)) {
      return "Mumbai Street & Pav";
    }
    if (
      cuisine === "asian" ||
      cuisine === "chinese" ||
      cuisine === "indo-chinese"
    ) {
      if (/\b(fried rice|rice)\b/.test(title)) return "Fried Rice";
      if (/\b(noodle|noodles|hakka)\b/.test(title)) return "Noodles";
      return "Wok Starters & Gravy";
    }

    // 2. Rice & Khichdi (checked before Dals so Dal Khichdi lands here)
    if (
      /\b(khichdi|rice|pulao|biryani|bhaat)\b/.test(title) &&
      !/\bdal tadka\b/.test(title)
    ) {
      return "Rice, Pulao & Khichdi";
    }

    // 3. Dals
    if (/\b(dal|daal)\b/.test(title)) {
      return cuisine === "north indian" ? "North Indian Dals" : "Dals & One-Pot Meals";
    }

    // 4. Gujarati Farsan & Steamed
    if (/\b(dhokla|khaman|khandvi|locho|idla)\b/.test(title)) {
      return "Gujarati Farsan & Steamed";
    }

    // 5. Ghar Nu Shaak
    if (
      /\b(bhindi|bataka|tameta|cauliflower|cabbage|lauki|mix veg|shaak)\b/.test(
        title
      )
    ) {
      return "Ghar Nu Shaak (Daily Sabjis)";
    }

    // 6. Chole, Rajma & Pulses
    if (/\b(chole|rajma|moong|usal|chana)\b/.test(title)) {
      return "Chole, Rajma & Pulses";
    }

    // 7. North Indian & Paneer Curries
    if (
      /\b(paneer|cheese angoori|malai kofta|mushroom|kaju|curry|masala|makhani|lababdar|angara|changezi|lasooni|shahi|hyderabadi|ghotalo|bhurji)\b/.test(
        title
      )
    ) {
      return "Paneer & Rich Curries";
    }

    return recipe.courseType || "Signature Mains";
  }

  if (groupBy === "SECTION" || groupBy === "INGREDIENT") {
    // Context-aware sub-grouping for "Dals" -> North Indian Dals vs Other Dals
    if (parentGroupName === "Dals" || /\b(dal|daal)\b/.test(title)) {
      if (/\b(dhokli)\b/.test(title) || (cuisine && cuisine !== "north indian")) {
        return "Other Dals";
      }
      return "North Indian Dals";
    }

    // Context-aware sub-grouping for "Indo-Chinese & Asian" -> Fried Rice, Noodles, Wok Starters
    if (
      parentGroupName === "Indo-Chinese & Asian" ||
      cuisine === "asian" ||
      cuisine === "chinese" ||
      cuisine === "indo-chinese"
    ) {
      if (/\b(fried rice|rice)\b/.test(title)) {
        return "Fried Rice";
      }
      if (/\b(noodle|noodles|hakka)\b/.test(title)) {
        return "Noodles";
      }
      return "Wok Starters & Gravy";
    }

    // Context-aware sub-grouping for "Italian & Pasta"
    if (parentGroupName === "Italian & Pasta" || cuisine === "italian") {
      if (/\b(spaghetti|spagetti)\b/.test(title)) {
        return "Spaghetti";
      }
      return "Penne & Classic Pasta";
    }

    // Context-aware sub-grouping for "North Indian Curries"
    if (/\b(paneer)\b/.test(title)) {
      return "Paneer Curries & Tawa";
    }
    if (/\b(kofta|angoori|kaju|mushroom|curry|masala)\b/.test(title)) {
      return "Kaju, Kofta & Veg Curries";
    }

    // Sandwiches & Toasts
    if (/\b(sandwich)\b/.test(title)) {
      return "Sandwiches";
    }
    if (/\b(toast)\b/.test(title)) {
      return "Loaded Toasts";
    }

    // Frankies & Wraps
    if (/\b(paneer)\b/.test(title) && /\b(frankie|wrap)\b/.test(title)) {
      return "Paneer Frankies";
    }
    if (/\b(frankie|wrap)\b/.test(title)) {
      return "Veg & Noodle Frankies";
    }

    return recipe.cuisine || recipe.courseType || "House Selection";
  }

  return recipe.cuisine || "General";
};

/**
 * Splits a section's items into sub-groups if items.length >= SUBGROUP_THRESHOLD
 * and at least 2 distinct sub-groups emerge. Otherwise returns a single unnamed sub-group.
 */
export const buildSubGroups = (items, groupBy, parentGroupName = "") => {
  if (!items || items.length < SUBGROUP_THRESHOLD) {
    return [{ subGroupName: null, items }];
  }

  const buckets = {};
  items.forEach((item) => {
    const label = getSubGroupLabel(item, groupBy, parentGroupName);
    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(item);
  });

  const keys = Object.keys(buckets);
  if (keys.length <= 1) {
    return [{ subGroupName: null, items }];
  }

  return keys
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      subGroupName: key,
      items: buckets[key],
    }));
};