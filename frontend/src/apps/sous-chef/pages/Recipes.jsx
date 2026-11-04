// src/apps/recipes/pages/Recipies.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Loader2, Utensils } from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import AddRecipeModal from "../components/AddRecipeModal";
import RecipeToolbar from "../components/Recipies/RecipeToolbar";
import CuisinePills from "../components/Recipies/CuisinePills";
import RecipeCardItem from "../components/Recipies/RecipeCardItem";
import RecipeListItem from "../components/Recipies/RecipeListItem";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

const MAIN_INGREDIENT_RULES = [
  { label: "Paneer Items", keywords: ["paneer", "cottage cheese"] },
  { label: "Rice & Khichdi", keywords: ["rice", "chawal", "khichdi", "biryani", "pulao", "basmati"] },
  { label: "Dal & Lentil", keywords: ["dal", "lentil", "toor", "moong", "masoor", "chana", "urad"] },
  { label: "Potato (Aloo)", keywords: ["aloo", "potato", "batata"] },
  { label: "Besan & Flour (Snacks)", keywords: ["besan", "gram flour", "dhokla", "khaman", "flour", "atta", "maida"] },
  { label: "Vegetables (Shaak)", keywords: ["bhindi", "tameta", "tomato", "gobi", "cauliflower", "palak", "spinach", "methi", "baingan", "brinjal"] },
  { label: "Pasta & Noodles", keywords: ["pasta", "spaghetti", "penne", "noodle", "macaroni"] },
  { label: "Sweets & Desserts", keywords: ["halwa", "kheer", "laddoo", "sweet", "dessert", "mithai", "cake"] },
];

const CUISINES = [
  "All",
  "Gujarati",
  "North Indian",
  "South Indian",
  "Street Food",
  "Italian",
  "Asian",
  "Dessert",
];

const Recipies = () => {
  const navigate = useNavigate();
  const { request } = useApi();

  // State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  // Filters & Layout State - Default to DENSE_LIST
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState("title-asc");
  const [viewMode, setViewMode] = useState("DENSE_LIST");
  const [groupBy, setGroupBy] = useState("CUISINE"); // "CUISINE" | "INGREDIENT" | "NONE"

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

  // Helper for ingredient detection
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
    return "Other Specialties";
  }, []);

  // Filtered & Sorted Pipeline
  const processedRecipes = useMemo(() => {
    let list = recipes.filter((item) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesIngredients = item.ingredients?.some((ing) => {
          const name = typeof ing === "string" ? ing : ing.name || "";
          return name.toLowerCase().includes(query);
        });
        if (!matchesTitle && !matchesTags && !matchesIngredients) return false;
      }

      if (selectedCuisine !== "All" && item.cuisine !== selectedCuisine) {
        return false;
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
  }, [recipes, searchTerm, selectedCuisine, sortBy]);

  // Grouped structure
  const groupedSections = useMemo(() => {
    if (groupBy === "NONE") {
      return [{ groupName: "All Recipes", items: processedRecipes }];
    }

    const groups = {};

    processedRecipes.forEach((recipe) => {
      let key = "General";
      if (groupBy === "CUISINE") {
        key = recipe.cuisine || "Other Cuisine";
      } else if (groupBy === "INGREDIENT") {
        key = detectMainIngredientGroup(recipe);
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(recipe);
    });

    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        groupName: key,
        items: groups[key],
      }));
  }, [processedRecipes, groupBy, detectMainIngredientGroup]);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20 md:pb-12">
      {/* CHEF NAVBAR */}
      <ChefNavbar onOpenAddRecipe={() => setIsAddRecipeOpen(true)} />

      {/* EXPANDED FULL-WIDTH WORKSPACE CANVAS */}
      <main className="max-w-[96rem] 2xl:max-w-[110rem] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 space-y-5">
        
        {/* ========================================================================= */}
        {/* PAGE TITLE & CONTEXT HEADER                                               */}
        {/* ========================================================================= */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Utensils size={10} className="text-amber-600 dark:text-[#f59e0b]" />
                House Special
              </span>
              {!loading && (
                <span className="text-[11px] font-mono font-medium text-stone-400 dark:text-stone-500">
                  {recipes.length} {recipes.length === 1 ? "dish recorded" : "dishes recorded"}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Off The <span className="italic font-bold text-amber-700 dark:text-[#f59e0b]">Menu</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
              An exhaustive list of things we swear we know how to cook.
            </p>
          </div>
        </section>

        {/* TOOLBAR CONTROLS */}
        <RecipeToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* CUISINE FILTER PILLS */}
        <CuisinePills
          cuisines={CUISINES}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
        />

        {/* CATALOG RESULTS CONTENT */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-xs font-mono uppercase tracking-widest text-amber-500">
              Loading Kitchen Catalog...
            </p>
          </div>
        ) : processedRecipes.length === 0 ? (
          <div className="py-16 sm:py-20 text-center border-2 border-dashed border-stone-200 dark:border-[#2C1F15] rounded-3xl p-6 sm:p-10 max-w-md mx-auto bg-white/50 dark:bg-[#151311]/50">
            <ChefHat size={40} className="mx-auto text-stone-400 dark:text-stone-500 mb-3" />
            <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">
              No recipes match your criteria
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              {recipes.length === 0
                ? "Your kitchen vault is empty. Click '+ Add Recipe' to register your first recipe."
                : "Try relaxing your search terms or picking another cuisine."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              {selectedCuisine !== "All" || searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCuisine("All");
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-stone-200"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsAddRecipeOpen(true)}
                className="px-4 py-2 text-xs font-bold text-[#140F0A] bg-[#f59e0b] hover:bg-[#d97706] rounded-xl transition-colors cursor-pointer"
              >
                + Add Recipe
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 pt-1">
            {groupedSections.map(({ groupName, items }) => (
              <section key={groupName} className="space-y-3">
                {/* Group Heading Banner */}
                <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-[#2C241E] pb-2 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight">
                      {groupName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Dense View (Default) vs Grid View */}
                {viewMode === "DENSE_LIST" ? (
                  <div className="rounded-2xl border border-stone-200/90 dark:border-[#2C241E] bg-white dark:bg-[#151311] overflow-hidden divide-y divide-stone-100 dark:divide-[#2C241E] shadow-2xs">
                    {items.map((item) => (
                      <RecipeListItem
                        key={item._id}
                        item={item}
                        onOpenCookMode={() =>
                          navigate(`/sous-chef/recipes/cook-mode?recipeId=${item._id}`)
                        }
                        onViewDetails={() =>
                          navigate(`/sous-chef/recipes/${item._id}`)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                    {items.map((item) => (
                      <RecipeCardItem
                        key={item._id}
                        item={item}
                        onOpenCookMode={() =>
                          navigate(`/sous-chef/recipes/cook-mode?recipeId=${item._id}`)
                        }
                        onViewDetails={() =>
                          navigate(`/sous-chef/recipes/${item._id}`)
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
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