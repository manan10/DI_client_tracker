import React, { useState, useRef, useEffect } from "react";
import { Search, X, Wallet, Briefcase, ChevronDown, Check } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const HistoryFilterBar = ({
  searchQuery,
  setSearchQuery,
  activeWallet,
  setActiveWallet,
  wallets = [],
  currentWalletObj,
}) => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const walletDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(e.target)
      ) {
        setIsWalletOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cashWallets = wallets.filter((w) => !w.isVirtual);
  const virtualWallets = wallets.filter((w) => w.isVirtual);

  return (
    <div className="flex flex-row items-center gap-2.5 max-w-2xl w-full relative z-15">
      {/* Search Input Box */}
      <div className="flex-1 relative bg-white dark:bg-[#1A1C20] rounded-xl border border-stone-200/90 hover:border-stone-300 dark:border-white/[0.08] dark:hover:border-white/15 shadow-2xs focus-within:border-emerald-700 dark:focus-within:border-[#4EA885] focus-within:ring-2 focus-within:ring-emerald-700/12 dark:focus-within:ring-[#4EA885]/20 transition-all flex items-center h-11">
        <Search
          size={15}
          className="text-stone-400 dark:text-stone-500 ml-3.5 shrink-0"
        />
        <input
          type="text"
          placeholder="Search category, notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent py-1.5 pl-2.5 pr-3 text-xs font-medium text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 mr-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100 dark:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Account Channel Dropdown */}
      <div
        className="relative shrink-0 max-w-44 sm:max-w-64"
        ref={walletDropdownRef}
      >
        <button
          type="button"
          onClick={() => setIsWalletOpen(!isWalletOpen)}
          className={`h-11 px-3.5 flex items-center justify-between gap-2.5 bg-white dark:bg-[#1A1C20] border rounded-xl shadow-2xs transition-all cursor-pointer outline-none ${
            isWalletOpen
              ? "border-emerald-700 dark:border-[#4EA885] ring-2 ring-emerald-700/12 dark:ring-[#4EA885]/20"
              : "border-stone-200/90 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/15"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Wallet
              size={13}
              className="text-emerald-700 dark:text-[#68C19D] shrink-0"
            />
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
              {currentWalletObj?.walletName}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-stone-400 shrink-0 transition-transform duration-200 ${
              isWalletOpen
                ? "rotate-180 text-emerald-700 dark:text-[#68C19D]"
                : ""
            }`}
          />
        </button>

        {isWalletOpen && (
          <div className="absolute top-[calc(100%+6px)] right-0 sm:left-0 z-50 w-72 bg-white dark:bg-[#1A1C20] border border-stone-200/90 dark:border-white/[0.09] rounded-2xl shadow-xl overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setActiveWallet("All");
                setIsWalletOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                activeWallet === "All"
                  ? "bg-emerald-50/85 dark:bg-[#4EA885]/[0.15] text-emerald-800 dark:text-[#86D4B4] font-bold"
                  : "hover:bg-stone-100/80 dark:hover:bg-white/[0.05] text-stone-700 dark:text-stone-300 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase
                  size={13}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
                <span className="text-xs">All Accounts Combined</span>
              </div>
              {activeWallet === "All" && (
                <Check
                  size={14}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
              )}
            </button>

            {cashWallets.length > 0 && (
              <div className="pt-2 mt-1.5 border-t border-stone-100 dark:border-white/[0.06]">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 px-2.5 pb-1 block">
                  Cash Wallets
                </span>
                <div className="flex flex-col gap-0.5">
                  {cashWallets.map((w) => {
                    const isSelected = activeWallet === w._id;

                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setActiveWallet(w._id);
                          setIsWalletOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/85 dark:bg-[#4EA885]/[0.15] text-emerald-800 dark:text-[#86D4B4] font-bold"
                            : "hover:bg-stone-100/80 dark:hover:bg-white/[0.05] text-stone-700 dark:text-stone-300 font-medium"
                        }`}
                      >
                        <span className="text-xs truncate pr-2">
                          {w.walletName}
                        </span>
                        <span
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          className="text-[11px] text-stone-500 dark:text-stone-400 shrink-0 tabular-nums"
                        >
                          ₹{formatINR(w.balance)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {virtualWallets.length > 0 && (
              <div className="pt-2 mt-1.5 border-t border-stone-100 dark:border-white/[0.06]">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 px-2.5 pb-1 block">
                  Digital Channels
                </span>
                <div className="flex flex-col gap-0.5">
                  {virtualWallets.map((w) => {
                    const isSelected = activeWallet === w._id;

                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setActiveWallet(w._id);
                          setIsWalletOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/85 dark:bg-[#4EA885]/[0.15] text-emerald-800 dark:text-[#86D4B4] font-bold"
                            : "hover:bg-stone-100/80 dark:hover:bg-white/[0.05] text-stone-700 dark:text-stone-300 font-medium"
                        }`}
                      >
                        <span className="text-xs truncate pr-2">
                          {w.walletName}
                        </span>
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#68C19D]">
                          Digital
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryFilterBar;
