import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";
import ReconcileModal from "../components/Dashboard/ReconcileModal";
import WalletActionModal from "../components/Dashboard/WalletActionModal";
import WalletGridSection from "../components/Dashboard/WalletGridSection";
import TransactionLedger from "../components/Dashboard/TransactionLedger";
import { Wallet, CalendarDays, ArrowUpRight, Sparkles } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0,
  );
};

const ExpenseDashboardNew = () => {
  const { request, loading } = useApi();
  const {
    fetchWallets,
    wallets = [],
    refreshKey = 0,
    setIsExpenseModalOpen,
    setIsTopUpModalOpen,
    setIsTransferModalOpen,
    setExpenseData,
    setTopUpData,
    setTransferData,
  } = useOutletContext() || {};

  const [summary, setSummary] = useState({
    monthlyTotal: 0,
    analytics: { total: 0 },
  });
  const [history, setHistory] = useState([]);

  // Active wallet action modal state
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Reconciliation modal state
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [walletToReconcile, setWalletToReconcile] = useState(null);

  const currentMonthName = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const loadDashboardData = async () => {
    try {
      const data = await request("/spending/summary");
      if (data) {
        setSummary({
          monthlyTotal: data.analytics?.total ?? 0,
          analytics: data.analytics || { total: 0 },
        });
        const historyData = await request(`/spending/history/all`);
        setHistory(historyData?.data || historyData || []);
        if (fetchWallets) {
          fetchWallets();
        }
      }
    } catch (err) {
      console.error("Dashboard sync failed", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleReconcileSubmit = async (walletId, actualCash) => {
    const res = await request(`/wallets/${walletId}/reconcile`, "POST", {
      actualCash,
    });
    if (res) {
      setIsReconcileModalOpen(false);
      setWalletToReconcile(null);
      if (fetchWallets) await fetchWallets();
      loadDashboardData();
    }
  };

  const handleCardClick = (wallet) => {
    setSelectedWallet(wallet);
    setIsActionModalOpen(true);
  };

  const handleTriggerAction = (type, wallet) => {
    setIsActionModalOpen(false);
    setSelectedWallet(null);

    if (type === "EXPENSE") {
      if (setExpenseData && wallet?._id) {
        setExpenseData((prev) => ({ ...prev, sourceWallet: wallet._id }));
      }
      if (setIsExpenseModalOpen) setIsExpenseModalOpen(true);
    } else if (type === "TOPUP") {
      if (setTopUpData && wallet?._id) {
        setTopUpData((prev) => ({ ...prev, targetWallet: wallet._id }));
      }
      if (setIsTopUpModalOpen) setIsTopUpModalOpen(true);
    } else if (type === "TRANSFER") {
      if (setTransferData && wallet?._id) {
        setTransferData((prev) => ({ ...prev, sourceWallet: wallet._id }));
      }
      if (setIsTransferModalOpen) setIsTransferModalOpen(true);
    } else if (type === "RECONCILE") {
      setWalletToReconcile(wallet);
      setIsReconcileModalOpen(true);
    }
  };

  const cashWallets = wallets.filter((w) => !w.isVirtual);
  const virtualWallets = wallets.filter((w) => w.isVirtual);
  const totalCash = cashWallets.reduce((acc, curr) => acc + curr.balance, 0);
  const recentHistory = history?.slice(0, 15) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050811] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 overflow-x-hidden pb-28 relative">
      {/* ULTRA-WIDE CONTAINER */}
      <main className="relative z-10 w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 pt-6 sm:pt-10 flex flex-col gap-8 lg:gap-12">
        {/* HEADER SECTION */}
        <header className="relative flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 pb-8 border-b border-slate-200/80 dark:border-white/[0.08]">
          {/* Left: Brand Identity & Overview */}
          <div className="flex flex-col justify-between gap-4 max-w-3xl">
            {/* Context Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-[#0B1120] dark:to-[#0F172A] border border-slate-300 dark:border-white/20 ring-1 ring-slate-200 dark:ring-white/5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  Dalal Book
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/[0.04] dark:to-white/[0.02] border border-slate-300/80 dark:border-white/15 ring-1 ring-slate-200/70 dark:ring-white/5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                <CalendarDays size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{currentMonthName}</span>
              </div>
            </div>

            {/* Title & Explainer */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Expense Overview
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm lg:text-base font-normal text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                See all your cash balances, track daily expenses, and check what's been spent this month in one place.
              </p>
            </div>

            {/* Micro Balance Note */}
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Wallet size={13} className="text-slate-400 dark:text-slate-500" />
                <span>{wallets.length} active wallets</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div>
                Physical Cash In Hand:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹{formatINR(totalCash)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: TOTAL SPENT CARD (Double-Bordered & Gradient-Filled) */}
          <div className="relative w-full lg:w-auto lg:min-w-[420px] 2xl:min-w-[480px] rounded-2xl p-5 sm:p-6 lg:p-7 overflow-hidden transition-all duration-300 border border-slate-300 dark:border-indigo-500/40 ring-1 ring-slate-400/50 dark:ring-indigo-400/20 bg-gradient-to-br from-indigo-50/80 via-white to-violet-100/50 dark:from-[#0E1326] dark:via-[#0B1020] dark:to-[#17142E] shadow-sm">
            {/* Top Row: Crisp Contrast Tag */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                <ArrowUpRight size={13} strokeWidth={2.5} />
                <span>Spent This Month</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Live Total</span>
              </div>
            </div>

            {/* Middle Row: Massive Standout Currency Display */}
            <div className="relative z-10 mt-3 sm:mt-5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-400 dark:text-slate-500 select-none">
                ₹
              </span>
              <span className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-mono font-black text-slate-950 dark:text-white tracking-tight leading-none tabular-nums truncate">
                {formatINR(summary.monthlyTotal)}
              </span>
            </div>

            {/* Bottom Row: Context Footer */}
            <div className="relative z-10 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Card, Bank Transfers & Cash</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Auto-Calculated
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 2xl:gap-14 items-start">
          <WalletGridSection
            cashWallets={cashWallets}
            virtualWallets={virtualWallets}
            totalCash={totalCash}
            onCardClick={handleCardClick}
          />

          <TransactionLedger recentHistory={recentHistory} wallets={wallets} />
        </div>
      </main>

      {/* Universal Action Modal */}
      <WalletActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedWallet(null);
        }}
        wallet={selectedWallet}
        onOpenExpense={() => handleTriggerAction("EXPENSE", selectedWallet)}
        onOpenTopUp={() => handleTriggerAction("TOPUP", selectedWallet)}
        onOpenTransfer={() => handleTriggerAction("TRANSFER", selectedWallet)}
        onOpenReconcile={() => handleTriggerAction("RECONCILE", selectedWallet)}
      />

      {/* Reconcile Modal */}
      <ReconcileModal
        key={walletToReconcile?._id || "reconcile-modal"}
        isOpen={isReconcileModalOpen}
        setOpen={setIsReconcileModalOpen}
        wallet={walletToReconcile}
        onSubmit={handleReconcileSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ExpenseDashboardNew;