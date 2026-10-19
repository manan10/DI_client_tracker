import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  Folder,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Robust Title-Casing Formatter for Categories & Subcategories
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toString()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const IconRenderer = ({ iconName, size = 16, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || Folder;
  return <IconComponent size={size} className={className} />;
};

export const Step3CategorySelect = ({
  categoryTree = [],
  searchQuery,
  setSearchQuery,
  filteredResults = [],
  expenseData,
  setExpenseData,
  currentWallet,
  onSelectCategory,
  onPrev,
  isAddingParent,
  setIsAddingParent,
  newParentName,
  setNewParentName,
  handleCreateParent,
  isAddingSub,
  setIsAddingSub,
  newSubName,
  setNewSubName,
  handleCreateSub,
}) => {
  // Track which parent accordion is currently open
  const [expandedParentId, setExpandedParentId] = useState(() => {
    if (!expenseData?.category || !categoryTree?.length) return null;
    const targetId =
      typeof expenseData.category === "object"
        ? expenseData.category._id?.toString()
        : expenseData.category?.toString();
    const parentWithCategory = categoryTree.find(
      (p) =>
        p._id?.toString() === targetId ||
        p.subCategories?.some((s) => s._id?.toString() === targetId),
    );
    return parentWithCategory?._id || null;
  });

  // Extract top subcategories across groups as quick picks
  const quickCategories = useMemo(() => {
    if (!categoryTree?.length) return [];
    const flat = [];
    categoryTree.forEach((parent) => {
      parent.subCategories?.forEach((sub) => {
        flat.push({ ...sub, parentColor: parent.color, parentIcon: parent.icon });
      });
    });
    return flat.slice(0, 6);
  }, [categoryTree]);

  const toggleAccordion = (parentId) => {
    setExpandedParentId((prev) => (prev === parentId ? null : parentId));
  };

  const handlePickCategory = (subId) => {
    setExpenseData((prev) => ({ ...prev, category: subId }));
    onSelectCategory();
  };

  return (
    <div className="flex flex-col h-full text-left space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-150 font-sans">
      {/* Step Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onPrev}
            className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer font-sans"
            title="Back to Amount"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="font-serif text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              Select <span className="italic font-normal text-emerald-600 dark:text-emerald-400">Category</span>
            </h2>
            <p className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
              Categorize This Expense
            </p>
          </div>
        </div>

        <span
          className={`font-sans text-sm font-bold tabular-nums shrink-0 ${
            currentWallet?.isVirtual
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-900 dark:text-white"
          }`}
        >
          ₹{Number(expenseData?.amount || 0).toLocaleString("en-IN")}
        </span>
      </div>

      {/* Sticky Search Input */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#0B1120] pb-1 shrink-0 font-sans">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search categories (e.g., Groceries, Fuel)..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 p-2.5 pl-9 rounded-lg font-sans text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Category Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pb-2 font-sans">
        {/* MODE 1: SEARCH FILTER RESULTS */}
        {searchQuery ? (
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Matching Categories ({filteredResults.length})
            </span>
            {filteredResults.map((res) => (
              <button
                key={res._id}
                type="button"
                onClick={() => handlePickCategory(res._id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all active:scale-[0.98] outline-none text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans ${
                  expenseData?.category === res._id
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-900 dark:text-white"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <p className="font-sans text-sm font-semibold truncate">{toTitleCase(res.label)}</p>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 truncate">
                    In {toTitleCase(res.parentLabel)}
                  </p>
                </div>
                <Check
                  size={16}
                  className={
                    expenseData?.category === res._id
                      ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                      : "opacity-0"
                  }
                />
              </button>
            ))}
            {filteredResults.length === 0 && (
              <div className="p-6 text-center text-slate-400 font-sans text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                No Matching Categories Found
              </div>
            )}
          </div>
        ) : (
          /* MODE 2: QUICK PICKS & GROUPS LIST */
          <>
            {/* Quick 1-Tap Chips */}
            {quickCategories.length > 0 && (
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">
                    Quick Picks
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((quick) => (
                    <button
                      key={quick._id}
                      type="button"
                      onClick={() => handlePickCategory(quick._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-sans text-xs font-semibold transition-all active:scale-95 cursor-pointer outline-none ${
                        expenseData?.category === quick._id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      <span>{toTitleCase(quick.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Groups Accordion Section */}
            <div className="space-y-2 font-sans">
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Browse Groups
              </span>

              <div className="flex flex-col gap-2">
                {categoryTree.map((parent) => {
                  const isExpanded = expandedParentId === parent._id;
                  const hasSelectedChild = parent.subCategories?.some(
                    (s) => s._id === expenseData?.category,
                  );

                  return (
                    <div
                      key={parent._id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded
                          ? "border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-slate-900/40 shadow-xs"
                          : hasSelectedChild
                          ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-500/5"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      }`}
                    >
                      {/* Accordion Header Row */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(parent._id)}
                        className="w-full flex items-center justify-between p-3 sm:p-3.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-sans"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 shadow-xs"
                            style={{
                              backgroundColor: `${parent.color || "#64748b"}15`,
                              color: parent.color || "#64748b",
                            }}
                          >
                            <IconRenderer iconName={parent.icon} size={16} />
                          </div>

                          <div className="flex flex-col min-w-0 text-left">
                            <span className="font-serif text-xs sm:text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                              {toTitleCase(parent.label)}
                            </span>
                            <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {parent.subCategories?.length || 0} Subcategories
                            </span>
                          </div>
                        </div>

                        {/* Right-side Indicator */}
                        <div className="flex items-center gap-2 shrink-0">
                          {hasSelectedChild && (
                            <span className="font-sans text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Selected
                            </span>
                          )}
                          <div
                            className={`p-1 rounded-md transition-colors ${
                              isExpanded
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                          >
                            <ChevronDown
                              size={16}
                              strokeWidth={2.5}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Subcategories Dropdown Area */}
                      {isExpanded && (
                        <div className="p-3 pt-1 border-t border-slate-200/60 dark:border-white/10 animate-in fade-in duration-150 bg-white dark:bg-[#0B1120] font-sans">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5">
                            {parent.subCategories?.map((sub) => {
                              const isSubActive =
                                expenseData?.category === sub._id;
                              return (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => handlePickCategory(sub._id)}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left font-sans text-xs font-semibold transition-all active:scale-[0.98] outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                    isSubActive
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                      : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:bg-white"
                                  }`}
                                >
                                  <span className="truncate pr-1">
                                    {toTitleCase(sub.label)}
                                  </span>
                                  {isSubActive && (
                                    <Check
                                      size={12}
                                      strokeWidth={3}
                                      className="shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}

                            {/* Inline Add Sub-category Button/Form */}
                            {!isAddingSub ? (
                              <button
                                type="button"
                                onClick={() => setIsAddingSub(true)}
                                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-white/20 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-all font-sans text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                                <span>Add Sub</span>
                              </button>
                            ) : (
                              <div className="col-span-2 sm:col-span-3 flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg p-1.5 shadow-sm mt-1 font-sans">
                                <input
                                  autoFocus
                                  value={newSubName}
                                  onChange={(e) =>
                                    setNewSubName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleCreateSub();
                                    } else if (e.key === "Escape") {
                                      setIsAddingSub(false);
                                    }
                                  }}
                                  placeholder="New entry name..."
                                  className="w-full bg-transparent px-2 py-1 font-sans text-xs font-semibold outline-none text-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleCreateSub}
                                  className="p-1 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none cursor-pointer font-sans"
                                >
                                  <Check size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Create New Group Button / Inline Form */}
                {!isAddingParent ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingParent(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all font-sans text-xs font-bold uppercase tracking-widest outline-none cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Create New Group</span>
                  </button>
                ) : (
                  <div className="flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-xl p-1.5 shadow-sm font-sans">
                    <input
                      autoFocus
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateParent();
                        } else if (e.key === "Escape") {
                          setIsAddingParent(false);
                        }
                      }}
                      placeholder="Group name (e.g. Office Expenses)..."
                      className="w-full bg-transparent px-2.5 py-1 font-sans text-xs font-semibold outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleCreateParent}
                      className="p-1.5 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none cursor-pointer font-sans"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Step3CategorySelect;