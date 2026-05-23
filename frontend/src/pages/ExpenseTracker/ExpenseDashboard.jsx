import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { DashboardHeader } from "../../components/ExpenseTracker/Dashboard/DashboardHeader";
import WalletGrid from "../../components/ExpenseTracker/Dashboard/WalletGrid";
import GlobalFeed from "../../components/ExpenseTracker/Dashboard/GlobalFeed";

const ExpenseDashboard = () => {
  const { request, loading } = useApi();
  const { fetchWallets, wallets, refreshKey } = useOutletContext();

  const [summary, setSummary] = useState({ monthlyTotal: 0, analytics: { total: 0 } });
  const [history, setHistory] = useState([]);

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

  return (
    // pb-36 handles the bottom navigation spacing on mobile
    <div className="pb-36 lg:pb-24">
      <DashboardHeader 
        summary={{ ...summary, wallets }} 
        loading={loading} 
        loadDashboardData={loadDashboardData} 
      />
      
      {/* Optimized wrapper: Adjusted mobile horizontal padding and top margin */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
        <WalletGrid wallets={wallets} />
        
        {/* Adjusted top margin for mobile density */}
        <div className="mt-20 md:mt-12 text-left">
          <GlobalFeed history={history} wallets={wallets} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;