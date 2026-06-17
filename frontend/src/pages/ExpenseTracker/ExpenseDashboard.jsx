import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { DashboardHeader } from "../../components/ExpenseTracker/Dashboard/DashboardHeader";
import WalletGrid from "../../components/ExpenseTracker/Dashboard/WalletGrid";
import GlobalFeed from "../../components/ExpenseTracker/Dashboard/GlobalFeed";
import ReconcileModal from "../../components/ExpenseTracker/Dashboard/ReconcileModal";

const ExpenseDashboard = () => {
  const { request, loading } = useApi();
  const { fetchWallets, wallets, refreshKey } = useOutletContext();

  const [summary, setSummary] = useState({ monthlyTotal: 0, analytics: { total: 0 } });
  const [history, setHistory] = useState([]);
  
  // NEW: Reconciliation State
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [walletToReconcile, setWalletToReconcile] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await request("/spending/summary");
      if (data) {
        setSummary({
          monthlyTotal: data.analytics?.total ?? 0,
          analytics: data.analytics || { total: 0 }
        });
        const historyData = await request(`/spending/history/all`);
        setHistory(historyData?.data || historyData || []);
        fetchWallets();
      }
    } catch (err) {
      console.error("Dashboard Sync Failed", err);
    }
  }, [request, fetchWallets]);

  useEffect(() => {
    const timer = setTimeout(() => { loadDashboardData(); }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData, refreshKey]);

  // NEW: Handle Quick Sync Submit
  const handleReconcileSubmit = async (walletId, actualCash) => {
    const res = await request(`/wallets/${walletId}/reconcile`, "POST", { actualCash });
    if (res) {
      setIsReconcileModalOpen(false);
      setWalletToReconcile(null);
      await fetchWallets();
      loadDashboardData(); // Refresh history feed to show the new adjustment log
    }
  };

  const openReconcileModal = (wallet) => {
    setWalletToReconcile(wallet);
    setIsReconcileModalOpen(true);
  };

  return (
    <div className="pb-36 lg:pb-24">
      <DashboardHeader 
        summary={{ ...summary, wallets }} 
        loading={loading} 
        loadDashboardData={loadDashboardData} 
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
        {/* Passed the trigger function down to the grid */}
        <WalletGrid wallets={wallets} onReconcile={openReconcileModal} />
        
        <div className="mt-20 md:mt-12 text-left">
          <GlobalFeed history={history} wallets={wallets} />
        </div>
      </div>

      {/* NEW: Reconcile Modal */}
      <ReconcileModal 
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