import React, { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";
import ReconcileModal from "../components/Dashboard/ReconcileModal";
import WalletActionModal from "../components/Dashboard/WalletActionModal";
import WalletGridSection from "../components/Dashboard/WalletGridSection";
import TransactionLedger from "../components/Dashboard/TransactionLedger";
import { CalendarDays } from "lucide-react";

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    amount || 0
  );
};

const ExpenseDashboard = () => {
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

  // Wallet filter state for inspecting last 10 entries of a single wallet
  const [filteredWalletId, setFilteredWalletId] = useState(null);
  const ledgerRef = useRef(null);

  // Active wallet action modal state
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Reconciliation modal state
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [walletToReconcile, setWalletToReconcile] = useState(null);

  // Load Warm Household Typography Suite (Lora + Nunito Sans + IBM Plex Mono)
  useEffect(() => {
    const linkId = "kharcha-paani-sage-fonts";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Lora:wght@600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const currentMonthName = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const shortMonthName = new Date().toLocaleDateString("en-IN", {
    month: "short",
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

  // Primary card/row click opens WalletActionModal
  const handleCardClick = (wallet) => {
    if (!wallet) return;
    setSelectedWallet(wallet);
    setIsActionModalOpen(true);
  };

  // Explicit "Filter" button toggles filtering the ledger to that wallet's last 10 entries
  const handleFilterWallet = (wallet) => {
    if (!wallet?._id) return;

    setFilteredWalletId((prev) => {
      const nextId = prev === wallet._id ? null : wallet._id;

      // On mobile/tablet stacked layouts, scroll smoothly down to the filtered ledger
      if (nextId && window.innerWidth < 1024 && ledgerRef.current) {
        setTimeout(() => {
          ledgerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 60);
      }

      return nextId;
    });
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

  const activeFilteredWallet = useMemo(
    () => wallets.find((w) => w._id === filteredWalletId) || null,
    [wallets, filteredWalletId]
  );

  // Show last 10 entries for the selected wallet, or last 15 overall when unfiltered
  const displayedHistory = useMemo(() => {
    if (!filteredWalletId) {
      return history?.slice(0, 15) || [];
    }

    return (history || [])
      .filter((item) => {
        const srcId = item.sourceWallet?._id || item.sourceWallet;
        const tgtId = item.targetWallet?._id || item.targetWallet;
        return srcId === filteredWalletId || tgtId === filteredWalletId;
      })
      .slice(0, 10);
  }, [history, filteredWalletId]);

  const hasMonthlySpend = Number(summary.monthlyTotal) > 0;

  return (
    <div
      style={{
        fontFamily: "'Nunito Sans', sans-serif",
        "--kp-font-title": "'Lora', serif",
        "--kp-font-body": "'Nunito Sans', sans-serif",
        "--kp-font-mono": "'IBM Plex Mono', monospace",
      }}
      className="min-h-screen bg-[#F5F4F0] dark:bg-[#121315] text-stone-900 dark:text-stone-100 selection:bg-emerald-700/15 dark:selection:bg-[#4EA885]/25 overflow-x-hidden pb-32 relative transition-colors duration-200"
    >
      {/* =================================================================== */}
      {/* WARM EDITORIAL HEADER BAND                                          */}
      {/* =================================================================== */}
      <header className="relative z-10 w-full bg-[#FAF9F6] dark:bg-[#16181C] border-b border-stone-200/90 dark:border-white/[0.07]">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left: Unified Upright Heading Block */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
              <span className="uppercase tracking-[0.16em] text-[10px] font-bold text-emerald-700 dark:text-[#68C19D]">
                Kharcha Paani
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                <CalendarDays
                  size={12}
                  className="text-emerald-700 dark:text-[#68C19D]"
                />
                <span>{currentMonthName}</span>
              </span>
            </div>

            <h1
              style={{ fontFamily: "'Lora', serif" }}
              className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-none text-stone-950 dark:text-stone-50"
            >
              Overview
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 max-w-xl">
              Cash reserves, active accounts, and monthly spending in one ledger.
            </p>
          </div>

          {/* Right: Architectural Typographic Ledger Figures */}
          <div className="flex items-center gap-6 sm:gap-11 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-200/80 dark:border-white/[0.07]">
            {/* Metric 1: Monthly Spend */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Spent ({shortMonthName})
              </span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-stone-400 dark:text-stone-500"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className={`text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight leading-none tabular-nums ${
                    hasMonthlySpend
                      ? "text-stone-950 dark:text-stone-50"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {formatINR(summary.monthlyTotal)}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                {hasMonthlySpend ? "All channels combined" : "No spend logged yet"}
              </span>
            </div>

            {/* Vertical Ledger Rule */}
            <div className="w-px h-13 bg-stone-200 dark:bg-white/[0.08] shrink-0" />

            {/* Metric 2: Physical Cash In Hand (Anchored with Subtle Botanical Accent) */}
            <div className="flex flex-col pl-3.5 border-l-2 border-emerald-700/75 dark:border-[#4EA885]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                Cash In Hand
              </span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span
                  style={{ fontFamily: "'Lora', serif" }}
                  className="text-base sm:text-lg font-semibold text-emerald-700/65 dark:text-[#68C19D]/65"
                >
                  ₹
                </span>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-emerald-700 dark:text-[#68C19D] tracking-tight leading-none tabular-nums"
                >
                  {formatINR(totalCash)}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                Across {cashWallets.length} cash wallets
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* WORKSPACE CONTAINER                                                 */}
      {/* =================================================================== */}
      <main className="relative z-10 w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 pt-6 sm:pt-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-11 2xl:gap-14 items-start">
          <WalletGridSection
            cashWallets={cashWallets}
            virtualWallets={virtualWallets}
            totalCash={totalCash}
            selectedWalletId={filteredWalletId}
            onCardClick={handleCardClick}
            onFilterWallet={handleFilterWallet}
          />

          <div ref={ledgerRef} className="lg:col-span-7 w-full min-w-0 scroll-mt-4">
            <TransactionLedger
              recentHistory={displayedHistory}
              wallets={wallets}
              filteredWallet={activeFilteredWallet}
              onClearFilter={() => setFilteredWalletId(null)}
              onOpenWalletActions={handleCardClick}
            />
          </div>
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
        wallets={wallets}
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

export default ExpenseDashboard;