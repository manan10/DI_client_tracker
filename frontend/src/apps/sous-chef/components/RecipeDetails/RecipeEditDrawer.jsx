// src/apps/recipes/components/RecipeDetails/RecipeEditDrawer.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Timer,
  Lightbulb,
  Wand2,
  Link2,
  ClipboardPaste,
  Youtube,
  Instagram,
  Image as ImageIcon,
  Video,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";
import { toast } from "sonner";

const CUISINES = [
  "North Indian",
  "Gujarati",
  "South Indian",
  "Street Food",
  "Italian",
  "Asian",
  "Continental",
  "Dessert",
  "Other",
];

const COURSES = [
  "Main Course",
  "Appetizer",
  "Breakfast",
  "Snack",
  "Dessert",
  "Drink",
  "Side Dish",
];

const DIFFICULTIES = [
  { label: "Easy", desc: "Simple and quick" },
  { label: "Medium", desc: "Everyday cooking" },
  { label: "Expert", desc: "More prep and steps" },
];

const DIETARY_OPTIONS = [
  { key: "isVegetarian", label: "Vegetarian" },
  { key: "isJain", label: "Jain Friendly" },
  { key: "isSwaminarayan", label: "Swaminarayan" },
  { key: "isVegan", label: "Vegan" },
  { key: "isGlutenFree", label: "Gluten-Free" },
];

const SECTION_META = {
  photo: {
    badge: "Media Asset",
    title: "Cover Photo",
    subtitle: "Update the recipe thumbnail image URL",
  },
  video: {
    badge: "Media Asset",
    title: "Video Embed",
    subtitle: "Link a YouTube video or Instagram Reel",
  },
  details: {
    badge: "Core Metadata",
    title: "Recipe Details",
    subtitle: "Title, description, cuisine, course & dietary tags",
  },
  stats: {
    badge: "Telemetry",
    title: "Timings & Portions",
    subtitle: "Prep time, cook time, base servings & difficulty",
  },
  ingredients: {
    badge: "Pantry & Prep",
    title: "Ingredients List",
    subtitle: "Add, update, or remove recipe ingredients",
  },
  steps: {
    badge: "Cooking Method",
    title: "Preparation Steps",
    subtitle: "Edit instructions, timers, chef notes & step order",
  },
  import: {
    badge: "AI Importer",
    title: "Extract Recipe Details",
    subtitle: "Pull details from a YouTube/Reel link or paste text",
  },
};

