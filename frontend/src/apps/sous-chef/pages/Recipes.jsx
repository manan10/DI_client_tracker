// src/apps/recipes/pages/Recipies.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Loader2,
  Search,
  Flame,
  Play,
  X,
  ArrowUpDown,
  Clock,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import AddRecipeModal from "../components/AddRecipeModal";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

const MAIN_INGREDIENT_RULES = [
  { label: "Paneer Specialties", keywords: ["paneer", "cottage cheese"] },
  { label: "Rice, Biryani & Khichdi", keywords: ["rice", "chawal", "khichdi", "biryani", "pulao", "basmati"] },
  { label: "Dal & Lentil Preparations", keywords: ["dal", "lentil", "toor", "moong", "masoor", "chana", "urad"] },
  { label: "Potato (Aloo) Creations", keywords: ["aloo", "potato", "batata"] },
  { label: "Farsan & Besan Snacks", keywords: ["besan", "gram flour", "dhokla", "khaman", "flour", "atta", "maida"] },
  { label: "Seasonal Vegetables (Shaak)", keywords: ["bhindi", "tameta", "tomato", "gobi", "cauliflower", "palak", "spinach", "methi", "baingan", "brinjal"] },
  { label: "Artisanal Pasta & Noodles", keywords: ["pasta", "spaghetti", "penne", "noodle", "macaroni"] },
  { label: "Mithai & Desserts", keywords: ["halwa", "kheer", "laddoo", "sweet", "dessert", "mithai", "cake"] },
];

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

const GROUP_OPTIONS = [
  { id: "CUISINE", label: "By Cuisine" },
  { id: "INGREDIENT", label: "By Ingredient" },
  { id: "NONE", label: "All Dishes" },
];

const SORT_OPTIONS = [
  { id: "title-asc", label: "A–Z" },
  { id: "time-asc", label: "Fastest" },
  { id: "time-desc", label: "Slowest" },
];

