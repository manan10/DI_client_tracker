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
              onSelectWallet();
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
  );
};