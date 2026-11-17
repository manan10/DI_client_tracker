// src/apps/recipes/components/wizard/GeneralInfoStep.jsx
import React from "react";
import {
  Users,
  Clock,
  Timer,
  Video,
  Image,
  Check,
  Wand2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import CustomDropdown from "./CustomDropdown";

const DIETARY_META = [
  { key: "isVegetarian", code: "VEG", label: "Vegetarian" },
  { key: "isJain", code: "J", label: "Jain (No Root Veg)" },
  { key: "isSwaminarayan", code: "SW", label: "Swaminarayan" },
  { key: "isVegan", code: "VG", label: "Vegan (No Dairy)" },
  { key: "isGlutenFree", code: "GF", label: "Gluten-Free" },
];

const GeneralInfoStep = ({
  formData,
  setFormData,
  cuisines,
  courses,
  difficulties,
  isValid,
  onToggleDietary,
  onOpenImport,
}) => {
  return (
    <div className="space-y-4 font-mono">
      {/* High-Visibility AI / Link Import Banner */}
      <div className="border-2 border-stone-900 dark:border-amber-500/50 bg-stone-900 dark:bg-[#1C1610] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white block">
              Have a YouTube, Reel, or Recipe Text?
            </span>
            <span className="text-[10px] font-mono text-stone-300 dark:text-stone-400 block truncate mt-0.5">
              Auto-fill title, timings, ingredients & steps in one click.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenImport}
          className="h-9 px-3.5 bg-[#f59e0b] hover:bg-amber-400 text-[#140F0A] text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <Wand2 size={13} strokeWidth={2.4} />
          <span>Import Recipe</span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Dish Fields */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Recipe Title *
            </label>
            {!isValid && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Required
              </span>
            )}
          </div>
          <input
            required
            type="text"
            placeholder="e.g. Gujarati Sev Tameta Shaak"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-9 px-3 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Brief Description / Subtext
          </label>
          <textarea
            rows={2}
            placeholder="Short introduction, flavour profile, or serving tip..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2.5 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 resize-none transition-colors"
          />
        </div>

        {/* Cuisine & Course Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomDropdown
            label="Cuisine"
            value={formData.cuisine}
            options={cuisines}
            onChange={(val) => setFormData({ ...formData, cuisine: val })}
          />
          <CustomDropdown
            label="Course Type"
            value={formData.courseType}
            options={courses}
            onChange={(val) => setFormData({ ...formData, courseType: val })}
          />
        </div>

        {/* Difficulty, Servings & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomDropdown
            label="Difficulty"
            value={formData.difficulty}
            options={difficulties}
            onChange={(val) => setFormData({ ...formData, difficulty: val })}
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Users size={11} className="text-amber-700 dark:text-amber-400" />
                <span>Serves</span>
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
                className="w-full h-10 px-2 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-center text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Clock size={11} className="text-amber-700 dark:text-amber-400" />
                <span>Prep</span>
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
                className="w-full h-10 px-2 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-center text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Timer size={11} className="text-amber-700 dark:text-amber-400" />
                <span>Cook</span>
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
                className="w-full h-10 px-2 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono font-bold text-center text-stone-900 dark:text-white focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Compatibility Tags */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-2.5">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
          Dietary Tags
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DIETARY_META.map(({ key, code, label }) => {
            const active = formData.dietaryFlags[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleDietary(key)}
                className={`flex items-center justify-between p-2 border text-left transition-colors cursor-pointer ${
                  active
                    ? "border-amber-600/50 dark:border-amber-400/50 bg-amber-500/10 text-stone-900 dark:text-amber-300 font-extrabold"
                    : "border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-700 font-bold"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1 py-0.2 text-[9px] font-mono font-extrabold uppercase border border-current shrink-0">
                    {code}
                  </span>
                  <span className="text-[11px] font-mono truncate">{label}</span>
                </div>
                <div
                  className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-stone-900 dark:bg-[#f59e0b] border-stone-900 dark:border-[#f59e0b] text-white dark:text-[#140F0A]"
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

      {/* Optional Media Links */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14110E] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Video size={11} className="text-amber-700 dark:text-amber-400" />
              <span>Video Link (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              className="w-full h-9 px-3 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Image size={11} className="text-amber-700 dark:text-amber-400" />
              <span>Cover Photo URL (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              className="w-full h-9 px-3 border border-stone-300 dark:border-stone-700 bg-[#FAF9F6] dark:bg-[#0E0C0A] text-xs font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoStep;