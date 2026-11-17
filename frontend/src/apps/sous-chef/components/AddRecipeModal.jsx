// src/apps/recipes/components/AddRecipeModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
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

// 2-step primary flow: Details first, Review second
const WIZARD_STEPS = [
  { id: 1, key: "details", title: "Details", subtitle: "Name, cuisine & time", icon: FileText },
  { id: 2, key: "review", title: "Review", subtitle: "Confirm & publish", icon: CheckCircle2 },
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
  const [currentStep, setCurrentStep] = useState(1); // 1 = Details, 2 = Review
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentStep(1);
      setIsImportOpen(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDetailsValid = Boolean(formData.title.trim());

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

  // AI Parse Handler (Raw Text) -> Returns to Details step
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
        applyExtractedRecipe(parsed);
        toast.success("Recipe imported! Check the details below.");
        setIsImportOpen(false);
        setCurrentStep(1);
      } else {
        toast.error(response?.message || "Could not read recipe text");
      }
    } catch (err) {
      console.error("[AI-PARSE] Request failed:", err);
      toast.error(err?.message || "Failed to reach recipe service");
    } finally {
      setIsAiParsing(false);
    }
  };

  // Direct URL Parse Handler (YouTube / Instagram) -> Returns to Details step
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
        applyExtractedRecipe(parsed, response.videoUrl || cleanUrl);
        toast.success("Recipe imported from video! Check the details below.");
        setIsImportOpen(false);
        setCurrentStep(1);
      } else {
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
    if (!isDetailsValid) {
      toast.error("Please add a title for the recipe");
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    if (isImportOpen) {
      setIsImportOpen(false);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const handleJumpToStep = (stepNumber) => {
    setIsImportOpen(false);
    if (stepNumber === currentStep) return;
    if (stepNumber === 2 && !isDetailsValid) {
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
    if (e) e.preventDefault();

    if (!isDetailsValid) {
      toast.error("Please add a recipe title");
      setIsImportOpen(false);
      setCurrentStep(1);
      return;
    }

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
        setIsImportOpen(false);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-stone-950/70 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container: Mobile Bottom-Drawer / Desktop Slide-Drawer */}
      <div
        className="relative z-10 w-full sm:w-[580px] max-h-[92vh] sm:max-h-full h-[90vh] sm:h-full flex flex-col bg-[#FAF9F6] dark:bg-[#0E0C0A] border-t-4 sm:border-t-4 border-t-stone-900 dark:border-t-[#f59e0b] sm:border-l-2 sm:border-l-stone-900 dark:sm:border-l-stone-700 text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Masthead Header (Mirrors Recipies.jsx) */}
        <header className="px-5 sm:px-6 pt-4 pb-3.5 border-b-2 border-stone-900 dark:border-stone-800 bg-white dark:bg-[#14110E] flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                शाही रसोई • Kitchen Entry
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {isImportOpen ? "AI Importer" : `Step 0${currentStep} / 02`}
              </span>
            </div>

            <h2 className="font-sans font-[1000] uppercase tracking-tighter text-2xl sm:text-3xl text-stone-900 dark:text-white leading-none truncate pt-0.5">
              {formData.title.trim() ? (
                formData.title
              ) : (
                <>
                  Add <span className="text-amber-700 dark:text-[#f59e0b]">Recipe</span>
                </>
              )}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] hover:border-stone-900 dark:hover:border-amber-400 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <span>Esc</span>
            <X size={13} strokeWidth={2.5} />
          </button>
        </header>

        {/* 2-Step Progress Rail (or Import Return Bar) */}
        <WizardProgressBar
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onJumpToStep={handleJumpToStep}
          isImportOpen={isImportOpen}
          onCloseImport={() => setIsImportOpen(false)}
        />

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs no-scrollbar bg-[#FAF9F6] dark:bg-[#0E0C0A]">
          {isImportOpen ? (
            <SmartPasteStep
              rawText={rawText}
              setRawText={setRawText}
              isAiParsing={isAiParsing}
              onAiParse={handleAiParse}
              onUrlParse={handleUrlParse}
            />
          ) : currentStep === 1 ? (
            <GeneralInfoStep
              formData={formData}
              setFormData={setFormData}
              cuisines={CUISINES}
              courses={COURSES}
              difficulties={DIFFICULTIES}
              isValid={isDetailsValid}
              onToggleDietary={handleToggleDietary}
              onOpenImport={() => setIsImportOpen(true)}
            />
          ) : (
            <ReviewStep formData={formData} />
          )}
        </div>

        {/* Structured Command Bar Footer */}
        <footer className="px-5 sm:px-6 py-3.5 border-t-2 border-stone-900 dark:border-stone-800 bg-white dark:bg-[#14110E] flex items-center justify-between gap-3 shrink-0 font-mono">
          {/* Left Side: Back or Bordered Cancel */}
          <div className="flex items-center gap-2.5">
            {isImportOpen || currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isAiParsing || loading}
                className="h-9 px-3.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-800 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-500 text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft size={13} strokeWidth={2.4} />
                <span>{isImportOpen ? "Back to Details" : "Back"}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || isAiParsing}
                onClick={onClose}
                className="h-9 px-3.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] hover:border-stone-900 dark:hover:border-stone-500 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-[11px] font-mono font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
            )}

            {/* Subtle Status Readout on Desktop */}
            {!isImportOpen && (
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {isDetailsValid ? "• Ready" : "• Title required"}
              </span>
            )}
          </div>

          {/* Right Side: Primary Actions */}
          {!isImportOpen && (
            <div className="flex items-center gap-2">
              {currentStep === 1 ? (
                <>
                  {/* Direct Quick-Save Button on Step 1 */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || isAiParsing || !isDetailsValid}
                    className="h-9 px-3.5 border border-stone-900/40 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] hover:border-stone-900 dark:hover:border-amber-400 text-stone-900 dark:text-stone-200 font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-35"
                    title="Save directly without reviewing"
                  >
                    {loading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={13} strokeWidth={2.5} className="text-amber-700 dark:text-amber-400" />
                    )}
                    <span>Quick Save</span>
                  </button>

                  {/* Primary Review Step CTA */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="h-9 px-4 border border-stone-900 dark:border-[#f59e0b] bg-stone-900 hover:bg-stone-800 dark:bg-[#f59e0b] dark:hover:bg-amber-400 text-white dark:text-[#140F0A] font-mono font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Review</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isAiParsing || !isDetailsValid}
                  className="h-9 px-5 border border-stone-900 dark:border-[#f59e0b] bg-stone-900 hover:bg-stone-800 dark:bg-[#f59e0b] dark:hover:bg-amber-400 text-white dark:text-[#140F0A] font-mono font-extrabold text-[11px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.8} />
                      <span>Save Recipe</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AddRecipeModal;