// src/apps/recipes/components/EditRecipeModal.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Clock,
  Users,
  Video,
  Image,
  Timer,
  Leaf,
  Layers,
  FileText,
  Check,
  Loader2,
  ChevronDown,
  Edit3,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
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
  "Appetizer / Snack",
  "Dessert",
  "Breakfast",
  "Beverage",
  "Side Dish",
  "Other",
];

const DIFFICULTIES = [
  { label: "Easy", desc: "Simple & quick" },
  { label: "Medium", desc: "Everyday home cook" },
  { label: "Expert", desc: "Elaborate technique" },
];

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedItem =
    typeof options[0] === "string"
      ? options.find((opt) => opt === value)
      : options.find((opt) => opt.label === value);

  const displayLabel =
    typeof selectedItem === "string"
      ? selectedItem
      : selectedItem?.label || value;

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-[#2C1F15] bg-white dark:bg-[#1A120B] text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer shadow-2xs"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 ml-2 text-stone-400 transition-transform ${
            isOpen ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl shadow-xl max-h-56 overflow-y-auto no-scrollbar p-1">
          {options.map((opt) => {
            const optVal = typeof opt === "string" ? opt : opt.label;
            const optDesc = typeof opt === "string" ? null : opt.desc;
            const isSelected = value === optVal;

            return (
              <button
                key={optVal}
                type="button"
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#281c12]"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{optVal}</span>
                  {optDesc && (
                    <span className="text-[10px] text-stone-400 font-normal">
                      {optDesc}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check size={14} className="text-amber-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EditRecipeModal = ({ isOpen, onClose, recipe, onRecipeUpdated }) => {
  const { request } = useApi();
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (recipe && isOpen) {
      setFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        cuisine: recipe.cuisine || "North Indian",
        courseType: recipe.courseType || "Main Course",
        difficulty: recipe.difficulty || "Medium",
        baseServings: recipe.baseServings || 4,
        prepTimeMinutes: recipe.prepTimeMinutes || 0,
        cookTimeMinutes: recipe.cookTimeMinutes || 0,
        videoUrl: recipe.video?.rawUrl || recipe.video?.embedUrl || "",
        coverImage: recipe.coverImage || "",
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "",
        dietaryFlags: {
          isVegetarian: recipe.dietaryFlags?.isVegetarian ?? true,
          isJain: recipe.dietaryFlags?.isJain ?? false,
          isSwaminarayan: recipe.dietaryFlags?.isSwaminarayan ?? false,
          isVegan: recipe.dietaryFlags?.isVegan ?? false,
          isGlutenFree: recipe.dietaryFlags?.isGlutenFree ?? false,
        },
        ingredients:
          recipe.ingredients && recipe.ingredients.length > 0
            ? recipe.ingredients.map((ing) => ({
                name: ing.name || "",
                quantity: ing.quantity ?? 1,
                unit: ing.unit || "",
                isPantryStaple: Boolean(ing.isPantryStaple),
                notes: ing.notes || "",
              }))
            : [{ name: "", quantity: 1, unit: "", isPantryStaple: false, notes: "" }],
        instructions:
          recipe.instructions && recipe.instructions.length > 0
            ? recipe.instructions.map((step, idx) => ({
                stepNumber: step.stepNumber || idx + 1,
                title: step.title || "",
                instruction: step.instruction || "",
                timerDurationSeconds: step.timerDurationSeconds || 0,
                chefTip: step.chefTip || "",
              }))
            : [
                {
                  stepNumber: 1,
                  title: "",
                  instruction: "",
                  timerDurationSeconds: 0,
                  chefTip: "",
                },
              ],
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [recipe, isOpen]);

  if (!isOpen || !formData) return null;

  const handleToggleDietary = (flag) => {
    setFormData((prev) => ({
      ...prev,
      dietaryFlags: {
        ...prev.dietaryFlags,
        [flag]: !prev.dietaryFlags[flag],
      },
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please provide a recipe title");
      setActiveTab("details");
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
      toast.error("Please provide at least one valid ingredient");
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
      toast.error("Please provide at least one cooking step");
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
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    setLoading(true);
    try {
      const response = await request(`/recipes/${recipe._id}`, "PUT", payload);
      if (response && (response.success || response.data)) {
        toast.success("Recipe updated successfully!");
        onRecipeUpdated(response.data || response);
        onClose();
      } else {
        toast.error(response?.message || "Failed to update recipe");
      }
    } catch (err) {
      toast.error(err?.message || "Server error while saving changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/70 backdrop-blur-xs transition-opacity duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full sm:w-[600px] lg:w-[680px] max-h-[94vh] sm:max-h-full h-[90vh] sm:h-full flex flex-col rounded-t-2xl sm:rounded-none sm:rounded-l-2xl bg-white dark:bg-[#120D09] border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-[#2C1F15] text-stone-900 dark:text-stone-100 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-stone-200 dark:border-[#2C1F15] bg-stone-50 dark:bg-[#18110B] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <Edit3 size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold font-serif tracking-tight truncate">
                Edit Recipe
              </h2>
              <p className="text-[11px] text-stone-400 truncate">
                Modify ingredients, steps, timings, or media
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <nav className="flex items-center px-4 border-b border-stone-200 dark:border-[#2C1F15] bg-stone-50/50 dark:bg-[#150F0A] gap-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: "details", label: "General & Diet", icon: FileText },
            {
              id: "ingredients",
              label: `Ingredients (${formData.ingredients.length})`,
              icon: Leaf,
            },
            {
              id: "steps",
              label: `Steps (${formData.instructions.length})`,
              icon: Layers,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                    : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Icon
                  size={13}
                  className={
                    isActive ? "text-amber-500" : "text-stone-400 dark:text-stone-500"
                  }
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <form
          id="edit-recipe-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs no-scrollbar"
        >
          {activeTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Recipe Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl p-3 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 shadow-2xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomSelect
                  label="Cuisine"
                  value={formData.cuisine}
                  options={CUISINES}
                  onChange={(val) => setFormData({ ...formData, cuisine: val })}
                />
                <CustomSelect
                  label="Course Type"
                  value={formData.courseType}
                  options={COURSES}
                  onChange={(val) =>
                    setFormData({ ...formData, courseType: val })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomSelect
                  label="Difficulty"
                  value={formData.difficulty}
                  options={DIFFICULTIES}
                  onChange={(val) =>
                    setFormData({ ...formData, difficulty: val })
                  }
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Users size={12} className="text-amber-500" />
                    <span>Base Portions</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.baseServings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseServings: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2.5 text-xs text-center font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" />
                    <span>Prep (Mins)</span>
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
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2 text-xs font-mono text-center text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Timer size={12} className="text-amber-500" />
                    <span>Cook (Mins)</span>
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
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2 text-xs font-mono text-center text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#18110B] border border-stone-200 dark:border-[#2C1F15] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
                  Dietary Flags
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "isVegetarian", label: "Vegetarian" },
                    { key: "isJain", label: "Jain Friendly" },
                    { key: "isSwaminarayan", label: "Swaminarayan" },
                    { key: "isVegan", label: "Vegan" },
                    { key: "isGlutenFree", label: "Gluten-Free" },
                  ].map(({ key, label }) => {
                    const active = formData.dietaryFlags[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleDietary(key)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          active
                            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 font-semibold"
                            : "bg-white dark:bg-[#120D09] border-stone-200 dark:border-[#2C1F15] text-stone-600 dark:text-stone-400"
                        }`}
                      >
                        <span className="text-[11px]">{label}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            active
                              ? "bg-amber-500 border-amber-500 text-stone-950"
                              : "border-stone-300 dark:border-stone-700"
                          }`}
                        >
                          {active && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <Video size={12} className="text-stone-400" />
                    <span>Video Link (YouTube / Instagram)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <Image size={12} className="text-stone-400" />
                    <span>Cover Photo URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImage: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="Paneer, Curry, Spicy, Dinner"
                    className="w-full bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-0.5">
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Ingredients Checklist ({formData.ingredients.length})
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Mark staples like salt & oil to omit them from missing-ingredient alerts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] flex flex-col gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-stone-400 w-4 text-center">
                        {idx + 1}
                      </span>
                      <input
                        required
                        type="text"
                        placeholder="Ingredient Name"
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(idx, "name", e.target.value)
                        }
                        className="flex-1 bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove ingredient"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 pl-6">
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
                        className="col-span-3 bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                      />

                      <input
                        type="text"
                        placeholder="Unit (tsp, cup, g)"
                        value={ing.unit}
                        onChange={(e) =>
                          handleIngredientChange(idx, "unit", e.target.value)
                        }
                        className="col-span-4 bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg px-2.5 py-1 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500"
                      />

                      <label className="col-span-5 flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] cursor-pointer">
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
                        <span className="text-[10px] text-stone-500 font-medium truncate">
                          Pantry Staple
                        </span>
                      </label>
                    </div>

                    <div className="pl-6">
                      <input
                        type="text"
                        placeholder="Preparation note (e.g., finely chopped, soaked)"
                        value={ing.notes || ""}
                        onChange={(e) =>
                          handleIngredientChange(idx, "notes", e.target.value)
                        }
                        className="w-full bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg px-2.5 py-1 text-[11px] text-stone-500 italic focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "steps" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Instructions Sequence ({formData.instructions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#1A120B] border border-stone-200 dark:border-[#2C1F15] space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Step title (e.g. Sautéing Aromatics)"
                          value={step.title}
                          onChange={(e) =>
                            handleStepChange(idx, "title", e.target.value)
                          }
                          className="w-full bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg px-2.5 py-1 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] px-2 py-0.5 rounded-lg">
                          <Timer size={11} className="text-amber-500" />
                          <input
                            type="number"
                            min="0"
                            placeholder="Sec"
                            value={step.timerDurationSeconds || ""}
                            onChange={(e) =>
                              handleStepChange(
                                idx,
                                "timerDurationSeconds",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-11 bg-transparent text-[11px] font-mono text-center font-bold text-amber-600 dark:text-amber-400 focus:outline-none"
                          />
                          <span className="text-[10px] text-stone-400">s</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      placeholder="Step instructions..."
                      value={step.instruction}
                      onChange={(e) =>
                        handleStepChange(idx, "instruction", e.target.value)
                      }
                      className="w-full bg-white dark:bg-[#120D09] border border-stone-200 dark:border-[#2C1F15] rounded-lg p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                    />

                    <input
                      type="text"
                      placeholder="Chef's Tip (optional)"
                      value={step.chefTip || ""}
                      onChange={(e) =>
                        handleStepChange(idx, "chefTip", e.target.value)
                      }
                      className="w-full bg-white dark:bg-[#120D09] border border-stone-200/80 dark:border-[#2C1F15]/80 rounded-lg px-2.5 py-1 text-[11px] text-stone-500 italic focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <footer className="px-5 py-3.5 border-t border-stone-200 dark:border-[#2C1F15] bg-stone-50 dark:bg-[#18110B] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-recipe-form"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin text-stone-950" />
                <span>Updating Vault...</span>
              </>
            ) : (
              <>
                <Check size={13} strokeWidth={2.5} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditRecipeModal;