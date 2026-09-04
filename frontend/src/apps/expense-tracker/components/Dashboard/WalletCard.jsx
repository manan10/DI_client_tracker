import React from "react";
import {
  Wallet,
  Landmark,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { getWalletColor } from "./walletUtils";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

const WalletCard = ({
  wallet,
  index = 0,
  onCardClick,
}) => {
  const isCash = !wallet.isVirtual;
  const palette = getWalletColor(wallet._id || wallet.walletName, index);

  return (
    <button
      type="button"
      onClick={() => onCardClick(wallet)}
      className={`relative flex flex-col justify-between p-3 bg-white dark:bg-slate-900 border ${palette.border} rounded-md shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden text-left cursor-pointer outline-none w-full`}
    >
      <div className={`absolute top-0 inset-x-0 h-1 ${palette.indicator}`} />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-1.5 pt-0.5 w-full">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          <div className={`p-1.5 rounded-md border shrink-0 ${palette.iconBox}`}>
            {isCash ? (
              wallet.isGeneralPool ? <Landmark size={13} /> : <Wallet size={13} />
            ) : (
              <Smartphone size={13} />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 wrap-break-word leading-tight">
              {wallet.walletName}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
              {isCash ? "Cash" : "Digital"}
            </span>
          </div>
        </div>

        {!isCash && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 text-[8px] font-mono font-bold uppercase tracking-wider shrink-0">
            <CheckCircle2 size={9} className="text-emerald-500" />
            <span>Linked</span>
          </div>
        )}
      </div>

      {/* Balance Segment */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col w-full">
        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {isCash ? "Balance" : "Channel Status"}
        </span>
        <div className="flex items-baseline justify-between gap-1 mt-0.5">
          <span
            className={`text-sm sm:text-base font-mono font-black tabular-nums tracking-tight ${
              isCash ? palette.accent : "text-slate-700 dark:text-slate-300 text-xs"
            }`}
          >
            {isCash ? `₹${formatINR(wallet.balance)}` : "Active"}
          </span>
          <span
            className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs border shrink-0 ${palette.badge}`}
          >
            View
          </span>
        </div>
      </div>
    </button>
  );
};

export default WalletCard;