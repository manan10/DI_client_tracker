// src/apps/recipes/pages/CookMode.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ListFilter,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  ChevronDown,
  Check,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

const CookMode = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const recipeId = searchParams.get("recipeId");

  // Recipe & Catalog State
  const [recipe, setRecipe] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);

  // Cooking Progression
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [servings, setServings] = useState(4);

  // Ingredients Drawer
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Active Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Wake Lock & Fullscreen State
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wakeLockRef = useRef(null);

  // Audio Chime Helper
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Ignore autoplay restrictions
    }
  }, [soundEnabled]);

  // Screen Wake Lock API
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          setWakeLockActive(true);
          wakeLockRef.current.addEventListener("release", () => {
            setWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn("Screen wake lock unavailable:", err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Fetch Current Recipe and all recipes for quick switching
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch all recipes first
        const listRes = await request("/recipes", "GET");
        let availableList = [];
        if (listRes?.success && Array.isArray(listRes.data)) {
          availableList = listRes.data;
        } else if (Array.isArray(listRes?.data)) {
          availableList = listRes.data;
        } else if (Array.isArray(listRes)) {
          availableList = listRes;
        }

        if (!isMounted) return;
        setAllRecipes(availableList);

        // Target recipe validation: Do not call if id is "cook-mode", "undefined", or null
        const isValidId = recipeId && recipeId !== "cook-mode" && recipeId !== "undefined";
        const targetId = isValidId ? recipeId : (availableList.length > 0 ? availableList[0]._id : null);

        if (targetId && targetId !== "cook-mode") {
          const detailRes = await request(`/recipes/${targetId}`, "GET");
          const recipeData = detailRes?.data || detailRes;
          if (isMounted && recipeData && recipeData.title) {
            setRecipe(recipeData);
            setServings(recipeData.baseServings || 4);
            setCurrentStepIndex(0);
            setCompletedSteps({});
            setCheckedIngredients({});
          }
        }
      } catch (err) {
        console.error("Cook Mode Load Error:", err);
        if (isMounted) {
          toast.error(err?.message || "Failed to load recipe data for cook mode");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [recipeId, request]);

  const handleSelectRecipe = (selectedId) => {
    setIsRecipePickerOpen(false);
    setSearchParams({ recipeId: selectedId });
  };

  // Synchronize Timer when moving between steps
  useEffect(() => {
    if (!recipe?.instructions) return;
    const currentStep = recipe.instructions[currentStepIndex];
    const duration = currentStep?.timerDurationSeconds || 0;

    setTimerInitialSeconds(duration);
    setTimerSeconds(duration);
    setIsTimerRunning(false);
  }, [currentStepIndex, recipe]);

  // Timer Tick Engine
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime();
      toast.success("Timer Complete!", {
        description: `Step ${currentStepIndex + 1} timer reached 0:00.`,
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentStepIndex, playChime]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevStep();
      } else if (e.key === " " && timerInitialSeconds > 0) {
        e.preventDefault();
        setIsTimerRunning((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const scaleRatio = useMemo(() => {
    if (!recipe?.baseServings || recipe.baseServings === 0) return 1;
    return servings / recipe.baseServings;
  }, [servings, recipe?.baseServings]);

  const totalSteps = recipe?.instructions?.length || 0;
  const currentStep = recipe?.instructions?.[currentStepIndex];

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleStepCompleted = (idx) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0E0C0A] flex flex-col items-center justify-center text-amber-400 gap-3 font-mono">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-400">
          Entering Hands-Free Kitchen Mode...
        </p>
      </div>
    );
  }

  // Safe fallback if no recipe or instructions are available
  if (!recipe || !currentStep) {
    return (
      <div className="h-screen w-screen bg-[#0E0C0A] flex flex-col items-center justify-center text-stone-300 p-6 text-center space-y-4 font-sans select-none">
        <ChefHat size={48} className="text-amber-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-white">Select a Recipe to Cook</h2>
        <p className="text-sm text-stone-400 max-w-sm">
          Pick a dish from your kitchen vault to launch hands-free Cook Mode.
        </p>

        {allRecipes.length > 0 && (
          <div className="w-full max-w-xs space-y-2 pt-2">
            {allRecipes.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => handleSelectRecipe(r._id)}
                className="w-full p-3 rounded-xl bg-[#1C140D] hover:bg-[#2A1D13] border border-[#3A281A] hover:border-amber-500/50 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="font-serif font-bold text-sm text-white truncate">{r.title}</span>
                <span className="text-[10px] font-mono text-amber-400 uppercase">{r.cuisine}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/sous-chef/recipes")}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Return to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0E0C0A] text-stone-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* 1. TOP STATUS & HUD BAR */}
      <header className="h-16 px-4 sm:px-8 border-b border-[#2C1F15] bg-[#140F0A]/95 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/sous-chef/recipes/${recipe._id}`)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Exit Cook Mode"
          >
            <X size={20} />
          </button>

          <div className="min-w-0 relative">
            <button
              type="button"
              onClick={() => setIsRecipePickerOpen(!isRecipePickerOpen)}
              className="text-left group cursor-pointer outline-none flex items-center gap-1.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                    Cook Mode • {recipe.cuisine}
                  </span>
                  {wakeLockActive && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Screen Active
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-lg font-serif font-bold text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                  {recipe.title}
                </h1>
              </div>
              <ChevronDown size={14} className="text-stone-400 group-hover:text-amber-400 shrink-0" />
            </button>

            {/* Quick Recipe Switcher Popover */}
            {isRecipePickerOpen && (
              <div className="absolute left-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl bg-[#1C140D] border border-amber-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 no-scrollbar">
                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                  Switch Active Recipe
                </div>
                {allRecipes.map((r) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => handleSelectRecipe(r._id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      r._id === recipe._id
                        ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                        : "text-stone-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{r.title}</span>
                    {r._id === recipe._id && <Check size={13} className="text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1C140D] border border-amber-500/30 text-xs">
            <Users size={13} className="text-amber-500 mr-1" />
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-5 h-5 rounded hover:bg-white/10 text-stone-300 font-bold cursor-pointer"
            >
              -
            </button>
            <span className="w-6 text-center font-mono font-bold text-amber-300">
              {servings}p
            </span>
            <button
              type="button"
              onClick={() => setServings((s) => s + 1)}
              className="w-5 h-5 rounded hover:bg-white/10 text-stone-300 font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "border-[#2C1F15] text-stone-500"
            }`}
            title={soundEnabled ? "Mute Timer Chime" : "Enable Timer Chime"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isIngredientsOpen
                ? "bg-amber-500 text-stone-950 border-amber-400 font-black shadow-lg shadow-amber-500/20"
                : "bg-[#1C140D] border-amber-500/30 text-amber-300 hover:border-amber-400"
            }`}
          >
            <ListFilter size={14} />
            <span className="hidden sm:inline">Ingredients</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/30">
              {Object.keys(checkedIngredients).length}/{recipe.ingredients?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-[#2C1F15] text-stone-400 hover:text-white transition-colors cursor-pointer hidden md:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* 2. PROGRESS STEP RIBBON */}
      <div className="w-full bg-[#17100B] px-4 sm:px-8 py-2 border-b border-[#2C1F15] flex items-center justify-between shrink-0 text-xs font-mono">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 mr-4">
          {recipe.instructions.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = completedSteps[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border ${
                  isCurrent
                    ? "bg-amber-500 text-stone-950 font-black border-amber-400 shadow-md"
                    : isDone
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                    : "bg-[#1F1710] text-stone-400 border-[#332215] hover:text-stone-200"
                }`}
              >
                <span>{isDone ? "✓" : idx + 1}</span>
                {step.title && (
                  <span className="truncate max-w-[90px] sm:max-w-[120px] text-[11px] font-sans">
                    {step.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <span className="text-amber-500 font-bold shrink-0">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* 3. MAIN COOKING ARENA */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-5xl mx-auto w-full no-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {currentStep.stepNumber || currentStepIndex + 1}
                </span>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-500/80 font-bold">
                    Current Directive
                  </span>
                  <h2 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {currentStep.title || `Cooking Step #${currentStepIndex + 1}`}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleStepCompleted(currentStepIndex)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  completedSteps[currentStepIndex]
                    ? "bg-emerald-500 text-stone-950 border-emerald-400 font-black shadow-md"
                    : "bg-[#1C140D] border-[#3A281A] text-stone-400 hover:text-stone-200"
                }`}
              >
                <CheckCircle2 size={16} />
                <span className="hidden sm:inline">
                  {completedSteps[currentStepIndex] ? "Step Complete" : "Mark Done"}
                </span>
              </button>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-[#140F0A] border-2 border-amber-500/30 shadow-2xl">
              <p className="text-lg sm:text-2xl lg:text-3xl text-stone-100 font-serif leading-relaxed sm:leading-loose">
                {currentStep.instruction}
              </p>

              {currentStep.chefTip && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
                  <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 uppercase font-mono tracking-wider mr-2">
                      Chef's Pro Tip:
                    </strong>
                    {currentStep.chefTip}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Step Timer HUD */}
          {timerInitialSeconds > 0 && (
            <div className="my-6 p-6 rounded-3xl bg-gradient-to-r from-[#1E140D] via-[#24180F] to-[#1E140D] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isTimerRunning ? "bg-amber-500 text-stone-950 animate-pulse shadow-lg shadow-amber-500/30" : "bg-[#140F0A] text-amber-400 border border-amber-500/30"}`}>
                  <Clock size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                    Step Countdown Timer
                  </span>
                  <span className="text-4xl sm:text-5xl font-mono font-black tabular-nums tracking-wider text-amber-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black font-mono text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
                    isTimerRunning
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                      : "bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 shadow-amber-500/30"
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause size={16} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      <span>{timerSeconds === timerInitialSeconds ? "Start Timer" : "Resume"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTimerSeconds((s) => s + 60)}
                  className="px-3.5 py-3 rounded-2xl bg-[#140F0A] hover:bg-white/10 border border-[#3A281A] text-stone-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                  title="Add 1 Minute"
                >
                  +1m
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(timerInitialSeconds);
                  }}
                  className="p-3 rounded-2xl bg-[#140F0A] hover:bg-white/10 border border-[#3A281A] text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Huge Tap Targets */}
          <div className="pt-6 flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={goToPrevStep}
              className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl bg-[#1C140D] hover:bg-[#251A11] border border-[#3A281A] text-stone-300 font-bold text-sm sm:text-base transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-98"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span>Previous Step</span>
            </button>

            {currentStepIndex < totalSteps - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm sm:text-base transition-all shadow-xl shadow-amber-500/20 cursor-pointer active:scale-98"
              >
                <span>Next Step</span>
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toast.success("Dish Completed! Shahi Rasoi compliments the chef!");
                  navigate(`/sous-chef/recipes/${recipe._id}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-sm sm:text-base transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                <CheckCircle2 size={20} strokeWidth={2.5} />
                <span>Finish Cooking</span>
              </button>
            )}
          </div>
        </main>

        {/* 4. INGREDIENTS SIDEBAR */}
        <aside
          className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-[#140F0A] border-l-2 border-amber-500/30 p-5 flex flex-col justify-between transition-transform duration-300 z-40 shadow-2xl ${
            isIngredientsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2C1F15]">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-amber-500" />
              <h3 className="font-serif font-bold text-base text-white">
                Ingredients Checklist
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsIngredientsOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="py-2 text-[11px] font-mono text-amber-400/80">
            Ratios dynamically scaled for <strong className="text-white">{servings} servings</strong> ({scaleRatio.toFixed(1)}x)
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 no-scrollbar">
            {recipe.ingredients?.map((ing, idx) => {
              const isChecked = checkedIngredients[idx];
              const scaledQty =
                ing.quantity > 0
                  ? Number((ing.quantity * scaleRatio).toFixed(2))
                  : 0;

              return (
                <div
                  key={idx}
                  onClick={() => toggleIngredient(idx)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    isChecked
                      ? "bg-emerald-950/20 border-emerald-500/30 text-stone-500 line-through"
                      : "bg-[#1C140D] border-[#332215] text-stone-200 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? "bg-emerald-500 text-stone-950 border-emerald-400"
                          : "border-stone-600"
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="truncate">{ing.name}</span>
                  </div>

                  <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                    {scaledQty > 0 ? scaledQty : ""} {ing.unit}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#2C1F15] flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={() => setCheckedIngredients({})}
              className="text-stone-400 hover:text-rose-400 cursor-pointer"
            >
              Reset Checklist
            </button>
            <span className="text-amber-500 font-bold">
              {Object.keys(checkedIngredients).length} / {recipe.ingredients?.length || 0} Ready
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CookMode;