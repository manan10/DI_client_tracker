import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
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

  const handleOpenNewEntry = () => {
    setEditingId(null);
    setInputValues({});
    setNote("");
    setEntryDate(new Date().toISOString().split('T')[0]);
    setIsEntryOpen(true);
  };

  const startEdit = (snapshot) => {
    setEditingId(snapshot._id);
    setEntryDate(new Date(snapshot.date).toISOString().split('T')[0]);
    setNote(snapshot.note || "");
    const editValues = {};
    snapshot.balances.forEach(b => { 
      if (b.accountId?._id) {
        // Keeping DB decimal format (18.73)
        editValues[b.accountId._id] = b.amount; 
      }
    });
    setInputValues(editValues);
    setIsEntryOpen(true);
  };

  const groupedAccounts = useMemo(() => groupAccountsByOwner(accounts), [accounts]);

  // FIXED CALCULATION LOGIC
  const performance = useMemo(() => {
    // If we have history and the form is CLOSED, show the latest DB snapshot
    if (!isEntryOpen && history.length > 0) {
      const latest = history[0];
      const previous = history.length > 1 ? history[1] : null;
      
      const currentVal = latest.balances.reduce((sum, b) => sum + (b.amount || 0), 0);
      const prevVal = previous ? previous.balances.reduce((sum, b) => sum + (b.amount || 0), 0) : currentVal;
      
      return { 
        currentTotal: currentVal, 
        growth: currentVal - prevVal 
      };
    }

    // If form is OPEN, use utility to calculate based on inputs
    return calculatePerformance(inputValues, history);
  }, [inputValues, history, isEntryOpen]);

  const handleSaveSnapshot = async () => {
    setSaving(true);
    const balances = Object.entries(inputValues).map(([id, val]) => ({
      accountId: id,
      amount: Number(val) || 0 // DB stores decimals directly
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center italic text-slate-400">Loading Assets...</div>;

  return (
    <div className="w-full px-6 md:px-12 py-10 space-y-14">
      <AccountHero 
        currentTotal={performance.currentTotal}
        growth={performance.growth}
        isEntryOpen={isEntryOpen}
        setIsEntryOpen={handleOpenNewEntry}
        editingId={editingId}
      />

      <SnapshotForm 
        isOpen={isEntryOpen}
        onClose={() => { setIsEntryOpen(false); setEditingId(null); }}
        groupedAccounts={groupedAccounts}
        inputValues={inputValues}
        setInputValues={setInputValues}
        entryDate={entryDate}
        setEntryDate={setEntryDate}
        note={note}
        setNote={setNote}
        onSave={handleSaveSnapshot}
        saving={saving}
        editingId={editingId}
      />

      <div className="w-full">
        <HistoryTable accounts={accounts} history={history} onEdit={startEdit} />
      </div>
    </div>
  );
};

export default AccountBalances;