const Recipies = () => {
  const navigate = useNavigate();
  const { request } = useApi();

  // Data & Modal State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  // Filter & Grouping State
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("CUISINE"); // "CUISINE" | "INGREDIENT" | "NONE"
  const [sortBy, setSortBy] = useState("title-asc");

  // Persisted 2-View Switcher State
  const [menuStyle, setMenuStyle] = useState(() => {
    const saved = localStorage.getItem("sous-chef-menu-edition");
    return saved === "BISTRO" || saved === "SHAHI_HYBRID" ? saved : "BISTRO";
  });

  const handleSelectMenuStyle = (styleId) => {
    setMenuStyle(styleId);
    localStorage.setItem("sous-chef-menu-edition", styleId);
  };

  // Fetch Recipes
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request("/recipes", "GET");
      if (response && response.success && Array.isArray(response.data)) {
        setRecipes(response.data);
      } else if (Array.isArray(response?.data)) {
        setRecipes(response.data);
      } else if (Array.isArray(response)) {
        setRecipes(response);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error("Fetch Recipes Error:", err);
      toast.error(err?.message || "Failed to load recipes from server");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleRecipeCreated = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  const detectMainIngredientGroup = useCallback((recipe) => {
    const title = (recipe.title || "").toLowerCase();
    const ingredients = (recipe.ingredients || [])
      .map((ing) => (typeof ing === "string" ? ing : ing.name || "").toLowerCase())
      .join(" ");
    const tags = (recipe.tags || []).join(" ").toLowerCase();
    const searchableText = `${title} ${ingredients} ${tags}`;

    for (const rule of MAIN_INGREDIENT_RULES) {
      if (rule.keywords.some((kw) => searchableText.includes(kw))) {
        return rule.label;
      }
    }
    return "House Specialties";
  }, []);

  // Filtered & Sorted Recipes
  const processedRecipes = useMemo(() => {
    let list = recipes.filter((item) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);
        const matchesCuisine = item.cuisine?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesIngredients = item.ingredients?.some((ing) => {
          const name = typeof ing === "string" ? ing : ing.name || "";
          return name.toLowerCase().includes(query);
        });
        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesCuisine &&
          !matchesTags &&
          !matchesIngredients
        ) {
          return false;
        }
      }
      return true;
    });

    list.sort((a, b) => {
      const timeA = (a.prepTimeMinutes || 0) + (a.cookTimeMinutes || 0);
      const timeB = (b.prepTimeMinutes || 0) + (b.cookTimeMinutes || 0);

      switch (sortBy) {
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "time-asc":
          return timeA - timeB;
        case "time-desc":
          return timeB - timeA;
        default:
          return 0;
      }
    });

    return list;
  }, [recipes, searchTerm, sortBy]);

  // Grouped Sections
  const groupedSections = useMemo(() => {
    if (groupBy === "NONE") {
      return [{ groupName: "Complete À La Carte Repertoire", items: processedRecipes }];
    }

    const groups = {};
    processedRecipes.forEach((recipe) => {
      let key = "General";
      if (groupBy === "CUISINE") {
        key = recipe.cuisine || "House Classics";
      } else if (groupBy === "INGREDIENT") {
        key = detectMainIngredientGroup(recipe);
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(recipe);
    });

    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        groupName: key,
        items: groups[key],
      }));
  }, [processedRecipes, groupBy, detectMainIngredientGroup]);

  // Primary: Dish Subtext (description). Fallback: Hero ingredients with pantry staples stripped out.
  const getDishSubtext = (item) => {
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

  // Helper to render compact dietary codes
  const renderDietaryCodes = (item) => {
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

  const formatDuration = (item) => {
    const total = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);
    if (total <= 0) return "Quick Prep";
    return `${total} mins`;
  };

  const cycleSort = () => {
    setSortBy((prev) =>
      prev === "title-asc"
        ? "time-asc"
        : prev === "time-asc"
        ? "time-desc"
        : "title-asc"
    );
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || "A–Z";

  const openDetails = (id) => navigate(`/sous-chef/recipes/${id}`);
  const openCookMode = (e, id) => {
    e.stopPropagation();
    navigate(`/sous-chef/recipes/cook-mode?recipeId=${id}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300 pb-24">
      <ChefNavbar onOpenAddRecipe={() => setIsAddRecipeOpen(true)} />

      {/* ========================================================================= */}
      {/* FULL WIDESCREEN MENU CANVAS                                               */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 pt-6 sm:pt-10">
        
        {/* ========================================================================= */}
        {/* RESTAURANT MASTHEAD & ARCHITECTURAL LEDGER FILTER BAR                     */}
        {/* ========================================================================= */}
        <header className="mb-8 sm:mb-10">
          {/* Top Double-Rule Architectural Header */}
          <div className="border-t-4 border-stone-900 dark:border-stone-200 pt-1">
            <div className="border-t border-stone-900 dark:border-stone-200 pt-4 pb-5 border-b-2 border-stone-900 dark:border-stone-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                    शाही रसोई • House Repertoire
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600 tabular-nums">
                    {processedRecipes.length} Selections
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-[0.9]">
                  Off The <span className="text-amber-700 dark:text-[#f59e0b]">Menu</span>
                </h1>
              </div>

              <div className="md:text-right space-y-1.5">
                <p className="text-xs sm:text-sm font-mono font-bold text-stone-800 dark:text-stone-200">
                  An exhaustive list of things we swear we know how to cook.
                </p>
                <div className="flex flex-wrap md:justify-end items-center gap-2.5 sm:gap-3 text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  <span>[J] Jain</span>
                  <span>•</span>
                  <span>[SW] Swaminarayan</span>
                  <span>•</span>
                  <span>[VG] Vegan</span>
                  <span>•</span>
                  <span>[GF] Gluten-Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CLEAN PRINT-STYLE LEDGER TOOLBAR BAR                                  */}
          {/* ===================================================================== */}
          <div className="mt-4 border-y border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14110E] py-2 px-3 sm:px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-mono text-xs shadow-2xs">
            
            {/* Left: Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-8 pl-9 pr-14 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1A1612] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Right: Index Grouping + Sort + Edition Switcher */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4">
              
              {/* 1. Group Index Tabs */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mr-1 hidden sm:inline">
                  Index:
                </span>
                <div className="inline-flex items-center rounded bg-stone-100 dark:bg-[#1A1612] p-0.5 border border-stone-300 dark:border-stone-700">
                  {GROUP_OPTIONS.map((g) => {
                    const active = groupBy === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGroupBy(g.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          active
                            ? "bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 font-extrabold shadow-2xs"
                            : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sort Button */}
              <button
                type="button"
                onClick={cycleSort}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#1A1612] text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:border-stone-500 dark:hover:border-stone-500 transition-colors cursor-pointer"
                title="Cycle Sort Order"
              >
                <ArrowUpDown size={12} className="text-amber-600 dark:text-amber-400" />
                <span>Sort: {currentSortLabel}</span>
              </button>

              <span className="hidden sm:inline text-stone-300 dark:text-stone-700">|</span>

              {/* 3. Menu View Edition Switcher (Bistro vs Banquet) */}
              <div className="inline-flex items-center h-8 p-0.5 rounded border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#1A1612]">
                {[
                  { id: "BISTRO", label: "Bistro", icon: LayoutGrid },
                  { id: "SHAHI_HYBRID", label: "Banquet", icon: Sparkles },
                ].map((ed) => {
                  const Icon = ed.icon;
                  const active = menuStyle === ed.id;
                  return (
                    <button
                      key={ed.id}
                      type="button"
                      onClick={() => handleSelectMenuStyle(ed.id)}
                      className={`inline-flex items-center gap-1.5 h-full px-2.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        active
                          ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold shadow-2xs"
                          : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={12} />
                      <span>{ed.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* LOADING & EMPTY STATES                                                    */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Typesetting Kitchen Menu...
            </p>
          </div>
        ) : processedRecipes.length === 0 ? (
          <div className="py-20 text-center border-y-2 border-dashed border-stone-300 dark:border-stone-700 max-w-lg mx-auto">
            <ChefHat size={38} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-sans font-[1000] uppercase tracking-tighter text-xl text-stone-900 dark:text-white">
              Nothing on the Menu Matches
            </h3>
            <p className="text-xs font-mono text-stone-600 dark:text-stone-300 mt-2">
              Try clearing your search filter or adding a new dish to the kitchen archive.
            </p>
          </div>
        ) : (
          <>
            {/* ===================================================================== */}
            {/* VIEW 1: BISTRO COURSE BOXES                                           */}
            {/* ===================================================================== */}
            {menuStyle === "BISTRO" && (
              <div
                className={
                  groupedSections.length === 1
                    ? "w-full"
                    : "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 sm:gap-8 items-start"
                }
              >
                {groupedSections.map(({ groupName, items }) => (
                  <section
                    key={groupName}
                    className="border-2 border-stone-900 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#14110E] p-5 sm:p-6 lg:p-7 shadow-sm"
                  >
                    {/* Boxed Bistro Course Header */}
                    <div className="border-b-2 border-stone-900 dark:border-stone-700 pb-3 mb-5 flex items-baseline justify-between gap-2">
                      <h2 className="font-sans font-[1000] uppercase tracking-tighter text-2xl sm:text-3xl text-stone-900 dark:text-white leading-none">
                        {groupName}
                      </h2>
                      <span className="font-mono font-bold text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider shrink-0">
                        {items.length} {items.length === 1 ? "Dish" : "Dishes"}
                      </span>
                    </div>

                    {/* Dish List */}
                    <div
                      className={
                        groupedSections.length === 1
                          ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-10 gap-y-6"
                          : "space-y-5"
                      }
                    >
                      {items.map((item) => (
                        <article
                          key={item._id}
                          onClick={() => openDetails(item._id)}
                          className="group cursor-pointer pb-4 border-b border-stone-200 dark:border-stone-800 last:border-b-0 last:pb-0"
                        >
                          {/* Top Row: Title + Duration */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-sans font-[1000] uppercase tracking-tighter text-base sm:text-lg text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-snug inline">
                                {item.title}
                              </h3>
                              {renderDietaryCodes(item)}
                              {item.video?.embedUrl && (
                                <Play
                                  size={10}
                                  fill="currentColor"
                                  className="inline text-rose-500 ml-1.5 align-middle"
                                />
                              )}
                            </div>

                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-mono font-extrabold text-[11px] tabular-nums shrink-0">
                              <Clock size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{formatDuration(item)}</span>
                            </div>
                          </div>

                          {/* Dish Subtext */}
                          <p className="text-xs font-mono text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed line-clamp-2">
                            {getDishSubtext(item)}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-2 text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            <span>
                              {item.courseType || "Main"} • {item.difficulty || "Medium"}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => openCookMode(e, item._id)}
                              className="inline-flex items-center gap-1 font-extrabold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                            >
                              <Flame size={10} />
                              <span>Cook Mode ↗</span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* ===================================================================== */}
            {/* VIEW 2: SHAHI + BRASSERIE HYBRID                                      */}
            {/* ===================================================================== */}
            {menuStyle === "SHAHI_HYBRID" && (
              <div className="border-2 border-stone-900 dark:border-stone-700 p-1 sm:p-1.5 bg-[#FAF9F6] dark:bg-[#14110E] shadow-sm">
                <div className="border border-stone-400 dark:border-stone-700 px-4 py-8 sm:px-8 sm:py-12 lg:px-12 space-y-14">
                  {groupedSections.map(({ groupName, items }) => (
                    <section key={groupName} className="space-y-8">
                      
                      {/* Centered Royal Section Header */}
                      <div className="relative flex items-center justify-center">
                        <div className="w-full h-[1px] bg-stone-300 dark:bg-stone-700" />
                        <div className="px-5 sm:px-8 bg-[#FAF9F6] dark:bg-[#14110E] shrink-0 text-center space-y-1">
                          <span className="block text-amber-600 dark:text-amber-400 text-[10px] tracking-[0.35em]">
                            ✦ ✦ ✦
                          </span>
                          <h2 className="font-sans font-[1000] uppercase tracking-tighter text-2xl sm:text-4xl text-stone-900 dark:text-white leading-none">
                            {groupName}
                          </h2>
                          <div className="w-16 h-0.5 bg-amber-500/60 mx-auto pt-0.5" />
                        </div>
                        <div className="w-full h-[1px] bg-stone-300 dark:bg-stone-700" />
                      </div>

                      {/* Centered Symmetrical Dish Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-9">
                        {items.map((item) => (
                          <article
                            key={item._id}
                            onClick={() => openDetails(item._id)}
                            className="group text-center flex flex-col items-center justify-between px-3 cursor-pointer"
                          >
                            <div className="flex flex-col items-center">
                              <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                                <h3 className="font-sans font-[1000] uppercase tracking-tighter text-lg sm:text-xl text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f59e0b] transition-colors leading-tight">
                                  {item.title}
                                </h3>
                                {renderDietaryCodes(item)}
                                {item.video?.embedUrl && (
                                  <Play
                                    size={10}
                                    fill="currentColor"
                                    className="text-rose-500 shrink-0"
                                  />
                                )}
                              </div>

                              <p className="text-xs font-mono text-stone-600 dark:text-stone-300 mt-1.5 max-w-md leading-relaxed line-clamp-2">
                                {getDishSubtext(item)}
                              </p>
                            </div>

                            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40 font-extrabold tabular-nums">
                                <Clock size={11} className="text-amber-600 dark:text-amber-400" />
                                {formatDuration(item)}
                              </span>

                              <span className="text-stone-300 dark:text-stone-700">•</span>

                              <span className="font-bold uppercase text-stone-500 dark:text-stone-400">
                                {item.difficulty || "Medium"}
                              </span>

                              <span className="text-stone-300 dark:text-stone-700">•</span>

                              <button
                                type="button"
                                onClick={(e) => openCookMode(e, item._id)}
                                className="inline-flex items-center gap-1 font-extrabold uppercase text-amber-700 dark:text-amber-300 hover:text-stone-900 dark:hover:text-white underline cursor-pointer"
                              >
                                <Flame size={11} />
                                <span>Cook Mode</span>
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD RECIPE MODAL */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => setIsAddRecipeOpen(false)}
        onRecipeCreated={handleRecipeCreated}
      />
    </div>
  );
};

export default Recipies;