import React, { useState, useMemo } from 'react';
import { 
  Search, Check, ChevronDown, X, MessageSquare, Inbox, Info
} from 'lucide-react';
import { useApi } from '../../../../hooks/useApi';
import { toast } from 'sonner';

const AuditStep = ({ selection, setSelection, masterLedgers }) => {
  const { request } = useApi();
  const [activeTab, setActiveTab] = useState('RECEIPT'); 
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [narrationModal, setNarrationModal] = useState({ open: false, transaction: null, text: "" });

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const companyLedgers = useMemo(() => {
    return masterLedgers.filter(l => l.tallyCompanyName === selection.tallyCompany);
  }, [masterLedgers, selection.tallyCompany]);

  const transactions = useMemo(() => {
    return (selection.stagedData?.transactions || []).filter(t => t.narration !== "EMPTY_FILE_MARKER");
  }, [selection.stagedData]);

  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'RECEIPT') acc.receipts += curr.amount;
      if (curr.type === 'PAYMENT') acc.payments += curr.amount;
      return acc;
    }, { receipts: 0, payments: 0 });
  }, [transactions]);

  const displayTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === activeTab)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, activeTab]);

  const handleUpdate = async (txId, payload, silent = false) => {
    try {
      const res = await request(`/audit/transactions/${txId}`, 'PATCH', payload);
      if (res.success) {
        setSelection(prev => {
          const updatedTransactions = prev.stagedData.transactions.map(t => 
            t._id === txId ? { ...t, ...payload } : t
          );
          let newVerified = [...(prev.verifiedIds || [])];
          if (payload.isChecked !== undefined) {
            newVerified = payload.isChecked 
              ? [...new Set([...newVerified, txId])]
              : newVerified.filter(id => id !== txId);
          }
          return {
            ...prev,
            verifiedIds: newVerified,
            stagedData: { ...prev.stagedData, transactions: updatedTransactions }
          };
        });
        if (payload.suggestedLedger) { setEditingId(null); setSearchQuery(""); }
      }
    } catch {
      if (!silent) toast.error("Sync failed");
    }
  };

  const groupedLedgers = useMemo(() => {
    const filtered = companyLedgers.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.groupName && l.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return filtered.reduce((acc, ledger) => {
      const groupName = ledger.groupName || "PRIMARY LEDGERS";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(ledger);
      return acc;
    }, {});
  }, [companyLedgers, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#08090A] overflow-hidden">
      
      {/* HEADER */}
      <header className="px-8 py-4 bg-white dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              Audit <span className="text-emerald-500">Verification</span>
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selection.tallyCompany}</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
            {['RECEIPT', 'PAYMENT'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-500' : 'text-slate-400'}`}
              >
                {tab}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col text-right">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Receipts</p>
             <p className="text-xs font-black text-emerald-500 tabular-nums italic">{formatINR(totals.receipts)}</p>
          </div>
          <div className="flex flex-col text-right">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payments</p>
             <p className="text-xs font-black text-rose-500 tabular-nums italic">{formatINR(totals.payments)}</p>
          </div>
          <div className="flex flex-col text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Verified</p>
              <p className="text-xs font-black text-slate-900 dark:text-white tabular-nums italic">
                {selection.verifiedIds?.length || 0} / {transactions.length}
              </p>
          </div>
        </div>
      </header>

      {/* TRANSACTION GRID */}
      <main className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="flex-1 bg-white dark:bg-[#0B0C10] rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden">
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <table className="w-full border-collapse text-left table-fixed">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#111218] border-b border-slate-200 dark:border-white/10 z-20">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="w-20 px-6 py-4 text-center">Done</th>
                  <th className="w-32 px-4 py-4">Date</th>
                  <th className="w-auto px-4 py-4">Particulars</th>
                  <th className="w-72 px-4 py-4">Tally Mapping</th>
                  <th className="w-40 px-4 py-4 text-right">Amount</th>
                  <th className="w-56 px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayTransactions.map((tx) => {
                  const isChecked = (selection.verifiedIds || []).includes(tx._id);
                  const isEditing = editingId === tx._id;
                  const conf = Math.round((tx.confidence || 0) * 100);
                  const confColor = conf > 80 ? 'text-emerald-500' : 'text-amber-500';

                  return (
                    <tr key={tx._id} className={`transition-all ${isChecked ? 'bg-emerald-50/20 dark:bg-emerald-500/[0.01]' : 'bg-white dark:bg-transparent'}`}>
                      
                      {/* 1. CHECKBOX */}
                      <td className="px-6 py-3 text-center">
                        <button 
                          onClick={() => handleUpdate(tx._id, { isChecked: !isChecked })}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-transparent hover:border-emerald-500'}`}
                        >
                          <Check size={16} strokeWidth={4} />
                        </button>
                      </td>

                      {/* 2. DATE */}
                      <td className="px-4 py-3 text-[13px] font-black tabular-nums text-slate-600 dark:text-slate-400 uppercase italic">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>

                      {/* 3. NARRATION */}
                      <td className="px-4 py-3 min-w-0">
                        <div className="flex flex-col">
                          <p className={`text-[12px] font-bold uppercase tracking-tight leading-tight italic transition-all ${isChecked ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.narration}
                          </p>
                          {tx.customNarration && (
                            <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1 mt-1 uppercase tracking-widest">
                              <Info size={10} /> {tx.customNarration}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. DROPDOWN (SMOOTHED) */}
                      <td className="px-4 py-3 relative">
                        <div 
                          onClick={() => !isChecked && setEditingId(isEditing ? null : tx._id)} 
                          className={`p-2.5 rounded-lg border-2 flex flex-col gap-1 transition-all cursor-pointer ${isEditing ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-white/2 border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">
                              {tx.suggestedLedger || "?? SELECT"}
                            </span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
                          </div>
                          {!isChecked && (
                            <div className="flex items-center gap-2">
                               <div className="flex-1 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${conf > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${conf}%` }} />
                               </div>
                               <span className={`text-[8px] font-black tabular-nums ${confColor}`}>{conf}%</span>
                            </div>
                          )}
                        </div>

                        {/* ACTUAL DROPDOWN LIST */}
                        {isEditing && !isChecked && (
                          <div className="absolute top-[calc(100%-8px)] left-4 right-4 z-[100] bg-white dark:bg-[#111214] border-2 border-emerald-500 rounded-b-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                             <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-transparent">
                                <input 
                                  autoFocus 
                                  placeholder="TYPE TO FILTER..." 
                                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-[10px] font-black uppercase outline-none focus:border-emerald-500 transition-all dark:text-white" 
                                  value={searchQuery} 
                                  onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                             </div>
                             <div className="max-h-52 overflow-y-auto no-scrollbar">
                                {Object.entries(groupedLedgers).map(([group, ledgers]) => (
                                  <div key={group}>
                                    <div className="bg-slate-100 dark:bg-white/5 px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">{group}</div>
                                    {ledgers.map(l => (
                                      <div key={l._id} onClick={() => handleUpdate(tx._id, { suggestedLedger: l.name })} className="px-6 py-2.5 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase cursor-pointer transition-colors border-b border-slate-50 dark:border-white/5">
                                        {l.name}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </td>

                      {/* 5. AMOUNT */}
                      <td className={`px-4 py-3 text-right text-[15px] font-[1000] tabular-nums italic ${activeTab === 'RECEIPT' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {formatINR(tx.amount).replace('₹', tx.type === 'RECEIPT' ? '+' : '-')}
                      </td>

                      {/* 6. ACTIONS (TEXT LABELS) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdate(tx._id, { isMarkedForManualEntry: !tx.isMarkedForManualEntry })}
                            className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border-2 transition-all ${tx.isMarkedForManualEntry ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-transparent border-slate-100 dark:border-white/10 text-slate-400 hover:border-amber-500'}`}
                          >
                            Manual
                          </button>
                          <button 
                            onClick={() => handleUpdate(tx._id, { isCommission: !tx.isCommission })}
                            className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border-2 transition-all ${tx.isCommission ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-transparent border-slate-100 dark:border-white/10 text-slate-400 hover:border-blue-600'}`}
                          >
                            Comm
                          </button>
                          <button 
                            onClick={() => setNarrationModal({ open: true, transaction: tx, text: tx.customNarration || "" })}
                            className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border-2 transition-all ${tx.customNarration ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-transparent border-slate-100 dark:border-white/10 text-slate-400 hover:border-slate-900'}`}
                          >
                            Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: NARRATION */}
      {narrationModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0C0E] w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-white/5 space-y-6 animate-in zoom-in duration-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 border-b pb-4">Internal Audit Note</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-[10px] font-bold text-slate-600 uppercase italic">
                {narrationModal.transaction?.narration}
              </div>
              <textarea 
                className="w-full bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/10 rounded-xl p-4 text-[12px] font-bold uppercase focus:border-emerald-500 outline-none text-slate-700" 
                rows={4}
                value={narrationModal.text}
                onChange={(e) => setNarrationModal(prev => ({...prev, text: e.target.value}))}
                placeholder="Type note for Tally..."
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setNarrationModal({ open: false, transaction: null, text: "" })} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">Cancel</button>
              <button 
                onClick={async () => {
                   await handleUpdate(narrationModal.transaction._id, { customNarration: narrationModal.text });
                   setNarrationModal({ open: false, transaction: null, text: "" });
                }} 
                className="flex-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditStep;