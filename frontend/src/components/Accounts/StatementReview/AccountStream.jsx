import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, Loader2, Sparkles, Check, 
  Search, ChevronDown, X, Database, FileSpreadsheet, FolderTree, CheckSquare
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
        toast.success("Sync successful");
        setEditingId(null);
      }
    } catch { toast.error("Update failed"); }
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

    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {});
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

          <table className="w-full text-left table-fixed border-collapse overflow-visible">
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
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 overflow-visible">
              {displayTransactions.map(t => {
                const isChecked = checkedIds.includes(t._id);
                const isEditing = editingId === t._id;
                const conf = Math.round((t.confidence || 0) * 100);

                return (
                  <tr key={t._id} className={`group transition-all overflow-visible ${isChecked ? 'bg-emerald-500/3 opacity-60' : 'hover:bg-slate-50/50 dark:hover:bg-white/1'}`}>
                    <td className="px-8 py-6 text-center" onClick={() => toggleCheck(t._id)}>
                      <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center mx-auto cursor-pointer transition-all duration-300 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white rotate-360 scale-110 shadow-lg shadow-emerald-600/20' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-white/20 text-transparent group-hover:border-emerald-500'}`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[13px] font-black tabular-nums tracking-tight px-3 py-1.5 rounded-md border ${isChecked ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200'}`}>
                        {t.date}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 uppercase leading-snug wrap-break-word">{t.narration}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REF:</span>
                        <span className="text-[10px] text-slate-500 font-medium tabular-nums">{t.refNo || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 relative overflow-visible">
                      {isEditing ? (
                        <div className="absolute inset-x-4 top-2 z-100 bg-white dark:bg-[#111214] border-2 border-emerald-500 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-0 animate-in zoom-in-95 min-w-100">
                          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5">
                            <Search size={18} className="text-slate-400" />
                            <input autoFocus placeholder="SEARCH LEDGER OR GROUP..." className="w-full bg-transparent border-none text-[13px] font-black focus:ring-0 uppercase outline-none h-10 tracking-widest" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <X size={20} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => setEditingId(null)} />
                          </div>
                          <div className="max-h-80 overflow-y-auto no-scrollbar scroll-smooth">
                            {Object.entries(groupedLedgers).map(([groupName, ledgers]) => (
                              <div key={groupName} className="border-b last:border-b-0 border-slate-50 dark:border-white/5">
                                <div className="sticky top-0 bg-slate-50 dark:bg-zinc-900 px-4 py-2 flex items-center gap-2 z-10 border-y border-slate-100 dark:border-white/5">
                                  <FolderTree size={12} className="text-emerald-500" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">{groupName}</span>
                                </div>
                                {ledgers.map(l => (
                                  <div 
                                    key={l._id} 
                                    onClick={() => handleLedgerUpdate(t._id, l.name)} 
                                    className="px-8 py-3.5 hover:bg-emerald-600 hover:text-white text-[12px] font-black uppercase tracking-widest cursor-pointer transition-all border-b last:border-b-0 border-slate-50 dark:border-white/5 leading-snug wrap-break-word"
                                  >
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
                            <span className="leading-snug wrap-break-word">{t.suggestedLedger || "REVIEW REQUIRED"}</span>
                          </div>
                          {/* Restored Confidence Score Badge */}
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
        /* COMPACT CENTERED UPLOAD CONSOLE */
        <div className="p-12 md:p-24 flex justify-center items-center w-full min-h-150">
          <div className="relative group w-full max-w-4xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] bg-white dark:bg-[#08090A] transition-all duration-500 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-emerald-500/2 shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />
            <div className="relative flex flex-col items-center justify-center py-20 px-10">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-125 animate-pulse" />
                <div className="relative flex items-center justify-center">
                  <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    {isUploading ? (
                      <Loader2 size={48} className="text-emerald-500 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Database size={48} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    )}
                  </div>
                  {!isUploading && (
                    <div className="absolute -top-3 -right-3 p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/40 transition-transform duration-500 group-hover:rotate-12">
                       <FileSpreadsheet size={18} />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center max-w-sm">
                <h4 className="text-[13px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mb-3 leading-tight">
                  {isUploading ? "Synchronizing Streams" : "Awaiting Registry Data"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-widest opacity-70 mb-10">
                  {isUploading 
                    ? "Our engine is currently parsing your bank statement..." 
                    : `Upload the ${account.name} statement to begin the audit.`}
                </p>
              </div>
              <div className="w-full max-w-70">
                <label className={`relative flex items-center justify-center gap-4 py-5 rounded-xl cursor-pointer transition-all duration-300 shadow-xl active:scale-95 overflow-hidden
                  ${isUploading 
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-950 dark:bg-white text-white dark:text-black hover:shadow-emerald-500/20'}`}>
                  {isUploading && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />}
                  {!isUploading && <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />}
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                    {isUploading ? "Syncing..." : "Initialize Import"}
                  </span>
                  <input type="file" className="hidden" disabled={isUploading} onChange={(e) => handleUpload(account._id, Array.from(e.target.files))} />
                </label>
                <div className="mt-6 flex items-center justify-center gap-3 opacity-30">
                  <div className="h-px w-10 bg-slate-300 dark:bg-white/10" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Tally Integrated</span>
                  <div className="h-px w-10 bg-slate-300 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStream;