import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, Loader2, Sparkles, Check, 
  Search, ChevronDown, X, Database, FileSpreadsheet, FolderTree, CheckSquare, MessageSquare, Save
} from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { toast } from 'sonner';

const parseDate = (dateStr) => {
  if (!dateStr) return 0;
  const parts = dateStr.split(/[-/ ]/);
  if (parts.length !== 3) return new Date(dateStr).getTime() || 0;
  const day = parseInt(parts[0], 10);
  const yearPart = parts[2];
  const year = yearPart.length === 2 ? 2000 + parseInt(yearPart, 10) : parseInt(yearPart, 10);
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const monthStr = parts[1].toLowerCase().substring(0, 3);
  const month = isNaN(parts[1]) ? monthNames.indexOf(monthStr) : parseInt(parts[1], 10) - 1;
  return new Date(year, month, day).getTime();
};

const AccountStream = ({ 
  account, accStaged, activeTab, setActiveTab, 
  handleUpload, isUploading, checkedIds, toggleCheck, hideChecked 
}) => {
  const { request } = useApi();
  const [masterLedgers, setMasterLedgers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localTransactions, setLocalTransactions] = useState(accStaged?.transactions || []);
  
  // MODAL STATE
  const [narrationModal, setNarrationModal] = useState({ open: false, transaction: null, text: "" });

  useEffect(() => {
    const fetchLedgers = async () => {
      const arnId = accStaged?.transactions?.[0]?.arnId || account?.arnId;
      if (!arnId) return;
      try {
        const res = await request(`/ledgers/arn/${arnId}`);
        if (res?.success) setMasterLedgers(res.data || []);
      } catch { console.error("Sync Error"); }
    };
    fetchLedgers();
  }, [account?.arnId, accStaged, request]);

  const handleLedgerUpdate = async (transactionId, newLedgerName) => {
    try {
      const res = await request(`/accounting/staged/${transactionId}`, 'PATCH', {
        suggestedLedger: newLedgerName, confidence: 1.0 
      });
      if (res.success) {
        setLocalTransactions(prev => prev.map(t => 
          t._id === transactionId ? { ...t, suggestedLedger: newLedgerName, confidence: 1.0 } : t
        ));
        toast.success("Ledger Synced");
        setEditingId(null);
      }
    } catch { toast.error("Update failed"); }
  };

  const saveCustomNarration = async () => {
    const { transaction, text } = narrationModal;
    try {
      const res = await request(`/accounting/staged/${transaction._id}`, 'PATCH', {
        customNarration: text
      });
      if (res.success) {
        setLocalTransactions(prev => prev.map(t => 
          t._id === transaction._id ? { ...t, customNarration: text } : t
        ));
        toast.success("Narration updated");
        setNarrationModal({ open: false, transaction: null, text: "" });
      }
    } catch { toast.error("Sync failed"); }
  };

  const displayTransactions = useMemo(() => {
    return localTransactions
      .filter(t => (t.type === activeTab) && (hideChecked ? !checkedIds.includes(t._id) : true))
      .sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [localTransactions, activeTab, hideChecked, checkedIds]);

  const groupedLedgers = useMemo(() => {
    const filtered = masterLedgers.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.group && l.group.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const groups = filtered.reduce((acc, ledger) => {
      const groupName = ledger.group || "UNGROUPED";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(ledger);
      return acc;
    }, {});
    return Object.keys(groups).sort().reduce((acc, key) => { acc[key] = groups[key]; return acc; }, {});
  }, [masterLedgers, searchQuery]);

  const isAllSelected = useMemo(() => {
    if (displayTransactions.length === 0) return false;
    return displayTransactions.every(t => checkedIds.includes(t._id));
  }, [displayTransactions, checkedIds]);

  const handleSelectAll = () => {
    const visibleIds = displayTransactions.map(t => t._id);
    if (isAllSelected) {
      visibleIds.forEach(id => toggleCheck(id));
    } else {
      visibleIds.forEach(id => {
        if (!checkedIds.includes(id)) toggleCheck(id);
      });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      {accStaged ? (
        <div className="bg-white dark:bg-[#0B0C0E] border-x border-b border-slate-200 dark:border-white/5 overflow-visible">
          
          <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/1">
            <button 
              onClick={() => setActiveTab('RECEIPT')} 
              className={`px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative
                ${activeTab === 'RECEIPT' ? 'text-emerald-600 bg-white dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Receipts
              {activeTab === 'RECEIPT' && <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-emerald-500" />}
            </button>
            <button 
              onClick={() => setActiveTab('PAYMENT')} 
              className={`px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative
                ${activeTab === 'PAYMENT' ? 'text-rose-600 bg-white dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Payments
              {activeTab === 'PAYMENT' && <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-rose-500" />}
            </button>
          </div>

          <table className="w-full text-left table-fixed border-collapse">
            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-50/80 dark:bg-white/3 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-8 py-5 w-24 text-center">
                  <button 
                    onClick={handleSelectAll}
                    className={`w-7 h-7 rounded-md border-2 flex items-center justify-center mx-auto transition-all duration-200
                      ${isAllSelected 
                        ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-md' 
                        : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-white/20 text-transparent hover:border-black dark:hover:border-white'}`}
                  >
                    <CheckSquare size={14} strokeWidth={3} className={isAllSelected ? 'opacity-100' : 'opacity-0'} />
                  </button>
                </th>
                <th className="px-6 py-5 w-44">Date</th>
                <th className="px-6 py-5">Particulars / Narration</th>
                <th className="px-6 py-5 w-112.5">Tally Ledger Mapping</th>
                <th className="px-10 py-5 text-right w-52">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {displayTransactions.map(t => {
                const isChecked = checkedIds.includes(t._id);
                const isEditing = editingId === t._id;
                const conf = Math.round((t.confidence || 0) * 100);
                const hasCustomNote = t.customNarration && t.customNarration.length > 0;

                return (
                  <tr key={t._id} className={`group transition-all ${isChecked ? 'bg-emerald-500/3 opacity-60' : 'hover:bg-slate-50/50 dark:hover:bg-white/1'}`}>
                    <td className="px-8 py-6 text-center" onClick={() => toggleCheck(t._id)}>
                      <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center mx-auto cursor-pointer transition-all duration-300 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-white/20 text-transparent group-hover:border-emerald-500'}`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[13px] font-black tabular-nums tracking-tight px-3 py-1.5 rounded-md border ${isChecked ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200'}`}>
                        {t.date}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                         <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 uppercase leading-snug wrap-break-word">{t.narration}</p>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-medium tabular-nums">REF: {t.refNo || "N/A"}</span>
                            <button 
                               onClick={() => setNarrationModal({ open: true, transaction: t, text: t.customNarration || "" })}
                               className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${hasCustomNote ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500'}`}
                            >
                               <MessageSquare size={10} strokeWidth={3} />
                               <span className="text-[8px] font-black uppercase tracking-widest">{hasCustomNote ? 'Tally Note Active' : 'Add Tally Note'}</span>
                            </button>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 relative">
                      {isEditing ? (
                        <div className="absolute inset-x-4 top-2 z-50 bg-white dark:bg-[#111214] border-2 border-emerald-500 rounded-lg shadow-2xl p-0 animate-in zoom-in-95 min-w-100">
                          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5">
                            <Search size={18} className="text-slate-400" />
                            <input autoFocus placeholder="SEARCH LEDGER..." className="w-full bg-transparent border-none text-[13px] font-black focus:ring-0 uppercase outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <X size={20} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => setEditingId(null)} />
                          </div>
                          <div className="max-h-80 overflow-y-auto no-scrollbar">
                            {Object.entries(groupedLedgers).map(([groupName, ledgers]) => (
                              <div key={groupName}>
                                <div className="sticky top-0 bg-slate-50 dark:bg-zinc-900 px-4 py-2 flex items-center gap-2 z-10 border-y border-slate-100 dark:border-white/5">
                                  <FolderTree size={12} className="text-emerald-500" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">{groupName}</span>
                                </div>
                                {ledgers.map(l => (
                                  <div key={l._id} onClick={() => handleLedgerUpdate(t._id, l.name)} className="px-8 py-3.5 hover:bg-emerald-600 hover:text-white text-[12px] font-black uppercase tracking-widest cursor-pointer border-b last:border-b-0 border-slate-50 dark:border-white/5">
                                    {l.name}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => { setEditingId(t._id); setSearchQuery(""); }} className="flex items-center justify-between gap-4 px-4 py-3 min-h-14 rounded-lg border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-[12px] font-black uppercase tracking-[0.05em] cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <Sparkles size={14} className={`shrink-0 ${conf > 80 ? "text-emerald-500" : "text-amber-500"}`} />
                            <span className="leading-snug">{t.suggestedLedger || "REVIEW REQUIRED"}</span>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-slate-200/50">
                            <span className={`font-black ${conf > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{conf}%</span>
                            <ChevronDown size={14} className="text-slate-400" />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <p className={`text-[15px] font-black tabular-nums tracking-tight ${activeTab === 'RECEIPT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* UPLOAD CONSOLE ... remains same as your original version */
        <div className="p-12 md:p-24 flex justify-center items-center w-full min-h-150">
           {/* ... Upload logic ... */}
           <div className="text-center max-w-sm">
               <h4 className="text-[13px] font-black uppercase tracking-[0.4em] mb-3 leading-tight text-slate-900 dark:text-white">Awaiting Registry Data</h4>
               <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-10 opacity-70">Upload the {account.name} statement to begin the audit.</p>
               <label className="bg-slate-950 dark:bg-white text-white dark:text-black px-10 py-5 rounded-xl cursor-pointer font-black uppercase text-[11px] tracking-widest shadow-xl block">
                  Initialize Import
                  <input type="file" className="hidden" onChange={(e) => handleUpload(account._id, Array.from(e.target.files))} />
               </label>
           </div>
        </div>
      )}

      {/* NARRATION MODAL */}
      {narrationModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40">
          <div className="bg-white dark:bg-[#0B0C0E] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/1">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <MessageSquare size={16} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Internal Tally Narration</h3>
              </div>
              <button onClick={() => setNarrationModal({ open: false, transaction: null, text: "" })} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Description</p>
                 <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 italic">{narrationModal.transaction?.narration}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Tally Note</p>
                <textarea 
                  autoFocus
                  rows={4}
                  className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/10 rounded-xl p-4 text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300"
                  placeholder="ENTER DETAILED NARRATION FOR TALLY..."
                  value={narrationModal.text}
                  onChange={(e) => setNarrationModal(prev => ({ ...prev, text: e.target.value }))}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-white/1 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
               <button 
                  onClick={() => setNarrationModal({ open: false, transaction: null, text: "" })}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
               >
                  Cancel
               </button>
               <button 
                  onClick={saveCustomNarration}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
               >
                  <Save size={14} />
                  Update Narration
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStream;