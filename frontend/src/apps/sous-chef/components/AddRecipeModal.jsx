// src/apps/recipes/components/AddRecipeModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Clock,
  Users,
  Video,
  Image,
  UtensilsCrossed,
  Sparkles,
  Flame,
  Check,
  Timer,
  Leaf,
  Wand2,
  Loader2,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

const CUISINE_OPTIONS = [
  "Gujarati",
  "North Indian",
  "South Indian",
  "Street Food",
  "Italian",
  "Asian",
  "Continental",
  "Dessert",
  "Other",
];

const COURSE_TYPES = [
  "Main Course",
  "Appetizer / Snack",
  "Dessert",
  "Breakfast",
  "Beverage",
  "Side Dish",
  "Other",
];

const INITIAL_FORM = {
  title: "",
  description: "",
  cuisine: "North Indian",
  courseType: "Main Course",
  difficulty: "Medium",
  baseServings: 4,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  videoUrl: "",
  coverImage: "",
  tags: "",
  dietaryFlags: {
    isVegetarian: true,
    isJain: false,
    isSwaminarayan: false,
    isVegan: false,
    isGlutenFree: false,
  },
  ingredients: [
    { name: "", quantity: 1, unit: "pieces", isPantryStaple: false, notes: "" },
  ],
  instructions: [
    { stepNumber: 1, title: "", instruction: "", timerDurationSeconds: 0, chefTip: "" },
  ],
};

