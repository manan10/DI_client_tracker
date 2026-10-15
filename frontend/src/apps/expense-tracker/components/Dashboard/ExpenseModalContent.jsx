import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";

import { Step1WalletSelect } from "./ExpenseModalSteps/Step1WalletSelect";
import { Step2AmountInput } from "./ExpenseModalSteps/Step2AmountInput";
import { Step3CategorySelect } from "./ExpenseModalSteps/Step3CategorySelect";
import { Step4ReviewConfirm } from "./ExpenseModalSteps/Step4ReviewConfirm";

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

  // Exact step determination:
  // 1. Edit mode -> Step 4
  // 2. Preselected wallet (from card click) -> Step 2
  // 3. Floating action / no wallet -> Step 1
  const [step, setStep] = useState(() => {
    if (isEditMode) return 4;
    if (expenseData?.sourceWallet) return 2;
    return 1;
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (!expenseData?.sourceWallet) return "cash";
    const current = wallets.find((w) => w._id === expenseData.sourceWallet);
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

  // Resolves category metadata directly without triggering compiler memoization bailouts
  const targetCategoryId =
    typeof expenseData?.category === "object"
      ? expenseData.category?._id?.toString()
      : expenseData?.category?.toString();

  let currentCategoryMeta = null;
  if (categoryTree?.length && targetCategoryId) {
    for (const parent of categoryTree) {
      const sub = parent.subCategories?.find(
        (s) => s._id?.toString() === targetCategoryId,
      );
      if (sub) {
        currentCategoryMeta = {
          parentLabel: parent.label,
          subLabel: sub.label,
          color: parent.color,
          icon: parent.icon,
        };
        break;
      }
      if (parent._id?.toString() === targetCategoryId) {
        currentCategoryMeta = {
          parentLabel: parent.label,
          subLabel: parent.label,
          color: parent.color,
          icon: parent.icon,
        };
        break;
      }
    }
  }

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
            <Step1WalletSelect
              isEditMode={isEditMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredWallets={filteredWallets}
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              onSelectWallet={() => (isEditMode ? setStep(4) : nextStep())}
            />
          )}

          {/* STEP 2: EXPENSE AMOUNT */}
          {step === 2 && (
            <Step2AmountInput
              isEditMode={isEditMode}
              currentWallet={currentWallet}
              expenseData={expenseData}
              amountInputRef={amountInputRef}
              formatDisplayAmount={formatDisplayAmount}
              handleAmountChange={handleAmountChange}
              onPrev={() => {
                setExpenseData((prev) => ({ ...prev, sourceWallet: "" }));
                setStep(1);
              }}
              onNext={() => (isEditMode ? setStep(4) : nextStep())}
            />
          )}

          {/* STEP 3: CATEGORY & GROUP SELECTION */}
          {step === 3 && (
            <Step3CategorySelect
              categoryTree={categoryTree}
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredResults={filteredResults}
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              currentWallet={currentWallet}
              onSelectCategory={() => (isEditMode ? setStep(4) : nextStep())}
              onPrev={prevStep}
              isAddingParent={isAddingParent}
              setIsAddingParent={setIsAddingParent}
              newParentName={newParentName}
              setNewParentName={setNewParentName}
              handleCreateParent={handleCreateParent}
              isAddingSub={isAddingSub}
              setIsAddingSub={setIsAddingSub}
              newSubName={newSubName}
              setNewSubName={setNewSubName}
              handleCreateSub={handleCreateSub}
            />
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <Step4ReviewConfirm
              isEditMode={isEditMode}
              currentCategoryMeta={currentCategoryMeta}
              currentWallet={currentWallet}
              expenseData={expenseData}
              setExpenseData={setExpenseData}
              handleFinalSubmit={handleFinalSubmit}
              loading={loading}
              onPrev={() => setStep(isEditMode ? 1 : 3)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseModalContent;