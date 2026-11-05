// src/apps/recipes/components/AddRecipeModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Wand2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

import WizardProgressBar from "./wizard/WizardProgressBar";
import SmartPasteStep from "./wizard/SmartPasteStep";
import GeneralInfoStep from "./wizard/GeneralInfoStep";
import ReviewStep from "./wizard/ReviewStep";

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

const WIZARD_STEPS = [
  { id: 1, key: "smart-paste", title: "Import", subtitle: "Paste or video link", icon: Wand2 },
  { id: 2, key: "details", title: "Details", subtitle: "Name, cuisine & time", icon: FileText },
  { id: 3, key: "review", title: "Review", subtitle: "Confirm & publish", icon: CheckCircle2 },
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
    { name: "", quantity: 1, unit: "cup", isPantryStaple: false, notes: "" },
  ],
  instructions: [
    { stepNumber: 1, title: "", instruction: "", timerDurationSeconds: 0, chefTip: "" },
  ],
};

const AddRecipeModal = ({ isOpen, onClose, onRecipeCreated }) => {
  const { request } = useApi();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(1);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isStep2Valid = Boolean(formData.title.trim());

  // Shared state population helper
  const applyExtractedRecipe = (parsed, overrideVideoUrl = null) => {
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
      videoUrl: overrideVideoUrl || prev.videoUrl,
      ingredients:
        Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0
          ? parsed.ingredients
          : prev.ingredients,
      instructions:
        Array.isArray(parsed.instructions) && parsed.instructions.length > 0
          ? parsed.instructions
          : prev.instructions,
    }));
  };

