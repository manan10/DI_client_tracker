// src/apps/recipes/pages/Recipies.jsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Loader2,
  Search,
  ArrowUpDown,
  LayoutGrid,
  BookOpen,
  Layers,
  ChevronDown,
  Check,
  Utensils,
  ConciergeBell,
  ChevronsDownUp,
  ChevronsUpDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import AddRecipeModal from "../components/AddRecipeModal";
import BistroMenuView from "../components/Recipies/BistroMenuView";
import CarteMenuView from "../components/Recipies/CarteMenuView";
import { slugifySection } from "../components/Recipies/recipeMenuUtils";
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

const GROUP_OPTIONS = [
  { id: "CUISINE", label: "Cuisine" },
  { id: "INGREDIENT", label: "Ingredient" },
  { id: "NONE", label: "All Dishes" },
];

const SORT_OPTIONS = [
  { id: "title-asc", label: "A–Z" },
  { id: "title-desc", label: "Z–A" },
  { id: "time-asc", label: "Fastest" },
  { id: "time-desc", label: "Slowest" },
];

// Sharp architectural editorial select matching the menu's print broadsheet geometry
const EditorialSelect = ({
  icon: Icon,
  prefix,
  value,
  options,
  onChange,
  className = "",
  align = "left",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const current = options.find((o) => o.id === value) || options[0];
  const isFiltered =
    value !== "ALL" && (prefix === "Cuisine" || prefix === "Course");

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full h-9 px-2.5 sm:px-3 border text-xs font-mono flex items-center justify-between gap-1.5 transition-colors cursor-pointer outline-none ${
          isFiltered
            ? "border-stone-900 dark:border-amber-400 bg-amber-500/15 dark:bg-amber-500/20 text-stone-900 dark:text-amber-300"
            : "border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-stone-500 text-stone-900 dark:text-white"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {Icon && (
            <Icon
              size={12}
              className="text-amber-700 dark:text-amber-400 shrink-0"
            />
          )}
          {prefix && (
            <span className="text-stone-400 dark:text-stone-500 font-bold uppercase text-[10px] shrink-0">
              {prefix}:
            </span>
          )}
          <span className="font-extrabold uppercase tracking-wider truncate text-[11px]">
            {current?.label}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`text-stone-500 dark:text-stone-400 shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-amber-600 dark:text-amber-400" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1 w-48 border-2 border-stone-900 dark:border-stone-600 bg-[#FAF9F6] dark:bg-[#14110E] shadow-lg divide-y divide-stone-200 dark:divide-stone-800 z-30 max-h-64 overflow-y-auto`}
        >
          {options.map((opt) => {
            const active = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer text-left ${
                  active
                    ? "bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 font-extrabold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/5 font-bold"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && (
                  <Check size={12} strokeWidth={2.8} className="shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Recipies = () => {
  const navigate = useNavigate();
  const { request } = useApi();

  // Data & Modal State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  // Filter & Grouping State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [groupBy, setGroupBy] = useState("CUISINE"); // "CUISINE" | "INGREDIENT" | "NONE"
  const [sortBy, setSortBy] = useState("title-asc");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Collapsible Sections State
  const [collapsedSections, setCollapsedSections] = useState({});

  // Persisted 2-View Switcher State ("BISTRO" | "INDEX")
  const [menuStyle, setMenuStyle] = useState(() => {
    const saved = localStorage.getItem("sous-chef-menu-edition");
    return saved === "BISTRO" || saved === "INDEX" ? saved : "BISTRO";
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

  // Dynamically derive available cuisines from the recipe catalog
  const cuisineOptions = useMemo(() => {
    const uniqueCuisines = new Set();
    recipes.forEach((r) => {
      if (r.cuisine && r.cuisine.trim()) {
        uniqueCuisines.add(r.cuisine.trim());
      }
    });
    const sorted = Array.from(uniqueCuisines).sort((a, b) => a.localeCompare(b));
    return [
      { id: "ALL", label: "All Cuisines" },
      ...sorted.map((c) => ({ id: c, label: c })),
    ];
  }, [recipes]);

  // Dynamically derive available course types from the recipe catalog
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set();
    recipes.forEach((r) => {
      if (r.courseType && r.courseType.trim()) {
        uniqueCourses.add(r.courseType.trim());
      }
    });
    const sorted = Array.from(uniqueCourses).sort((a, b) => a.localeCompare(b));
    return [
      { id: "ALL", label: "All Courses" },
      ...sorted.map((c) => ({ id: c, label: c })),
    ];
  }, [recipes]);

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
      // 1. Cuisine Filter
      if (selectedCuisine !== "ALL") {
        const itemCuisine = (item.cuisine || "").trim();
        if (itemCuisine !== selectedCuisine) return false;
      }

      // 2. Course Type Filter
      if (selectedCourse !== "ALL") {
        const itemCourse = (item.courseType || "").trim();
        if (itemCourse !== selectedCourse) return false;
      }

      // 3. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDescription = item.description?.toLowerCase().includes(query);
        const matchesCuisine = item.cuisine?.toLowerCase().includes(query);
        const matchesCourse = item.courseType?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesIngredients = item.ingredients?.some((ing) => {
          const name = typeof ing === "string" ? ing : ing.name || "";
          return name.toLowerCase().includes(query);
        });
        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesCuisine &&
          !matchesCourse &&
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
  }, [recipes, selectedCuisine, selectedCourse, searchTerm, sortBy]);

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

  // Collapse / Expand Helpers
  const toggleSection = (groupName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const areAllCollapsed = useMemo(() => {
    if (groupedSections.length === 0) return false;
    return groupedSections.every((sec) => Boolean(collapsedSections[sec.groupName]));
  }, [groupedSections, collapsedSections]);

  const handleToggleCollapseAll = () => {
    if (areAllCollapsed) {
      setCollapsedSections({});
    } else {
      const next = {};
      groupedSections.forEach((sec) => {
        next[sec.groupName] = true;
      });
      setCollapsedSections(next);
    }
  };

  const handleJumpToSection = (groupName) => {
    setCollapsedSections((prev) => {
      if (!prev[groupName]) return prev;
      const next = { ...prev };
      delete next[groupName];
      return next;
    });

    requestAnimationFrame(() => {
      const el = document.getElementById(slugifySection(groupName));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCuisine !== "ALL") count++;
    if (selectedCourse !== "ALL") count++;
    if (groupBy !== "CUISINE") count++;
    if (sortBy !== "title-asc") count++;
    return count;
  }, [selectedCuisine, selectedCourse, groupBy, sortBy]);

  const activeFiltersLabel = useMemo(() => {
    const parts = [];
    if (selectedCuisine !== "ALL") parts.push(selectedCuisine);
    if (selectedCourse !== "ALL") parts.push(selectedCourse);
    if (searchTerm.trim()) parts.push(`"${searchTerm.trim()}"`);
    return parts.join(" • ");
  }, [selectedCuisine, selectedCourse, searchTerm]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCuisine !== "ALL" ||
    selectedCourse !== "ALL";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("ALL");
    setSelectedCourse("ALL");
    setGroupBy("CUISINE");
    setSortBy("title-asc");
  };

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
      <main className="w-full max-w-[120rem] mx-auto px-3.5 sm:px-8 lg:px-12 2xl:px-16 pt-4 sm:pt-9">
        
        {/* ========================================================================= */}
        {/* COMPACT RESTAURANT MASTHEAD & ARCHITECTURAL FILTER BAR                    */}
        {/* ========================================================================= */}
        <header className="mb-4 sm:mb-7">
          {/* Top Double-Rule Architectural Header */}
          <div className="border-t-2 sm:border-t-4 border-stone-900 dark:border-stone-200 pt-0.5 sm:pt-1">
            <div className="border-t border-stone-900 dark:border-stone-200 pt-2.5 pb-3 sm:pt-4 sm:pb-5 border-b-2 border-stone-900 dark:border-stone-200 flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40">
                    शाही रसोई • House Repertoire
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200 dark:bg-[#2A2520] text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600 tabular-nums">
                    {processedRecipes.length}{" "}
                    {processedRecipes.length === 1 ? "Selection" : "Selections"}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-6xl lg:text-7xl font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white leading-[0.9]">
                  Off The{" "}
                  <span className="text-amber-700 dark:text-[#f59e0b]">Menu</span>
                </h1>
              </div>

              <div className="md:text-right space-y-1">
                <p className="hidden sm:block text-xs sm:text-sm font-mono font-bold text-stone-800 dark:text-stone-200">
                  An exhaustive list of things we swear we know how to cook.
                </p>
                <div className="flex flex-wrap md:justify-end items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
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
          {/* UNIFIED CONTROL ROW (SINGLE ROW ON MOBILE, INLINE ON DESKTOP)         */}
          {/* ===================================================================== */}
          <div className="pt-3 sm:pt-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 font-mono">
            
            {/* Primary Strip: Search + Mobile Filter Trigger + View Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              {/* Crisp Sharp-Cornered Search Input */}
              <div className="relative flex-1 xl:max-w-96 min-w-0">
                <Search
                  size={14}
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dishes, ingredients..."
                  className="w-full h-9 pl-8 sm:pl-9 pr-8 sm:pr-14 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Mobile / Tablet Expandable Filters Drawer Trigger (< xl) */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className={`xl:hidden h-9 px-2.5 sm:px-3 border inline-flex items-center justify-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  isMobileFiltersOpen || activeFilterCount > 0
                    ? "border-stone-900 dark:border-amber-400 bg-amber-500/15 dark:bg-amber-500/20 text-stone-900 dark:text-amber-300"
                    : "border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-stone-800 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-500"
                }`}
                aria-expanded={isMobileFiltersOpen}
                aria-label="Toggle Menu Filters"
              >
                <SlidersHorizontal
                  size={13}
                  className="text-amber-700 dark:text-amber-400 shrink-0"
                />
                <span className="hidden xs:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 text-[9px] font-black tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile / Tablet Icon-Only 2-Edition Toggle (< xl) */}
              <div className="xl:hidden inline-flex items-center h-9 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] divide-x divide-stone-900/30 dark:divide-stone-700 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectMenuStyle("BISTRO")}
                  className={`h-full px-2.5 sm:px-3 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    menuStyle === "BISTRO"
                      ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Bistro Course Boxes"
                  aria-label="Bistro Course Boxes"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">Bistro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMenuStyle("INDEX")}
                  className={`h-full px-2.5 sm:px-3 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    menuStyle === "INDEX"
                      ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Chef's Tasting Carte"
                  aria-label="Chef's Tasting Carte"
                >
                  <BookOpen size={13} />
                  <span className="hidden sm:inline">Carte</span>
                </button>
              </div>
            </div>

            {/* Expandable Filter Tray on Mobile/Tablet; Always Inline on Desktop (xl+) */}
            <div
              className={`${
                isMobileFiltersOpen
                  ? "grid grid-cols-2 sm:flex sm:flex-wrap p-2.5 border border-stone-900/30 dark:border-stone-700 bg-stone-100/70 dark:bg-[#14110E]/90"
                  : "hidden"
              } xl:flex xl:flex-nowrap xl:p-0 xl:border-0 xl:bg-transparent items-center gap-2 shrink-0`}
            >
              {/* 1. Cuisine Filter Dropdown */}
              <EditorialSelect
                icon={Utensils}
                prefix="Cuisine"
                value={selectedCuisine}
                options={cuisineOptions}
                onChange={setSelectedCuisine}
                className="w-full sm:w-44"
              />

              {/* 2. Course Filter Dropdown */}
              <EditorialSelect
                icon={ConciergeBell}
                prefix="Course"
                value={selectedCourse}
                options={courseOptions}
                onChange={setSelectedCourse}
                className="w-full sm:w-44"
              />

              {/* 3. Section Grouping Dropdown */}
              <EditorialSelect
                icon={Layers}
                prefix="Group"
                value={groupBy}
                options={GROUP_OPTIONS}
                onChange={setGroupBy}
                className="w-full sm:w-40"
              />

              {/* 4. Sort Dropdown */}
              <EditorialSelect
                icon={ArrowUpDown}
                prefix="Sort"
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
                align="right"
                className="w-full sm:w-32"
              />

              {/* 5. Collapse / Expand All Sections Button */}
              {groupedSections.length > 1 && (
                <button
                  type="button"
                  onClick={handleToggleCollapseAll}
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto h-9 px-2.5 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] hover:border-stone-900 dark:hover:border-stone-500 text-stone-700 dark:text-stone-300 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  title={
                    areAllCollapsed ? "Expand All Sections" : "Collapse All Sections"
                  }
                >
                  {areAllCollapsed ? (
                    <>
                      <ChevronsUpDown
                        size={13}
                        className="text-amber-700 dark:text-amber-400"
                      />
                      <span>Expand All</span>
                    </>
                  ) : (
                    <>
                      <ChevronsDownUp
                        size={13}
                        className="text-amber-700 dark:text-amber-400"
                      />
                      <span>Collapse All</span>
                    </>
                  )}
                </button>
              )}

              {/* 6. Desktop Sharp 2-Edition Toggle (Bistro vs Carte) */}
              <div className="hidden xl:inline-flex items-center h-9 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] divide-x divide-stone-900/30 dark:divide-stone-700 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectMenuStyle("BISTRO")}
                  className={`h-full px-3 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    menuStyle === "BISTRO"
                      ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Bistro Course Boxes"
                >
                  <LayoutGrid size={12} />
                  <span>Bistro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMenuStyle("INDEX")}
                  className={`h-full px-3 inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    menuStyle === "INDEX"
                      ? "bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Chef's Tasting Carte"
                >
                  <BookOpen size={12} />
                  <span>Carte</span>
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* STICKY SECTION JUMP-TO INDEX RAIL                                     */}
          {/* ===================================================================== */}
          {!loading && groupedSections.length > 1 && (
            <nav
              aria-label="Menu Sections"
              className="sticky top-0 z-20 mt-2.5 sm:mt-3.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-3 py-1.5 sm:py-2 bg-[#FAF9F6]/95 dark:bg-[#0E0C0A]/95 backdrop-blur-md border-y border-stone-900/25 dark:border-stone-700/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar font-mono"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 dark:text-stone-500 shrink-0 pr-0.5">
                Jump:
              </span>
              {groupedSections.map(({ groupName, items }) => {
                const isCollapsed = Boolean(collapsedSections[groupName]);
                return (
                  <button
                    key={groupName}
                    type="button"
                    onClick={() => handleJumpToSection(groupName)}
                    className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                      isCollapsed
                        ? "border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-[#14110E] text-stone-500 dark:text-stone-500"
                        : "border-stone-900/30 dark:border-stone-700 bg-white dark:bg-[#181410] text-stone-800 dark:text-stone-200 hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold"
                    }`}
                  >
                    <span>{groupName}</span>
                    <span className="text-amber-700 dark:text-amber-400 font-extrabold tabular-nums">
                      ({items.length})
                    </span>
                  </button>
                );
              })}
            </nav>
          )}
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
          <div className="py-20 text-center border-2 border-dashed border-stone-300 dark:border-stone-700 p-8 max-w-lg mx-auto">
            <ChefHat size={38} className="mx-auto text-stone-400 mb-3" />
            <h3 className="font-sans font-[1000] uppercase tracking-tighter text-xl text-stone-900 dark:text-white">
              Nothing on the Menu Matches
            </h3>
            <p className="text-xs font-mono text-stone-600 dark:text-stone-300 mt-2">
              Try clearing your active filters or adding a new dish to the kitchen archive.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 border border-stone-900 dark:border-amber-400 bg-stone-900 dark:bg-[#f59e0b] text-white dark:text-[#140F0A] text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {menuStyle === "BISTRO" && (
              <BistroMenuView
                groupedSections={groupedSections}
                collapsedSections={collapsedSections}
                onToggleSection={toggleSection}
                onOpenDetails={openDetails}
                onOpenCookMode={openCookMode}
                groupBy={groupBy}
                activeFiltersLabel={activeFiltersLabel}
              />
            )}

            {menuStyle === "INDEX" && (
              <CarteMenuView
                groupedSections={groupedSections}
                collapsedSections={collapsedSections}
                onToggleSection={toggleSection}
                onOpenDetails={openDetails}
                onOpenCookMode={openCookMode}
                groupBy={groupBy}
                activeFiltersLabel={activeFiltersLabel}
              />
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