import React, { useState, useRef, useEffect } from "react";
import { Search, X, Wallet, Briefcase, ChevronDown, Check } from "lucide-react";
import { getWalletColor } from "../Dashboard/walletUtils";

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
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target)) {
        setIsWalletOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cashWallets = wallets.filter((w) => !w.isVirtual);
  const virtualWallets = wallets.filter((w) => w.isVirtual);

  return (
    <div className="flex flex-row items-center gap-2.5 max-w-2xl w-full">
      {/* Search Input Box */}
      <div className="flex-1 relative bg-white dark:bg-[#0B1120] rounded-xl border-2 border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600 shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all flex items-center h-11">
        <Search size={15} className="text-slate-400 dark:text-slate-500 ml-3 shrink-0" />
        <input
          type="text"
          placeholder="Search category, notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent py-1.5 pl-2 pr-3 text-xs font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Account Channel Dropdown */}
      <div className="relative shrink-0 max-w-44 sm:max-w-64" ref={walletDropdownRef}>
        <button
          type="button"
          onClick={() => setIsWalletOpen(!isWalletOpen)}
          className={`h-11 px-3 flex items-center justify-between gap-2 bg-white dark:bg-[#0B1120] border-2 rounded-xl shadow-2xs transition-all cursor-pointer outline-none ${
            isWalletOpen
              ? "border-teal-600 ring-2 ring-teal-500/15"
              : "border-teal-500/70 dark:border-teal-500/50 hover:border-teal-600 dark:hover:border-teal-400"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <Wallet size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
              {currentWalletObj?.walletName}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-teal-600 dark:text-teal-400 shrink-0 transition-transform duration-200 ${
              isWalletOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isWalletOpen && (
          <div className="absolute top-[calc(100%+6px)] right-0 sm:left-0 z-50 w-72 bg-white dark:bg-[#0B1120] border-2 border-teal-500/30 rounded-xl shadow-2xl overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setActiveWallet("All");
                setIsWalletOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                activeWallet === "All"
                  ? "bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/30"
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={13} className="text-teal-600" />
                <span className="text-xs font-bold">All Accounts Combined</span>
              </div>
              {activeWallet === "All" && <Check size={14} className="text-teal-600" />}
            </button>

            {cashWallets.length > 0 && (
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-2 pb-1 block">
                  Cash Vaults
                </span>
                <div className="flex flex-col gap-0.5">
                  {cashWallets.map((w, idx) => {
                    const palette = getWalletColor(w._id, idx);
                    const isSelected = activeWallet === w._id;

                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setActiveWallet(w._id);
                          setIsWalletOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                          isSelected
                            ? `${palette.badge} border font-bold`
                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-xs truncate pr-2">{w.walletName}</span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 shrink-0">
                          ₹{formatINR(w.balance)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {virtualWallets.length > 0 && (
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-2 pb-1 block">
                  Digital Gateways
                </span>
                <div className="flex flex-col gap-0.5">
                  {virtualWallets.map((w, idx) => {
                    const isSelected = activeWallet === w._id;

                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => {
                          setActiveWallet(w._id);
                          setIsWalletOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30"
                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-xs truncate pr-2">{w.walletName}</span>
                        <span className="text-[9px] font-mono font-bold uppercase text-indigo-500">
                          Live Sync
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