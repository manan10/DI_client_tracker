import React from "react";
import { Wallet, Landmark, Smartphone, CheckCircle2 } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0
  );
};

const WalletCard = ({ wallet, onCardClick }) => {
  const isCash = !wallet.isVirtual;

  return (
    <button
      type="button"
      onClick={() => onCardClick(wallet)}
      style={{ fontFamily: "'Nunito Sans', sans-serif" }}
      className="group relative flex flex-col justify-between p-3.5 bg-white dark:bg-[#1A1C20] border border-stone-200/80 dark:border-white/[0.07] hover:border-emerald-700/45 dark:hover:border-[#4EA885]/50 rounded-2xl shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden text-left cursor-pointer outline-none w-full"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D] flex items-center justify-center shrink-0">
            {isCash ? (
              wallet.isGeneralPool ? (
                <Landmark size={14} />
              ) : (
                <Wallet size={14} />
              )
            ) : (
              <Smartphone size={14} />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              style={{ fontFamily: "'Lora', serif" }}
              className="text-sm font-bold text-stone-950 dark:text-stone-50 group-hover:text-emerald-800 dark:group-hover:text-[#86D4B4] transition-colors truncate leading-tight"
            >
              {wallet.walletName}
            </span>
            <span className="text-[9.5px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
              {isCash ? "Cash" : "Digital"}
            </span>
          </div>
        </div>

        {!isCash && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-700/10 dark:bg-[#4EA885]/18 text-emerald-800 dark:text-[#86D4B4] text-[9px] font-bold uppercase tracking-wider shrink-0">
            <CheckCircle2 size={9} />
            <span>Linked</span>
          </div>
        )}
      </div>

      {/* Balance Segment */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-white/[0.06] flex flex-col w-full">
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
          {isCash ? "Balance" : "Channel Status"}
        </span>
        <div className="flex items-baseline justify-between gap-1 mt-0.5">
          <span
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className={`font-bold tabular-nums tracking-tight ${
              isCash
                ? "text-base text-stone-950 dark:text-stone-50"
                : "text-xs text-emerald-700 dark:text-[#68C19D]"
            }`}
          >
            {isCash ? `₹${formatINR(wallet.balance)}` : "Active"}
          </span>
          <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-stone-300 shrink-0">
            View
          </span>
        </div>
      </div>
    </button>
  );
};

export default WalletCard;
