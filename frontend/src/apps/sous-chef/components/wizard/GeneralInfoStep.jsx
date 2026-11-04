// src/apps/recipes/components/wizard/GeneralInfoStep.jsx
import React from "react";
import { Users, Clock, Timer, Video, Image, Check } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

const GeneralInfoStep = ({
  formData,
  setFormData,
  cuisines,
  courses,
  difficulties,
  isValid,
  onToggleDietary,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recipe Title *
          </label>
          {!isValid && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Title required
            </span>
          )}
        </div>
        <input
          required
          type="text"
          placeholder="e.g. Gujarati Sev Tameta Shaak"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-xs"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Brief Story or Overview
        </label>
        <textarea
          rows={2}
          placeholder="Short introduction, flavour profile, or serving tip..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-xs resize-none"
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

      {/* Difficulty & Servings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CustomDropdown
          label="Difficulty"
          value={formData.difficulty}
          options={difficulties}
          onChange={(val) => setFormData({ ...formData, difficulty: val })}
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Users size={12} className="text-amber-500" />
            <span>Portions / Servings</span>
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
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-center font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs font-mono"
          />
        </div>
      </div>

      {/* Timings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Dietary Compatibility Tags
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: "isVegetarian", label: "Vegetarian" },
            { key: "isJain", label: "Jain Friendly (No Root Veg)" },
            { key: "isSwaminarayan", label: "No Onion / Garlic" },
            { key: "isVegan", label: "Vegan (No Dairy)" },
            { key: "isGlutenFree", label: "Gluten-Free" },
          ].map(({ key, label }) => {
            const active = formData.dietaryFlags[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggleDietary(key)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs"
                    : "bg-slate-50 dark:bg-[#121620] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 font-medium"
                }`}
              >
                <span className="text-[11px]">{label}</span>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    active
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {active && <Check size={11} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Links */}
      <div className="space-y-2.5 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Video size={12} className="text-slate-400" />
            <span>Video Link (YouTube or Reel)</span>
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 shadow-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Image size={12} className="text-slate-400" />
            <span>Cover Photo Image URL</span>
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 shadow-xs font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoStep;