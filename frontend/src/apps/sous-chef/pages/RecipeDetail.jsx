// src/apps/recipes/pages/RecipeDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Loader2,
  Clock,
  Minus,
  Plus,
  Flame,
  Utensils,
  Sparkles,
  Leaf,
  Droplets,
  Package,
  Lightbulb,
  Scale,
  ListOrdered,
  Wheat,
  Milk,
  Pencil,
  Video,
} from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import RecipeCommandBar from "../components/RecipeDetails/RecipeCommandBar";
import RecipeTitleHero from "../components/RecipeDetails/RecipeTitleHero";
import RecipeEditDrawer from "../components/RecipeDetails/RecipeEditDrawer";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

// -------------------------------------------------------------
// SMART INGREDIENT CATEGORIZATION & SORTING ENGINE
// -------------------------------------------------------------
const INGREDIENT_CATEGORIES = [
  {
    id: "VEGGIES_HERBS",
    title: "Veggies, Herbs & Aromatics",
    subtitle: "Chop, slice & prep",
    Icon: Leaf,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    headerBg:
      "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-400/30 text-emerald-900 dark:text-emerald-200",
    qtyBadge:
      "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40",
  },
  {
    id: "MAIN_BASE",
    title: "Grains, Pulses, Paneer & Base",
    subtitle: "Core components",
    Icon: Wheat,
    iconColor: "text-amber-600 dark:text-amber-400",
    headerBg:
      "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 dark:border-amber-400/30 text-amber-900 dark:text-amber-200",
    qtyBadge:
      "bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40",
  },
  {
    id: "FATS_DAIRY",
    title: "Oils, Ghee, Butter & Dairy",
    subtitle: "Cooking fats & richness",
    Icon: Milk,
    iconColor: "text-sky-600 dark:text-sky-400",
    headerBg:
      "bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/25 dark:border-sky-400/30 text-sky-900 dark:text-sky-200",
    qtyBadge:
      "bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30 dark:border-sky-400/40",
  },
  {
    id: "SPICES_MASALAS",
    title: "Spices, Masalas & Tempering",
    subtitle: "Whole & powdered spices",
    Icon: Flame,
    iconColor: "text-orange-600 dark:text-orange-400",
    headerBg:
      "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/25 dark:border-orange-400/30 text-orange-900 dark:text-orange-200",
    qtyBadge:
      "bg-orange-500/15 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/30 dark:border-orange-400/40",
  },
  {
    id: "SAUCES_LIQUIDS",
    title: "Sauces, Pastes & Liquids",
    subtitle: "Condiments, stock & water",
    Icon: Droplets,
    iconColor: "text-rose-600 dark:text-rose-400",
    headerBg:
      "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/25 dark:border-rose-400/30 text-rose-900 dark:text-rose-200",
    qtyBadge:
      "bg-rose-500/15 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40",
  },
  {
    id: "PANTRY_STAPLES",
    title: "Seasoning & Pantry Essentials",
    subtitle: "Salt, sweeteners & staples",
    Icon: Package,
    iconColor: "text-stone-600 dark:text-stone-300",
    headerBg:
      "bg-stone-200/80 dark:bg-[#2A2520] border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200",
    qtyBadge:
      "bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-600",
  },
];

// Classifies an ingredient into one of the 6 culinary categories
const classifyIngredientCategory = (ing) => {
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

const getIngredientMeta = (ing) => {
  const catId = classifyIngredientCategory(ing);
  const found =
    INGREDIENT_CATEGORIES.find((c) => c.id === catId) ||
    INGREDIENT_CATEGORIES[INGREDIENT_CATEGORIES.length - 1];
  return {
    Icon: found.Icon,
    iconColor: found.iconColor,
    qtyBadge: found.qtyBadge,
    categoryId: found.id,
  };
};

const getStepClassification = (text = "") => {
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
        "bg-orange-500/15 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/30 dark:border-orange-400/40",
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
        "bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40",
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
        "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40",
    };
  }
  return {
    Icon: Utensils,
    label: "Prep & Combine",
    badgeClass:
      "bg-sky-500/15 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30 dark:border-sky-400/40",
  };
};

const formatStaticDuration = (secs) => {
  if (!secs || secs <= 0) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m} ${m === 1 ? "min" : "mins"}`;
  return `${s}s`;
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active slide-over edit drawer ('photo' | 'video' | 'details' | 'stats' | 'ingredients' | 'steps' | 'import' | null)
  const [activeEditSection, setActiveEditSection] = useState(null);

  // Portion Scaling
  const [servings, setServings] = useState(4);

  // Mobile View Filter ('all' | 'ingredients' | 'steps')
  const [mobileSection, setMobileSection] = useState("all");

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const response = await request(`/recipes/${id}`, "GET");
        if (response && (response.success || response.data)) {
          const data = response.data || response;
          setRecipe(data);
          setServings(data.baseServings || 4);
        } else {
          toast.error("Recipe not found in collection");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to load recipe details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipe();
  }, [id, request]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipe(updatedRecipe);
    if (updatedRecipe.baseServings) {
      setServings(updatedRecipe.baseServings);
    }
  };

  const scaleRatio = useMemo(() => {
    if (!recipe?.baseServings || recipe.baseServings === 0) return 1;
    return servings / recipe.baseServings;
  }, [servings, recipe?.baseServings]);

  const groupedIngredients = useMemo(() => {
    const rawList = recipe?.ingredients || [];
    const buckets = {};

    INGREDIENT_CATEGORIES.forEach((cat) => {
      buckets[cat.id] = [];
    });

    rawList.forEach((ing, idx) => {
      const catId = classifyIngredientCategory(ing);
      buckets[catId].push({ ...ing, originalIdx: idx });
    });

    return INGREDIENT_CATEGORIES.map((cat) => ({
      ...cat,
      items: buckets[cat.id] || [],
    })).filter((group) => group.items.length > 0);
  }, [recipe?.ingredients]);

  const getStepIngredients = (instructionText = "") => {
    if (!recipe?.ingredients || !instructionText) return [];
    const lower = instructionText.toLowerCase();

    return recipe.ingredients.filter((ing) => {
      if (!ing.name) return false;
      const nameLower = ing.name.toLowerCase().trim();
      if (lower.includes(nameLower)) return true;
      const words = nameLower.split(/\s+/).filter((w) => w.length > 3);
      return words.some((w) => lower.includes(w));
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#181512] text-stone-900 dark:text-stone-100 font-mono flex flex-col">
        <ChefNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={30} className="animate-spin text-amber-500" />
          <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-300">
            Loading Recipe...
          </p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#181512] text-stone-900 dark:text-stone-100 font-mono flex flex-col">
        <ChefNavbar />
        <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
          <ChefHat size={40} className="mx-auto text-stone-400" />
          <h2 className="text-lg font-sans font-[1000] uppercase tracking-tighter">
            Recipe Not Found
          </h2>
          <button
            onClick={() => navigate("/sous-chef/recipes")}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Back to All Recipes
          </button>
        </div>
      </div>
    );
  }

  const formatScaledQty = (qty) => {
    if (!qty || qty <= 0) return "";
    return Number((qty * scaleRatio).toFixed(2));
  };

  const allIngredients = recipe.ingredients || [];
  const totalSteps = recipe.instructions?.length || 0;

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#181512] text-stone-900 dark:text-stone-100 transition-colors duration-200 pb-28 relative font-mono overflow-x-hidden">
      {/* SUBTLE WARM AMBIENT ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-36 left-1/3 w-[550px] h-[350px] bg-amber-500/[0.05] dark:bg-amber-500/[0.06] blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-36 w-[450px] h-[450px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] blur-[140px] rounded-full" />
      </div>

      <ChefNavbar />

      <main className="relative z-10 w-full px-4 sm:px-8 xl:px-12 py-3 sm:py-5 space-y-6">
        {/* 1. TOP COMMAND BAR */}
        <RecipeCommandBar
          onBack={() => navigate("/sous-chef/recipes")}
          onShare={handleCopyLink}
          onOpenImport={() => setActiveEditSection("import")}
          cookModeUrl={`/sous-chef/recipes/cook-mode?recipeId=${recipe._id}`}
        />

        {/* 2. TITLE HERO SECTION */}
        <RecipeTitleHero
          recipe={recipe}
          onEditSection={(sec) => setActiveEditSection(sec)}
        />

        {/* ========================================================================= */}
        {/* 3. EDITORIAL PUBLICATION LAYOUT                                           */}
        {/* ========================================================================= */}
        <section className="pt-1">
          {/* STICKY MOBILE NAVIGATION BAR */}
          <div className="sticky top-0 z-30 flex lg:hidden bg-[#FAF9F6]/95 dark:bg-[#181512]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 mb-6 text-xs font-mono font-bold uppercase tracking-wider">
            {[
              { id: "all", label: "Full View" },
              {
                id: "ingredients",
                label: `Ingredients (${allIngredients.length})`,
              },
              {
                id: "steps",
                label: `Method (${totalSteps})`,
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMobileSection(t.id)}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                  mobileSection === t.id
                    ? "border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-500/[0.06]"
                    : "border-transparent text-stone-500 dark:text-stone-300 hover:text-stone-800 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* ================================================================= */}
            {/* LEFT RAIL: FRAMED VIDEO IFRAME + CATEGORIZED INGREDIENTS (4 Cols) */}
            {/* ================================================================= */}
            <aside
              className={`lg:col-span-4 space-y-7 lg:pr-8 lg:border-r border-stone-200 dark:border-stone-700/80 lg:sticky lg:top-6 ${
                mobileSection === "steps" ? "hidden lg:block" : "block"
              }`}
            >
              {/* VIDEO SECTION */}
              {recipe.video?.embedUrl ? (
                <div className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] shadow-md space-y-1.5">
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border border-stone-200 dark:border-stone-700">
                    <iframe
                      src={recipe.video.embedUrl}
                      title={recipe.title}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => setActiveEditSection("video")}
                      className="inline-flex items-center gap-1 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
                    >
                      <Pencil size={10} />
                      <span>Change Video Link</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveEditSection("video")}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-stone-300 dark:border-stone-600 text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video size={13} />
                  <span>Add Video Link</span>
                </button>
              )}

              {/* INGREDIENTS EDITORIAL LEDGER */}
              <div className="space-y-4">
                <div className="pb-3 border-b-2 border-stone-900 dark:border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Scale
                      size={16}
                      className="text-amber-500 dark:text-amber-400 shrink-0"
                    />
                    <h2 className="text-base sm:text-lg font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-none">
                      Ingredients
                    </h2>
                    <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-300">
                      ({allIngredients.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Portion Scaler */}
                    <div className="inline-flex items-center rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] shadow-2xs text-xs">
                      <button
                        type="button"
                        onClick={() => setServings((s) => Math.max(1, s - 1))}
                        className="px-1.5 py-1 text-stone-700 dark:text-stone-200 hover:bg-amber-500 hover:text-stone-950 rounded-l-md transition-colors cursor-pointer"
                        title="Decrease Servings"
                      >
                        <Minus size={10} strokeWidth={3} />
                      </button>
                      <span className="px-2 py-0.5 font-mono font-extrabold text-amber-700 dark:text-amber-300 tabular-nums border-x border-stone-200 dark:border-stone-600">
                        {servings}p
                      </span>
                      <button
                        type="button"
                        onClick={() => setServings((s) => s + 1)}
                        className="px-1.5 py-1 text-stone-700 dark:text-stone-200 hover:bg-amber-500 hover:text-stone-950 rounded-r-md transition-colors cursor-pointer"
                        title="Increase Servings"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>

                    {/* Edit Ingredients Drawer Trigger */}
                    <button
                      type="button"
                      onClick={() => setActiveEditSection("ingredients")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Pencil size={10} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Scale Indicator */}
                {scaleRatio !== 1 && (
                  <div className="flex items-center justify-between text-[11px] font-mono py-0.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40 font-bold text-[10px] uppercase tracking-wider">
                      Scaled {scaleRatio.toFixed(1)}x
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings(recipe.baseServings || 4)}
                      className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white underline cursor-pointer"
                    >
                      Reset ({recipe.baseServings}p)
                    </button>
                  </div>
                )}

                {/* Categorized Ingredient Groups */}
                <div className="space-y-5">
                  {groupedIngredients.map((group) => {
                    const GroupIcon = group.Icon;

                    return (
                      <div key={group.id} className="space-y-1.5">
                        <div
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border ${group.headerBg}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GroupIcon
                              size={13}
                              className={`shrink-0 ${group.iconColor}`}
                            />
                            <span className="text-[11px] font-sans font-[1000] uppercase tracking-tight truncate">
                              {group.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold opacity-80 shrink-0 ml-2">
                            {group.items.length}
                          </span>
                        </div>

                        <div className="divide-y divide-stone-200/80 dark:divide-stone-700/70 border-b border-stone-200 dark:border-stone-700/80">
                          {group.items.map((ing) => {
                            const qty = formatScaledQty(ing.quantity);

                            return (
                              <div
                                key={ing.originalIdx}
                                className="flex items-center justify-between gap-3 py-2 px-2 rounded-md text-xs font-mono even:bg-stone-200/30 dark:even:bg-white/[0.03]"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${group.iconColor.replace(
                                      "text-",
                                      "bg-"
                                    )}`}
                                  />
                                  <div className="truncate">
                                    <span className="font-bold text-stone-900 dark:text-stone-100">
                                      {ing.name}
                                    </span>
                                    {ing.notes && (
                                      <span className="text-[11px] text-stone-500 dark:text-stone-300 ml-1.5">
                                        ({ing.notes})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {(qty !== "" || ing.unit) && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold shrink-0 tabular-nums border ${group.qtyBadge}`}
                                  >
                                    {qty} {ing.unit}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ================================================================= */}
            {/* RIGHT COLUMN: EDITORIAL PREPARATION STEPS (8 Cols)                */}
            {/* ================================================================= */}
            <div
              className={`lg:col-span-8 space-y-4 ${
                mobileSection === "ingredients" ? "hidden lg:block" : "block"
              }`}
            >
              {/* Preparation Section Header */}
              <div className="pb-3 border-b-2 border-stone-900 dark:border-stone-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ListOrdered
                    size={17}
                    className="text-amber-500 dark:text-amber-400 shrink-0"
                  />
                  <h2 className="text-base sm:text-lg font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-none">
                    Preparation
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {totalSteps} {totalSteps === 1 ? "Step" : "Steps"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveEditSection("steps")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#24201C] text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Pencil size={10} />
                    <span>Edit Steps</span>
                  </button>
                </div>
              </div>

              {/* Read-Only Editorial Steps Stream */}
              <div className="divide-y divide-stone-200 dark:divide-stone-700/80">
                {recipe.instructions?.map((step, idx) => {
                  const {
                    Icon: StepIcon,
                    label,
                    badgeClass,
                  } = getStepClassification(
                    `${step.title || ""} ${step.instruction || ""}`
                  );
                  const stepIngredients = getStepIngredients(step.instruction);
                  const durationLabel = formatStaticDuration(
                    step.timerDurationSeconds
                  );

                  return (
                    <article
                      key={idx}
                      className="py-6 first:pt-2 flex flex-col sm:flex-row gap-4 sm:gap-7"
                    >
                      {/* Left Step Meta Column */}
                      <div className="sm:w-36 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-mono font-extrabold bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 shadow-2xs">
                            {String(step.stepNumber || idx + 1).padStart(2, "0")}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeClass}`}
                          >
                            <StepIcon size={10} />
                            <span>{label}</span>
                          </span>
                        </div>

                        {durationLabel && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-200 dark:bg-[#26211D] border border-stone-300 dark:border-stone-600 text-[11px] font-mono font-bold text-stone-800 dark:text-stone-100">
                            <Clock
                              size={11}
                              className="text-amber-600 dark:text-amber-400"
                            />
                            <span className="tabular-nums">{durationLabel}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Step Narrative Column */}
                      <div className="flex-1 space-y-2.5 min-w-0">
                        {step.title && (
                          <h3 className="text-base sm:text-lg font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-tight">
                            {step.title}
                          </h3>
                        )}

                        <p className="text-xs sm:text-sm font-mono text-stone-700 dark:text-stone-200 leading-relaxed">
                          {step.instruction}
                        </p>

                        {stepIngredients.length > 0 && (
                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 dark:text-stone-300 mr-0.5">
                              Uses:
                            </span>
                            {stepIngredients.map((item, i) => {
                              const qty = formatScaledQty(item.quantity);
                              const { Icon: ItemIcon, iconColor } =
                                getIngredientMeta(item);

                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-white dark:bg-[#26211D] border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-100 shadow-2xs"
                                >
                                  <ItemIcon size={11} className={iconColor} />
                                  <span>{item.name}</span>
                                  {qty !== "" && (
                                    <span className="text-amber-700 dark:text-amber-300 font-extrabold tabular-nums">
                                      ({qty} {item.unit})
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {step.chefTip && (
                          <div className="mt-2.5 p-3 rounded-lg bg-amber-500/10 dark:bg-[#282118] border border-amber-500/25 dark:border-amber-500/35 border-l-4 border-l-amber-500 flex items-start gap-2.5 text-xs font-mono text-stone-800 dark:text-stone-100">
                            <Lightbulb
                              size={14}
                              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                            />
                            <div className="leading-relaxed">
                              <strong className="font-mono font-extrabold uppercase text-[10px] tracking-wider text-amber-800 dark:text-amber-300 mr-1.5">
                                Chef's Note:
                              </strong>
                              <span>{step.chefTip}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Tags Strip */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300 mr-1">
                    Tags:
                  </span>
                  {recipe.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-stone-200/70 dark:bg-[#24201C] text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOCUSED SLIDE-OVER DRAWER FOR EACH INDIVIDUAL SECTION & AI EXTRACT */}
      <RecipeEditDrawer
        section={activeEditSection}
        recipe={recipe}
        onClose={() => setActiveEditSection(null)}
        onSaved={handleRecipeUpdated}
      />
    </div>
  );
};

export default RecipeDetail;