const RecipeEditDrawer = ({ isOpen, section, recipe, onClose, onSaved }) => {
  const { request } = useApi();
  const [saving, setSaving] = useState(false);

  // Two-stage visibility state so open & close CSS transitions play smoothly
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Section form states
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [details, setDetails] = useState({
    title: "",
    description: "",
    cuisine: "North Indian",
    courseType: "Main Course",
    tags: "",
    dietaryFlags: {},
  });
  const [stats, setStats] = useState({
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    baseServings: 4,
    difficulty: "Medium",
  });
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  // AI Import states
  const [importMode, setImportMode] = useState("url"); // "url" | "text"
  const [linkInput, setLinkInput] = useState("");
  const [rawText, setRawText] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState(null);
  const [extractApplyOptions, setExtractApplyOptions] = useState({
    overwriteDetails: true,
    overwriteIngredients: true,
    overwriteSteps: true,
  });

  // Handle smooth mount -> animate-in and animate-out -> unmount lifecycle
  useEffect(() => {
    let rafId;
    let closeTimer;

    if (isOpen && section && recipe) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
      closeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isOpen, section, recipe]);

  // Escape key to close smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !saving && !isAiParsing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, saving, isAiParsing, onClose]);

  // Hydrate form state when opened
  useEffect(() => {
    if (!isOpen || !section || !recipe) return;

    if (section === "photo") {
      setCoverImage(recipe.coverImage || "");
    } else if (section === "video") {
      setVideoUrl(recipe.video?.rawUrl || recipe.video?.embedUrl || "");
    } else if (section === "details") {
      setDetails({
        title: recipe.title || "",
        description: recipe.description || "",
        cuisine: recipe.cuisine || "North Indian",
        courseType: recipe.courseType || "Main Course",
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "",
        dietaryFlags: {
          isVegetarian: recipe.dietaryFlags?.isVegetarian ?? true,
          isJain: recipe.dietaryFlags?.isJain ?? false,
          isSwaminarayan: recipe.dietaryFlags?.isSwaminarayan ?? false,
          isVegan: recipe.dietaryFlags?.isVegan ?? false,
          isGlutenFree: recipe.dietaryFlags?.isGlutenFree ?? false,
        },
      });
    } else if (section === "stats") {
      setStats({
        prepTimeMinutes: recipe.prepTimeMinutes || 0,
        cookTimeMinutes: recipe.cookTimeMinutes || 0,
        baseServings: recipe.baseServings || 4,
        difficulty: recipe.difficulty || "Medium",
      });
    } else if (section === "ingredients") {
      setIngredients(
        recipe.ingredients && recipe.ingredients.length > 0
          ? recipe.ingredients.map((ing) => ({
              name: ing.name || "",
              quantity: ing.quantity ?? 1,
              unit: ing.unit || "",
              isPantryStaple: Boolean(ing.isPantryStaple),
              notes: ing.notes || "",
            }))
          : [
              {
                name: "",
                quantity: 1,
                unit: "cup",
                isPantryStaple: false,
                notes: "",
              },
            ]
      );
    } else if (section === "steps") {
      setInstructions(
        recipe.instructions && recipe.instructions.length > 0
          ? recipe.instructions.map((s, i) => ({
              stepNumber: s.stepNumber || i + 1,
              title: s.title || "",
              instruction: s.instruction || "",
              timerDurationSeconds: s.timerDurationSeconds || 0,
              chefTip: s.chefTip || "",
            }))
          : [
              {
                stepNumber: 1,
                title: "",
                instruction: "",
                timerDurationSeconds: 0,
                chefTip: "",
              },
            ]
      );
    } else if (section === "import") {
      setExtractedPreview(null);
      setLinkInput("");
      setRawText("");
    }
  }, [isOpen, section, recipe]);

  if (!shouldRender || !section || !recipe) return null;

  const meta = SECTION_META[section] || SECTION_META.details;

  // --- Save Handler ---
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    let payload = {};

    if (section === "photo") {
      payload = { coverImage: coverImage.trim() };
    } else if (section === "video") {
      payload = { videoUrl: videoUrl.trim() };
    } else if (section === "details") {
      if (!details.title.trim()) {
        toast.error("Recipe title cannot be empty");
        return;
      }
      payload = {
        title: details.title.trim(),
        description: details.description.trim(),
        cuisine: details.cuisine,
        courseType: details.courseType,
        dietaryFlags: details.dietaryFlags,
        tags: details.tags
          ? details.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
    } else if (section === "stats") {
      payload = {
        prepTimeMinutes: Math.max(0, Number(stats.prepTimeMinutes) || 0),
        cookTimeMinutes: Math.max(0, Number(stats.cookTimeMinutes) || 0),
        baseServings: Math.max(1, Number(stats.baseServings) || 4),
        difficulty: stats.difficulty,
      };
    } else if (section === "ingredients") {
      const cleaned = ingredients
        .filter((ing) => ing.name && ing.name.trim() !== "")
        .map((ing) => ({
          name: ing.name.trim(),
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit ? ing.unit.trim() : "",
          isPantryStaple: Boolean(ing.isPantryStaple),
          notes: ing.notes ? ing.notes.trim() : "",
        }));

      if (cleaned.length === 0) {
        toast.error("Add at least one named ingredient");
        return;
      }
      payload = { ingredients: cleaned };
    } else if (section === "steps") {
      const cleaned = instructions
        .filter((step) => step.instruction && step.instruction.trim() !== "")
        .map((step, idx) => ({
          stepNumber: idx + 1,
          title: step.title ? step.title.trim() : "",
          instruction: step.instruction.trim(),
          timerDurationSeconds: Math.max(
            0,
            Number(step.timerDurationSeconds) || 0
          ),
          chefTip: step.chefTip ? step.chefTip.trim() : "",
        }));

      if (cleaned.length === 0) {
        toast.error("Add at least one cooking instruction");
        return;
      }
      payload = { instructions: cleaned };
    } else if (section === "import") {
      if (!extractedPreview) {
        toast.error("Extract recipe details first");
        return;
      }
      const p = extractedPreview;
      if (extractApplyOptions.overwriteDetails) {
        if (p.title) payload.title = p.title;
        if (p.description) payload.description = p.description;
        if (p.cuisine) payload.cuisine = p.cuisine;
        if (p.courseType) payload.courseType = p.courseType;
        if (p.difficulty) payload.difficulty = p.difficulty;
        if (p.baseServings) payload.baseServings = p.baseServings;
        if (p.prepTimeMinutes !== undefined)
          payload.prepTimeMinutes = p.prepTimeMinutes;
        if (p.cookTimeMinutes !== undefined)
          payload.cookTimeMinutes = p.cookTimeMinutes;
        if (p.dietaryFlags) payload.dietaryFlags = p.dietaryFlags;
        if (Array.isArray(p.tags) && p.tags.length > 0) payload.tags = p.tags;
        if (p.videoUrl) payload.videoUrl = p.videoUrl;
      }
      if (
        extractApplyOptions.overwriteIngredients &&
        Array.isArray(p.ingredients) &&
        p.ingredients.length > 0
      ) {
        payload.ingredients = p.ingredients;
      }
      if (
        extractApplyOptions.overwriteSteps &&
        Array.isArray(p.instructions) &&
        p.instructions.length > 0
      ) {
        payload.instructions = p.instructions.map((s, idx) => ({
          ...s,
          stepNumber: idx + 1,
        }));
      }
    }

    setSaving(true);
    try {
      const response = await request(`/recipes/${recipe._id}`, "PUT", payload);
      if (response && (response.success || response.data)) {
        const updated = response.data || response;
        toast.success(`${meta.title} updated`);
        onSaved(updated);
        onClose();
      } else {
        toast.error(response?.message || "Failed to save changes");
      }
    } catch (err) {
      toast.error(err?.message || "Server error while saving");
    } finally {
      setSaving(false);
    }
  };

  // --- AI Extract Handlers (URL & Text) ---
  const handleExtractUrl = async (e) => {
    e.preventDefault();
    if (!linkInput.trim()) {
      toast.error("Please enter a YouTube or Instagram URL");
      return;
    }
    setIsAiParsing(true);
    try {
      const response = await request("/recipes/parse-url", "POST", {
        url: linkInput.trim(),
      });
      if (response && (response.success || response.data)) {
        const parsed = response.data || response;
        setExtractedPreview({
          ...parsed,
          videoUrl: response.videoUrl || linkInput.trim(),
        });
        toast.success("Extracted details from video link!");
      } else {
        toast.error(response?.message || "Could not extract details from link");
      }
    } catch (err) {
      toast.error(
        err?.message || "Could not read video link. Try pasting text instead."
      );
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleExtractText = async () => {
    if (!rawText.trim()) {
      toast.error("Please paste recipe text first");
      return;
    }
    setIsAiParsing(true);
    try {
      const response = await request("/recipes/parse", "POST", { rawText });
      if (response && (response.success || response.data)) {
        const parsed = response.data || response;
        setExtractedPreview(parsed);
        toast.success("Extracted details from recipe text!");
      } else {
        toast.error(response?.message || "Could not read recipe text");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to reach parser service");
    } finally {
      setIsAiParsing(false);
    }
  };

  // --- Ingredient Helpers ---
  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { name: "", quantity: 1, unit: "", isPantryStaple: false, notes: "" },
    ]);

  const removeIngredient = (idx) => {
    if (ingredients.length <= 1) {
      toast.error("At least one ingredient is required");
      return;
    }
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateIngredient = (idx, field, val) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  // --- Step Helpers ---
  const addStep = () =>
    setInstructions((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: "",
        instruction: "",
        timerDurationSeconds: 0,
        chefTip: "",
      },
    ]);

  const removeStep = (idx) => {
    if (instructions.length <= 1) {
      toast.error("At least one cooking step is required");
      return;
    }
    setInstructions((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const moveStep = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= instructions.length) return;
    setInstructions((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    });
  };

  const updateStep = (idx, field, val) => {
    setInstructions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end font-sans transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Smooth Fading Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/75 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => !saving && !isAiParsing && onClose()}
      />

      {/* Smooth Bottom-Sheet (Mobile) / Slide-Over Drawer (Desktop) */}
      <div
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className={`relative z-10 w-full sm:w-[580px] max-h-[92vh] sm:max-h-full h-[88vh] sm:h-full flex flex-col rounded-t-2xl sm:rounded-none bg-[#FAF9F6] dark:bg-[#0E0C0A] border-t-4 border-t-stone-900 dark:border-t-amber-500 sm:border-l-2 sm:border-l-stone-900 dark:sm:border-l-stone-700 text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden transform transition-transform duration-300 will-change-transform ${
          isVisible
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Grab Indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 bg-white dark:bg-[#14110E] shrink-0">
          <span className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Drawer Header */}
        <header className="px-5 sm:px-6 pt-2 sm:pt-4 pb-3.5 border-b-2 border-stone-900 dark:border-stone-800 bg-white dark:bg-[#14110E] flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {meta.badge}
              </span>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 truncate">
                - {recipe.title}
              </span>
            </div>

            <h2 className="font-sans font-[1000] uppercase tracking-tighter text-2xl sm:text-3xl text-stone-900 dark:text-white leading-none">
              {meta.title}
            </h2>
            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              {meta.subtitle}
            </p>
          </div>

          <button
            type="button"
            disabled={saving || isAiParsing}
            onClick={onClose}
            className="h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] hover:border-stone-900 dark:hover:border-amber-400 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Esc</span>
            <X size={13} strokeWidth={2.5} />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs no-scrollbar">
          {/* 1. COVER PHOTO EDITOR */}
          {section === "photo" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <ImageIcon
                    size={12}
                    className="text-amber-600 dark:text-amber-400"
                  />
                  <span>Cover Image URL</span>
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                />
              </div>

              <div className="border-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-[#14110E] p-3 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                  Live Preview
                </span>
                <div className="w-full aspect-video bg-stone-950 overflow-hidden border border-stone-300 dark:border-stone-700 flex items-center justify-center">
                  {coverImage.trim() ? (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-mono text-stone-500">
                      No image URL entered
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. VIDEO URL EDITOR */}
          {section === "video" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Video size={12} className="text-rose-500" />
                  <span>YouTube or Instagram Reel URL</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                  className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                />
                <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Leave blank and save if you want to remove the embedded video.
                </p>
              </div>
            </div>
          )}

          {/* 3. CORE DETAILS EDITOR */}
          {section === "details" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={details.title}
                  onChange={(e) =>
                    setDetails({ ...details, title: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-sm font-sans font-bold text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Cuisine
                  </label>
                  <select
                    value={details.cuisine}
                    onChange={(e) =>
                      setDetails({ ...details, cuisine: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                  >
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Course Type
                  </label>
                  <select
                    value={details.courseType}
                    onChange={(e) =>
                      setDetails({ ...details, courseType: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={details.description}
                  onChange={(e) =>
                    setDetails({ ...details, description: e.target.value })
                  }
                  className="w-full p-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                  Dietary Compatibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_OPTIONS.map(({ key, label }) => {
                    const active = Boolean(details.dietaryFlags?.[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setDetails({
                            ...details,
                            dietaryFlags: {
                              ...details.dietaryFlags,
                              [key]: !active,
                            },
                          })
                        }
                        className={`flex items-center justify-between p-2.5 border text-left transition-colors cursor-pointer ${
                          active
                            ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 font-bold"
                            : "bg-white dark:bg-[#14110E] border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                        }`}
                      >
                        <span className="text-xs font-mono">{label}</span>
                        <div
                          className={`w-4 h-4 flex items-center justify-center border ${
                            active
                              ? "bg-amber-500 border-amber-500 text-stone-950"
                              : "border-stone-400 dark:border-stone-600"
                          }`}
                        >
                          {active && <Check size={11} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={details.tags}
                  onChange={(e) =>
                    setDetails({ ...details, tags: e.target.value })
                  }
                  placeholder="Comfort Food, Kathiyawadi, Quick Dinner"
                  className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* 4. TELEMETRY / TIMINGS EDITOR */}
          {section === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Prep (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stats.prepTimeMinutes}
                    onChange={(e) =>
                      setStats({ ...stats, prepTimeMinutes: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-sm font-mono font-bold text-center text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Cook (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stats.cookTimeMinutes}
                    onChange={(e) =>
                      setStats({ ...stats, cookTimeMinutes: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-sm font-mono font-bold text-center text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stats.baseServings}
                    onChange={(e) =>
                      setStats({ ...stats, baseServings: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] text-sm font-mono font-bold text-center text-amber-700 dark:text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {DIFFICULTIES.map((d) => {
                    const active = stats.difficulty === d.label;
                    return (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() =>
                          setStats({ ...stats, difficulty: d.label })
                        }
                        className={`p-3 border text-left transition-colors cursor-pointer ${
                          active
                            ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 border-stone-900 dark:border-amber-500"
                            : "bg-white dark:bg-[#14110E] border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                        }`}
                      >
                        <div className="font-sans font-bold text-xs uppercase">
                          {d.label}
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            active
                              ? "text-stone-300 dark:text-stone-900"
                              : "text-stone-500"
                          }`}
                        >
                          {d.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. INGREDIENTS LIST EDITOR */}
          {section === "ingredients" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Total Items: {ingredients.length}
                </span>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="h-8 px-3 border border-stone-900 dark:border-amber-500 bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14110E] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <input
                        type="text"
                        placeholder="Ingredient name (e.g. Paneer)"
                        value={ing.name}
                        onChange={(e) =>
                          updateIngredient(idx, "name", e.target.value)
                        }
                        className="flex-1 h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 pl-8">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) =>
                          updateIngredient(idx, "quantity", e.target.value)
                        }
                        className="col-span-3 h-8 px-2 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-center text-amber-700 dark:text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="Unit (cup, g)"
                        value={ing.unit}
                        onChange={(e) =>
                          updateIngredient(idx, "unit", e.target.value)
                        }
                        className="col-span-4 h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="Prep note (chopped)"
                        value={ing.notes || ""}
                        onChange={(e) =>
                          updateIngredient(idx, "notes", e.target.value)
                        }
                        className="col-span-5 h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-600 dark:text-stone-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. PREPARATION STEPS EDITOR */}
          {section === "steps" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Total Steps: {instructions.length}
                </span>
                <button
                  type="button"
                  onClick={addStep}
                  className="h-8 px-3 border border-stone-900 dark:border-amber-500 bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-3">
                {instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14110E] space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <span className="w-6 h-6 bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-mono font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <input
                          type="text"
                          placeholder="Step heading (e.g. Tempering Spices)"
                          value={step.title}
                          onChange={(e) =>
                            updateStep(idx, "title", e.target.value)
                          }
                          className="flex-1 h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-sans font-bold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <div
                          className="h-8 px-2 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] flex items-center gap-1"
                          title="Timer in seconds"
                        >
                          <Timer size={12} className="text-amber-500" />
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={step.timerDurationSeconds || ""}
                            onChange={(e) =>
                              updateStep(
                                idx,
                                "timerDurationSeconds",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-11 bg-transparent text-xs font-mono font-bold text-center text-amber-700 dark:text-amber-300 focus:outline-none"
                          />
                          <span className="text-[10px] font-mono text-stone-500">
                            s
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveStep(idx, -1)}
                          className="h-8 w-7 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:border-amber-500 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>

                        <button
                          type="button"
                          disabled={idx === instructions.length - 1}
                          onClick={() => moveStep(idx, 1)}
                          className="h-8 w-7 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:border-amber-500 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="h-8 w-7 flex items-center justify-center text-stone-400 hover:text-rose-500 cursor-pointer"
                          title="Delete Step"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Write detailed instructions..."
                      value={step.instruction}
                      onChange={(e) =>
                        updateStep(idx, "instruction", e.target.value)
                      }
                      className="w-full p-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500 resize-y leading-relaxed"
                    />

                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/25">
                      <Lightbulb
                        size={13}
                        className="text-amber-600 dark:text-amber-400 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Chef's Note / Pro Tip (optional)"
                        value={step.chefTip || ""}
                        onChange={(e) =>
                          updateStep(idx, "chefTip", e.target.value)
                        }
                        className="w-full bg-transparent text-xs font-mono text-stone-800 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. AI EXTRACT FROM LINK OR TEXT */}
          {section === "import" && (
            <div className="space-y-5 font-mono">
              <div className="border-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-[#14110E] p-4 flex items-start gap-3">
                <div className="w-8 h-8 border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Sparkles size={15} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-[1000] uppercase tracking-tighter text-sm text-stone-900 dark:text-white leading-none">
                    Smart Recipe Extractor
                  </h3>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    Extract ingredients, steps, timings, and metadata from a
                    YouTube/Instagram link or pasted recipe text and apply them
                    to this dish.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 border border-stone-900/40 dark:border-stone-700 bg-white dark:bg-[#14110E] divide-x divide-stone-900/30 dark:divide-stone-700">
                <button
                  type="button"
                  onClick={() => setImportMode("url")}
                  className={`h-10 px-3 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    importMode === "url"
                      ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  <Link2 size={13} />
                  <span>YouTube / Reel Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode("text")}
                  className={`h-10 px-3 text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    importMode === "text"
                      ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-extrabold"
                      : "text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  <ClipboardPaste size={13} />
                  <span>Paste Recipe Text</span>
                </button>
              </div>

              {importMode === "url" && (
                <form
                  onSubmit={handleExtractUrl}
                  className="border-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-[#14110E] p-4 space-y-3.5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Link2
                          size={12}
                          className="text-amber-600 dark:text-amber-400"
                        />
                        <span>Video / Reel URL</span>
                      </span>
                      <span className="flex items-center gap-2 text-stone-400">
                        <Youtube size={14} />
                        <Instagram size={13} />
                      </span>
                    </label>
                    <input
                      type="url"
                      disabled={isAiParsing}
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
                      className="w-full h-10 px-3 border border-stone-900/40 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAiParsing || !linkInput.trim()}
                    className="w-full h-10 px-4 border border-stone-900 dark:border-amber-500 bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-stone-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Extracting Video Transcript...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} />
                        <span>Extract from Link</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {importMode === "text" && (
                <div className="border-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-[#14110E] p-4 space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <ClipboardPaste
                          size={12}
                          className="text-amber-600 dark:text-amber-400"
                        />
                        <span>Raw Recipe Text / Notes</span>
                      </label>
                      {rawText && (
                        <button
                          type="button"
                          onClick={() => setRawText("")}
                          className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={6}
                      disabled={isAiParsing}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste recipe notes, ingredients, and instructions here..."
                      className="w-full p-3 border border-stone-900/40 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isAiParsing || !rawText.trim()}
                    onClick={handleExtractText}
                    className="w-full h-10 px-4 border border-stone-900 dark:border-amber-500 bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-stone-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Parsing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} />
                        <span>Extract from Text</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {extractedPreview && (
                <div className="border-2 border-emerald-600/60 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <RefreshCw size={12} />
                      <span>Ready to Apply Extracted Data</span>
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {extractedPreview.ingredients?.length || 0} items •{" "}
                      {extractedPreview.instructions?.length || 0} steps
                    </span>
                  </div>

                  {extractedPreview.title && (
                    <div className="text-xs font-bold text-stone-900 dark:text-white">
                      Detected Title: {extractedPreview.title}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    {[
                      {
                        key: "overwriteDetails",
                        label: "Update Title, Description, Cuisine & Timings",
                      },
                      {
                        key: "overwriteIngredients",
                        label: `Replace Ingredients (${
                          extractedPreview.ingredients?.length || 0
                        } items)`,
                      },
                      {
                        key: "overwriteSteps",
                        label: `Replace Preparation Steps (${
                          extractedPreview.instructions?.length || 0
                        } steps)`,
                      },
                    ].map(({ key, label }) => {
                      const checked = extractApplyOptions[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setExtractApplyOptions((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="w-full flex items-center justify-between p-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#14110E] text-left text-[11px] cursor-pointer"
                        >
                          <span>{label}</span>
                          <div
                            className={`w-4 h-4 flex items-center justify-center border ${
                              checked
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-stone-400"
                            }`}
                          >
                            {checked && <Check size={11} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <footer className="px-5 sm:px-6 py-3.5 border-t-2 border-stone-900 dark:border-stone-800 bg-white dark:bg-[#14110E] flex items-center justify-between gap-3 shrink-0 font-mono">
          <button
            type="button"
            disabled={saving || isAiParsing}
            onClick={onClose}
            className="h-9 px-3.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] hover:border-stone-900 dark:hover:border-stone-500 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-[11px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              isAiParsing ||
              (section === "import" && !extractedPreview)
            }
            onClick={handleSave}
            className="h-9 px-5 border border-stone-900 dark:border-amber-500 bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-mono font-extrabold text-[11px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.8} />
                <span>
                  {section === "import" ? "Apply Extracted Data" : "Save Changes"}
                </span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RecipeEditDrawer;