import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import ExpenseModal from "../../components/ExpenseTracker/Dashboard/ExpenseModal";
import HistoryHeader from "../../components/ExpenseTracker/History/HistoryHeader";
import HistoryFilterBar from "../../components/ExpenseTracker/History/HistoryFilterBar";
import HistorySummaryCard from "../../components/ExpenseTracker/History/HistorySummaryCard";
import HistoryTimelineStream from "../../components/ExpenseTracker/History/HistoryTimelineStream";
import VoidConfirmModal from "../../components/ExpenseTracker/History/VoidConfirmModal";

const getRelativeDateHeader = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const dayNumber = d.getDate().toString().padStart(2, "0");
  const monthName = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
  const yearName = d.getFullYear().toString();

  if (isToday) return { tag: "Today", dayNumber, monthName, dayName, yearName };
  if (isYesterday) return { tag: "Yesterday", dayNumber, monthName, dayName, yearName };

  return {
    tag: null,
    dayNumber,
    monthName,
    dayName,
    yearName,
  };
};

const ExpenseHistoryNew = () => {
  const { request, loading } = useApi();
  const { wallets = [], refreshKey, fetchWallets } = useOutletContext() || {};

  const [transactions, setTransactions] = useState([]);
  const [periodGlobalTransactions, setPeriodGlobalTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeWallet, setActiveWallet] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Modals & Action States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    amount: "",
    category: "",
    description: "",
    sourceWallet: "",
    type: "DEBIT",
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const years = [2024, 2025, 2026];

  // Fetch Total Period Inflow & Outflow Across ALL Wallets for the Selected Month/Year
  useEffect(() => {
    let isMounted = true;
    const fetchPeriodTotals = async () => {
      try {
        const res = await request(
          `/spending/history?month=${selectedMonth}&year=${selectedYear}&walletId=All&search=`,
          "GET"
        );
        if (isMounted && res) {
          const rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
          setPeriodGlobalTransactions(rawData);
        }
      } catch (err) {
        console.error("Failed to load period global metrics", err);
      }
    };
    fetchPeriodTotals();
    return () => {
      isMounted = false;
    };
  }, [request, selectedMonth, selectedYear, refreshKey]);

  // Debounced API Sync for Filtered Query Table
  useEffect(() => {
    let isMounted = true;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${encodeURIComponent(
          searchQuery
        )}`;
        const res = await request(`/spending/history?${query}`, "GET");
        if (isMounted && res) {
          const rawData = res?.success ? res.data : Array.isArray(res) ? res : [];
          setTransactions(rawData);
        }
      } catch (err) {
        console.error("Failed to load history records", err);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [request, selectedMonth, selectedYear, activeWallet, searchQuery, refreshKey]);

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleEditClick = (t, e) => {
    if (e) e.stopPropagation();
    setEditData({
      _id: t._id,
      amount: String(t.amount || ""),
      category: t.category?._id || t.category,
      description: t.description || "",
      sourceWallet: t.sourceWallet?._id || t.sourceWallet,
      type: t.type || "DEBIT",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await request(`/spending/${editData._id}`, "PUT", {
        ...editData,
        amount: Number(editData.amount),
      });

      if (res?.success || res) {
        setIsEditModalOpen(false);
        const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${encodeURIComponent(
          searchQuery
        )}`;
        const refreshRes = await request(`/spending/history?${query}`, "GET");
        if (refreshRes) {
          setTransactions(refreshRes?.data || refreshRes || []);
        }
        const periodRes = await request(
          `/spending/history?month=${selectedMonth}&year=${selectedYear}&walletId=All&search=`,
          "GET"
        );
        if (periodRes) {
          setPeriodGlobalTransactions(periodRes?.data || periodRes || []);
        }
        if (fetchWallets) fetchWallets();
      }
    } catch (err) {
      console.error("Failed to update transaction", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await request(`/spending/${deleteTarget._id}`, "DELETE");
      if (res?.success || res) {
        setTransactions((prev) => prev.filter((t) => t._id !== deleteTarget._id));
        setPeriodGlobalTransactions((prev) => prev.filter((t) => t._id !== deleteTarget._id));
        if (fetchWallets) fetchWallets();
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setDeleteTarget(null);
    }
  };

  const currentWalletObj =
    activeWallet === "All"
      ? { walletName: "All Accounts", isGeneralPool: true }
      : wallets.find((w) => w._id === activeWallet);

  // Month-Wide Header Metrics
  const periodHeaderMetrics = useMemo(() => {
    let monthTotalOutflow = 0;
    let monthTotalInflow = 0;

    periodGlobalTransactions.forEach((t) => {
      const isDebit = t.type === "DEBIT" || (!t.type && !t.isTopUp);
      if (isDebit) {
        monthTotalOutflow += Number(t.amount || 0);
      } else {
        monthTotalInflow += Number(t.amount || 0);
      }
    });

    return { monthTotalOutflow, monthTotalInflow };
  }, [periodGlobalTransactions]);

  // Contextual Selection Summary Metrics
  const selectionSummary = useMemo(() => {
    let periodSpent = 0;
    let periodTopUp = 0;

    transactions.forEach((t) => {
      const isDebit = t.type === "DEBIT" || (!t.type && !t.isTopUp);
      if (isDebit) {
        periodSpent += Number(t.amount || 0);
      } else {
        periodTopUp += Number(t.amount || 0);
      }
    });

    let currentBalance = 0;
    if (activeWallet === "All") {
      currentBalance = wallets
        .filter((w) => !w.isVirtual)
        .reduce((acc, curr) => acc + (curr.balance || 0), 0);
    } else {
      currentBalance = currentWalletObj?.balance || 0;
    }

    const netDelta = periodTopUp - periodSpent;

    return {
      periodSpent,
      periodTopUp,
      currentBalance,
      netDelta,
      isVirtualWallet: Boolean(currentWalletObj?.isVirtual),
      txCount: transactions.length,
    };
  }, [transactions, wallets, activeWallet, currentWalletObj]);

  // Group transactions chronologically
  const groupedTransactions = useMemo(() => {
    const groups = [];
    let currentHeader = null;
    let currentItems = [];

    transactions.forEach((item) => {
      const headerObj = getRelativeDateHeader(item.date);
      const headerKey = `${headerObj.dayNumber}-${headerObj.monthName}-${headerObj.yearName}`;
      if (headerKey !== currentHeader?.key) {
        if (currentItems.length > 0) {
          groups.push({ header: currentHeader, items: currentItems });
        }
        currentHeader = { key: headerKey, ...headerObj };
        currentItems = [item];
      } else {
        currentItems.push(item);
      }
    });

    if (currentItems.length > 0) {
      groups.push({ header: currentHeader, items: currentItems });
    }

    return groups;
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 overflow-x-hidden pb-28 relative">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/10 via-indigo-500/5 to-transparent pointer-events-none dark:from-emerald-500/5 dark:via-transparent" />

      <main className="relative z-10 w-full max-w-440 mx-auto px-3 sm:px-6 lg:px-10 xl:px-14 pt-6 sm:pt-10 flex flex-col gap-5 sm:gap-6">
        {/* 1. Header with Period Picker & Month Totals */}
        <HistoryHeader
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          months={months}
          years={years}
          monthTotalOutflow={periodHeaderMetrics.monthTotalOutflow}
          monthTotalInflow={periodHeaderMetrics.monthTotalInflow}
        />

        {/* 2. Filter Bar: Search & Account Channel */}
        <HistoryFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeWallet={activeWallet}
          setActiveWallet={setActiveWallet}
          wallets={wallets}
          currentWalletObj={currentWalletObj}
        />

        {/* 3. Unified Wallet & Scoped Period Summary Card */}
        <HistorySummaryCard
          currentWalletObj={currentWalletObj}
          selectedMonthName={months[selectedMonth]}
          selectedYear={selectedYear}
          selectionSummary={selectionSummary}
        />

        {/* 4. Fluid Timeline Stream */}
        <HistoryTimelineStream
          loading={loading}
          transactionsCount={selectionSummary.txCount}
          groupedTransactions={groupedTransactions}
          expandedId={expandedId}
          onToggleRow={toggleRow}
          onEditClick={handleEditClick}
          onDeleteClick={(item, e) => {
            if (e) e.stopPropagation();
            setDeleteTarget(item);
          }}
          wallets={wallets}
          selectedMonthName={months[selectedMonth]}
          selectedYear={selectedYear}
        />
      </main>

      {/* Edit Transaction Modal */}
      <ExpenseModal
        isOpen={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        wallets={wallets}
        expenseData={editData}
        setExpenseData={setEditData}
        onSubmit={handleEditSubmit}
        loading={loading}
      />

      {/* Delete / Void Confirmation Modal */}
      <VoidConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ExpenseHistoryNew;