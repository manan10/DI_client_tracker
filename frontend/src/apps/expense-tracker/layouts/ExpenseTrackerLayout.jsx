import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";
import { useAuth } from "../../../shared/hooks/useAuth";
import ExpenseNavbar from "../components/ExpenseNavbar";
import ExpenseModal from "../components/Dashboard/ExpenseModal";
import TopUpModal from "../components/Dashboard/TopUpModal";
import TransferModal from "../components/Dashboard/TransferModal";
import FloatingActions from "../components/Dashboard/FloatingActions";

const ExpenseTrackerLayout = () => {
  const { request, loading } = useApi();
  const { user } = useAuth();

  const [wallets, setWallets] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const initializationTriggered = useRef(false);

  const [expenseData, setExpenseData] = useState({
    amount: "",
    category: "",
    description: "",
    sourceWallet: "",
    type: "DEBIT",
  });

  const [topUpData, setTopUpData] = useState({
    amount: "",
    description: "",
    targetWallet: "",
    isExternal: false,
  });

  const [transferData, setTransferData] = useState({
    amount: "",
    description: "",
    sourceWallet: "",
    targetWallet: "",
  });

  const fetchWallets = useCallback(async () => {
    try {
      const data = await request("/spending/summary");
      if (data?.wallets) {
        setWallets(data.wallets);
        const userWallet = data.wallets.find(
          (w) =>
            w.walletName.toLowerCase().includes(user?.name?.toLowerCase()) ||
            (!w.isGeneralPool && !w.isVirtual),
        );
        const activeWallet = userWallet || data.wallets.find((w) => !w.isGeneralPool);
        if (activeWallet) {
          setExpenseData((prev) => ({
            ...prev,
            sourceWallet: prev.sourceWallet || activeWallet._id,
          }));
        }
      }
    } catch (err) {
      console.error("Wallet Sync Failure", err);
    }
  }, [request, user?.name]);

  useEffect(() => {
    if (!initializationTriggered.current) {
      initializationTriggered.current = true;
      setTimeout(() => {
        fetchWallets();
      }, 0);
    }
  }, [fetchWallets]);

  const handleExpenseSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request("/spending", "POST", {
      ...expenseData,
      amount: Number(expenseData.amount),
    });
    if (res) {
      setIsExpenseModalOpen(false);
      setExpenseData((prev) => ({
        ...prev,
        amount: "",
        description: "",
        category: "",
      }));
      await fetchWallets();
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleTopUpSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request(`/wallets/${topUpData.targetWallet}/topup`, "POST", {
      amount: Number(topUpData.amount),
      description: topUpData.description,
      isExternal: topUpData.isExternal || false,
    });
    if (res) {
      setIsTopUpModalOpen(false);
      setTopUpData({
        amount: "",
        description: "",
        targetWallet: "",
        isExternal: false,
      });
      await fetchWallets();
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleTransferSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request("/wallets/transfer", "POST", {
      sourceWallet: transferData.sourceWallet,
      targetWallet: transferData.targetWallet,
      amount: Number(transferData.amount),
      description: transferData.description,
    });
    if (res) {
      setIsTransferModalOpen(false);
      setTransferData({
        amount: "",
        description: "",
        sourceWallet: "",
        targetWallet: "",
      });
      await fetchWallets();
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 flex flex-col">
      <ExpenseNavbar />

      <div className="flex-1 pb-24 md:pb-0">
        <Outlet
          context={{
            fetchWallets,
            wallets,
            refreshKey,
            setIsExpenseModalOpen,
            setIsTopUpModalOpen,
            setIsTransferModalOpen,
            setExpenseData,
            setTopUpData,
            setTransferData,
          }}
        />
      </div>

      <div className="fixed bottom-24 md:bottom-10 right-5 md:right-10 z-40">
        <FloatingActions
          onOpenExpense={() => setIsExpenseModalOpen(true)}
          onOpenTopUp={() => setIsTopUpModalOpen(true)}
          onOpenTransfer={() => setIsTransferModalOpen(true)}
        />
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        setOpen={setIsExpenseModalOpen}
        wallets={wallets}
        expenseData={expenseData}
        setExpenseData={setExpenseData}
        onSubmit={handleExpenseSubmit}
        loading={loading}
      />
      <TopUpModal
        isOpen={isTopUpModalOpen}
        setOpen={setIsTopUpModalOpen}
        wallets={wallets}
        topUpData={topUpData}
        setTopUpData={setTopUpData}
        onSubmit={handleTopUpSubmit}
        loading={loading}
      />
      <TransferModal
        isOpen={isTransferModalOpen}
        setOpen={setIsTransferModalOpen}
        wallets={wallets}
        transferData={transferData}
        setTransferData={setTransferData}
        onSubmit={handleTransferSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ExpenseTrackerLayout;