const AddRecipeModal = ({ isOpen, onClose, onRecipeCreated }) => {
  const { request } = useApi();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [rawRecipeText, setRawRecipeText] = useState("");
  const [activeTab, setActiveTab] = useState("magic-paste");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Gemini AI Magic Parser Handler ---
  const handleAiParse = async () => {
    if (!rawRecipeText || !rawRecipeText.trim()) {
      toast.error("Please paste the recipe text first");
      return;
    }

    setIsAiParsing(true);
    try {
      // Corrected to useApi signature: request(endpoint, method, data)
      const response = await request(
        "/recipes/parse",
        "POST",
        { rawText: rawRecipeText }
      );

      if (response && (response.success || response.data)) {
        const parsed = response.data || response;

        setFormData((prev) => ({
          ...prev,
          title: parsed.title || prev.title,
          description: parsed.description || prev.description,
          cuisine: parsed.cuisine || prev.cuisine,
          courseType: parsed.courseType || prev.courseType,
          difficulty: parsed.difficulty || prev.difficulty,
          baseServings: parsed.baseServings || prev.baseServings,
          prepTimeMinutes: parsed.prepTimeMinutes || prev.prepTimeMinutes,
          cookTimeMinutes: parsed.cookTimeMinutes || prev.cookTimeMinutes,
          tags: Array.isArray(parsed.tags) ? parsed.tags.join(", ") : prev.tags,
          dietaryFlags: parsed.dietaryFlags || prev.dietaryFlags,
          ingredients:
            Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0
              ? parsed.ingredients
              : prev.ingredients,
          instructions:
            Array.isArray(parsed.instructions) && parsed.instructions.length > 0
              ? parsed.instructions
              : prev.instructions,
        }));

        toast.success("Recipe parsed by Gemini!", {
          description: `Extracted ${parsed.ingredients?.length || 0} ingredients and ${parsed.instructions?.length || 0} steps.`,
        });

        // Switch to overview to review extracted details
        setActiveTab("overview");
      } else {
        toast.error(response?.message || "Failed to parse recipe with AI");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to connect to parser service");
    } finally {
      setIsAiParsing(false);
    }
  };

  // --- Handlers: Ingredients ---
  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", quantity: 1, unit: "", isPantryStaple: false, notes: "" },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    if (formData.ingredients.length === 1) {
      toast.error("Recipe must contain at least one ingredient");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.ingredients];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ingredients: updated };
    });
  };

  // --- Handlers: Instructions ---
  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        {
          stepNumber: prev.instructions.length + 1,
          title: "",
          instruction: "",
          timerDurationSeconds: 0,
          chefTip: "",
        },
      ],
    }));
  };

  const handleRemoveStep = (index) => {
    if (formData.instructions.length === 1) {
      toast.error("Recipe must contain at least one instruction step");
      return;
    }
    setFormData((prev) => {
      const filtered = prev.instructions.filter((_, i) => i !== index);
      const reIndexed = filtered.map((step, idx) => ({
        ...step,
        stepNumber: idx + 1,
      }));
      return { ...prev, instructions: reIndexed };
    });
  };

  const handleStepChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.instructions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, instructions: updated };
    });
  };

  // --- Handlers: Dietary Toggles ---
  const handleToggleDietary = (flag) => {
    setFormData((prev) => ({
      ...prev,
      dietaryFlags: {
        ...prev.dietaryFlags,
        [flag]: !prev.dietaryFlags[flag],
      },
    }));
  };

  // --- Final Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please provide a recipe title");
      setActiveTab("overview");
      return;
    }

    const cleanedIngredients = formData.ingredients
      .filter((ing) => ing.name && ing.name.trim() !== "")
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit ? ing.unit.trim() : "",
        isPantryStaple: Boolean(ing.isPantryStaple),
        notes: ing.notes ? ing.notes.trim() : "",
      }));

    if (cleanedIngredients.length === 0) {
      toast.error("Please add at least one valid ingredient");
      setActiveTab("ingredients");
      return;
    }

    const cleanedInstructions = formData.instructions
      .filter((step) => step.instruction && step.instruction.trim() !== "")
      .map((step, idx) => ({
        stepNumber: idx + 1,
        title: step.title ? step.title.trim() : "",
        instruction: step.instruction.trim(),
        timerDurationSeconds: Number(step.timerDurationSeconds) || 0,
        chefTip: step.chefTip ? step.chefTip.trim() : "",
      }));

    if (cleanedInstructions.length === 0) {
      toast.error("Please enter instructions for at least one step");
      setActiveTab("steps");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      cuisine: formData.cuisine,
      courseType: formData.courseType,
      difficulty: formData.difficulty,
      baseServings: Number(formData.baseServings) || 4,
      prepTimeMinutes: Number(formData.prepTimeMinutes) || 0,
      cookTimeMinutes: Number(formData.cookTimeMinutes) || 0,
      dietaryFlags: formData.dietaryFlags,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      videoUrl: formData.videoUrl.trim(),
      coverImage: formData.coverImage.trim(),
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    setLoading(true);
    try {
      // Corrected to useApi signature: request(endpoint, method, data)
      const response = await request("/recipes", "POST", payload);

      if (response && (response.success || response.data)) {
        toast.success("Recipe indexed into Royal Rasoi!", {
          description: payload.title,
        });
        setFormData(INITIAL_FORM);
        setRawRecipeText("");
        if (onRecipeCreated) {
          onRecipeCreated(response.data || response);
        }
        onClose();
      } else {
        toast.error(response?.message || "Failed to create recipe");
      }
    } catch (err) {
      toast.error(err?.message || "Server error while adding recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans text-left">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#140F0A] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-stone-100">
        
        {/* MODAL HEADER */}
        <header className="px-6 py-4 border-b border-[#2C1F15] bg-[#1C140D] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <UtensilsCrossed size={19} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Royal Rasoi Registry
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-xs font-mono text-stone-400">Sous Chef</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight truncate mt-0.5">
                Add Recipe
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        {/* TABS CONTROLLER */}
        <nav className="flex items-center px-6 border-b border-[#2C1F15] bg-[#17100B] gap-4 sm:gap-6 text-xs font-bold uppercase tracking-wider shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("magic-paste")}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "magic-paste"
                ? "border-amber-400 text-amber-300 font-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Wand2 size={13} className="text-amber-400" />
            <span>Magic Paste (AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-300 font-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            Overview & Diet
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ingredients"
                ? "border-amber-400 text-amber-300 font-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            Ingredients ({formData.ingredients.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "steps"
                ? "border-amber-400 text-amber-300 font-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            Steps ({formData.instructions.length})
          </button>
        </nav>

        {/* SCROLLABLE FORM BODY */}
        <form
          id="add-recipe-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs no-scrollbar"
        >
          {/* TAB 0: MAGIC PASTE TAB */}
          {activeTab === "magic-paste" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#23170E] to-[#17100B] border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-sm text-white">
                    Paste Any Raw Recipe Text
                  </h3>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Paste descriptions from YouTube, Sanjeev Kapoor/Ranveer Brar recipes, WhatsApp forwards, or messy bilingual Hindi/English cooking steps. Gemini will structure portions, ingredients, steps, and dietary tags automatically.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ClipboardPaste size={13} className="text-amber-500" />
                    <span>Raw Recipe Text / Transcript</span>
                  </label>
                  {rawRecipeText && (
                    <button
                      type="button"
                      onClick={() => setRawRecipeText("")}
                      className="text-[10px] text-stone-400 hover:text-rose-400 font-bold cursor-pointer"
                    >
                      Clear Text
                    </button>
                  )}
                </div>

                <textarea
                  rows={10}
                  value={rawRecipeText}
                  onChange={(e) => setRawRecipeText(e.target.value)}
                  placeholder={`Paste full text here, e.g.:

Full written recipe for Dal khichdi
Prep time: 20-25 minutes
Serves: 2-3 people
Ingredients:
Split pigeon peas | तूर दाल 1/2 cup
Ghee | घी 1 tsp
Method:
Wash & soak all the dals...`}
                  className="w-full bg-[#18110B] border border-[#3A281A] rounded-2xl p-4 text-xs font-mono text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-none shadow-inner"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isAiParsing || !rawRecipeText.trim()}
                  onClick={handleAiParse}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-[#140F0A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {isAiParsing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Gemini is Parsing Recipe...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} />
                      <span>Parse with Gemini</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW & DIETARY */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                    Recipe Title *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Restaurant Style Dal Khichdi"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                    Cuisine *
                  </label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) =>
                      setFormData({ ...formData, cuisine: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2.5 text-xs font-bold text-amber-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-[#140F0A]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                    Course Type
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) =>
                      setFormData({ ...formData, courseType: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {COURSE_TYPES.map((ct) => (
                      <option key={ct} value={ct} className="bg-[#140F0A]">
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Easy">Easy (Beginner Friendly)</option>
                    <option value="Medium">Medium (Regular Cook)</option>
                    <option value="Expert">Expert (Elaborate Prep)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Users size={12} className="text-amber-500" />
                    <span>Base Portions</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.baseServings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseServings: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300 text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" />
                    <span>Prep Time (Minutes)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prepTimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prepTimeMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    <span>Cook Time (Minutes)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cookTimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cookTimeMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C140D] border border-amber-500/20 space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                  <Leaf size={14} className="text-emerald-400" />
                  <span>Dietary Compatibility Flags</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "isVegetarian", label: "Vegetarian" },
                    { key: "isJain", label: "Jain Friendly (No Root Veg)" },
                    { key: "isSwaminarayan", label: "Swaminarayan (No Onion/Garlic)" },
                    { key: "isVegan", label: "Vegan (No Dairy)" },
                    { key: "isGlutenFree", label: "Gluten Free" },
                  ].map(({ key, label }) => {
                    const isChecked = formData.dietaryFlags[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleDietary(key)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-xs"
                            : "bg-[#140F0A] border-[#332215] text-stone-400 hover:border-stone-600"
                        }`}
                      >
                        <span className="font-semibold text-[11px]">{label}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? "bg-emerald-500 text-black border-emerald-400"
                              : "border-stone-600"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Video size={13} className="text-rose-400" />
                    <span>Video Link (YouTube Watch, Short, or Instagram Reel)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2 text-xs font-mono text-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Image size={13} className="text-sky-400" />
                    <span>Cover Photo Image URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImage: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2 text-xs font-mono text-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300 uppercase tracking-wider text-[11px]">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Comfort Food, Khichdi, Tadka"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full bg-[#1A120B] border border-[#3A281A] rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS LIST */}
          {activeTab === "ingredients" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="font-bold text-sm text-amber-200">
                    Ingredients List ({formData.ingredients.length})
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Pantry staples are auto-flagged so they won't count as missing in the Matcher.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#1C140D] border border-[#332215] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                  >
                    <div className="flex-1">
                      <input
                        required
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(idx, "name", e.target.value)
                        }
                        className="w-full bg-[#140F0A] border border-[#3A281A] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div className="w-20">
                      <input
                        required
                        type="number"
                        step="0.05"
                        min="0"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) =>
                          handleIngredientChange(idx, "quantity", e.target.value)
                        }
                        className="w-full bg-[#140F0A] border border-[#3A281A] rounded-lg px-2 py-1.5 text-xs text-amber-300 text-center font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ing.unit}
                        onChange={(e) =>
                          handleIngredientChange(idx, "unit", e.target.value)
                        }
                        className="w-full bg-[#140F0A] border border-[#3A281A] rounded-lg px-2 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#140F0A] border border-[#3A281A] cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={ing.isPantryStaple}
                        onChange={(e) =>
                          handleIngredientChange(
                            idx,
                            "isPantryStaple",
                            e.target.checked
                          )
                        }
                        className="accent-amber-500 rounded"
                      />
                      <span className="text-[10px] text-stone-400 font-medium">
                        Staple
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove ingredient"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP INSTRUCTIONS */}
          {activeTab === "steps" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="font-bold text-sm text-amber-200">
                    Step-by-Step Cooking Guide ({formData.instructions.length})
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Numbered stages extracted from the recipe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {formData.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#1C140D] border border-[#332215] space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Step Heading"
                          value={step.title}
                          onChange={(e) =>
                            handleStepChange(idx, "title", e.target.value)
                          }
                          className="bg-[#140F0A] border border-[#3A281A] rounded-lg px-2.5 py-1 text-xs text-amber-200 font-bold focus:outline-none focus:border-amber-500 sm:w-64"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#140F0A] border border-[#3A281A] px-2 py-0.5 rounded-lg">
                          <Timer size={12} className="text-amber-400" />
                          <input
                            type="number"
                            min="0"
                            step="30"
                            placeholder="Secs"
                            value={step.timerDurationSeconds || ""}
                            onChange={(e) =>
                              handleStepChange(
                                idx,
                                "timerDurationSeconds",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-14 bg-transparent text-[11px] font-mono text-amber-300 text-center focus:outline-none"
                            title="Timer in seconds"
                          />
                          <span className="text-[10px] text-stone-500">sec</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove step"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      placeholder="Detailed instructions for this step..."
                      value={step.instruction}
                      onChange={(e) =>
                        handleStepChange(idx, "instruction", e.target.value)
                      }
                      className="w-full bg-[#140F0A] border border-[#3A281A] rounded-lg p-2.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                    />

                    <input
                      type="text"
                      placeholder="Chef's Tip / Note (Optional)"
                      value={step.chefTip || ""}
                      onChange={(e) =>
                        handleStepChange(idx, "chefTip", e.target.value)
                      }
                      className="w-full bg-[#140F0A]/60 border border-[#2E2015] rounded-lg px-2.5 py-1 text-[11px] text-stone-400 italic focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* FOOTER ACTIONS */}
        <footer className="px-6 py-4 border-t border-[#2C1F15] bg-[#1C140D] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== "magic-paste" && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "steps") setActiveTab("ingredients");
                  else if (activeTab === "ingredients") setActiveTab("overview");
                  else if (activeTab === "overview") setActiveTab("magic-paste");
                }}
                className="px-3 py-1.5 rounded-lg border border-[#3A281A] text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
            )}

            {activeTab !== "steps" && activeTab !== "magic-paste" && (
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "overview" ? "ingredients" : "steps")
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#2B1D12] border border-amber-500/30 text-amber-200 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Next Section &rarr;
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={loading || isAiParsing}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-recipe-form"
              disabled={loading || isAiParsing}
              className="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#140F0A] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Vault...</span>
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={3} />
                  <span>Index Recipe</span>
                </>
              )}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default AddRecipeModal;