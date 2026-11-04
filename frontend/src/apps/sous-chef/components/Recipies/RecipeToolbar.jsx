// src/apps/recipes/components/Recipies/RecipeToolbar.jsx
import React from "react";
import { Search, Layers, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import CustomSelect from "./CustomSelect";

const GROUP_OPTIONS = [
  { value: "CUISINE", label: "Cuisine" },
  { value: "INGREDIENT", label: "Ingredient" },
  { value: "NONE", label: "None" },
];

const SORT_OPTIONS = [
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "time-asc", label: "Fastest" },
  { value: "time-desc", label: "Longest" },
];

const RecipeToolbar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 w-full">
      {/* Search Input - Standalone without outer wrapper */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipes, ingredients, or tags..."
          className="w-full pl-9 pr-14 py-2 sm:py-2.5 rounded-xl border border-stone-200/90 dark:border-[#2C241E] bg-white dark:bg-[#151311] text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-2xs transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer px-1 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Controls: Compact single line on mobile (Group + Sort + Icon View Switcher) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Custom Group Dropdown */}
        <CustomSelect
          label="Group"
          icon={Layers}
          value={groupBy}
          onChange={onGroupByChange}
          options={GROUP_OPTIONS}
          className="flex-1 sm:w-36 md:w-40"
        />

        {/* Custom Sort Dropdown */}
        <CustomSelect
          label="Sort"
          icon={ArrowUpDown}
          value={sortBy}
          onChange={onSortByChange}
          options={SORT_OPTIONS}
          className="flex-1 sm:w-38 md:w-42"
        />

        {/* Icon-Only View Switcher */}
        <div className="flex items-center bg-white dark:bg-[#151311] p-1 rounded-xl border border-stone-200/90 dark:border-[#2C241E] shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("DENSE_LIST")}
            className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
              viewMode === "DENSE_LIST"
                ? "bg-[#f59e0b] text-[#151311] shadow-2xs font-bold"
                : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
            title="Dense List View"
            aria-label="Dense List View"
          >
            <List size={16} strokeWidth={2.3} />
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("CARDS")}
            className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
              viewMode === "CARDS"
                ? "bg-[#f59e0b] text-[#151311] shadow-2xs font-bold"
                : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
            title="Card Grid View"
            aria-label="Card Grid View"
          >
            <LayoutGrid size={16} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeToolbar;