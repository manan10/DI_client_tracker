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

// Classifies a recipe into granular restaurant Menu Sections
export const classifyMenuSection = (recipe) => {
  const title = (recipe.title || "").toLowerCase();
  const cuisine = (recipe.cuisine || "").toLowerCase();
  const course = (recipe.courseType || "").toLowerCase();
  const tags = (recipe.tags || []).join(" ").toLowerCase();
  const text = `${title} ${cuisine} ${course} ${tags}`;

  // 1. Frankies & Wraps
  if (/\b(frankie|wrap|roll)\b/.test(title)) {
    return "Frankies & Wraps";
  }

  // 2. Sandwiches & Loaded Toasts (Dedicated category)
  if (/\b(sandwich|sandwiches|sandwitches|toast)\b/.test(title)) {
    return "Sandwiches & Loaded Toasts";
  }

  // 3. Burgers, Puffs & Bakes
  if (/\b(burger|puff|garlic bread|baked|au gratin)\b/.test(text)) {
    return "Burgers, Puffs & Bakes";
  }

  // 4. Italian & Pasta (Separate from Continental)
  if (
    /\b(italian|pasta|spaghetti|spagetti|penne|macaroni|arrabiata|marinara|pesto|lasagna|risotto)\b/.test(
      text
    )
  ) {
    return "Italian & Pasta";
  }

  // 5. Continental & Sizzlers (Separate from Italian)
  if (
    /\b(continental|paprika sauce|tandoori sauce|sizzler|fondue)\b/.test(text)
  ) {
    return "Continental & Sizzlers";
  }

  // 6. Indo-Chinese & Asian
  if (
    /\b(asian|chinese|manchurian|schezwan|hakka|noodle|fried rice|burnt garlic|burnt chilli|paneer chilli|chilli paneer|spring roll|momos)\b/.test(
      text
    )
  ) {
    return "Indo-Chinese & Asian";
  }

  // 7. Mexican
  if (/\b(mexican|burrito|nachos|taco|quesadilla|enchilada)\b/.test(text)) {
    return "Mexican";
  }

  // 8. South Indian
  if (
    /\b(south indian|dosa|idli|uttapam|sambhar|sambar|medu vada|appe|appam)\b/.test(
      text
    )
  ) {
    return "South Indian";
  }

  // 9. Breakfast, Chilla & Waffles
  if (
    /\b(breakfast|poha|waffle|pancake|chilla|oats|bread butter|nutella|paratha|parantha|upma|thepla)\b/.test(
      text
    )
  ) {
    return "Breakfast, Chilla & Waffles";
  }

  // 10. Gujarati Farsan & Steamed Snacks
  if (
    /\b(dhokla|khaman|khandvi|locho|idla|patra|handvo|muthiya|farsan)\b/.test(
      text
    )
  ) {
    return "Gujarati Farsan & Steamed Snacks";
  }

  // 11. Mumbai Street Food & Pav
  if (
    /\b(pav bhaji|pav bhaaji|vadapav|vada pav|dabeli|thecha|masala pav|misal pav)\b/.test(
      text
    )
  ) {
    return "Mumbai Street Food & Pav";
  }

  // 12. Chaat & Quick Tiffin
  if (
    /\b(chaat|pani puri|aloopuri|aloo puri|sev puri|bhel|dahi puri|ragda|maggi|fries|collegian|chapata chana|chana dal)\b/.test(
      text
    )
  ) {
    return "Chaat & Quick Tiffin";
  }

  // 13. Mithai & Desserts
  if (
    /\b(halwa|kheer|laddoo|ladoo|sweet|dessert|mithai|cake|shrikhand|basundi|gulab jamun|rasmalai)\b/.test(
      text
    )
  ) {
    return "Mithai & Desserts";
  }

  // 14. Ghar Nu Shaak (Daily Home Vegetable Sabjis)
  if (
    /\b(shaak|sabji|bhindi|kanda bataka|sev tameta|cauliflower|cabbage|lauki|dudhi|mix veg|baingan|gobi|methi|tinda|parwal|karela|valor|tuvar)\b/.test(
      text
    )
  ) {
    return "Ghar Nu Shaak (Daily Sabjis)";
  }

  // 15. Dal & Kadhi (Separate from Rice & Pulses)
  if (/\b(dal|daal|kadhi)\b/.test(title)) {
    return "Dal & Kadhi";
  }

  // 16. Chole, Rajma & Pulses
  if (
    /\b(chole|chana masala|pindi chole|rajma|moong|sev usal|sprout|lobia|kathol)\b/.test(
      text
    )
  ) {
    return "Chole, Rajma & Pulses";
  }

  // 17. Rice, Pulao & Khichdi
  if (
    /\b(khichdi|pulao|biryani|jeera rice|vagharelo bhaat|bhaat|rice)\b/.test(
      title
    )
  ) {
    return "Rice, Pulao & Khichdi";
  }

  // 18. North Indian Curries (Rich restaurant gravies, paneer curries, kofta, kaju, mushroom)
  if (
    /\b(north indian|paneer|curry|masala|makhani|lababdar|angara|changezi|lasooni|methi malai|patiala|tikka|shahi|hyderabadi|ghotalo|bhurji|kofta|angoori|kaju|mushroom|handi|kadai)\b/.test(
      text
    )
  ) {
    return "North Indian Curries";
  }

  return "House Specialties";
};

