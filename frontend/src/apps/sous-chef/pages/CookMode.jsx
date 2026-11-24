// src/apps/recipes/pages/CookMode.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  X,
  Play,
  Pause,
  ChefHat,
  Plus,
  ListOrdered,
  Minus,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";
import {
  INGREDIENT_CATEGORIES,
  classifyIngredientCategory,
  formatTimer,
} from "../components/CookMode/cookModeUtils";
import CookModeHeader from "../components/CookMode/CookModeHeader";
import MiseEnPlaceList from "../components/CookMode/MiseEnPlaceList";
import CookModeStepStage from "../components/CookMode/CookModeStepStage";
import CookModeBottomDock from "../components/CookMode/CookModeBottomDock";
import CookModeSheets from "../components/CookMode/CookModeSheets";

const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const getSessionKey = (id) => `shahi_cook_session_${id}`;

const CookMode = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const recipeId = searchParams.get("recipeId");

  // Recipe & Catalog State
  const [recipe, setRecipe] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cooking Progression (Explicit step completion only)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [servings, setServings] = useState(4);

  // Video & Mobile Sheets
  const [showMobileVideo, setShowMobileVideo] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Timestamp-Backed Parallel Multi-Timer Engine
  const [timers, setTimers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  // Kitchen Ergonomics
  const [largeText, setLargeText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Request OS / Browser Notification Permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported on this browser");
      return false;
    }
    if (Notification.permission === "granted") {
      setNotifPermission("granted");
      return true;
    }
    if (Notification.permission !== "denied") {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === "granted") {
        toast.success("Phone timer alerts enabled!");
        return true;
      }
    }
    toast.error("Enable notifications in browser settings for timer alerts");
    return false;
  }, []);

  // Send Phone Banner Notification
  const sendPhoneNotification = useCallback((title, body, tag) => {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            tag,
            vibrate: [250, 120, 250],
            renotify: true,
          });
        });
      } else {
        new Notification(title, { body, tag });
      }
    } catch {
      // Handled silently
    }
  }, []);

  // Audio + Vibration Chime
  const playChime = useCallback(
    (isWarning = false) => {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(
            isWarning ? [150, 80, 150] : [250, 120, 250, 120, 400]
          );
        }
      } catch {
        // Ignore unsupported vibration
      }

      if (!soundEnabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        if (isWarning) {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        } else {
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
          osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.32);
        }

        gain.gain.setValueAtTime(0.32, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.95);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.95);
      } catch {
        // Handled silently
      }
    },
    [soundEnabled]
  );

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
      } catch {
        setWakeLockActive(false);
      }
    };

    requestWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
    };
  }, []);

  // Accidental Tab Close / Refresh Guard
  useEffect(() => {
    const hasRunningTimer = timers.some(
      (t) => t.isRunning && t.remainingSeconds > 0
    );
    if (!hasRunningTimer) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timers]);

  // Cleanup Speech Synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex, recipe]);

  // Fetch Recipe & Restore Saved Cooking Session
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setIsHydrated(false);
      try {
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

        const isValidId =
          recipeId && recipeId !== "cook-mode" && recipeId !== "undefined";
        const targetId = isValidId
          ? recipeId
          : availableList.length > 0
          ? availableList[0]._id
          : null;

        if (targetId && targetId !== "cook-mode") {
          const detailRes = await request(`/recipes/${targetId}`, "GET");
          const recipeData = detailRes?.data || detailRes;

          if (isMounted && recipeData && recipeData.title) {
            setRecipe(recipeData);

            let restored = false;
            try {
              const rawSaved = localStorage.getItem(
                getSessionKey(recipeData._id)
              );
              if (rawSaved) {
                const parsed = JSON.parse(rawSaved);
                const isFresh =
                  parsed.updatedAt &&
                  Date.now() - parsed.updatedAt < SESSION_TTL_MS;

                if (isFresh) {
                  const maxStep = Math.max(
                    0,
                    (recipeData.instructions?.length || 1) - 1
                  );
                  setCurrentStepIndex(
                    Math.min(parsed.currentStepIndex || 0, maxStep)
                  );
                  setCompletedSteps(parsed.completedSteps || {});
                  setCheckedIngredients(parsed.checkedIngredients || {});
                  setServings(parsed.servings || recipeData.baseServings || 4);

                  const now = Date.now();
                  const restoredTimers = (parsed.timers || []).map((t) => {
                    if (t.isRunning && t.endTimestamp) {
                      const rem = Math.max(
                        0,
                        Math.round((t.endTimestamp - now) / 1000)
                      );
                      return {
                        ...t,
                        remainingSeconds: rem,
                        isRunning: rem > 0,
                      };
                    }
                    return t;
                  });
                  setTimers(restoredTimers);
                  restored = true;
                  toast.info("Resumed your active cooking session");
                } else {
                  localStorage.removeItem(getSessionKey(recipeData._id));
                }
              }
            } catch {
              // Ignore storage parse error
            }

            if (!restored) {
              setServings(recipeData.baseServings || 4);
              setCurrentStepIndex(0);
              setCompletedSteps({});
              setCheckedIngredients({});
              setTimers([]);
            }

            setShowMobileVideo(false);
            setIsHydrated(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err?.message || "Failed to load recipe for Cook Mode");
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

  // Auto-Persist Session State
  useEffect(() => {
    if (!isHydrated || !recipe?._id) return;
    try {
      localStorage.setItem(
        getSessionKey(recipe._id),
        JSON.stringify({
          updatedAt: Date.now(),
          currentStepIndex,
          completedSteps,
          checkedIngredients,
          servings,
          timers,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    isHydrated,
    recipe?._id,
    currentStepIndex,
    completedSteps,
    checkedIngredients,
    servings,
    timers,
  ]);

  // Timestamp-Accurate Parallel Multi-Timer Tick Engine
  useEffect(() => {
    const hasRunning = timers.some((t) => t.isRunning && t.remainingSeconds > 0);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;

          const next = t.endTimestamp
            ? Math.max(0, Math.round((t.endTimestamp - now) / 1000))
            : Math.max(0, t.remainingSeconds - 1);

          if (
            next <= 60 &&
            next > 0 &&
            t.totalSeconds >= 120 &&
            !t.warned1Min
          ) {
            playChime(true);
            toast.info(`1 Minute Left: ${t.label}`);
            sendPhoneNotification(
              `1 Minute Left • ${recipe?.title || "Cook Mode"}`,
              `${t.label} finishes in 1 minute.`,
              `warn-${t.id}`
            );
            return { ...t, remainingSeconds: next, warned1Min: true };
          }

          if (next === 0) {
            playChime(false);
            toast.success(`Timer Done: ${t.label}`, { duration: 7000 });
            sendPhoneNotification(
              `Timer Done! • ${recipe?.title || "Cook Mode"}`,
              `${t.label} has finished.`,
              `done-${t.id}`
            );
            return {
              ...t,
              remainingSeconds: 0,
              endTimestamp: null,
              isRunning: false,
            };
          }

          return { ...t, remainingSeconds: next };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [timers, playChime, sendPhoneNotification, recipe?.title]);

  const totalSteps = recipe?.instructions?.length || 0;
  const currentStep = recipe?.instructions?.[currentStepIndex];

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const toggleStepDone = (idx) =>
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const toggleIngredientCheck = (idx) =>
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevStep();
      } else if (e.key === "Escape" && activeSheet) {
        setActiveSheet(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextStep, goToPrevStep, activeSheet]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    if (activeSheet) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (activeSheet) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) goToNextStep();
      else goToPrevStep();
    }
  };

  // Text-to-Speech Read Aloud
  const toggleSpeakStep = () => {
    if (!("speechSynthesis" in window) || !currentStep) {
      toast.error("Voice readout not supported on this browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = [
      `Step ${currentStepIndex + 1}.`,
      currentStep.title ? `${currentStep.title}.` : "",
      currentStep.instruction || "",
      currentStep.chefTip ? `Chef's tip: ${currentStep.chefTip}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.96;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Timer Handlers
  const ensureNotificationsPrompted = () => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission()
        .then((res) => setNotifPermission(res))
        .catch(() => {});
    }
  };

  const startOrToggleStepTimer = () => {
    if (!currentStep?.timerDurationSeconds) return;
    ensureNotificationsPrompted();
    const stepTimerId = `step-${currentStepIndex}`;
    const existing = timers.find((t) => t.id === stepTimerId);
    const now = Date.now();

    if (existing) {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.id !== stepTimerId) return t;
          const nextRunning = !t.isRunning;
          const nextRem =
            t.remainingSeconds === 0 ? t.totalSeconds : t.remainingSeconds;
          return {
            ...t,
            remainingSeconds: nextRem,
            endTimestamp: nextRunning ? now + nextRem * 1000 : null,
            isRunning: nextRunning,
            warned1Min: nextRem > 60 ? false : t.warned1Min,
          };
        })
      );
    } else {
      const dur = currentStep.timerDurationSeconds;
      setTimers((prev) => [
        ...prev,
        {
          id: stepTimerId,
          label: currentStep.title || `Step ${currentStepIndex + 1}`,
          totalSeconds: dur,
          remainingSeconds: dur,
          endTimestamp: now + dur * 1000,
          isRunning: true,
          stepIndex: currentStepIndex,
          warned1Min: false,
        },
      ]);
    }
  };

  const addCustomTimer = (minutes, labelOverride) => {
    ensureNotificationsPrompted();
    const secs = minutes * 60;
    setTimers((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: labelOverride || `${minutes}m Kitchen Timer`,
        totalSeconds: secs,
        remainingSeconds: secs,
        endTimestamp: Date.now() + secs * 1000,
        isRunning: true,
        stepIndex: currentStepIndex,
        warned1Min: false,
      },
    ]);
    setActiveSheet(null);
    toast.success(`Started ${minutes} min timer`);
  };

  const toggleTimerById = (id) => {
    const now = Date.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextRunning = !t.isRunning;
        const nextRem =
          t.remainingSeconds === 0 ? t.totalSeconds : t.remainingSeconds;
        return {
          ...t,
          remainingSeconds: nextRem,
          endTimestamp: nextRunning ? now + nextRem * 1000 : null,
          isRunning: nextRunning,
          warned1Min: nextRem > 60 ? false : t.warned1Min,
        };
      })
    );
  };

  const addMinuteToTimer = (id) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextRem = t.remainingSeconds + 60;
        return {
          ...t,
          totalSeconds: t.totalSeconds + 60,
          remainingSeconds: nextRem,
          endTimestamp: t.isRunning ? Date.now() + nextRem * 1000 : null,
          warned1Min: false,
        };
      })
    );
  };

  const resetTimerById = (id) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isRunning: false,
              remainingSeconds: t.totalSeconds,
              endTimestamp: null,
              warned1Min: false,
            }
          : t
      )
    );
  };

  const removeTimerById = (id) =>
    setTimers((prev) => prev.filter((t) => t.id !== id));

  const handleResetSession = () => {
    if (!recipe) return;
    localStorage.removeItem(getSessionKey(recipe._id));
    setCurrentStepIndex(0);
    setCompletedSteps({});
    setCheckedIngredients({});
    setServings(recipe.baseServings || 4);
    setTimers([]);
    setActiveSheet(null);
    toast.success("Cooking session reset");
  };

  const handleExitCookMode = () => {
    const runningTimers = timers.filter(
      (t) => t.isRunning && t.remainingSeconds > 0
    );
    if (runningTimers.length > 0) {
      const ok = window.confirm(
        `You have ${runningTimers.length} active timer(s) running. Exit Cook Mode? (Your session progress will be saved.)`
      );
      if (!ok) return;
    }
    navigate(`/sous-chef/recipes/${recipe._id}`);
  };

  const handleSelectRecipe = (selectedId) => {
    setActiveSheet(null);
    setSearchParams({ recipeId: selectedId });
  };

  // Scaling & Ingredient Grouping
  const scaleRatio = useMemo(() => {
    if (!recipe?.baseServings || recipe.baseServings === 0) return 1;
    return servings / recipe.baseServings;
  }, [servings, recipe?.baseServings]);

  const formatScaledQty = (qty) => {
    if (!qty || qty <= 0) return "";
    return Number((qty * scaleRatio).toFixed(2));
  };

  const stepIngredients = useMemo(() => {
    if (!recipe?.ingredients || !currentStep?.instruction) return [];
    const lower = currentStep.instruction.toLowerCase();

    return recipe.ingredients.filter((ing) => {
      if (!ing.name) return false;
      const nameLower = ing.name.toLowerCase().trim();
      if (lower.includes(nameLower)) return true;
      const words = nameLower.split(/\s+/).filter((w) => w.length > 3);
      return words.some((w) => lower.includes(w));
    });
  }, [recipe?.ingredients, currentStep?.instruction]);

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
    })).filter((g) => g.items.length > 0);
  }, [recipe?.ingredients]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-screen bg-[#FAF9F6] dark:bg-[#0E0C0A] flex flex-col items-center justify-center text-amber-500 gap-3 font-mono">
        <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Loading Kitchen Cockpit...
        </p>
      </div>
    );
  }

  if (!recipe || !currentStep) {
    return (
      <div className="h-[100dvh] w-screen bg-[#FAF9F6] dark:bg-[#0E0C0A] flex flex-col items-center justify-center text-stone-800 dark:text-stone-200 p-6 text-center space-y-5 font-mono select-none">
        <ChefHat size={44} className="text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-2xl font-sans font-[1000] uppercase tracking-tighter text-stone-900 dark:text-white">
            Select a Dish to Cook
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Choose a recipe from your collection to enter Cook Mode.
          </p>
        </div>

        {allRecipes.length > 0 && (
          <div className="w-full max-w-sm space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {allRecipes.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => handleSelectRecipe(r._id)}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#171310] border border-stone-300 dark:border-stone-800 hover:border-amber-500 text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <span className="font-sans font-bold text-sm text-stone-900 dark:text-white truncate">
                  {r.title}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase shrink-0">
                  {r.cuisine}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/sous-chef/recipes")}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-mono font-extrabold text-xs uppercase tracking-wider cursor-pointer"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  const hasVideo = Boolean(recipe.video?.embedUrl);
  const currentStepTimerObj = timers.find(
    (t) => t.id === `step-${currentStepIndex}`
  );
  const backgroundTimers = timers.filter(
    (t) => t.id !== `step-${currentStepIndex}`
  );
  const nextStep =
    currentStepIndex < totalSteps - 1
      ? recipe.instructions[currentStepIndex + 1]
      : null;
  const checkedIngredientsCount =
    Object.values(checkedIngredients).filter(Boolean).length;
  const totalIngredientsCount = recipe.ingredients?.length || 0;
  const completedStepsCount =
    Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="h-[100dvh] w-screen bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-900 dark:text-stone-100 flex flex-col font-mono select-none overflow-hidden relative">
      {/* 1. UNIFIED TOP KITCHEN HUD */}
      <CookModeHeader
        recipeTitle={recipe.title}
        wakeLockActive={wakeLockActive}
        hasVideo={hasVideo}
        showMobileVideo={showMobileVideo}
        onToggleMobileVideo={() => setShowMobileVideo((prev) => !prev)}
        isSpeaking={isSpeaking}
        onToggleSpeak={toggleSpeakStep}
        largeText={largeText}
        onToggleLargeText={() => setLargeText((prev) => !prev)}
        timersCount={timers.length}
        onOpenSheet={setActiveSheet}
        onExit={handleExitCookMode}
      />

      {/* 2. MOBILE COLLAPSIBLE VIDEO DRAWER */}
      {hasVideo && showMobileVideo && (
        <div className="lg:hidden bg-black border-b border-stone-800 shrink-0 z-20">
          <div className="max-w-lg mx-auto aspect-video w-full">
            <iframe
              src={recipe.video.embedUrl}
              title={recipe.title}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 3. BACKGROUND RUNNING TIMERS BAR */}
      {backgroundTimers.length > 0 && (
        <div className="px-3 sm:px-6 py-1.5 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {backgroundTimers.map((t) => (
            <div
              key={t.id}
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono shrink-0 ${
                t.remainingSeconds === 0
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 animate-pulse"
                  : "bg-white dark:bg-[#1B1714] border-amber-500/40 text-stone-900 dark:text-amber-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrentStepIndex(t.stepIndex)}
                className="text-[10px] font-bold uppercase truncate max-w-[100px] hover:underline cursor-pointer"
              >
                {t.label}
              </button>
              <span className="font-extrabold tabular-nums">
                {formatTimer(t.remainingSeconds)}
              </span>
              <button
                type="button"
                onClick={() => toggleTimerById(t.id)}
                className="p-0.5 text-amber-600 dark:text-amber-400 cursor-pointer"
              >
                {t.isRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                type="button"
                onClick={() => removeTimerById(t.id)}
                className="p-0.5 text-stone-400 hover:text-rose-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP LEFT RAIL: PINNED VIDEO + MISE-EN-PLACE CHECKLIST (lg+) */}
        <aside className="hidden lg:flex lg:w-[390px] xl:w-[430px] flex-col border-r border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#120F0C] shrink-0 overflow-hidden">
          {hasVideo && (
            <div className="p-4 pb-2 shrink-0">
              <div className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1B1714] shadow-xs">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={recipe.video.embedUrl}
                    title={recipe.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0">
            <div>
              <h2 className="font-sans font-[1000] uppercase tracking-tight text-sm text-stone-900 dark:text-white leading-none">
                Mise-en-Place
              </h2>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                {checkedIngredientsCount} of {totalIngredientsCount} prepped
              </span>
            </div>

            <div className="inline-flex items-center rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1B1714]">
              <button
                type="button"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 rounded-l-lg cursor-pointer"
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="px-2 text-xs font-mono font-extrabold text-amber-600 dark:text-amber-300 tabular-nums">
                {servings}p
              </span>
              <button
                type="button"
                onClick={() => setServings((s) => s + 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 rounded-r-lg cursor-pointer"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            <MiseEnPlaceList
              groupedIngredients={groupedIngredients}
              checkedIngredients={checkedIngredients}
              onToggleIngredient={toggleIngredientCheck}
              formatScaledQty={formatScaledQty}
            />
          </div>
        </aside>

        {/* RIGHT / PRIMARY STAGE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Story Progress Bar */}
          <div className="lg:hidden px-3.5 py-2 bg-[#FAF9F6] dark:bg-[#120F0C] border-b border-stone-200 dark:border-stone-800/80 shrink-0 space-y-1.5">
            <div className="flex items-center gap-1 w-full">
              {recipe.instructions.map((_, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                      isCurrent
                        ? "bg-amber-500 scale-y-125"
                        : isDone
                        ? "bg-emerald-500"
                        : "bg-stone-300 dark:bg-stone-800"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="text-amber-700 dark:text-amber-400 tabular-nums">
                Step {String(currentStepIndex + 1).padStart(2, "0")} of{" "}
                {String(totalSteps).padStart(2, "0")}
                {completedStepsCount > 0 && ` • ${completedStepsCount} Done`}
              </span>

              <button
                type="button"
                onClick={() => setActiveSheet("steps")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200/80 dark:bg-[#1E1915] text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                <ListOrdered size={11} />
                <span>All Steps</span>
              </button>
            </div>
          </div>

          {/* Desktop Horizontal Step Ribbon */}
          <div className="hidden lg:flex items-center justify-between gap-4 px-6 py-2.5 bg-[#FAF9F6] dark:bg-[#120F0C] border-b border-stone-200 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
              {recipe.instructions.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                      isCurrent
                        ? "bg-amber-500 text-stone-950 border-amber-400 font-extrabold"
                        : isDone
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold"
                        : "bg-white dark:bg-[#1B1714] text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    <span>
                      {isDone ? "✓" : String(idx + 1).padStart(2, "0")}
                    </span>
                    {step.title && (
                      <span className="truncate max-w-[130px] font-sans font-bold text-[11px]">
                        {step.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
              {completedStepsCount}/{totalSteps} Done
            </span>
          </div>

          {/* Swipeable Step Stage */}
          <CookModeStepStage
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            isStepCompleted={Boolean(completedSteps[currentStepIndex])}
            onToggleStepDone={toggleStepDone}
            largeText={largeText}
            servings={servings}
            stepIngredients={stepIngredients}
            formatScaledQty={formatScaledQty}
            currentStepTimerObj={currentStepTimerObj}
            onStartOrToggleStepTimer={startOrToggleStepTimer}
            onAddMinuteToTimer={addMinuteToTimer}
            onResetTimerById={resetTimerById}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* Bottom Thumb-Zone Dock */}
          <CookModeBottomDock
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            nextStepTitle={nextStep?.title}
            checkedIngredientsCount={checkedIngredientsCount}
            totalIngredientsCount={totalIngredientsCount}
            onOpenIngredients={() => setActiveSheet("ingredients")}
            onPrevStep={goToPrevStep}
            onNextStep={goToNextStep}
            onFinishDish={() => {
              localStorage.removeItem(getSessionKey(recipe._id));
              toast.success("Dish Completed! Great job in the kitchen!");
              navigate(`/sous-chef/recipes/${recipe._id}`);
            }}
          />
        </div>
      </div>

      {/* 5. UNIFIED MOBILE BOTTOM SHEETS */}
      <CookModeSheets
        activeSheet={activeSheet}
        onClose={() => setActiveSheet(null)}
        recipe={recipe}
        allRecipes={allRecipes}
        onSelectRecipe={handleSelectRecipe}
        servings={servings}
        onChangeServings={setServings}
        groupedIngredients={groupedIngredients}
        checkedIngredients={checkedIngredients}
        checkedIngredientsCount={checkedIngredientsCount}
        totalIngredientsCount={totalIngredientsCount}
        onToggleIngredient={toggleIngredientCheck}
        formatScaledQty={formatScaledQty}
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
        onSelectStep={setCurrentStepIndex}
        onToggleStepDone={toggleStepDone}
        timers={timers}
        onAddCustomTimer={addCustomTimer}
        onToggleTimerById={toggleTimerById}
        onAddMinuteToTimer={addMinuteToTimer}
        onRemoveTimerById={removeTimerById}
        notifPermission={notifPermission}
        onRequestNotifPermission={requestNotificationPermission}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onResetSession={handleResetSession}
      />
    </div>
  );
};

export default CookMode;