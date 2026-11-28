import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Wallet,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Landmark,
} from "lucide-react";

const formatDisplayAmount = (val) => {
  if (!val) return "";
  const number = String(val).replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("en-IN").format(number);
};

const TransferModalContent = ({
  setOpen,
  wallets = [],
  transferData,
  setTransferData,
  onSubmit,
  loading,
}) => {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState("");
  const amountInputRef = useRef(null);
  const commentsInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (step === 3 && amountInputRef.current) {
      if (window.innerWidth >= 768) {
        amountInputRef.current.focus();
      }
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!loading) setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, setOpen]);

  const sourceWalletObj = wallets.find(
    (w) => w._id === transferData.sourceWallet
  );
  const targetWalletObj = wallets.find(
    (w) => w._id === transferData.targetWallet
  );

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
    setTransferData((prev) => ({ ...prev, amount: rawValue }));
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError("");
    try {
      await onSubmit(e);
    } catch (err) {
      setLocalError(err.message || "Transfer failed. Please check funds.");
    }
  };

  return (
    <div
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 text-left"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Viewport */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1A1C20] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t sm:border border-stone-200/90 dark:border-white/[0.08] z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* HEADER / NAVIGATION COMMAND BAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-white/[0.07] bg-[#FAF9F6] dark:bg-[#16181C] shrink-0">
          <div
            className="flex items-center gap-3 min-w-0"
            role="tablist"
            aria-label="Transfer Steps"
          >
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={step === s}
                disabled={step < s || loading}
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 transition-all outline-none rounded-md ${
                  step === s ? "opacity-100" : "opacity-40 hover:opacity-75"
                } ${step < s ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step >= s
                      ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                      : "bg-stone-200 dark:bg-white/[0.08] text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {s}
                </span>
                {step === s && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-900 dark:text-stone-100">
                    {s === 1 && "Source"}
                    {s === 2 && "Target"}
                    {s === 3 && "Details"}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 active:scale-95 outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* SCROLLABLE WORKSPACE */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 pb-8 sm:pb-6">
          {localError && (
            <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-700/[0.08] dark:bg-[#E88D96]/15 border border-rose-700/20 dark:border-[#E88D96]/25 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle
                size={14}
                className="text-rose-700 dark:text-[#F09BA3] shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-rose-700 dark:text-[#F09BA3] leading-snug">
                {localError}
              </p>
            </div>
          )}

          {/* STEP 1: SELECT SOURCE WALLET */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="text-left mb-2">
                <h2
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50"
                >
                  Select Origin Wallet
                </h2>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                  Select the wallet from which you want to transfer funds.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {wallets
                  .filter((w) => !w.isVirtual)
                  .map((w) => {
                    const isSelected = transferData.sourceWallet === w._id;
                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setTransferData((prev) => ({
                            ...prev,
                            sourceWallet: w._id,
                            targetWallet:
                              prev.targetWallet === w._id
                                ? ""
                                : prev.targetWallet,
                          }));
                          nextStep();
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left outline-none cursor-pointer ${
                          isSelected
                            ? "border-emerald-700/60 dark:border-[#4EA885]/60 bg-emerald-50/75 dark:bg-[#4EA885]/[0.14]"
                            : w.isGeneralPool
                            ? "bg-[#FAF9F6] dark:bg-[#1F2227] border-stone-200/90 dark:border-white/[0.08] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50"
                            : "bg-white dark:bg-[#1A1C20] border-stone-200/80 dark:border-white/[0.07] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              w.isGeneralPool
                                ? "bg-emerald-700/12 dark:bg-[#4EA885]/18 text-emerald-700 dark:text-[#68C19D]"
                                : "bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-stone-300"
                            }`}
                          >
                            {w.isGeneralPool ? (
                              <Landmark size={16} />
                            ) : (
                              <Wallet size={16} />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              style={{ fontFamily: "'Lora', serif" }}
                              className="text-sm font-bold truncate text-stone-950 dark:text-stone-50"
                            >
                              {w.walletName}
                            </span>
                            {w.isGeneralPool && (
                              <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#68C19D] mt-0.5">
                                Primary Reserve
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-sm font-bold tabular-nums shrink-0 pl-3 text-stone-700 dark:text-stone-300"
                        >
                          ₹{w.balance?.toLocaleString("en-IN") || 0}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DESTINATION TARGET WALLET */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="flex items-center gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors outline-none rounded-lg cursor-pointer"
                  title="Back to Origin Wallet"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex flex-col min-w-0">
                  <h2
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-tight"
                  >
                    Select Destination Wallet
                  </h2>
                  <p className="text-[10.5px] font-bold text-emerald-700 dark:text-[#68C19D] uppercase tracking-wider truncate mt-0.5">
                    From: {sourceWalletObj?.walletName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {wallets
                  .filter(
                    (w) => !w.isVirtual && w._id !== transferData.sourceWallet
                  )
                  .map((w) => {
                    const isSelected = transferData.targetWallet === w._id;
                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setTransferData((prev) => ({
                            ...prev,
                            targetWallet: w._id,
                          }));
                          nextStep();
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left outline-none cursor-pointer ${
                          isSelected
                            ? "border-emerald-700/60 dark:border-[#4EA885]/60 bg-emerald-50/75 dark:bg-[#4EA885]/[0.14]"
                            : w.isGeneralPool
                            ? "bg-[#FAF9F6] dark:bg-[#1F2227] border-stone-200/90 dark:border-white/[0.08] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50"
                            : "bg-white dark:bg-[#1A1C20] border-stone-200/80 dark:border-white/[0.07] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              w.isGeneralPool
                                ? "bg-emerald-700/12 dark:bg-[#4EA885]/18 text-emerald-700 dark:text-[#68C19D]"
                                : "bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-stone-300"
                            }`}
                          >
                            {w.isGeneralPool ? (
                              <Landmark size={16} />
                            ) : (
                              <Wallet size={16} />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              style={{ fontFamily: "'Lora', serif" }}
                              className="text-sm font-bold truncate text-stone-950 dark:text-stone-50"
                            >
                              {w.walletName}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-sm font-bold tabular-nums shrink-0 pl-3 text-stone-700 dark:text-stone-300"
                        >
                          ₹{w.balance?.toLocaleString("en-IN") || 0}
                        </span>
                      </button>
                    );
                  })}
                {wallets.filter(
                  (w) => !w.isVirtual && w._id !== transferData.sourceWallet
                ).length === 0 && (
                  <div className="p-6 text-center text-stone-400 text-xs font-bold uppercase tracking-wider border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
                    No matching target wallets available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: AMOUNT & DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={prevStep}
                  className="p-1.5 -ml-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors outline-none rounded-lg cursor-pointer"
                  title="Back to Target Wallet"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50 leading-tight"
                >
                  Transfer Details
                </h2>
              </div>

              {/* Amount Input */}
              <div className="relative border-b border-stone-200 dark:border-white/[0.09] focus-within:border-emerald-700 dark:focus-within:border-[#4EA885] transition-colors pt-2">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="absolute left-0 bottom-3 text-2xl font-bold text-stone-400 dark:text-stone-500"
                >
                  ₹
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="w-full bg-transparent pb-3 pl-7 text-3xl sm:text-4xl font-bold tabular-nums text-stone-950 dark:text-stone-50 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
                  value={formatDisplayAmount(transferData.amount)}
                  onChange={handleAmountChange}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      transferData.amount &&
                      Number(transferData.amount) > 0
                    ) {
                      e.preventDefault();
                      handleFinalSubmit(e);
                    } else if (e.key === "Backspace" && !transferData.amount) {
                      prevStep();
                    }
                  }}
                />
              </div>

              {/* Pathway Visualizer */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF9F6] dark:bg-[#16181C] rounded-xl border border-stone-200/80 dark:border-white/[0.07]">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[9.5px] font-bold text-stone-400 uppercase tracking-[0.12em] mb-0.5">
                    From
                  </p>
                  <p
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-xs font-bold text-stone-950 dark:text-stone-50 truncate"
                  >
                    {sourceWalletObj?.walletName}
                  </p>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-[#1A1C20] border border-stone-200/80 dark:border-white/[0.08] flex items-center justify-center text-emerald-700 dark:text-[#68C19D] shadow-2xs">
                  <ArrowRight size={14} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0 pl-2 text-right">
                  <p className="text-[9.5px] font-bold text-stone-400 uppercase tracking-[0.12em] mb-0.5">
                    To
                  </p>
                  <p
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-xs font-bold text-stone-950 dark:text-stone-50 truncate"
                  >
                    {targetWalletObj?.walletName}
                  </p>
                </div>
              </div>

              {/* Comments Input */}
              <div className="space-y-1.5 pt-1 text-left">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.12em]">
                  Comments (Optional)
                </label>
                <textarea
                  ref={commentsInputRef}
                  rows="2"
                  placeholder="Add transfer notes..."
                  className="w-full bg-white dark:bg-[#16181C] p-3 rounded-xl text-sm text-stone-900 dark:text-stone-100 outline-none border border-stone-200/90 dark:border-white/[0.08] focus:ring-2 focus:ring-emerald-700/15 dark:focus:ring-[#4EA885]/20 focus:border-emerald-700 dark:focus:border-[#4EA885] transition-all no-scrollbar placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  value={transferData.description}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFinalSubmit(e);
                    } else if (
                      e.key === "Backspace" &&
                      !transferData.description
                    ) {
                      prevStep();
                    }
                  }}
                />
              </div>

              {/* Submission Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={
                    !transferData.amount ||
                    Number(transferData.amount) <= 0 ||
                    loading
                  }
                  onClick={handleFinalSubmit}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 dark:bg-[#4EA885] dark:hover:bg-[#68C19D] text-white dark:text-[#121315] rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-45 transition-all outline-none shadow-2xs cursor-pointer"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white dark:border-stone-900/30 dark:border-t-stone-900" />
                  ) : (
                    <>
                      Complete Transfer <Check size={16} strokeWidth={3} />
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

const TransferModal = ({
  isOpen,
  setOpen,
  wallets = [],
  transferData,
  setTransferData,
  onSubmit,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <TransferModalContent
      key={
        isOpen ? transferData?.sourceWallet || "transfer-default" : "closed"
      }
      setOpen={setOpen}
      wallets={wallets}
      transferData={transferData}
      setTransferData={setTransferData}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};

export default TransferModal;
