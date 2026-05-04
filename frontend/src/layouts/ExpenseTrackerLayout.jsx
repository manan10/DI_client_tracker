import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import ExpenseNavbar from "../components/ExpenseNavbar";
import ExpenseModal from "../components/ExpenseTracker/Dashboard/ExpenseModal";
import TopUpModal from "../components/ExpenseTracker/Dashboard/TopUpModal";
import FloatingActions from "../components/ExpenseTracker/Dashboard/FloatingActions";

const ExpenseTrackerLayout = () => {
  const { request, loading } = useApi();
  const { user } = useAuth();

  const [wallets, setWallets] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const initializationTriggered = useRef(false);

  const [expenseData, setExpenseData] = useState({
    amount: "", category: "", description: "", sourceWallet: "", type: "DEBIT",
  });

  const [topUpData, setTopUpData] = useState({
    amount: "", description: "", targetWallet: "",
  });

  const fetchWallets = useCallback(async () => {
    try {
      const data = await request("/spending/summary");
      if (data?.wallets) {
        setWallets(data.wallets);
        const userWallet = data.wallets.find(w => 
          w.walletName.toLowerCase().includes(user?.name?.toLowerCase()) || (!w.isGeneralPool && !w.isVirtual)
        );
        const activeWallet = userWallet || data.wallets.find(w => !w.isGeneralPool);
        if (activeWallet) {
          setExpenseData(prev => ({ ...prev, sourceWallet: prev.sourceWallet || activeWallet._id }));
        }
      }
    } catch (err) {
      console.error("Wallet Sync Failure", err);
    }
  }, [request, user?.name]);

  useEffect(() => {
    if (!initializationTriggered.current) {
      initializationTriggered.current = true;
      setTimeout(() => { fetchWallets(); }, 0);
    }
  }, [fetchWallets]);

  const handleExpenseSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request("/spending", "POST", { ...expenseData, amount: Number(expenseData.amount) });
    if (res) {
      setIsExpenseModalOpen(false);
      setExpenseData(prev => ({ ...prev, amount: "", description: "", category: "" }));
      await fetchWallets();
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleTopUpSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request(`/wallets/${topUpData.targetWallet}/topup`, "POST", {
      amount: Number(topUpData.amount), description: topUpData.description,
    });
    if (res) {
      setIsTopUpModalOpen(false);
      setTopUpData({ amount: "", description: "", targetWallet: "" });
      await fetchWallets();
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500">
      <ExpenseNavbar />
      <Outlet context={{ fetchWallets, wallets, refreshKey }} />
      <FloatingActions 
        onOpenExpense={() => setIsExpenseModalOpen(true)}
        onOpenTopUp={() => setIsTopUpModalOpen(true)}
      />
      <ExpenseModal 
        isOpen={isExpenseModalOpen} setOpen={setIsExpenseModalOpen}
        wallets={wallets} expenseData={expenseData}
        setExpenseData={setExpenseData} onSubmit={handleExpenseSubmit}
        loading={loading}
      />
      <TopUpModal 
        isOpen={isTopUpModalOpen} setOpen={setIsTopUpModalOpen}
        wallets={wallets} topUpData={topUpData}
        setTopUpData={setTopUpData} onSubmit={handleTopUpSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ExpenseTrackerLayout;