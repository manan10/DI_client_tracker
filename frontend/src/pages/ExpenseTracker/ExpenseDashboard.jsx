import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import ExpenseNavbar from "../../components/ExpenseNavbar";
import { DashboardHeader } from "../../components/ExpenseTracker/Dashboard/DashboardHeader";
import WalletGrid from "../../components/ExpenseTracker/Dashboard/WalletGrid";
import GlobalFeed from "../../components/ExpenseTracker/Dashboard/GlobalFeed";
import ExpenseModal from "../../components/ExpenseTracker/Dashboard/ExpenseModal";
import TopUpModal from "../../components/ExpenseTracker/Dashboard/TopUpModal";
import FloatingActions from "../../components/ExpenseTracker/Dashboard/FloatingActions";

const ExpenseDashboard = () => {
  const { request, loading } = useApi();
  const { user } = useAuth();

  const [summary, setSummary] = useState({ wallets: [], monthlyTotal: 0 });
  const [history, setHistory] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
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
  });

  const loadDashboardData = useCallback(
    async (isMounted = true) => {
      try {
        const data = await request("/spending/summary");
        
        if (data?.wallets && isMounted) {
          setSummary({
            wallets: data.wallets,
            monthlyTotal: data.analytics?.total ?? data.monthlyTotal ?? 0,
            analytics: data.analytics || { total: 0, cash: 0, digital: 0 }
          });

          const historyData = await request(`/spending/history/all`);
          if (isMounted) {
            setHistory(historyData?.data || historyData || []); 
            
            const userWallet = data.wallets.find(
              (w) =>
                w.walletName.toLowerCase().includes(user?.name?.toLowerCase()) || 
                (!w.isGeneralPool && !w.isVirtual) 
            );
            
            const activeWallet = userWallet || data.wallets.find((w) => !w.isGeneralPool);
            
            if (activeWallet) {
              setExpenseData((prev) => ({
                ...prev,
                sourceWallet: prev.sourceWallet || activeWallet._id,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Sync Failure", err);
      }
    },
    [request, user?.name],
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!initializationTriggered.current) {
        initializationTriggered.current = true;
        await loadDashboardData(isMounted);
      }
    })();
    return () => { isMounted = false; };
  }, [loadDashboardData]);

  const handleExpenseSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await request("/spending", "POST", { 
        ...expenseData, 
        amount: Number(expenseData.amount) 
      });
      
      if (response) {
        setIsExpenseModalOpen(false);
        setExpenseData((prev) => ({ ...prev, amount: "", description: "", category: "" }));
        loadDashboardData(true);
      }
    } catch (err) {
      console.error("Expense Submission Failed:", err.message);
      throw err; 
    }
  };

  const handleTopUpSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await request(`/wallets/${topUpData.targetWallet}/topup`, "POST", {
        amount: Number(topUpData.amount),
        description: topUpData.description,
      });

      if (response) {
        setIsTopUpModalOpen(false);
        setTopUpData({ amount: "", description: "", targetWallet: "" });
        loadDashboardData(true);
      }
    } catch (err) {
      console.error("Top-Up Failed:", err.message);
      throw err; 
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 text-left">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <ExpenseNavbar />

      <div className="pb-36 lg:pb-24">
        <DashboardHeader 
          summary={summary} 
          loading={loading} 
          loadDashboardData={loadDashboardData} 
        />

        <div className="max-w-6xl mx-auto px-2 md:px-6 mt-6 md:mt-10">
          <WalletGrid wallets={summary.wallets} />
          
          <div className="mt-12 md:mt-12 text-left">
            <GlobalFeed history={history} wallets={summary.wallets} />
          </div>
        </div>

        <FloatingActions 
          onOpenExpense={() => setIsExpenseModalOpen(true)}
          onOpenTopUp={() => setIsTopUpModalOpen(true)}
        />

        <ExpenseModal 
          key={isExpenseModalOpen ? "active-expense" : "inactive-expense"}
          isOpen={isExpenseModalOpen} setOpen={setIsExpenseModalOpen}
          wallets={summary.wallets} expenseData={expenseData}
          setExpenseData={setExpenseData} onSubmit={handleExpenseSubmit}
          loading={loading}
        />

        <TopUpModal 
          key={isTopUpModalOpen ? "active-topup" : "inactive-topup"}
          isOpen={isTopUpModalOpen}
          setOpen={setIsTopUpModalOpen}
          wallets={summary.wallets}
          topUpData={topUpData}
          setTopUpData={setTopUpData}
          onSubmit={handleTopUpSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ExpenseDashboard;