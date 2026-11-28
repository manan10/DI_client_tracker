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
  setSelectedParent,
}) => {
  const [expandedParentId, setExpandedParentId] = useState(() => {
    if (!expenseData?.category || !categoryTree?.length) return null;
    const targetId =
      typeof expenseData.category === "object"
        ? expenseData.category._id?.toString()
        : expenseData.category?.toString();
    const parentWithCategory = categoryTree.find(
      (p) =>
        p._id?.toString() === targetId ||
        p.subCategories?.some((s) => s._id?.toString() === targetId)
    );
    return parentWithCategory?._id || null;
  });

  const quickCategories = useMemo(() => {
    if (!categoryTree?.length) return [];
    const flat = [];
    categoryTree.forEach((parent) => {
      parent.subCategories?.forEach((sub) => {
        flat.push({
          ...sub,
          parentColor: parent.color,
          parentIcon: parent.icon,
        });
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

  const handleTriggerAddSub = (parent) => {
    if (setSelectedParent) setSelectedParent(parent);
    setIsAddingSub(true);
  };

  const submitSub = (parentId) => {
    if (typeof handleCreateSub === "function") {
      handleCreateSub(parentId);
    }
  };

  return (
    <div className="flex flex-col h-full text-left space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-150">
      {/* Step Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors outline-none rounded-lg cursor-pointer"
            title="Back to Amount"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col min-w-0">
            <h2
              style={{ fontFamily: "'Lora', serif" }}
              className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-tight"
            >
              Select Category
            </h2>
            <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.12em] truncate mt-0.5">
              Categorize This Expense
            </p>
          </div>
        </div>

        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          className={`text-sm font-bold tabular-nums shrink-0 ${
            currentWallet?.isVirtual
              ? "text-emerald-700 dark:text-[#68C19D]"
              : "text-stone-950 dark:text-stone-50"
          }`}
        >
          ₹{Number(expenseData?.amount || 0).toLocaleString("en-IN")}
        </span>
      </div>

      {/* Sticky Search Input */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1A1C20] pb-1 shrink-0">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search categories (e.g., Groceries, Fuel)..."
            className="w-full bg-[#FAF9F6] dark:bg-[#16181C] p-2.5 pl-9 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200/90 dark:border-white/[0.08] outline-none focus:ring-2 focus:ring-emerald-700/15 dark:focus:ring-[#4EA885]/20 focus:border-emerald-700 dark:focus:border-[#4EA885] transition-all placeholder:text-stone-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Category Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pb-2">
        {searchQuery ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
              Matching Categories ({filteredResults.length})
            </span>
            {filteredResults.map((res) => (
              <button
                key={res._id}
                type="button"
                onClick={() => handlePickCategory(res._id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all active:scale-[0.98] outline-none text-left cursor-pointer ${
                  expenseData?.category === res._id
                    ? "bg-emerald-50/75 border-emerald-700/60 dark:bg-[#4EA885]/[0.14] dark:border-[#4EA885]/60 text-emerald-800 dark:text-[#86D4B4]"
                    : "bg-white dark:bg-[#1A1C20] border-stone-200/80 dark:border-white/[0.07] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50 text-stone-950 dark:text-stone-50"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <p
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-sm font-bold truncate"
                  >
                    {toTitleCase(res.label)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    In {toTitleCase(res.parentLabel)}
                  </p>
                </div>
                <Check
                  size={16}
                  className={
                    expenseData?.category === res._id
                      ? "opacity-100 text-emerald-700 dark:text-[#68C19D]"
                      : "opacity-0"
                  }
                />
              </button>
            ))}
            {filteredResults.length === 0 && (
              <div className="p-6 text-center text-stone-400 text-xs font-bold uppercase tracking-wider border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                No Matching Categories Found
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Quick 1-Tap Chips */}
            {quickCategories.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Sparkles
                    size={12}
                    className="text-emerald-700 dark:text-[#68C19D]"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                    Quick Picks
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((quick) => (
                    <button
                      key={quick._id}
                      type="button"
                      onClick={() => handlePickCategory(quick._id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95 cursor-pointer outline-none ${
                        expenseData?.category === quick._id
                          ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] border-emerald-700 dark:border-[#4EA885] shadow-2xs"
                          : "bg-[#FAF9F6] dark:bg-[#16181C] border-stone-200/80 dark:border-white/[0.08] text-stone-700 dark:text-stone-300 hover:border-emerald-700/50 hover:text-emerald-800 dark:hover:text-[#86D4B4]"
                      }`}
                    >
                      <span>{toTitleCase(quick.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Groups Accordion Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
                Browse Groups
              </span>

              <div className="flex flex-col gap-2">
                {categoryTree.map((parent) => {
                  const isExpanded = expandedParentId === parent._id;
                  const hasSelectedChild = parent.subCategories?.some(
                    (s) => s._id === expenseData?.category
                  );

                  return (
                    <div
                      key={parent._id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded
                          ? "border-stone-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#16181C] shadow-2xs"
                          : hasSelectedChild
                          ? "border-emerald-700/50 dark:border-[#4EA885]/50 bg-emerald-50/40 dark:bg-[#4EA885]/[0.08]"
                          : "border-stone-200/80 dark:border-white/[0.07] bg-[#FAF9F6]/60 dark:bg-[#16181C]/60 hover:bg-[#FAF9F6] dark:hover:bg-[#16181C]"
                      }`}
                    >
                      {/* Accordion Header Row */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(parent._id)}
                        className="w-full flex items-center justify-between p-3 sm:p-3.5 transition-colors cursor-pointer outline-none"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]">
                            <IconRenderer iconName={parent.icon} size={16} />
                          </div>

                          <div className="flex flex-col min-w-0 text-left">
                            <span
                              style={{ fontFamily: "'Lora', serif" }}
                              className="text-sm font-bold tracking-tight text-stone-950 dark:text-stone-50 truncate"
                            >
                              {toTitleCase(parent.label)}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                              {parent.subCategories?.length || 0} Subcategories
                            </span>
                          </div>
                        </div>

                        {/* Right-side Indicator */}
                        <div className="flex items-center gap-2 shrink-0">
                          {hasSelectedChild && (
                            <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-700/12 dark:bg-[#4EA885]/20 text-emerald-800 dark:text-[#86D4B4]">
                              Selected
                            </span>
                          )}
                          <div
                            className={`p-1 rounded-lg transition-colors ${
                              isExpanded
                                ? "bg-emerald-700/10 text-emerald-700 dark:bg-[#4EA885]/20 dark:text-[#68C19D]"
                                : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
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
                        <div className="p-3 pt-1 border-t border-stone-200/70 dark:border-white/[0.06] animate-in fade-in duration-150 bg-white dark:bg-[#1A1C20]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5">
                            {parent.subCategories?.map((sub) => {
                              const isSubActive =
                                expenseData?.category === sub._id;
                              return (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => handlePickCategory(sub._id)}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all active:scale-[0.98] outline-none cursor-pointer ${
                                    isSubActive
                                      ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] border-emerald-700 dark:border-[#4EA885] shadow-2xs"
                                      : "bg-[#FAF9F6] dark:bg-[#16181C] border-stone-200/80 dark:border-white/[0.07] text-stone-700 dark:text-stone-200 hover:border-emerald-700/50 hover:bg-white dark:hover:bg-[#202329]"
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
                                onClick={() => handleTriggerAddSub(parent)}
                                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-stone-300 dark:border-white/20 text-stone-500 hover:text-emerald-700 dark:hover:text-[#68C19D] hover:border-emerald-700/60 dark:hover:border-[#4EA885]/60 transition-all text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                                <span>Add Sub</span>
                              </button>
                            ) : (
                              <div className="col-span-2 sm:col-span-3 flex items-center bg-white dark:bg-[#16181C] border border-emerald-700 dark:border-[#4EA885] rounded-xl p-1.5 shadow-2xs mt-1">
                                <input
                                  autoFocus
                                  value={newSubName}
                                  onChange={(e) =>
                                    setNewSubName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      submitSub(parent._id);
                                    } else if (e.key === "Escape") {
                                      setIsAddingSub(false);
                                    }
                                  }}
                                  placeholder={`New sub in ${parent.label}...`}
                                  className="w-full bg-transparent px-2 py-1 text-xs font-semibold outline-none text-stone-900 dark:text-stone-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => submitSub(parent._id)}
                                  className="p-1.5 bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] rounded-lg ml-1 hover:bg-emerald-800 outline-none cursor-pointer"
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
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-stone-300 dark:border-white/20 text-stone-500 hover:text-emerald-700 dark:hover:text-[#68C19D] hover:border-emerald-700/60 dark:hover:border-[#4EA885]/60 hover:bg-emerald-50/30 dark:hover:bg-[#4EA885]/[0.06] transition-all text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Create New Group</span>
                  </button>
                ) : (
                  <div className="flex items-center bg-white dark:bg-[#16181C] border border-emerald-700 dark:border-[#4EA885] rounded-xl p-1.5 shadow-2xs">
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
                      placeholder="Group name (e.g. Household)..."
                      className="w-full bg-transparent px-2.5 py-1 text-xs font-semibold outline-none text-stone-900 dark:text-stone-100"
                    />
                    <button
                      type="button"
                      onClick={handleCreateParent}
                      className="p-1.5 bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315] rounded-lg ml-1 hover:bg-emerald-800 outline-none cursor-pointer"
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
