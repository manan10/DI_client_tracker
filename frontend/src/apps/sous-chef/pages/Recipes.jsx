// src/apps/recipes/pages/Recipies.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Clock,
  Users,
  ChevronRight,
  RotateCcw,
  ChefHat,
  Leaf,
  Play,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import AddRecipeModal from "../components/AddRecipeModal";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

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

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  // Dietary Toggle Filters
  const [dietary, setDietary] = useState({
    isJain: false,
    isSwaminarayan: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });

  // Dynamic Servings Preview Stepper (Default 4)
  const [globalServings, setGlobalServings] = useState(4);

  // Fetch from backend using exact useApi signature: request(endpoint, method)
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

  const toggleDietaryFilter = (key) => {
    setDietary((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("All");
    setDietary({
      isJain: false,
      isSwaminarayan: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
    });
  };

  // Called when AddRecipeModal successfully saves to backend
  const handleRecipeCreated = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  // Filtered recipes pipeline
  const filteredRecipes = useMemo(() => {
    return recipes.filter((item) => {
      // Text Search
      if (
        searchTerm.trim() &&
        !item.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
        !item.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase().trim()))
      ) {
        return false;
      }

      // Cuisine Pill
      if (selectedCuisine !== "All" && item.cuisine !== selectedCuisine) {
        return false;
      }

      // Dietary Filters
      if (dietary.isJain && !item.dietaryFlags?.isJain) return false;
      if (dietary.isSwaminarayan && !item.dietaryFlags?.isSwaminarayan) return false;
      if (dietary.isVegetarian && !item.dietaryFlags?.isVegetarian) return false;
      if (dietary.isVegan && !item.dietaryFlags?.isVegan) return false;
      if (dietary.isGlutenFree && !item.dietaryFlags?.isGlutenFree) return false;

      return true;
    });
  }, [recipes, searchTerm, selectedCuisine, dietary]);

  const hasActiveDietary = Object.values(dietary).some(Boolean);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20 md:pb-10 select-none">
      {/* ========================================================================= */}
      {/* CHEF NAVBAR                                                               */}
      {/* ========================================================================= */}
      <ChefNavbar onOpenAddRecipe={() => setIsAddRecipeOpen(true)} />

      {/* ========================================================================= */}
      {/* MAIN VAULT WORKSPACE                                                      */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* --- SEARCH & PORTION CONTROLS BAR --- */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes by name, ingredient, or tag (e.g. Khichdi, Kathiyawadi)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#2C241E] bg-white dark:bg-[#151311] text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dynamic Portion Scaler Stepper */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-[#2C241E] bg-white dark:bg-[#151311] shadow-2xs shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300">
              <Users size={14} className="text-amber-600 dark:text-[#f59e0b]" />
              <span>Portions:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGlobalServings((s) => Math.max(1, s - 1))}
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
              >
                -
              </button>
              <span className="w-7 text-center font-bold text-sm text-amber-700 dark:text-[#f59e0b]">
                {globalServings}
              </span>
              <button
                type="button"
                onClick={() => setGlobalServings((s) => s + 1)}
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* --- DIETARY TOGGLE FLAGS --- */}
        <section className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-1">
            <Leaf size={13} className="text-emerald-600" />
            <span>Dietary:</span>
          </div>

          {[
            { key: "isJain", label: "Jain" },
            { key: "isSwaminarayan", label: "Swaminarayan" },
            { key: "isVegetarian", label: "Vegetarian" },
            { key: "isVegan", label: "Vegan" },
            { key: "isGlutenFree", label: "Gluten-Free" },
          ].map(({ key, label }) => {
            const isActive = dietary[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDietaryFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-xs"
                    : "bg-white dark:bg-[#151311] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-[#2C241E] hover:border-emerald-400 dark:hover:border-emerald-500/50"
                }`}
              >
                {label}
              </button>
            );
          })}

          {hasActiveDietary && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline ml-1 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </section>

        {/* --- CUISINE FILTER PILLS --- */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CUISINES.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                type="button"
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#f59e0b] text-[#151311] font-bold shadow-xs"
                    : "bg-white dark:bg-[#151311] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#2C241E] hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </section>

        {/* ========================================================================= */}
        {/* RECIPES CATALOG                                                           */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-xs font-mono uppercase tracking-widest text-amber-500">
              Connecting to Royal Rasoi Database...
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-stone-200 dark:border-[#2C1F15] rounded-2xl p-8 max-w-md mx-auto">
            <ChefHat size={36} className="mx-auto text-stone-400 dark:text-stone-500 mb-2" />
            <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
              No recipes found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {recipes.length === 0
                ? "Your kitchen vault is empty. Click 'Add Recipe' to register your first recipe into MongoDB."
                : "Try relaxing your dietary filters or searching for another keyword."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {hasActiveDietary && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-white/5 rounded-lg cursor-pointer"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAddRecipeOpen(true)}
                className="px-4 py-1.5 text-xs font-bold text-[#140F0A] bg-[#f59e0b] hover:bg-[#d97706] rounded-lg transition-colors cursor-pointer"
              >
                + Add Recipe
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecipes.map((item) => {
              const totalTime = (item.prepTimeMinutes || 0) + (item.cookTimeMinutes || 0);
              const baseServ = item.baseServings || 4;
              const scaleRatio = globalServings / baseServ;

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#151311] border border-stone-200/90 dark:border-[#2C241E] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Banner Image / Video Tag */}
                  <div className="relative h-44 w-full bg-stone-100 dark:bg-[#1E1915] overflow-hidden">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <UtensilsCrossed size={28} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {item.video?.embedUrl && (
                      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/90 text-white backdrop-blur-xs">
                        <Play size={10} fill="currentColor" />
                        Video
                      </span>
                    )}

                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                      {item.cuisine}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Dietary Badges */}
                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                        {item.dietaryFlags?.isJain && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                            Jain
                          </span>
                        )}
                        {item.dietaryFlags?.isSwaminarayan && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                            Swaminarayan
                          </span>
                        )}
                        {item.dietaryFlags?.isGlutenFree && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">
                            GF
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-snug group-hover:text-[#f59e0b] transition-colors">
                        {item.title}
                      </h2>

                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {totalTime} mins
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={12} />
                          {globalServings} Servings
                          {scaleRatio !== 1 && (
                            <span className="text-[10px] text-[#f59e0b] font-bold">
                              ({scaleRatio.toFixed(1)}x)
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{item.difficulty}</span>
                      </div>
                    </div>

                    {/* Scaled Ingredients Snapshot */}
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 dark:border-[#2C241E] space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Ingredients ({item.ingredients.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 3).map((ing, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-300"
                            >
                              {(ing.quantity * scaleRatio).toFixed(1).replace(/\.0$/, "")}{" "}
                              {ing.unit} {ing.name}
                            </span>
                          ))}
                          {item.ingredients.length > 3 && (
                            <span className="text-[10px] text-stone-400 self-center">
                              +{item.ingredients.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-stone-50 dark:bg-white/[0.02] border-t border-stone-100 dark:border-[#2C241E] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(`/sous-chef/recipes/cook-mode?recipeId=${item._id}`)}
                      className="text-xs font-serif italic text-amber-800 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Cook Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/sous-chef/recipes/${item._id}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                    >
                      <span>View Recipe</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ADD RECIPE MODAL                                                          */}
      {/* ========================================================================= */}
      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onClose={() => setIsAddRecipeOpen(false)}
        onRecipeCreated={handleRecipeCreated}
      />
    </div>
  );
};

export default Recipies;