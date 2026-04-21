import React, { useState, useMemo, useEffect } from "react";
import ExpenseNavbar from "../../components/ExpenseNavbar";
import ExpenseModal from "../../components/ExpenseTracker/Dashboard/ExpenseModal";
import { useApi } from "../../hooks/useApi";

// Sub-components
import HistoryHeader from "../../components/ExpenseTracker/History/HeaderHistory";
import FilterBar from "../../components/ExpenseTracker/History/FilterBar";
import TransactionGroup from "../../components/ExpenseTracker/History/TransactionGroup";
import DeleteConfirmation from "../../components/ExpenseTracker/History/DeleteConfirmation";

const ExpenseHistory = () => {
  const { request, loading } = useApi();
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeWallet, setActiveWallet] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ amount: "", category: "", description: "", sourceWallet: "", type: "DEBIT" });

  // FETCH HISTORY (Effect-contained to fix cascading render error)
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
  }, [request, selectedMonth, selectedYear, activeWallet, searchQuery]);

  // FETCH WALLETS
  useEffect(() => {
    let isMounted = true;
    const getWallets = async () => {
      const res = await request("/spending/summary", "GET");
      if (isMounted && res?.wallets) setWallets(res.wallets);
    };
    getWallets();
    return () => { isMounted = false; };
  }, [request]);

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
      // Trigger local state update to avoid full refresh
      const query = `month=${selectedMonth}&year=${selectedYear}&walletId=${activeWallet}&search=${searchQuery}`;
      const refreshRes = await request(`/spending/history?${query}`, "GET");
      if (refreshRes?.success) setTransactions(refreshRes.data);
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
    <div className="min-h-screen bg-white dark:bg-[#020617] text-left">
      <ExpenseNavbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <HistoryHeader 
          selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear} setSelectedYear={setSelectedYear}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        />
        <FilterBar wallets={wallets} activeWallet={activeWallet} setActiveWallet={setActiveWallet} />
        
        <div className="mt-16 space-y-12">
          {loading && transactions.length === 0 ? (
            <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">Synchronizing Ledger...</div>
          ) : Object.keys(groupedTransactions).length === 0 ? (
            <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">No records for this selection</div>
          ) : Object.keys(groupedTransactions).map(date => (
            <TransactionGroup 
              key={date} date={date} transactions={groupedTransactions[date]} 
              onEdit={handleEditClick} onDelete={setDeleteTarget}
            />
          ))}
        </div>

        <ExpenseModal 
          isOpen={isEditModalOpen} setOpen={setIsEditModalOpen}
          wallets={wallets} expenseData={editData} setExpenseData={setEditData} 
          onSubmit={handleEditSubmit} loading={loading}
        />

        {deleteTarget && (
          <DeleteConfirmation 
            target={deleteTarget} 
            onClose={() => setDeleteTarget(null)} 
            onConfirm={async () => {
              await request(`/spending/${deleteTarget._id}`, "DELETE");
              setTransactions(prev => prev.filter(t => t._id !== deleteTarget._id));
              setDeleteTarget(null);
            }} 
          />
        )}
      </main>
    </div>
  );
};

export default ExpenseHistory;