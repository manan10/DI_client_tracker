// src/apps/recipes/pages/RecipeDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  ChefHat,
  Play,
  Check,
  Timer,
  RotateCcw,
  Sparkles,
  Share2,
  Bookmark,
  AlertCircle,
  ExternalLink,
  Pause,
  UtensilsCrossed,
  Leaf,
  Layers,
} from "lucide-react";
import ChefNavbar from "../components/ChefNavbar";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

// Step Timer Component for active cooking countdowns
const StepTimer = ({ initialSeconds, stepTitle }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      toast.success(`Timer finished for: ${stepTitle || "Cooking Step"}!`, {
        duration: 6000,
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, stepTitle]);

  const toggleTimer = () => setIsRunning((r) => !r);
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A120B] border border-amber-500/30 text-xs font-mono">
      <Timer size={14} className={isRunning ? "text-amber-400 animate-pulse" : "text-stone-400"} />
      <span className={`font-bold tabular-nums ${secondsLeft === 0 ? "text-emerald-400" : "text-amber-300"}`}>
        {formatTime(secondsLeft)}
      </span>

      <button
        type="button"
        onClick={toggleTimer}
        className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer"
        title={isRunning ? "Pause Timer" : "Start Timer"}
      >
        {isRunning ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
      </button>

      <button
        type="button"
        onClick={resetTimer}
        className="p-1 rounded-md text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
        title="Reset Timer"
      >
        <RotateCcw size={11} />
      </button>
    </div>
  );
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic portion scaling
  const [servings, setServings] = useState(4);

  // Interactive Checklist states
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});

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
          toast.error("Recipe not found in vault");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to load recipe details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, request]);

  // Dynamic scale ratio
  const scaleRatio = useMemo(() => {
    if (!recipe?.baseServings || recipe.baseServings === 0) return 1;
    return servings / recipe.baseServings;
  }, [servings, recipe?.baseServings]);

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleStepComplete = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Recipe link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-900 dark:text-stone-100 font-sans">
        <ChefNavbar />
        <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-stone-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-amber-500">
            Unsealing Recipe from Royal Rasoi...
          </p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-900 dark:text-stone-100 font-sans">
        <ChefNavbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <ChefHat size={40} className="mx-auto text-stone-500" />
          <h2 className="text-xl font-serif font-bold">Recipe Not Found</h2>
          <p className="text-xs text-stone-400">
            The requested recipe does not exist or has been removed from the registry.
          </p>
          <button
            type="button"
            onClick={() => navigate("/sous-chef/recipes")}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider"
          >
            Return to Vault
          </button>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300 pb-24 md:pb-16 select-none">
      {/* Top Navbar */}
      <ChefNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* TOP BREADCRUMB & UTILITY BAR */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/sous-chef/recipes")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-amber-500 dark:text-stone-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Recipes</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-stone-200 dark:border-[#2C1F15] bg-white dark:bg-[#140F0A] text-stone-600 dark:text-stone-300 hover:text-amber-500 transition-colors shadow-2xs cursor-pointer"
              title="Share Recipe"
            >
              <Share2 size={15} />
            </button>
            <Link
              to={`/sous-chef/recipes/cook-mode?recipeId=${recipe._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Flame size={14} fill="currentColor" />
              <span>Launch Cook Mode</span>
            </Link>
          </div>
        </div>

        {/* HERO HEADER & TITLE */}
        <div className="space-y-4">
          {/* Dietary & Cuisine Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-serif font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {recipe.cuisine} • {recipe.courseType}
            </span>

            {recipe.dietaryFlags?.isJain && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                Jain Friendly
              </span>
            )}
            {recipe.dietaryFlags?.isSwaminarayan && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                Swaminarayan
              </span>
            )}
            {recipe.dietaryFlags?.isVegetarian && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                Vegetarian
              </span>
            )}
            {recipe.dietaryFlags?.isGlutenFree && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">
                Gluten-Free
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-white tracking-tight leading-tight">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-3xl leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#140F0A] border border-stone-200 dark:border-[#2C1F15] shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Prep Time
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800 dark:text-stone-200">
                <Clock size={15} className="text-amber-500" />
                <span>{recipe.prepTimeMinutes || 0} mins</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#140F0A] border border-stone-200 dark:border-[#2C1F15] shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Cook Time
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800 dark:text-stone-200">
                <Flame size={15} className="text-orange-500" />
                <span>{recipe.cookTimeMinutes || 0} mins</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#140F0A] border border-stone-200 dark:border-[#2C1F15] shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Total Duration
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                <span>{totalTime} mins</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#140F0A] border border-stone-200 dark:border-[#2C1F15] shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Difficulty
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800 dark:text-stone-200 capitalize">
                <span>{recipe.difficulty || "Medium"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MEDIA SECTION: VIDEO IFRAME OR COVER IMAGE */}
        {(recipe.video?.embedUrl || recipe.coverImage) && (
          <div className="rounded-3xl overflow-hidden bg-black border border-stone-200 dark:border-[#2C1F15] shadow-xl">
            {recipe.video?.embedUrl ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={recipe.video.embedUrl}
                  title={recipe.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : recipe.coverImage ? (
              <div className="h-72 sm:h-96 w-full overflow-hidden">
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* MAIN SPLIT: INGREDIENTS WITH PORTION SCALER vs METHOD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INGREDIENTS LIST & DYNAMIC SCALER (5 Cols) */}
          <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#140F0A] border-2 border-amber-500/30 shadow-md space-y-5">
              
              {/* Portion Scaler Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[#2C1F15]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                    Ingredients
                  </h3>
                  <span className="text-xs text-stone-400">
                    {recipe.ingredients?.length || 0} items listed
                  </span>
                </div>

                {/* Servings Stepper */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-100 dark:bg-[#201710] border border-stone-200 dark:border-[#382518]">
                  <button
                    type="button"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-white/10 active:scale-95 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-amber-500 font-mono">
                    {servings}p
                  </span>
                  <button
                    type="button"
                    onClick={() => setServings((s) => s + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-white/10 active:scale-95 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {scaleRatio !== 1 && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center justify-between">
                  <span>Portions scaled by {scaleRatio.toFixed(2)}x</span>
                  <button
                    type="button"
                    onClick={() => setServings(recipe.baseServings || 4)}
                    className="underline text-[11px] font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Ingredients Checklist */}
              <div className="space-y-2">
                {recipe.ingredients?.map((ing, idx) => {
                  const isChecked = checkedIngredients[idx];
                  const scaledQty =
                    ing.quantity > 0
                      ? Number((ing.quantity * scaleRatio).toFixed(2))
                      : 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredientCheck(idx)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border ${
                        isChecked
                          ? "bg-emerald-950/20 border-emerald-500/30 text-stone-400 line-through"
                          : "bg-stone-50 dark:bg-[#1A120B] border-stone-200 dark:border-[#2C1F15] text-stone-800 dark:text-stone-200 hover:border-amber-500/40"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-emerald-500 text-stone-950 border-emerald-400"
                            : "border-stone-400 dark:border-stone-600"
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>

                      <div className="flex-1 text-xs leading-relaxed">
                        <span className="font-bold text-amber-500 mr-1.5 font-mono">
                          {scaledQty > 0 ? scaledQty : ""} {ing.unit}
                        </span>
                        <span className={isChecked ? "opacity-60" : "font-medium"}>
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <span className="text-[11px] text-stone-400 ml-1 italic">
                            ({ing.notes})
                          </span>
                        )}
                        {ing.isPantryStaple && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-stone-200 dark:bg-stone-800 text-stone-500">
                            Staple
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* RIGHT: METHOD & STEP-BY-STEP INSTRUCTIONS (7 Cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-white">
                  Cooking Instructions
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Follow the numbered sequence. Click a step to mark it completed.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-amber-500">
                {Object.values(completedSteps).filter(Boolean).length} / {recipe.instructions?.length || 0} Done
              </div>
            </div>

            <div className="space-y-4">
              {recipe.instructions?.map((step, idx) => {
                const isDone = completedSteps[idx];

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-emerald-950/15 border-emerald-500/30 opacity-75"
                        : "bg-white dark:bg-[#140F0A] border-stone-200 dark:border-[#2C1F15] shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div
                        onClick={() => toggleStepComplete(idx)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono border ${
                            isDone
                              ? "bg-emerald-500 text-stone-950 border-emerald-400"
                              : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {isDone ? <Check size={13} strokeWidth={3} /> : step.stepNumber || idx + 1}
                        </div>

                        {step.title && (
                          <h4 className={`font-bold text-sm ${isDone ? "line-through text-stone-400" : "text-stone-900 dark:text-white"}`}>
                            {step.title}
                          </h4>
                        )}
                      </div>

                      {/* Step Timer if duration exists */}
                      {step.timerDurationSeconds > 0 && (
                        <StepTimer
                          initialSeconds={step.timerDurationSeconds}
                          stepTitle={step.title}
                        />
                      )}
                    </div>

                    <p
                      onClick={() => toggleStepComplete(idx)}
                      className={`text-xs sm:text-sm leading-relaxed pl-9 cursor-pointer ${
                        isDone ? "text-stone-400 line-through" : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {step.instruction}
                    </p>

                    {step.chefTip && (
                      <div className="mt-3 ml-9 p-2.5 rounded-xl bg-amber-500/10 border-l-2 border-amber-500 text-xs text-amber-300 italic">
                        <span className="font-bold not-italic mr-1 text-amber-400">Chef's Tip:</span>
                        {step.chefTip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* BOTTOM TAG CLOUD */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="pt-6 border-t border-stone-200 dark:border-[#2C1F15] flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 mr-2">
              Tags:
            </span>
            {recipe.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-[#1A120B] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-[#2C1F15]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default RecipeDetail;