import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Loader2, Landmark } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { exportToTallyExcel } from '../../utils/tallyExport'; // NEW IMPORT

import LandingView from './StatementReview/LandingView';
import Sidebar from './StatementReview/Sidebar';
import WorkbenchHeader from './StatementReview/WorkbenchHeader';
import AccountStream from './StatementReview/AccountStream';
import CommandBar from './StatementReview/CommandBar';
import ResetModal from './StatementReview/ResetModal';

const StatementReview = ({ onComplete }) => {
  const { request } = useApi();
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
  const [hideChecked, setHideChecked] = useState(false);

  const [checkedIds, setCheckedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_checked_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('tally_checked_items', JSON.stringify(checkedIds));
  }, [checkedIds]);

  const initWorkbench = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const [arnRes, accRes, stagedRes] = await Promise.all([
        request('/arns'), request('/accounts'), request('/accounting/staged')
      ]);
      setArns(arnRes?.data || []);
      setAccounts(accRes?.data || []);
      const staged = stagedRes?.groups || [];
      setStagedData(staged);
      if (arnRes?.data?.length > 0) setActiveArnId(arnRes.data[0]._id);
      if (staged.length > 0) setShowWorkbench(true);
    } catch { toast.error("Initialization failed"); } finally { setIsInitialLoading(false); }
  }, [request]);

  useEffect(() => { initWorkbench(); }, [initWorkbench]);

  useEffect(() => {
    if (activeArnId && accounts.length > 0) {
      const activeArnCode = arns.find(a => a._id === activeArnId)?.arnCode;
      const arnAccounts = accounts.filter(acc => acc.arn === activeArnCode);
      if (arnAccounts.length > 0 && !activeTabs[activeArnId]) {
        setActiveTabs(prev => ({ ...prev, [activeArnId]: arnAccounts[0]._id }));
      }
    }
  }, [activeArnId, accounts, arns, activeTabs]);

  const handleUpload = async (accountId, files) => {
    if (!files?.length) return;
    setIsUploading(accountId);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('accountId', accountId);
    try {
      const res = await request('/accounting/upload-bulk', 'POST', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.success) {
        const stagedUpdate = await request('/accounting/staged');
        setStagedData(stagedUpdate?.groups || []);
        setShowWorkbench(true);
        toast.success("Sync complete");
      }
    } catch { toast.error("Upload failed"); } finally { setIsUploading(null); }
  };

  const finalizeBatch = async () => {
    setIsFinalizing(true);
    try {
      // 1. Trigger Excel Download
      const success = exportToTallyExcel(stagedData, checkedIds, accounts);
      
      if (!success) {
        toast.error("Nothing to export. Check items first.");
        return;
      }

      // 2. Clear server-side staging
      await request('/accounting/clear-staged', 'DELETE');
      
      // 3. Clear local state
      setCheckedIds([]); 
      setStagedData([]);
      localStorage.removeItem('tally_checked_items');
      setShowWorkbench(false);
      
      if (onComplete) onComplete();
      toast.success("Excel generated & Batch cleared");
    } catch { 
      toast.error("Process error"); 
    } finally { 
      setIsFinalizing(false); 
      setShowResetModal(false); 
    }
  };

  const auditStats = useMemo(() => {
    if (!Array.isArray(stagedData)) return { totalTx: 0, pendingAccounts: 0, pendingArns: 0 };
    const totalTx = stagedData.reduce((acc, g) => acc + (g.transactions?.length || 0), 0);
    const accountsWithPending = stagedData.filter(group => group.transactions.some(t => !checkedIds.includes(t._id))).length;
    const pendingArnIds = new Set(stagedData.filter(group => group.transactions.some(t => !checkedIds.includes(t._id))).map(group => group.transactions[0]?.arnId).filter(Boolean));
    return { totalTx, pendingAccounts: accountsWithPending, pendingArns: pendingArnIds.size };
  }, [stagedData, checkedIds]);

  const activeArn = useMemo(() => arns.find(a => a._id === activeArnId), [arns, activeArnId]);
  const progressPercent = auditStats.totalTx > 0 ? Math.round((checkedIds.length / auditStats.totalTx) * 100) : 0;
  const currentArnAccounts = accounts.filter(acc => acc.arn === activeArn?.arnCode);

  if (isInitialLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#050607]">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Registry</span>
    </div>
  );

  if (!showWorkbench) return <LandingView onLaunch={() => setShowWorkbench(true)} />;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#050607] text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/20">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar arns={arns} activeArnId={activeArnId} setActiveArnId={setActiveArnId} />

        <main className="flex-1 flex flex-col relative pb-40 border-l border-slate-200 dark:border-white/5">
          <WorkbenchHeader 
            activeArn={activeArn} 
            checkedCount={checkedIds.length}
            totalCount={auditStats.totalTx}
            progressPercent={progressPercent}
            hideChecked={hideChecked}
            setHideChecked={setHideChecked}
          />

          <div className="sticky top-0 z-30 flex items-center bg-white/80 dark:bg-[#050607]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
            {currentArnAccounts.map((acc) => {
              const isActive = activeTabs[activeArnId] === acc._id;
              const isStaged = stagedData.some(g => String(g.accountId) === String(acc._id));
              
              return (
                <button
                  key={acc._id}
                  onClick={() => setActiveTabs(p => ({ ...p, [activeArnId]: acc._id }))}
                  className={`px-10 py-5 text-[11px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-3
                    ${isActive ? 'text-black dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Landmark size={14} className={isActive ? 'text-emerald-500' : 'text-slate-300'} />
                  {acc.name}
                  {isStaged && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            {currentArnAccounts
              .filter(acc => acc._id === activeTabs[activeArnId])
              .map((acc) => {
                const accStaged = stagedData.find(g => String(g.accountId) === String(acc._id));
                return (
                  <AccountStream 
                    key={`${acc._id}-${accStaged?.transactions?.length || 0}`}
                    account={acc}
                    accStaged={accStaged}
                    activeTab={activeTabs[`${acc._id}_type`] || 'RECEIPT'}
                    setActiveTab={(tab) => setActiveTabs(p => ({...p, [`${acc._id}_type`]: tab}))}
                    handleUpload={handleUpload}
                    isUploading={isUploading === acc._id}
                    checkedIds={checkedIds}
                    toggleCheck={(id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])}
                    hideChecked={hideChecked}
                  />
                );
            })}
          </div>
        </main>
      </div>

      <CommandBar 
        visible={stagedData.length > 0}
        checkedCount={checkedIds.length}
        totalCount={auditStats.totalTx}
        pendingAccounts={auditStats.pendingAccounts}
        pendingArns={auditStats.pendingArns}
        progressPercent={progressPercent}
        onReset={() => setShowResetModal(true)}
        onFinalize={finalizeBatch}
        isFinalizing={isFinalizing}
      />

      {showResetModal && <ResetModal onCancel={() => setShowResetModal(false)} onConfirm={finalizeBatch} />}
    </div>
  );
};

export default StatementReview;