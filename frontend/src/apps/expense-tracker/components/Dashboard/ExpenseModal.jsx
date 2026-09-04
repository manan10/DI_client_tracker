import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  X,
  Check,
  ChevronRight,
  ArrowLeft,
  Search,
  Wallet,
  ArrowRight,
  AlertCircle,
  Landmark,
  Globe,
  Coins,
  Plus,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";

const IconRenderer = ({ iconName, size = 16, className = "" }) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.Folder;
  return <IconComponent size={size} className={className} />;
};

const formatDisplayAmount = (val) => {
  if (!val) return "";
  const number = val.toString().replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("en-IN").format(number);
};

const ExpenseModalContent = ({
  setOpen,
  wallets = [],
  expenseData,
  setExpenseData,
  onSubmit,
  loading,
}) => {
  const { request } = useApi();
  const isEditMode = Boolean(expenseData?._id);

  // Auto-skip logic: Edit mode -> Step 4, Preselected Wallet -> Step 2, Otherwise -> Step 1
  const [step, setStep] = useState(() => {
    if (isEditMode) return 4;
    if (expenseData?.sourceWallet) return 2;
    return 1;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const current = wallets.find((w) => w._id === expenseData?.sourceWallet);
    return current?.isVirtual ? "online" : "cash";
  });

  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localError, setLocalError] = useState("");

  const amountInputRef = useRef(null);

  // Inline Category Creation State
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");

  const filteredWallets = useMemo(
    () => ({
      cash: wallets?.filter((w) => !w.isVirtual) || [],
      online: wallets?.filter((w) => w.isVirtual) || [],
    }),
    [wallets],
  );

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Smart Auto-Focus on Step 2
  useEffect(() => {
    if (step === 2 && amountInputRef.current) {
      if (window.innerWidth >= 768) {
        amountInputRef.current.focus();
      }
    }
  }, [step]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!loading) setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, setOpen]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await request("/categories/tree");
      const rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
      const sortedTree = rawData
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((parent) => ({
          ...parent,
          subCategories: (parent.subCategories || []).sort((a, b) =>
            a.label.localeCompare(b.label),
          ),
        }));
      setCategoryTree(sortedTree);

      setSelectedParent((prev) => {
        if (!prev) return null;
        const updatedParent = sortedTree.find((p) => p._id === prev._id);
        return updatedParent || null;
      });
    } catch (err) {
      console.error("Failed to load category tree", err);
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await request("/categories/tree");
        const rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
        const sortedTree = rawData
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((parent) => ({
            ...parent,
            subCategories: (parent.subCategories || []).sort((a, b) =>
              a.label.localeCompare(b.label),
            ),
          }));

        if (isMounted) {
          setCategoryTree(sortedTree);
        }
      } catch (err) {
        console.error("Failed to load category tree", err);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [request]);

  // Inline Category Handlers
  const handleCreateParent = async () => {
    if (!newParentName.trim()) {
      setIsAddingParent(false);
      return;
    }
    const res = await request("/categories", "POST", {
      label: newParentName,
      color: "#64748b",
      icon: "Folder",
    });
    if (res?.success) {
      await loadCategories();
      setNewParentName("");
      setIsAddingParent(false);
    } else {
      setLocalError("Failed to create category");
    }
  };

  const handleCreateSub = async () => {
    if (!newSubName.trim() || !selectedParent) {
      setIsAddingSub(false);
      return;
    }
    const res = await request(`/categories/${selectedParent._id}/sub`, "POST", {
      label: newSubName,
    });
    if (res?.success) {
      await loadCategories();
      setNewSubName("");
      setIsAddingSub(false);
    } else {
      setLocalError("Failed to create entry");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const nextStep = () => {
    setLocalError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setLocalError("");
    setStep((prev) => prev - 1);
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setExpenseData((prev) => ({ ...prev, amount: rawValue }));
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(e);
    } catch (err) {
      setLocalError(err.message || "Entry failed.");
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery || !categoryTree) return [];
    const results = [];
    categoryTree.forEach((parent) => {
      parent.subCategories?.forEach((sub) => {
        if (sub.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ ...sub, parentLabel: parent.label });
        }
      });
    });
    return results.sort((a, b) => a.label.localeCompare(b.label));
  }, [searchQuery, categoryTree]);

  // Robustly resolve the category handling strings, objects, and legacy parent IDs
  const currentSub = useMemo(() => {
    if (!categoryTree || !expenseData.category) return null;

    const targetId = typeof expenseData.category === 'object'
      ? expenseData.category._id?.toString()
      : expenseData.category?.toString();

    // 1. Check SubCategories
    let found = categoryTree
      .flatMap((p) => p.subCategories || [])
      .find((s) => s._id?.toString() === targetId);

    // 2. Check Parent Categories (fallback)
    if (!found) {
      found = categoryTree.find(p => p._id?.toString() === targetId);
    }

    return found || null;
  }, [categoryTree, expenseData.category]);

  const currentWallet = wallets.find((w) => w._id === expenseData.sourceWallet);

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-[#020617]/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Viewport */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden border-t sm:border border-slate-200 dark:border-white/10 z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* COMMAND HEADER / STEP NAVIGATION */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 min-w-0" role="tablist" aria-label="Expense Steps">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={step === s}
                disabled={(step < s && !isEditMode) || loading}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 transition-all outline-none rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  step === s ? "opacity-100" : "opacity-40 hover:opacity-75"
                } ${step < s && !isEditMode ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step >= s
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {s}
                </span>
                {step === s && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                    {s === 1
                      ? "Select Wallet"
                      : s === 2
                      ? "Add Amount"
                      : s === 3
                      ? "Select Group"
                      : "Details"}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* SCROLLABLE WORKSPACE */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 pb-8 sm:pb-6">
          {localError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-300 leading-snug">
                {localError}
              </p>
            </div>
          )}

          {/* STEP 1: SELECT WALLET */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="text-left mb-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isEditMode ? "Switch Wallet" : "Wallet Selection"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the account the expense was paid from.
                </p>
              </div>

              {/* Segmented Control */}
              <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg flex gap-1 border border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("cash")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                    activeTab === "cash"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Coins size={14} /> Cash Wallets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("online")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
                    activeTab === "online"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Globe size={14} /> Digital Accounts
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredWallets[activeTab].map((w) => (
                  <button
                    key={w._id}
                    type="button"
                    onClick={() => {
                      setExpenseData((prev) => ({ ...prev, sourceWallet: w._id }));
                      if (isEditMode) {
                        setStep(4);
                      } else {
                        nextStep();
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all text-left outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      expenseData.sourceWallet === w._id
                        ? w.isVirtual
                          ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                          : "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-white border-slate-200 dark:bg-[#0B1120] dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-900 dark:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <div
                        className={`p-2 rounded-md shrink-0 ${
                          expenseData.sourceWallet === w._id
                            ? w.isVirtual
                              ? "bg-indigo-600 text-white"
                              : "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {w.isGeneralPool ? (
                          <Landmark size={16} />
                        ) : w.isVirtual ? (
                          <Globe size={16} />
                        ) : (
                          <Wallet size={16} />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">{w.walletName}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                            expenseData.sourceWallet === w._id ? "opacity-80" : "text-slate-500"
                          }`}
                        >
                          {w.isVirtual ? "DIGITAL ACCOUNT" : "CASH WALLET"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums shrink-0 pl-3">
                      {w.isVirtual ? "—" : `₹${w.balance?.toLocaleString("en-IN") || 0}`}
                    </span>
                  </button>
                ))}
                {filteredWallets[activeTab].length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                    No matching accounts
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: EXPENSE AMOUNT */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer"
                  title="Back to Wallet Selection"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Expense Amount
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">
                    From wallet: {currentWallet?.walletName}
                  </p>
                </div>
              </div>

              <div className="relative border-b border-slate-200 dark:border-white/10 focus-within:border-emerald-500 transition-colors pt-2">
                <span className="absolute left-0 bottom-3 text-2xl font-bold text-slate-400 dark:text-slate-600">
                  ₹
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full bg-transparent pb-3 pl-8 text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
                  value={formatDisplayAmount(expenseData.amount)}
                  onChange={handleAmountChange}
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                    } else if (e.key === "Enter" && expenseData.amount && Number(expenseData.amount) > 0) {
                      e.preventDefault();
                      if (isEditMode) {
                        setStep(4);
                      } else {
                        nextStep();
                      }
                    } else if (e.key === "Backspace" && !expenseData.amount && !isEditMode) {
                      prevStep();
                    }
                  }}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!expenseData.amount || Number(expenseData.amount) <= 0}
                  onClick={() => (isEditMode ? setStep(4) : nextStep())}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                >
                  {isEditMode ? "Update Details" : "Proceed"} <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CATEGORY & GROUP SELECTION */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isAddingSub) setIsAddingSub(false);
                    else if (isAddingParent) setIsAddingParent(false);
                    else if (searchQuery) setSearchQuery("");
                    else if (selectedParent) setSelectedParent(null);
                    else prevStep();
                  }}
                  className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {selectedParent && (
                      <div
                        style={{ color: selectedParent.color }}
                        className="shrink-0 flex items-center"
                      >
                        <IconRenderer iconName={selectedParent.icon} size={14} />
                      </div>
                    )}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {selectedParent ? selectedParent.label : "Select Category"}
                    </h2>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${
                    currentWallet?.isVirtual
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  ₹{Number(expenseData.amount).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Sticky Search Bar */}
              <div className="sticky top-0 z-10 bg-white dark:bg-[#0B1120] pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Find category..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-2.5 pl-9 rounded-lg text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !searchQuery) {
                        if (selectedParent) setSelectedParent(null);
                        else prevStep();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Categories Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Search Results Mode */}
                {searchQuery ? (
                  <div className="flex flex-col gap-2">
                    {filteredResults.map((res) => (
                      <button
                        key={res._id}
                        type="button"
                        onClick={() => {
                          setExpenseData((prev) => ({ ...prev, category: res._id }));
                          if (isEditMode) setStep(4);
                          else nextStep();
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all active:scale-[0.98] outline-none text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          expenseData.category === res._id
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-900 dark:text-white"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <p className="text-sm font-semibold truncate">{res.label}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 truncate">
                            In {res.parentLabel}
                          </p>
                        </div>
                        <Check
                          size={16}
                          className={
                            expenseData.category === res._id
                              ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                              : "opacity-0"
                          }
                        />
                      </button>
                    ))}
                    {filteredResults.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                        No matches found
                      </div>
                    )}
                  </div>
                ) : !selectedParent ? (
                  /* Top-Level Groups Mode */
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {categoryTree?.map((parent) => (
                      <button
                        key={parent._id}
                        type="button"
                        onClick={() => setSelectedParent(parent)}
                        className="group flex flex-col items-center justify-start gap-2 p-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all active:scale-95 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <div
                          className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center transition-colors"
                          style={{ color: parent.color }}
                        >
                          <IconRenderer iconName={parent.icon} size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center truncate w-full">
                          {parent.label}
                        </span>
                      </button>
                    ))}

                    {/* Inline Parent Creation Tile */}
                    {!isAddingParent ? (
                      <button
                        type="button"
                        onClick={() => setIsAddingParent(true)}
                        className="group flex flex-col items-center justify-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10 transition-all active:scale-95 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <div className="w-10 h-10 rounded-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                          <Plus size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-center truncate w-full">
                          New Group
                        </span>
                      </button>
                    ) : (
                      <div className="col-span-3 sm:col-span-4 flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg p-1.5 shadow-sm">
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
                          placeholder="Group name..."
                          className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleCreateParent}
                          className="p-1.5 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none cursor-pointer"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Subcategories Mode */
                  <div className="flex flex-col gap-2">
                    {selectedParent.subCategories?.map((sub) => (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => {
                          setExpenseData((prev) => ({ ...prev, category: sub._id }));
                          if (isEditMode) setStep(4);
                          else nextStep();
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-lg border transition-all active:scale-[0.98] outline-none text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          expenseData.category === sub._id
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-sm font-semibold truncate pr-2">{sub.label}</span>
                        <Check
                          size={16}
                          className={
                            expenseData.category === sub._id
                              ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                              : "opacity-0"
                          }
                        />
                      </button>
                    ))}

                    {/* Inline Subcategory Creation Tile */}
                    {!isAddingSub ? (
                      <button
                        type="button"
                        onClick={() => setIsAddingSub(true)}
                        className="flex items-center justify-center gap-2 p-3.5 rounded-lg border border-dashed border-slate-300 dark:border-white/20 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/10 transition-all active:scale-[0.98] outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          New Sub Category
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg p-1.5 shadow-sm">
                        <input
                          autoFocus
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateSub();
                            } else if (e.key === "Escape") {
                              setIsAddingSub(false);
                            }
                          }}
                          placeholder="Entry name..."
                          className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleCreateSub}
                          className="p-1.5 bg-emerald-600 text-white rounded-md ml-1 hover:bg-emerald-700 outline-none cursor-pointer"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep(isEditMode ? 1 : 3)}
                  disabled={loading}
                  className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md disabled:opacity-50 cursor-pointer"
                  title="Back to Categories"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Review Expense
                </h2>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-end pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="space-y-0.5 text-left pr-2 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Category
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {currentSub?.label || "Misc"}
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight shrink-0 text-slate-900 dark:text-white">
                    ₹{Number(expenseData.amount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {currentWallet?.isVirtual ? <Globe size={12} /> : <Wallet size={12} />}
                    <span className="truncate">From: {currentWallet?.walletName}</span>
                  </div>
                  <span className="uppercase tracking-widest shrink-0 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                    {currentWallet?.isVirtual ? "Digital" : "Cash"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Comments (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Purchase details..."
                  className="w-full bg-white dark:bg-[#0B1120] p-3 rounded-lg text-sm text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all no-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={expenseData.description}
                  onChange={(e) =>
                    setExpenseData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFinalSubmit(e);
                    } else if (e.key === "Backspace" && !expenseData.description) {
                      setStep(isEditMode ? 1 : 3);
                    }
                  }}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full text-white h-12 rounded-lg font-bold uppercase text-xs tracking-wider shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50 outline-none bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-offset-[#0B1120] cursor-pointer"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {isEditMode ? "Update Expense" : "Add Expense"}{" "}
                      <Check size={16} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExpenseModal = ({
  isOpen,
  setOpen,
  wallets = [],
  expenseData,
  setExpenseData,
  onSubmit,
  loading,
}) => {
  // Clear data when modal closes to ensure fresh state the next time it opens
  useEffect(() => {
    if (!isOpen && setExpenseData) {
      const timer = setTimeout(() => {
        setExpenseData({
          amount: "",
          category: "",
          description: "",
          sourceWallet: "",
          type: "DEBIT",
        });
      }, 300); // 300ms matches the transition-out timing
      return () => clearTimeout(timer);
    }
  }, [isOpen, setExpenseData]);

  if (!isOpen) return null;

  return (
    <ExpenseModalContent
      key={
        isOpen
          ? `${expenseData?._id || "new"}-${expenseData?.sourceWallet || "default"}`
          : "closed"
      }
      setOpen={setOpen}
      wallets={wallets}
      expenseData={expenseData}
      setExpenseData={setExpenseData}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};

export default ExpenseModal;