// AI Parse Handler (Raw Text)
  const handleAiParse = async () => {
    if (!rawText.trim()) {
      toast.error("Please paste recipe text first");
      return;
    }

    console.log("[AI-PARSE] Starting raw text parse. Character count:", rawText.trim().length);
    setIsAiParsing(true);
    try {
      const response = await request("/recipes/parse", "POST", { rawText });
      console.log("[AI-PARSE] Raw response received:", response);

      if (response && (response.success || response.data)) {
        const parsed = response.data || response;
        console.log("[AI-PARSE] Extracted recipe payload:", {
          title: parsed.title,
          ingredientsCount: Array.isArray(parsed.ingredients) ? parsed.ingredients.length : "NOT_AN_ARRAY",
          instructionsCount: Array.isArray(parsed.instructions) ? parsed.instructions.length : "NOT_AN_ARRAY",
          stepsCount: Array.isArray(parsed.steps) ? parsed.steps.length : "NOT_AN_ARRAY",
        });

        applyExtractedRecipe(parsed);
        toast.success("Recipe extracted! Moving to overview.");
        setCurrentStep(2);
      } else {
        console.warn("[AI-PARSE] Response did not indicate success:", response);
        toast.error(response?.message || "Could not read recipe text");
      }
    } catch (err) {
      console.error("[AI-PARSE] Request failed:", err);
      toast.error(err?.message || "Failed to reach recipe service");
    } finally {
      setIsAiParsing(false);
    }
  };

  // Direct URL Parse Handler (YouTube / Instagram)
  const handleUrlParse = async (targetUrl) => {
    if (!targetUrl || !targetUrl.trim()) {
      toast.error("Please provide a valid YouTube or Instagram link");
      return;
    }

    const cleanUrl = targetUrl.trim();
    console.log("[URL-PARSE] Starting URL parse for:", cleanUrl);
    setIsAiParsing(true);
    try {
      const response = await request("/recipes/parse-url", "POST", { url: cleanUrl });
      console.log("[URL-PARSE] Raw response received:", response);

      if (response && (response.success || response.data)) {
        const parsed = response.data || response;
        console.log("[URL-PARSE] Extracted recipe payload:", {
          title: parsed.title,
          ingredientsCount: Array.isArray(parsed.ingredients) ? parsed.ingredients.length : "NOT_AN_ARRAY",
          instructionsCount: Array.isArray(parsed.instructions) ? parsed.instructions.length : "NOT_AN_ARRAY",
          stepsCount: Array.isArray(parsed.steps) ? parsed.steps.length : "NOT_AN_ARRAY",
        });

        applyExtractedRecipe(parsed, response.videoUrl || cleanUrl);
        toast.success("Recipe extracted from video successfully!");
        setCurrentStep(2);
      } else {
        console.warn("[URL-PARSE] Server reported non-success:", response);
        toast.error(response?.message || "Could not extract details from link");
      }
    } catch (err) {
      console.error("[URL-PARSE] Request failed:", err);
      toast.error(
        err?.message || "Could not read video link. You can paste the description manually."
      );
    } finally {
      setIsAiParsing(false);
    }
  };

  // Step Navigation
  const handleNextStep = () => {
    if (currentStep === 2 && !isStep2Valid) {
      toast.error("Please add a title for the recipe");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (stepNumber) => {
    if (stepNumber === currentStep) return;
    if (stepNumber === 3 && !isStep2Valid) {
      toast.error("Please add a title first");
      return;
    }
    setCurrentStep(stepNumber);
  };

  const handleToggleDietary = (flag) => {
    setFormData((prev) => ({
      ...prev,
      dietaryFlags: {
        ...prev.dietaryFlags,
        [flag]: !prev.dietaryFlags[flag],
      },
    }));
  };

  // Final Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStep2Valid) {
      toast.error("Please add a recipe title");
      setCurrentStep(2);
      return;
    }

    // Sanitize ingredients & instructions extracted by AI
    const validIngredients = (formData.ingredients || [])
      .filter((ing) => ing.name && ing.name.trim().length > 0)
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit ? ing.unit.trim() : "",
        isPantryStaple: Boolean(ing.isPantryStaple),
        notes: ing.notes ? ing.notes.trim() : "",
      }));

    const validInstructions = (formData.instructions || [])
      .filter((step) => step.instruction && step.instruction.trim().length > 0)
      .map((step, idx) => ({
        stepNumber: idx + 1,
        title: step.title ? step.title.trim() : "",
        instruction: step.instruction.trim(),
        timerDurationSeconds: Number(step.timerDurationSeconds) || 0,
        chefTip: step.chefTip ? step.chefTip.trim() : "",
      }));

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
      ingredients: validIngredients,
      instructions: validInstructions,
      videoUrl: formData.videoUrl.trim(),
      coverImage: formData.coverImage.trim(),
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    setLoading(true);
    try {
      const response = await request("/recipes", "POST", payload);

      if (response && (response.success || response.data)) {
        toast.success("Recipe published successfully!");
        setFormData(INITIAL_FORM);
        setRawText("");
        if (onRecipeCreated) {
          onRecipeCreated(response.data || response);
        }
        onClose();
      } else {
        toast.error(response?.message || "Failed to save recipe");
      }
    } catch (err) {
      toast.error(err?.message || "Error saving recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container: Mobile Bottom-Drawer / Desktop Slide-Drawer */}
      <div
        className="relative z-10 w-full sm:w-[580px] max-h-[92vh] sm:max-h-full h-[90vh] sm:h-full flex flex-col rounded-t-2xl sm:rounded-none sm:rounded-l-2xl bg-white dark:bg-[#0F141C] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xl transition-all duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131924] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ChefHat size={18} strokeWidth={2.4} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {formData.title.trim() ? formData.title : "Add Recipe"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Step {currentStep} of 3: {WIZARD_STEPS[currentStep - 1].title} • {WIZARD_STEPS[currentStep - 1].subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        {/* 3-Step Progress Rail */}
        <WizardProgressBar
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onJumpToStep={handleJumpToStep}
        />

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs no-scrollbar bg-slate-50/40 dark:bg-transparent">
          {currentStep === 1 && (
            <SmartPasteStep
              rawText={rawText}
              setRawText={setRawText}
              isAiParsing={isAiParsing}
              onAiParse={handleAiParse}
              onUrlParse={handleUrlParse}
              onSkipToManual={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <GeneralInfoStep
              formData={formData}
              setFormData={setFormData}
              cuisines={CUISINES}
              courses={COURSES}
              difficulties={DIFFICULTIES}
              isValid={isStep2Valid}
              onToggleDietary={handleToggleDietary}
            />
          )}

          {currentStep === 3 && (
            <ReviewStep formData={formData} />
          )}
        </div>

        {/* Action Footer */}
        <footer className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131924] flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} strokeWidth={2.2} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || isAiParsing}
                onClick={onClose}
                className="h-9 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                disabled={loading || isAiParsing}
                onClick={onClose}
                className="hidden sm:inline-flex h-9 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 items-center"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight size={13} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isAiParsing || !isStep2Valid}
                className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-slate-950" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={2.6} />
                    <span>Save Recipe</span>
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddRecipeModal;