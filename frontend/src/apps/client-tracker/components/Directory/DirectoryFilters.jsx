import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Check,
  Users,
  AlertCircle,
  Trophy,
  ArrowUpDown,
  Download,
  X,
} from "lucide-react";

const DirectoryFilters = ({
  searchTerm,
  onSearchChange,
  onTierChange,
  selectedTierValue,
  quickFilter,
  onQuickFilterChange,
  sortConfig,
  onSortChange,
  counts = {},
  selectedCount = 0,
  onExportCsv,
}) => {
  const [isTierOpen, setIsTierOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const tierRef = useRef(null);
  const sortRef = useRef(null);
  const searchInputRef = useRef(null);

  const tierOptions = [
    {
      label: "All Tiers",
      value: "All",
      icon: <Users size={13} strokeWidth={2.2} />,
      color: "text-slate-500 dark:text-slate-400",
    },
    {
      label: "Needs Attention",
      value: "Attention",
      icon: <AlertCircle size={13} strokeWidth={2.2} />,
      color: "text-rose-500 dark:text-rose-400",
    },
    {
      label: "Diamond",
      value: "Diamond",
      icon: <Trophy size={13} strokeWidth={2.2} />,
      color: "text-cyan-500 dark:text-cyan-400",
    },
    {
      label: "Gold",
      value: "Gold",
      icon: <Trophy size={13} strokeWidth={2.2} />,
      color: "text-amber-500 dark:text-amber-400",
    },
    {
      label: "Silver",
      value: "Silver",
      icon: <Trophy size={13} strokeWidth={2.2} />,
      color: "text-slate-400 dark:text-slate-400",
    },
    {
      label: "Bronze",
      value: "Bronze",
      icon: <Trophy size={13} strokeWidth={2.2} />,
      color: "text-orange-500 dark:text-orange-400",
    },
  ];

  const sortOptions = [
    { label: "Highest AUM", key: "aum", direction: "desc" },
    { label: "Lowest AUM", key: "aum", direction: "asc" },
    { label: "Name (A → Z)", key: "name", direction: "asc" },
    { label: "Most Dormant", key: "updatedAt", direction: "asc" },
    { label: "Recently Active", key: "updatedAt", direction: "desc" },
    { label: "Largest Families", key: "members", direction: "desc" },
  ];

  const quickChips = [
    { id: "all", label: "All Portfolios", count: counts.all },
    { id: "attention", label: "Quiet > 90d", count: counts.attention, alert: true },
    { id: "families", label: "Families", count: counts.families },
    { id: "individuals", label: "Individuals", count: counts.individuals },
    { id: "incomplete", label: "Missing Info", count: counts.incomplete },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tierRef.current && !tierRef.current.contains(event.target)) {
        setIsTierOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTierOption =
    tierOptions.find((opt) => opt.value === selectedTierValue) || tierOptions[0];

  const currentSortOption =
    sortOptions.find(
      (s) => s.key === sortConfig?.key && s.direction === sortConfig?.direction
    ) || sortOptions[0];

  return (
    <div className="space-y-2.5 w-full">
      {/* ROW 1: Search + Tier Dropdown + Sort Dropdown + Export */}
      <div className="flex flex-col sm:flex-row gap-2 w-full items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0 sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={14} strokeWidth={2.2} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            placeholder="Search client, member, PAN, or phone..."
            className="w-full pl-9 pr-12 py-2 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-md">
              /
            </kbd>
          )}
        </div>

        {/* Controls Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tier Dropdown */}
          <div className="relative flex-1 sm:flex-initial sm:w-44 min-w-0" ref={tierRef}>
            <button
              type="button"
              onClick={() => setIsTierOpen(!isTierOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#161B26] border rounded-lg text-xs font-semibold transition-colors outline-none cursor-pointer ${
                isTierOpen
                  ? "border-sky-500 ring-2 ring-sky-500/15"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              } text-slate-800 dark:text-slate-200`}
            >
              <span className="flex items-center gap-2 truncate min-w-0">
                <span className={`${currentTierOption.color} shrink-0`}>
                  {currentTierOption.icon}
                </span>
                <span className="truncate">{currentTierOption.label}</span>
              </span>
              <ChevronDown
                size={13}
                strokeWidth={2.2}
                className={`transition-transform duration-200 text-slate-400 shrink-0 ml-1.5 ${
                  isTierOpen ? "rotate-180 text-sky-500" : ""
                }`}
              />
            </button>

            {isTierOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto z-50 w-48 mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-1 flex flex-col gap-0.5">
                  {tierOptions.map((option) => {
                    const isSelected = selectedTierValue === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          onTierChange(option.value);
                          setIsTierOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`${option.color} shrink-0`}>
                            {option.icon}
                          </span>
                          <span className="truncate">{option.label}</span>
                        </div>
                        {isSelected && (
                          <Check
                            size={13}
                            strokeWidth={2.5}
                            className="text-sky-600 dark:text-sky-300 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial sm:w-44 min-w-0" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#161B26] border rounded-lg text-xs font-semibold transition-colors outline-none cursor-pointer ${
                isSortOpen
                  ? "border-sky-500 ring-2 ring-sky-500/15"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              } text-slate-800 dark:text-slate-200`}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0">
                <ArrowUpDown
                  size={13}
                  strokeWidth={2.2}
                  className="text-slate-400 shrink-0"
                />
                <span className="truncate">{currentSortOption.label}</span>
              </span>
              <ChevronDown
                size={13}
                strokeWidth={2.2}
                className={`transition-transform duration-200 text-slate-400 shrink-0 ml-1.5 ${
                  isSortOpen ? "rotate-180 text-sky-500" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 z-50 w-48 mt-1.5 bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-1 flex flex-col gap-0.5">
                  {sortOptions.map((opt) => {
                    const isSelected =
                      sortConfig?.key === opt.key &&
                      sortConfig?.direction === opt.direction;
                    return (
                      <button
                        type="button"
                        key={`${opt.key}-${opt.direction}`}
                        onClick={() => {
                          onSortChange?.({
                            key: opt.key,
                            direction: opt.direction,
                          });
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <Check
                            size={13}
                            strokeWidth={2.5}
                            className="text-sky-600 dark:text-sky-300 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCsv}
            title={
              selectedCount > 0
                ? `Export ${selectedCount} selected families`
                : "Export filtered list to CSV"
            }
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-[#161B26] hover:bg-slate-50 dark:hover:bg-[#1C2230] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <Download size={13} strokeWidth={2.2} className="text-sky-600 dark:text-sky-400" />
            <span className="hidden md:inline">
              {selectedCount > 0 ? `Export (${selectedCount})` : "Export CSV"}
            </span>
          </button>
        </div>
      </div>

      {/* ROW 2: Wrapped Smart Filter Buttons (Zero Horizontal Scroll) */}
      <div className="flex flex-wrap items-center gap-1.5 w-full">
        {quickChips.map((chip) => {
          const isActive = quickFilter === chip.id;
          return (
            <button
              type="button"
              key={chip.id}
              onClick={() => onQuickFilterChange?.(chip.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                isActive
                  ? chip.alert
                    ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                    : "bg-sky-600 text-white border-sky-600 shadow-2xs"
                  : "bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {chip.alert && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
              <span>{chip.label}</span>
              {typeof chip.count === "number" && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 text-current"
                      : "bg-slate-100 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DirectoryFilters;