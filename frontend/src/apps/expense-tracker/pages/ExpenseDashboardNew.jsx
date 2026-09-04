import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";
import ReconcileModal from "../components/Dashboard/ReconcileModal";
import WalletActionModal from "../components/Dashboard/WalletActionModal";
import WalletGridSection from "../components/Dashboard/WalletGridSection";
import TransactionLedger from "../components/Dashboard/TransactionLedger";
import { RefreshCw, Activity } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 overflow-x-hidden pb-24 relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none dark:from-emerald-500/5 dark:via-transparent" />

      <main className="relative z-10 w-full max-w-440 mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-6 sm:pt-10 flex flex-col gap-8 lg:gap-10">
        {/* Header Strip */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="shrink-0 w-full md:w-auto flex justify-between items-start md:block">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                  Expense Module
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  Live System Overview
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent leading-none">
                Expense Dashboard
              </h1>

              <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Track treasury reserves, monitor daily spending channels, and
                reconcile physical cash balances from one centralized command
                hub.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="md:hidden p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-sm shadow-2xs text-slate-600 dark:text-slate-300 active:scale-95 transition-transform cursor-pointer"
              aria-label="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-emerald-500" : ""}
              />
            </button>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity
                size={14}
                strokeWidth={2.5}
                className="text-emerald-500"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Spent This Month
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-6xl lg:text-7xl font-mono font-[1000] tracking-tighter leading-none tabular-nums text-slate-950 dark:text-white">
                ₹{formatINR(summary.monthlyTotal)}
              </span>

              <button
                type="button"
                onClick={() => loadDashboardData()}
                disabled={loading}
                className="hidden md:flex p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-sm shadow-2xs hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-all cursor-pointer text-slate-600 dark:text-slate-300 active:scale-95 disabled:opacity-50"
                title="Sync Dashboard Data"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin text-emerald-500" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
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
