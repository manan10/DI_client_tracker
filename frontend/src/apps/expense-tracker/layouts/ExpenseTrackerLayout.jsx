import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";
import { useAuth } from "../../../shared/hooks/useAuth";
import ExpenseNavbar from "../components/ExpenseNavbar";
import ExpenseModal from "../components/Dashboard/ExpenseModal";
import TopUpModal from "../components/Dashboard/TopUpModal";
import TransferModal from "../components/Dashboard/TransferModal";
import FloatingActions from "../components/Dashboard/FloatingActions";

const initialExpenseState = {
  amount: "",
  category: "",
  description: "",
  sourceWallet: "",
  type: "DEBIT",
};

const initialTopUpState = {
  amount: "",
  description: "",
  targetWallet: "",
  isExternal: false,
};

const initialTransferState = {
  amount: "",
  description: "",
  sourceWallet: "",
  targetWallet: "",
};

const ExpenseTrackerLayout = () => {
  const { request, loading } = useApi();
  const { user } = useAuth();

  const [wallets, setWallets] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const initializationTriggered = useRef(false);

  const [expenseData, setExpenseData] = useState(initialExpenseState);
  const [topUpData, setTopUpData] = useState(initialTopUpState);
  const [transferData, setTransferData] = useState(initialTransferState);

  // Sync wallets from server without auto-injecting a default wallet into expenseData
  const fetchWallets = useCallback(async () => {
    try {
      const data = await request("/spending/summary");
      if (data?.wallets) {
        setWallets(data.wallets);
      }
    } catch (err) {
      console.error("Wallet Sync Failure", err);
    }
  }, [request]);

  useEffect(() => {
    if (!initializationTriggered.current) {
      initializationTriggered.current = true;
      setTimeout(() => {
        fetchWallets();
      }, 0);
    }
  }, [fetchWallets]);

  // Clean open handlers for Floating Actions that guarantee empty initial states
  const handleOpenExpenseFromFab = () => {
    setExpenseData(initialExpenseState);
    setIsExpenseModalOpen(true);
  };

  const handleOpenTopUpFromFab = () => {
    setTopUpData(initialTopUpState);
    setIsTopUpModalOpen(true);
  };

  const handleOpenTransferFromFab = () => {
    setTransferData(initialTransferState);
    setIsTransferModalOpen(true);
  };

  const handleExpenseSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request("/spending", "POST", {
      ...expenseData,
      amount: Number(expenseData.amount),
    });
    if (res) {
      setIsExpenseModalOpen(false);
      setExpenseData(initialExpenseState);
      await fetchWallets();
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleTopUpSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request(
      `/wallets/${topUpData.targetWallet}/topup`,
      "POST",
      {
        amount: Number(topUpData.amount),
        description: topUpData.description,
        isExternal: topUpData.isExternal || false,
      },
    );
    if (res) {
      setIsTopUpModalOpen(false);
      setTopUpData(initialTopUpState);
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
      setTransferData(initialTransferState);
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
          onOpenExpense={handleOpenExpenseFromFab}
          onOpenTopUp={handleOpenTopUpFromFab}
          onOpenTransfer={handleOpenTransferFromFab}
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