import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import AccountHero from './AccountBalances/AccountHero';
import SnapshotForm from './AccountBalances/SnapshotForm';
import HistoryTable from './AccountBalances/HistoryTable';
import { groupAccountsByOwner, calculatePerformance } from './AccountBalances/accountUtils';

const AccountBalances = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [inputValues, setInputValues] = useState({});
  const [note, setNote] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const accRes = await request('/accounts', 'GET');
      const histRes = await request('/accounts/history', 'GET');
      
      setAccounts(accRes?.data || []);
      setHistory(histRes?.data || []);
    } catch (err) { 
      console.error("Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [request]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Checks if the selected date already exists in history ---
  const handleDateChange = (newDate) => {
    setEntryDate(newDate);
    
    // Look for an existing snapshot on this exact date
    const existingSnap = history.find(h => new Date(h.date).toISOString().split('T')[0] === newDate);
    
    if (existingSnap) {
      setEditingId(existingSnap._id);
      setNote(existingSnap.note || "");
      const editValues = {};
      existingSnap.balances.forEach(b => { 
        if (b.accountId?._id || b.accountId) {
          editValues[b.accountId._id || b.accountId] = b.amount; 
        }
      });
      setInputValues(editValues);
    } else {
      setEditingId(null);
      // We don't clear the inputValues here so the user doesn't lose what they typed if they just change the date
    }
  };

  const handleOpenNewEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    setInputValues({});
    setNote("");
    // Trigger the date check for "today" immediately upon opening
    handleDateChange(today);
    setIsEntryOpen(true);
  };

  const startEdit = (snapshot) => {
    setEditingId(snapshot._id);
    setEntryDate(new Date(snapshot.date).toISOString().split('T')[0]);
    setNote(snapshot.note || "");
    const editValues = {};
    snapshot.balances.forEach(b => { 
      if (b.accountId?._id || b.accountId) {
        editValues[b.accountId._id || b.accountId] = b.amount; 
      }
    });
    setInputValues(editValues);
    setIsEntryOpen(true);
  };

  const groupedAccounts = useMemo(() => groupAccountsByOwner(accounts), [accounts]);

  const performance = useMemo(() => {
    if (!isEntryOpen && history.length > 0) {
      const latest = history[0];
      const previous = history.length > 1 ? history[1] : null;
      
      const currentVal = latest.balances.reduce((sum, b) => sum + (b.amount || 0), 0);
      const prevVal = previous ? previous.balances.reduce((sum, b) => sum + (b.amount || 0), 0) : currentVal;
      
      return { currentTotal: currentVal, growth: currentVal - prevVal };
    }
    return calculatePerformance(inputValues, history);
  }, [inputValues, history, isEntryOpen]);

  const handleSaveSnapshot = async () => {
    setSaving(true);
    const balances = Object.entries(inputValues).map(([id, val]) => ({
      accountId: id,
      amount: Number(val) || 0 
    }));
    try {
      const endpoint = editingId ? `/accounts/snapshot/${editingId}` : '/accounts/snapshot';
      const method = editingId ? 'PUT' : 'POST';
      await request(endpoint, method, { balances, note, date: entryDate });
      
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#10b981', '#ffffff'] });
      setIsEntryOpen(false);
      await loadData();
    } catch { 
        alert("Save Failed"); 
    } finally { 
        setSaving(false); 
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="text-emerald-600 dark:text-emerald-400 animate-spin" strokeWidth={2.5} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Synchronizing Liquidity Records...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* HERO METRICS SECTION */}
      <div className="w-full">
        <AccountHero 
          currentTotal={performance.currentTotal}
          growth={performance.growth}
          isEntryOpen={isEntryOpen}
          setIsEntryOpen={handleOpenNewEntry}
          editingId={editingId}
        />
      </div>

      {/* SNAPSHOT FORM / ENTRY DRAWER */}
      <div className="w-full">
        <SnapshotForm 
          isOpen={isEntryOpen}
          onClose={() => { setIsEntryOpen(false); setEditingId(null); }}
          groupedAccounts={groupedAccounts}
          inputValues={inputValues}
          setInputValues={setInputValues}
          entryDate={entryDate}
          onDateChange={handleDateChange}
          note={note}
          setNote={setNote}
          onSave={handleSaveSnapshot}
          saving={saving}
          editingId={editingId}
        />
      </div>

      {/* HISTORICAL LEDGER TABLE */}
      <div className="w-full">
        <HistoryTable accounts={accounts} history={history} onEdit={startEdit} />
      </div>

    </div>
  );
};

export default AccountBalances;