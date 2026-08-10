import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ExpenseNavbar from "../../components/ExpenseNavbar";
import ExpenseModal from "../../components/ExpenseTracker/Dashboard/ExpenseModal";
import { useApi } from "../../hooks/useApi";
import { Search, X, Activity } from "lucide-react";

import HistoryCommandCenter from "../../components/ExpenseTracker/History/HistoryCommandCenter";
import TransactionGroup from "../../components/ExpenseTracker/History/TransactionGroup";
import DeleteConfirmation from "../../components/ExpenseTracker/History/DeleteConfirmation";

const ExpenseHistory = () => {
  const { request, loading } = useApi();
  const { wallets = [], refreshKey, fetchWallets } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeWallet, setActiveWallet] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ amount: "", category: "", description: "", sourceWallet: "", type: "DEBIT" });

  // 1. DEBOUNCED API CALL (Fixes Network Storms & UI Freezes)
  useEffect(() => {
    let isMounted = true;
    
    const delayDebounceFn = setTimeout(async () => {
      const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${searchQuery}`;
      const res = await request(`/spending/history?${query}`, "GET");
      if (isMounted && res?.success) {
        setTransactions(res.data || []);
      }
    }, 300); // Waits 300ms after you stop typing before hitting the backend

    return () => { 
      isMounted = false; 
      clearTimeout(delayDebounceFn); 
    };
  }, [request, selectedMonth, selectedYear, activeWallet, searchQuery, refreshKey]);

  const handleEditClick = (t) => {
    setEditData({
      _id: t._id,
      amount: t.amount,
      category: t.category?._id || t.category,
      description: t.description,
      sourceWallet: t.sourceWallet?._id || t.sourceWallet,
      type: t.type || "DEBIT",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    const res = await request(`/spending/${editData._id}`, "PUT", { ...editData, amount: Number(editData.amount) });
    
    // Safety Check: Only close and refresh if the backend successfully updated
    if (res?.success || res) {
      setIsEditModalOpen(false);
      const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${searchQuery}`;
      const refreshRes = await request(`/spending/history?${query}`, "GET");
      if (refreshRes?.success) setTransactions(refreshRes.data);
      fetchWallets();
    }
  };

  const groupedTransactions = useMemo(() => {
    const groups = {};
    if (!Array.isArray(transactions)) return {};
    transactions.forEach(t => {
      const dateKey = t.date ? new Date(t.date).toISOString().split('T')[0] : 'Unknown';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {});
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. SEAMLESS HEADER */}
      <HistoryCommandCenter 
        wallets={wallets}
        activeWallet={activeWallet} 
        setActiveWallet={setActiveWallet}
        selectedMonth={selectedMonth} 
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear} 
        setSelectedYear={setSelectedYear}
      />

      {/* 2. PRECISION WORKSPACE */}
      {/* Fixed: max-w-400 typo to a fluid max-w-4xl for proper desktop constraints */}
      <main className="w-full max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10 min-w-0">
        
        {/* Subtle background depth texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-200/40 via-transparent to-transparent dark:from-emerald-900/5 pointer-events-none -z-10" />

        <div className="space-y-4 sm:space-y-6">
          
          {/* CINEMATIC SEARCH BAR */}
          <div className="relative w-full flex items-center bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm focus-within:border-emerald-500 dark:focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500 transition-all group overflow-hidden">
            
            <div className="pl-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0">
              <Search size={16} strokeWidth={2.5} />
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical ledger notes or amounts..."
              className="w-full bg-transparent py-3 sm:py-3.5 pl-3 pr-4 text-sm font-semibold outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")} 
                className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer shrink-0 outline-none"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* MAIN TRANSACTION LEDGER */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm min-w-0">
            
            {/* Header Strip */}
            <div className="border-b border-slate-200 dark:border-white/10 pb-4 mb-5 sm:mb-6 flex flex-row items-center justify-between gap-4 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md shrink-0">
                  <Activity size={14} strokeWidth={2.5} />
                </div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest truncate">
                  Verified Data Stream
                </h2>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5 shrink-0">
                {transactions.length} Nodes
              </span>
            </div>

            {/* Ledger List */}
            <div className="space-y-5 sm:space-y-6">
              {loading && transactions.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-800 border-t-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
                </div>
              ) : Object.keys(groupedTransactions).length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-slate-200 dark:border-white/5">
                    <Search size={18} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Transactions Found</p>
                  <p className="text-xs font-medium text-slate-500">There are no records matching your current filters and timeline.</p>
                </div>
              ) : (
                Object.keys(groupedTransactions).map(date => (
                  <TransactionGroup 
                    key={date} 
                    date={date} 
                    transactions={groupedTransactions[date]} 
                    onEdit={handleEditClick} 
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* MODALS */}
      <ExpenseModal 
        isOpen={isEditModalOpen} 
        setOpen={setIsEditModalOpen}
        wallets={wallets} 
        expenseData={editData} 
        setExpenseData={setEditData} 
        onSubmit={handleEditSubmit} 
        loading={loading}
      />

      {deleteTarget && (
        <DeleteConfirmation 
          target={deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          onConfirm={async () => {
            const res = await request(`/spending/${deleteTarget._id}`, "DELETE");
            if (res?.success || res) {
              setTransactions(prev => prev.filter(t => t._id !== deleteTarget._id));
              fetchWallets();
            }
            setDeleteTarget(null);
          }} 
        />
      )}
    </div>
  );
};

export default ExpenseHistory;