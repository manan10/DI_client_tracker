import React from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowDown,
  Landmark,
  Wallet,
  Coins,
} from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(amount || 0)
  );
};

const MonthlyRefill = ({ wallets = [], onRefill, loading }) => {
  const drawer = wallets.find((w) => w.isGeneralPool);
  const recipients = wallets.filter((w) => !w.isGeneralPool && w.targetAllowance > 0);
  const totalGivenOut = recipients.reduce(
    (sum, w) => sum + (Number(w.targetAllowance) || 0),
    0
  );
  const drawerRefillAmount = Number(drawer?.targetAllowance || 0);
  const remainingInDrawer = drawerRefillAmount - totalGivenOut;

  return (
    <div className="space-y-6 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Monthly <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Refill</span>
          </h2>
          <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Refill the main cash drawer and distribute monthly pocket allowances to family members.
          </p>
        </div>

        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
          <Coins size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>New Month</span>
        </span>
      </div>

      {/* 3-CARD SIMPLE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-sans font-medium text-slate-400 block">
            Money Added to Drawer
          </span>
          <span className="text-base sm:text-lg font-mono font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
            +₹{formatINR(drawerRefillAmount)}
          </span>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
            {drawer?.walletName || "Main Drawer"}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-sans font-medium text-slate-400 block">
            Given to Family Members
          </span>
          <span className="text-base sm:text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
            -₹{formatINR(totalGivenOut)}
          </span>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
            Split across {recipients.length} wallet{recipients.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-sans font-medium text-slate-400 block">
            Left in Main Drawer
          </span>
          <span
            className={`text-base sm:text-lg font-mono font-bold block mt-0.5 ${
              remainingInDrawer >= 0
                ? "text-slate-900 dark:text-white"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            ₹{formatINR(remainingInDrawer)}
          </span>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
            {remainingInDrawer >= 0 ? "Surplus remaining" : "Deficit (Need more cash)"}
          </span>
        </div>
      </div>

      {/* STEP 1: FILL THE MAIN DRAWER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Fill the Main Cash Drawer
          </h3>
        </div>

        <div className="p-3 rounded-lg bg-white dark:bg-[#0B1120] border border-blue-200/80 dark:border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <Landmark size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-sans font-semibold text-slate-900 dark:text-white block truncate">
                {drawer?.walletName || "Main Drawer"}
              </span>
              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
                Current balance: ₹{formatINR(drawer?.balance || 0)}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-mono font-bold text-blue-600 dark:text-blue-400">
              +₹{formatINR(drawerRefillAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* STEP 2: WHO RECEIVES ALLOWANCE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Send Allowance to Family Wallets
            </h3>
          </div>
          <span className="text-[11px] font-sans text-slate-400">
            {recipients.length} Person{recipients.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
          {recipients.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="py-2 px-3 sm:px-4">Family Member / Wallet</th>
                  <th className="py-2 px-3 sm:px-4 text-right">Current Balance</th>
                  <th className="py-2 px-3 sm:px-4 text-right">Amount to Add</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-sans">
                {recipients.map((wallet) => (
                  <tr
                    key={wallet._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <Wallet size={13} />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {wallet.walletName}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {wallet.user?.name || "Shared"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      ₹{formatINR(wallet.balance || 0)}
                    </td>

                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      +₹{formatINR(wallet.targetAllowance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-6 text-center text-xs font-sans text-slate-400">
              No members have monthly limits set. Go to the Wallets tab to add targets.
            </div>
          )}
        </div>
      </div>

      {/* PLAIN EXPLANATION BOX */}
      <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-white/5">
        <AlertCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
          When you click refill, the system will add{" "}
          <strong className="text-blue-600 dark:text-blue-400 font-mono font-semibold">
            ₹{formatINR(drawerRefillAmount)}
          </strong>{" "}
          into {drawer?.walletName || "Main Drawer"}, and transfer{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            ₹{formatINR(totalGivenOut)}
          </strong>{" "}
          into the individual wallets.
        </p>
      </div>

      {/* ACTION BUTTON */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onRefill}
          disabled={loading || !drawer}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-md text-xs font-sans font-semibold tracking-wide transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}
          <span>Confirm Monthly Refill</span>
        </button>
      </div>
    </div>
  );
};

export default MonthlyRefill;