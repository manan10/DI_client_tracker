// src/apps/recipes/components/CookMode/cookModeUtils.js
import {
  Leaf,
  Wheat,
  Milk,
  Flame,
  Droplets,
  Package,
  Clock,
  Sparkles,
  Utensils,
} from "lucide-react";

export const INGREDIENT_CATEGORIES = [
  {
    id: "VEGGIES_HERBS",
    title: "Veggies, Herbs & Aromatics",
    Icon: Leaf,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  {
    id: "MAIN_BASE",
    title: "Grains, Pulses, Paneer & Base",
    Icon: Wheat,
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeClass:
      "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  {
    id: "FATS_DAIRY",
    title: "Oils, Ghee, Butter & Dairy",
    Icon: Milk,
    iconColor: "text-sky-600 dark:text-sky-400",
    badgeClass:
      "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
  },
  {
    id: "SPICES_MASALAS",
    title: "Spices, Masalas & Tempering",
    Icon: Flame,
    iconColor: "text-orange-600 dark:text-orange-400",
    badgeClass:
      "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
  },
  {
    id: "SAUCES_LIQUIDS",
    title: "Sauces, Pastes & Liquids",
    Icon: Droplets,
    iconColor: "text-rose-600 dark:text-rose-400",
    badgeClass:
      "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
  },
  {
    id: "PANTRY_STAPLES",
    title: "Seasoning & Pantry Essentials",
    Icon: Package,
    iconColor: "text-stone-600 dark:text-stone-300",
    badgeClass:
      "bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-600",
  },
];

export const classifyIngredientCategory = (ing) => {
  const name = (ing.name || "").toLowerCase();
  const notes = (ing.notes || "").toLowerCase();

  if (
    /\b(oil|ghee|butter|makhan|cream|malai|milk|doodh|curd|dahi|yogurt|yoghurt|cheese|cheddar|mozzarella|buttermilk|chaas|condensed milk)\b/.test(
      name
    )
  ) {
    return "FATS_DAIRY";
  }
  if (
    /\b(sauce|soy|soya|vinegar|ketchup|schezwan|paste|puree|stock|broth|water|pani|syrup|honey|mayo|mayonnaise|tamarind|imli|coconut milk)\b/.test(
      name
    )
  ) {
    return "SAUCES_LIQUIDS";
  }
  if (
    /\b(masala|powder|turmeric|haldi|cumin|jeera|mustard|rai|coriander powder|dhaniya powder|chilli powder|mirch powder|kashmiri|garam|hing|asafoetida|kasuri|fenugreek|pepper|kali mirch|cardamom|elaichi|clove|laung|cinnamon|dalchini|bay leaf|tej patta|star anise|nutmeg|jaiphal|mace|javitri|saffron|kesar|sesame|til|poppy|khus|ajwain|carom|fennel|saunf|amchur|mango powder|chaat|tandoori|oregano|chilli flakes|paprika|sumac|thyme|rosemary|dry red|whole red|curry leaves|kadi patta)\b/.test(
      name
    )
  ) {
    return "SPICES_MASALAS";
  }
  if (
    /\b(onion|pyaz|garlic|lehsun|lasun|ginger|adrak|tomato|tameta|chilli|chillies|mirch|coriander|dhaniya|cilantro|mint|pudina|capsicum|bell pepper|shimla|cabbage|gobhi|gobi|cauliflower|carrot|gajar|beans|peas|matar|spinach|palak|methi|brinjal|baingan|eggplant|okra|bhindi|gourd|lauki|dudhi|karela|tinda|parwal|mushroom|corn|baby corn|broccoli|zucchini|lettuce|celery|leek|scallion|spring onion|lemon|lime|nimbu|avocado|cucumber|kakdi|beetroot|radish|mooli|birista)\b/.test(
      name
    ) ||
    /\b(chopped|finely|sliced|diced|minced|julienne|grated|slit|cubed|shredded|florets)\b/.test(
      notes
    )
  ) {
    return "VEGGIES_HERBS";
  }
  if (
    /\b(rice|chawal|basmati|dal|daal|lentil|toor|arhar|moong|masoor|chana|urad|rajma|chickpea|chole|kabuli|lobia|paneer|cottage cheese|tofu|soya chunks|potato|aloo|batata|sweet potato|shakarkandi|raw banana|kela|besan|gram flour|flour|atta|maida|cornflour|cornstarch|semolina|rava|sooji|poha|aval|oats|quinoa|noodle|hakka|pasta|macaroni|spaghetti|vermicelli|seviyan|bread|pav|bun|roti|paratha|sev|boondi|papad|cashew|kaju|almond|badam|peanut|singdana|raisin|kishmish|walnut|akhrot|pistachio|pista)\b/.test(
      name
    )
  ) {
    return "MAIN_BASE";
  }
  return "PANTRY_STAPLES";
};

export const getIngredientMeta = (ing) => {
  const catId = classifyIngredientCategory(ing);
  return (
    INGREDIENT_CATEGORIES.find((c) => c.id === catId) ||
    INGREDIENT_CATEGORIES[INGREDIENT_CATEGORIES.length - 1]
  );
};

export const getStepPhase = (text = "") => {
  const t = text.toLowerCase();
  if (
    t.includes("fry") ||
    t.includes("sauté") ||
    t.includes("roast") ||
    t.includes("heat") ||
    t.includes("boil") ||
    t.includes("sear") ||
    t.includes("temper") ||
    t.includes("wok")
  ) {
    return {
      Icon: Flame,
      label: "Heat & Sear",
      badgeClass:
        "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    };
  }
  if (
    t.includes("simmer") ||
    t.includes("wait") ||
    t.includes("rest") ||
    t.includes("marinate") ||
    t.includes("soak") ||
    t.includes("steam") ||
    t.includes("bake")
  ) {
    return {
      Icon: Clock,
      label: "Simmer & Rest",
      badgeClass:
        "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    };
  }
  if (
    t.includes("garnish") ||
    t.includes("serve") ||
    t.includes("plate") ||
    t.includes("top with") ||
    t.includes("finish")
  ) {
    return {
      Icon: Sparkles,
      label: "Finish & Plate",
      badgeClass:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    };
  }
  return {
    Icon: Utensils,
    label: "Prep & Combine",
    badgeClass:
      "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  };
};

export const formatTimer = (totalSec) => {
  const s = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};