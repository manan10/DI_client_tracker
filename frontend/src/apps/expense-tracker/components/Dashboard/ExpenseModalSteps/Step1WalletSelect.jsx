import React from "react";
import { Coins, Globe, Landmark, Wallet } from "lucide-react";

export const Step1WalletSelect = ({
  isEditMode,
  activeTab,
  setActiveTab,
  filteredWallets,
  expenseData,
  setExpenseData,
  onSelectWallet,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
      <div className="text-left mb-2">
        <h2
          style={{ fontFamily: "'Lora', serif" }}
          className="text-lg font-bold tracking-tight text-stone-950 dark:text-stone-50"
        >
          {isEditMode ? "Switch Wallet" : "Select Wallet"}
        </h2>
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-0.5">
          Select the account the expense was paid from.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="bg-stone-200/70 dark:bg-white/[0.06] p-1 rounded-xl flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("cash")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none cursor-pointer ${
            activeTab === "cash"
              ? "bg-white dark:bg-[#262930] text-emerald-700 dark:text-[#68C19D] shadow-2xs"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
          }`}
        >
          <Coins size={14} /> Cash Wallets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("online")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-all outline-none cursor-pointer ${
            activeTab === "online"
              ? "bg-white dark:bg-[#262930] text-emerald-700 dark:text-[#68C19D] shadow-2xs"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
          }`}
        >
          <Globe size={14} /> Digital Accounts
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filteredWallets[activeTab].map((w) => {
          const isSelected = expenseData.sourceWallet === w._id;
          return (
            <button
              key={w._id}
              type="button"
              onClick={() => {
                setExpenseData((prev) => ({ ...prev, sourceWallet: w._id }));
                onSelectWallet();
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left outline-none cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/75 border-emerald-700/60 dark:bg-[#4EA885]/[0.14] dark:border-[#4EA885]/60 text-emerald-800 dark:text-[#86D4B4]"
                  : "bg-white border-stone-200/80 dark:bg-[#1A1C20] dark:border-white/[0.07] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50 text-stone-950 dark:text-stone-50"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-emerald-700 dark:bg-[#4EA885] text-white dark:text-[#121315]"
                      : "bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D]"
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
                  <span
                    style={{ fontFamily: "'Lora', serif" }}
                    className="text-sm font-bold truncate"
                  >
                    {w.walletName}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider mt-0.5 ${
                      isSelected
                        ? "opacity-80"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    {w.isVirtual ? "Digital Channel" : "Cash Wallet"}
                  </span>
                </div>
              </div>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-sm font-bold tabular-nums shrink-0 pl-3 text-stone-700 dark:text-stone-300"
              >
                {w.isVirtual
                  ? "—"
                  : `₹${w.balance?.toLocaleString("en-IN") || 0}`}
              </span>
            </button>
          );
        })}
        {filteredWallets[activeTab].length === 0 && (
          <div className="p-6 text-center text-stone-400 text-xs font-bold uppercase tracking-wider border border-dashed border-stone-200 dark:border-white/10 rounded-xl">
            No matching accounts
          </div>
        )}
      </div>
    </div>
  );
};
