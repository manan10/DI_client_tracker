import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Loader2, Landmark, Check, Trash2, RefreshCw, Briefcase, FileText, 
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';

const StatementReview = ({ onComplete }) => {
  const { request } = useApi();
  
  // Data & UI State
  const [arns, setArns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stagedData, setStagedData] = useState([]); 
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [activeArnId, setActiveArnId] = useState(null);
  const [activeTabs, setActiveTabs] = useState({}); 
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(null); 
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [checkedIds, setCheckedIds] = useState(() => {
    const saved = localStorage.getItem('tally_checked_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tally_checked_items', JSON.stringify(checkedIds));
  }, [checkedIds]);

  const initWorkbench = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const [arnRes, accRes, stagedRes] = await Promise.all([
        request('/arns'),
        request('/accounts'),
        request('/accounting/staged')
      ]);
      if (arnRes?.data) {
        setArns(arnRes.data);
        if (arnRes.data.length > 0) setActiveArnId(arnRes.data[0]._id);
      }
      if (accRes?.data) setAccounts(accRes.data);
      if (stagedRes?.success) {
        setStagedData(stagedRes.groups || []);
        if (stagedRes.groups.length > 0) setShowWorkbench(true);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, [request]);

  useEffect(() => { initWorkbench(); }, [initWorkbench]);

  const handleUpload = async (accountId, files) => {
    if (!files.length) return;
    setIsUploading(accountId);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('accountId', accountId);
    try {
      const res = await request('/accounting/upload-bulk', 'POST', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        const stagedUpdate = await request('/accounting/staged');
        setStagedData(stagedUpdate.groups || []);
        toast.success("BATCH SYNCHRONIZED");
      }
    } finally { setIsUploading(null); }
  };

  const handleDeleteAccountStream = async (accountId, accountName) => {
    if (!window.confirm(`Wipe ${accountName}?`)) return;
    try {
      const res = await request(`/accounting/staged/${accountId}`, 'DELETE');
      if (res.success) {
        setStagedData(prev => prev.filter(g => String(g.accountId) !== String(accountId)));
        toast.success("STREAM PURGED");
      }
    } catch { 
        toast.error("PURGE ERROR"); 
    }
  };

  const toggleCheck = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const finalizeBatch = async () => {
    setIsFinalizing(true);
    try {
      await request('/accounting/clear-staged', 'DELETE');
      setCheckedIds([]); 
      setStagedData([]);
      localStorage.removeItem('tally_checked_items');
      onComplete();
    } catch {
        toast.error("FINALIZE ERROR");
    } finally { 
        setIsFinalizing(false); 
    }
  };

  if (isInitialLoading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  const activeArn = arns.find(a => a._id === activeArnId);
  const totalCount = stagedData.reduce((acc, g) => acc + (g.transactions?.length || 0), 0);
  const isEverythingChecked = totalCount > 0 && checkedIds.length === totalCount;

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] dark:bg-[#08090A] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {!showWorkbench ? (
        <div className="max-w-xl mx-auto pt-40 px-6 animate-in fade-in slide-in-from-bottom-10">
            <div className="border-l-12 border-emerald-500 pl-10 space-y-6">
              <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">Core <br /> <span className="text-emerald-500">Registry</span></h1>
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Statement Auditing Environment</p>
            </div>
            <button onClick={() => setShowWorkbench(true)} className="mt-20 w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black uppercase text-sm tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">Open Workbench</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-80 bg-slate-50 dark:bg-[#0E1012] border-r border-slate-200 dark:border-white/5 shrink-0 z-40 overflow-x-auto lg:overflow-y-auto no-scrollbar">
             <div className="p-8 lg:p-10 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0E1012] sticky top-0 z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Entity Index</p>
             </div>
             <div className="flex lg:flex-col">
               {arns.map(arn => (
                 <button 
                  key={arn._id}
                  onClick={() => setActiveArnId(arn._id)}
                  className={`p-8 text-left transition-all relative flex flex-col gap-2 shrink-0 lg:shrink border-b border-slate-100 dark:border-white/5
                    ${activeArnId === arn._id 
                      ? 'bg-white dark:bg-[#1A1C24] border-l-10 border-l-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                      : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0 hover:bg-white dark:hover:bg-[#16191D] border-l-10 border-l-transparent'}`}
                 >
                   <span className={`text-sm font-black uppercase tracking-tighter transition-colors ${activeArnId === arn._id ? 'text-slate-950 dark:text-white' : 'text-slate-500'}`}>
                    {arn.arnCode}
                   </span>
                   <span className={`text-[10px] font-bold uppercase truncate italic transition-colors ${activeArnId === arn._id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {arn.nickname}
                   </span>
                 </button>
               ))}
             </div>
          </div>

          {/* MAIN STREAM */}
          <div className="flex-1 pb-48">
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#08090A]/80 backdrop-blur-xl border-b-2 border-slate-950 dark:border-emerald-500 px-8 md:px-16 py-6 flex justify-between items-center">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{activeArn?.nickname}</span>
                    <span className="text-2xl font-black uppercase tracking-tighter italic leading-none">{activeArn?.arnCode}</span>
                  </div>
               </div>
               <div className="hidden md:flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Batch Progress</span>
                  <span className="text-xl font-[1000] text-emerald-500 tabular-nums leading-none">{checkedIds.length} / {totalCount}</span>
               </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 md:p-16 space-y-32">
               {accounts.filter(acc => acc.arn === activeArn?.arnCode).map((acc) => {
                 const accStaged = stagedData.find(g => String(g.accountId) === String(acc._id));
                 const activeTab = activeTabs[acc._id] || 'RECEIPT';

                 return (
                   <div key={acc._id} className="relative">
                      {/* BANK FOLDER TAB */}
                      <div className="flex items-end mb-12">
                         <div className={`px-10 py-6 border-4 border-b-0 border-slate-950 dark:border-white flex flex-col gap-1 ${accStaged ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-[12px_12px_0_rgba(16,185,129,0.3)]' : 'bg-transparent text-slate-950 dark:text-white'}`}>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50">Ledger Profile</span>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{acc.name}</h3>
                         </div>
                         <div className="flex-1 h-1 bg-slate-950 dark:bg-white mb-0.5" />
                      </div>

                      <div className="pl-0 md:pl-20 space-y-12 relative">
                        {/* EMERALD TIMELINE SPINE */}
                        {accStaged && (
                          <div className="absolute left-6 md:left-10.75 top-35 bottom-0 w-0.75 bg-emerald-500/30 dark:bg-emerald-500/10 z-0 hidden sm:block" />
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-12 border-b border-slate-100 dark:border-white/5">
                           {!accStaged ? (
                             <label className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 border-4 border-slate-950 dark:border-white text-slate-950 dark:text-white font-black uppercase text-[11px] tracking-[0.4em] cursor-pointer hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 shadow-xl">
                                {isUploading === acc._id ? <Loader2 className="animate-spin size={18}" /> : <Upload size={18} />}
                                Import Registry .txt
                                <input type="file" className="hidden" onChange={(e) => handleUpload(acc._id, Array.from(e.target.files))} accept=".txt,.csv" />
                             </label>
                           ) : (
                             <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                                <button onClick={() => handleDeleteAccountStream(acc._id, acc.name)} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-all shadow-lg active:scale-95">
                                   <Trash2 size={16} /> Wipe Stream
                                </button>
                                <div className="flex-1 flex bg-slate-100 dark:bg-[#16191D] p-1.5 border-2 border-slate-200 dark:border-white/5">
                                   <button onClick={() => setActiveTabs(p => ({...p, [acc._id]: 'RECEIPT'}))} className={`flex-1 py-3 text-[11px] font-black uppercase transition-all ${activeTab === 'RECEIPT' ? 'bg-white dark:bg-[#08090A] text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>Receipts</button>
                                   <button onClick={() => setActiveTabs(p => ({...p, [acc._id]: 'PAYMENT'}))} className={`flex-1 py-3 text-[11px] font-black uppercase transition-all ${activeTab === 'PAYMENT' ? 'bg-white dark:bg-[#08090A] text-rose-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>Payments</button>
                                </div>
                             </div>
                           )}
                        </div>

                        {accStaged && (
                          <div className="space-y-24">
                             {Object.entries(accStaged.transactions.filter(t => t.type === activeTab).reduce((acc, curr) => {
                                  if (!acc[curr.date]) acc[curr.date] = [];
                                  acc[curr.date].push(curr);
                                  return acc;
                                }, {})).sort((a, b) => {
                                  const dateA = new Date(a[0].split('/').reverse().join('-'));
                                  const dateB = new Date(b[0].split('/').reverse().join('-'));
                                  return dateA - dateB;
                                }).map(([date, transactions]) => (
                               <div key={date} className="space-y-10">
                                  <div className="relative inline-flex items-center bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 px-8 py-3 shadow-[8px_8px_0_rgba(16,185,129,0.3)]">
                                     <span className="text-[12px] font-[1000] uppercase tracking-[0.4em] italic">{date}</span>
                                     <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rotate-45" />
                                  </div>

                                  <div className="divide-y-2 divide-slate-100 dark:divide-white/5 border-t-2 border-slate-100 dark:border-white/5">
                                     {transactions.map(t => {
                                       const isChecked = checkedIds.includes(t._id);
                                       return (
                                         <div key={t._id} className={`flex items-center gap-12 py-12 transition-all relative ${isChecked ? 'opacity-20 grayscale scale-[0.98]' : 'hover:bg-slate-50/40'}`}>
                                            <button onClick={() => toggleCheck(t._id)} className={`w-14 h-14 shrink-0 border-4 transition-all flex items-center justify-center relative z-20 active:scale-90 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white dark:bg-[#08090A] border-slate-200 dark:border-white/10 hover:border-emerald-500 text-transparent'}`}>
                                               <Check size={32} strokeWidth={5} />
                                            </button>
                                            <div className="flex-1 min-w-0">
                                               <p className={`text-xl font-black uppercase tracking-tight leading-none mb-3 ${isChecked ? 'italic' : 'text-slate-950 dark:text-white'}`}>{t.narration}</p>
                                               <div className="flex items-center gap-6 font-black text-[10px] uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 italic">
                                                  <span># {t.refNo}</span>
                                                  <span className={activeTab === 'RECEIPT' ? 'text-emerald-500' : 'text-rose-500'}>{t.category}</span>
                                               </div>
                                            </div>
                                            <div className="text-right">
                                               <p className={`text-4xl font-black tabular-nums tracking-tighter ${isChecked ? 'text-slate-200 dark:text-slate-800' : activeTab === 'RECEIPT' ? 'text-emerald-800 dark:text-emerald-500' : 'text-rose-800 dark:text-rose-500'}`}>
                                                  {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                               </p>
                                            </div>
                                         </div>
                                       );
                                     })}
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {stagedData.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#111218] border-t-4 border-slate-950 dark:border-emerald-500 px-8 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-12">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2 italic">Registry Integrity</span>
                    <span className="text-4xl font-black text-slate-950 dark:text-white tabular-nums leading-none">{checkedIds.length} <span className="text-slate-200">/</span> {totalCount}</span>
                </div>
                <div className="w-64 h-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.4)]" style={{ width: `${(checkedIds.length / totalCount) * 100}%` }} />
                </div>
            </div>
            <div className="flex items-center gap-8 w-full md:w-auto">
              <button onClick={() => setShowResetModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-rose-700 transition-all shadow-xl active:scale-95">
                <RefreshCw size={18} /> RESET BATCH
              </button>
              <button 
                onClick={finalizeBatch} 
                disabled={!isEverythingChecked || isFinalizing}
                className={`flex-1 md:flex-none px-20 py-8 font-black uppercase text-sm tracking-[0.5em] transition-all shadow-2xl ${isEverythingChecked ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-200 dark:text-slate-800 cursor-not-allowed'}`}
              >
                {isFinalizing ? <Loader2 className="animate-spin size={16}" /> : isEverythingChecked ? 'FINALIZE REGISTRY' : 'PENDING AUDIT'}
              </button>
            </div>
        </div>
      )}

      {/* SHARP MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-slate-950/20 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0E1012] w-full max-w-md p-14 border-8 border-slate-950 dark:border-emerald-500 shadow-[30px_30px_0_rgba(16,185,129,0.2)] text-center">
                <AlertCircle className="text-rose-600 mb-8 mx-auto" size={72} />
                <h4 className="text-3xl font-black uppercase tracking-tighter italic mb-12 dark:text-white">Destroy Session?</h4>
                <div className="flex flex-col gap-4">
                    <button onClick={finalizeBatch} className="w-full py-6 bg-rose-600 text-white font-black uppercase text-[12px] tracking-[0.4em] shadow-xl hover:bg-rose-700 active:scale-95 transition-all">PURGE ALL RECORDS</button>
                    <button onClick={() => setShowResetModal(false)} className="w-full py-6 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 font-black uppercase text-[12px] tracking-[0.3em] hover:bg-slate-100 transition-all">CANCEL</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StatementReview;