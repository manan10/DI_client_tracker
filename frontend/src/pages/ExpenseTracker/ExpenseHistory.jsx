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

  useEffect(() => {
    let isMounted = true;
    const fetchHistoryData = async () => {
      const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${searchQuery}`;
      const res = await request(`/spending/history?${query}`, "GET");
      if (isMounted && res?.success) {
        setTransactions(res.data || []);
      }
    };
    fetchHistoryData();
    return () => { isMounted = false; };
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
    if (res) {
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
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
      <main className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
        
        {/* Very subtle background depth texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-200/40 via-transparent to-transparent dark:from-emerald-900/10 pointer-events-none -z-10" />

        <div className="space-y-5 sm:space-y-6">
          
          {/* CINEMATIC SEARCH BAR */}
          <div className="relative w-full flex items-center bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:border-emerald-500/80 dark:focus-within:border-emerald-400/80 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group overflow-hidden">
            
            {/* Elegant Focus Edge */}
            <div className="absolute top-0 left-0 h-full w-0.75 bg-linear-to-b from-emerald-400 to-emerald-600 opacity-0 group-focus-within:opacity-100 transition-opacity" />

            <div className="pl-4 sm:pl-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={16} strokeWidth={2.5} className="sm:w-4.5 sm:h-4.5" />
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical ledger notes or amounts..."
              className="w-full bg-transparent py-3.5 sm:py-4 pl-3 pr-4 text-xs sm:text-sm font-semibold outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="p-1.5 mr-2 sm:mr-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* MAIN TRANSACTION LEDGER */}
          <div className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl sm:rounded-4xl p-4 sm:p-8 shadow-sm">
            
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 sm:pb-5 mb-6 sm:mb-8 flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-lg shadow-md shadow-emerald-500/20">
                  <Activity size={14} strokeWidth={3} className="sm:w-4 sm:h-4" />
                </div>
                <h2 className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none mt-0.5">
                  Verified Data Stream
                </h2>
              </div>
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 leading-none">
                {transactions.length} Nodes
              </span>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {loading && transactions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
                </div>
              ) : Object.keys(groupedTransactions).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <Search size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">No Transactions Found</p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 max-w-xs">There are no records matching your current filters and timeline.</p>
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
        key={isEditModalOpen ? `edit-${editData._id}` : "closed"}
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
            await request(`/spending/${deleteTarget._id}`, "DELETE");
            setTransactions(prev => prev.filter(t => t._id !== deleteTarget._id));
            setDeleteTarget(null);
            fetchWallets();
          }} 
        />
      )}
    </div>
  );
};

export default ExpenseHistory;