// Sub-group classifier used automatically when a single group has >= SUBGROUP_THRESHOLD dishes
const getSubGroupLabel = (recipe, groupBy) => {
  const title = (recipe.title || "").toLowerCase();

  if (groupBy === "CUISINE") {
    if (
      /\b(paneer|cheese angoori|malai kofta|mushroom|kaju|curry|masala|makhani|lababdar|angara|changezi|lasooni|shahi|hyderabadi|ghotalo|bhurji)\b/.test(
        title
      )
    ) {
      return "North Indian & Paneer Curries";
    }
    if (/\b(dal|daal|kadhi)\b/.test(title)) {
      return "Dal & Kadhi";
    }
    if (/\b(chole|rajma|moong|usal|chana)\b/.test(title)) {
      return "Chole, Rajma & Pulses";
    }
    if (/\b(khichdi|rice|pulao|biryani|bhaat)\b/.test(title)) {
      return "Rice, Pulao & Khichdi";
    }
    if (/\b(dhokla|khaman|khandvi|locho|idla|dhokli)\b/.test(title)) {
      return "Farsan & Steamed Classics";
    }
    if (
      /\b(bhindi|bataka|tameta|cauliflower|cabbage|lauki|mix veg|shaak)\b/.test(
        title
      )
    ) {
      return "Ghar Nu Shaak (Daily Sabjis)";
    }
    if (/\b(sandwich|toast)\b/.test(title)) {
      return "Sandwiches & Toasts";
    }
    if (/\b(pav|dabeli|vadapav|vada pav)\b/.test(title)) {
      return "Mumbai Street & Pav";
    }
    return recipe.courseType || "Signature Mains";
  }

  if (groupBy === "SECTION" || groupBy === "INGREDIENT") {
    if (/\b(paneer)\b/.test(title) && /\b(curries|curry|masala|makhani|lababdar|angara|changezi|lasooni|shahi|hyderabadi|ghotalo|bhurji|tikka|patiala|methi malai)\b/.test(title)) {
      return "Paneer Gravies & Tawa";
    }
    if (/\b(kofta|angoori|kaju|mushroom|chana|curry)\b/.test(title)) {
      return "Kofta, Kaju & Veg Curries";
    }
    if (/\b(fried rice|rice|khichdi|pulao|biryani|bhaat)\b/.test(title)) {
      return "Rice & Khichdi";
    }
    if (/\b(noodle|hakka|spaghetti|spagetti)\b/.test(title)) {
      return "Noodles & Spaghetti";
    }
    if (/\b(pasta|penne|arrabiata|marinara|pesto)\b/.test(title)) {
      return "Penne & Classic Pasta";
    }
    if (/\b(manchurian|chilli|starter)\b/.test(title)) {
      return "Wok Starters & Gravy";
    }
    if (/\b(sandwich)\b/.test(title)) {
      return "Sandwiches";
    }
    if (/\b(toast)\b/.test(title)) {
      return "Loaded Toasts";
    }
    if (/\b(paneer)\b/.test(title) && /\b(frankie)\b/.test(title)) {
      return "Paneer Frankies";
    }
    if (/\b(frankie)\b/.test(title)) {
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
export const buildSubGroups = (items, groupBy) => {
  if (!items || items.length < SUBGROUP_THRESHOLD) {
    return [{ subGroupName: null, items }];
  }

  const buckets = {};
  items.forEach((item) => {
    const label = getSubGroupLabel(item, groupBy);
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