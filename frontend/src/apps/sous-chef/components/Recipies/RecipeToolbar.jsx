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
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes, ingredients, or dietary tags..."
          className="w-full pl-9 pr-16 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#151311] text-xs sm:text-sm font-mono text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-[#2A2520] border border-stone-300 dark:border-stone-600 cursor-pointer px-2 py-0.5 rounded hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Controls: Group + Sort + View Switcher */}
      <div className="flex items-center gap-2 shrink-0 font-mono">
        <CustomSelect
          label="Group"
          icon={Layers}
          value={groupBy}
          onChange={onGroupByChange}
          options={GROUP_OPTIONS}
          className="flex-1 sm:w-36 md:w-40"
        />

        <CustomSelect
          label="Sort"
          icon={ArrowUpDown}
          value={sortBy}
          onChange={onSortByChange}
          options={SORT_OPTIONS}
          className="flex-1 sm:w-38 md:w-42"
        />

        {/* View Switcher (Menu Ledger vs Illustrated Gallery) */}
        <div className="flex items-center bg-stone-200/70 dark:bg-[#2A2520] p-0.5 rounded-lg border border-stone-300 dark:border-stone-600 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("DENSE_LIST")}
            className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
              viewMode === "DENSE_LIST"
                ? "bg-[#f59e0b] text-[#140F0A] font-bold shadow-2xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
            title="Menu Ledger View"
            aria-label="Menu Ledger View"
          >
            <List size={16} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("CARDS")}
            className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
              viewMode === "CARDS"
                ? "bg-[#f59e0b] text-[#140F0A] font-bold shadow-2xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
            title="Illustrated Plate View"
            aria-label="Illustrated Plate View"
          >
            <LayoutGrid size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeToolbar;