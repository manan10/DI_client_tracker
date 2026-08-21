import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  ArrowRight, 
  Loader2, 
  RefreshCcw, 
  BookUser, 
  Building2, 
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ARNSelectorStrip from './Commissions/ARNSelectorStrip';
import CommissionForm from './Commissions/CommissionForm';
import WorkspaceAnalytics from './Commissions/WorkspaceAnalytics'; 
import WorkspaceHistory from './Commissions/WorkspaceHistory'; 
import GlobalCommissionAggregator from './Commissions/GlobalCommissionAggregator'; 
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const availableYears = ["2024-25", "2025-26", "2026-27"];

const Commissions = () => {
  const { request, loading: apiLoading } = useApi();
  
  const [arns, setArns] = useState([]);
  const [stats, setStats] = useState({}); 
  const [globalData, setGlobalData] = useState(null);
  const [selectedARN, setSelectedARN] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // View Modes: 'overview' | 'workspaces'
  const [viewMode, setViewMode] = useState('overview');

  const getCurrentFYString = () => {
    const now = new Date();
    const month = now.getMonth(); 
    const year = now.getFullYear();
    const startYear = month <= 2 ? year - 1 : year;
    const endYearShort = (startYear + 1).toString().slice(-2);
    return `${startYear}-${endYearShort}`;
  };
  const [selectedFY, setSelectedFY] = useState(getCurrentFYString());

  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Stepper handlers for Fiscal Year
  const handlePrevYear = () => {
    const currentIndex = availableYears.indexOf(selectedFY);
    if (currentIndex > 0) {
      setSelectedFY(availableYears[currentIndex - 1]);
    }
  };

  const handleNextYear = () => {
    const currentIndex = availableYears.indexOf(selectedFY);
    if (currentIndex < availableYears.length - 1) {
      setSelectedFY(availableYears[currentIndex + 1]);
    }
  };

  const isFirstYear = availableYears.indexOf(selectedFY) === 0;
  const isLastYear = availableYears.indexOf(selectedFY) === availableYears.length - 1;

  const fetchMasterData = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);

    try {
      const [arnRes, summaryRes, globalRes] = await Promise.all([
        request('/arns'),
        request(`/commissions/dashboard-summary?fiscalYear=${selectedFY}`),
        request('/analytics/global-summary')
      ]);
      
      if (arnRes.success) {
        // Exclude dummy licenses completely
        const activeArns = (arnRes.data || []).filter(arn => {
          if (!arn) return false;
          if (arn.isDummy === true) return false;
          const code = String(arn.arnCode || '').toUpperCase();
          const nick = String(arn.nickname || '').toUpperCase();
          return !code.includes('DUMMY') && !nick.includes('DUMMY');
        });

        setArns(activeArns);
        if (!selectedARN && activeArns.length > 0) {
          setSelectedARN({
            id: activeArns[0]._id,
            name: activeArns[0].arnCode,
            nickname: activeArns[0].nickname
          });
        }
      }

      if (globalRes.success) setGlobalData(globalRes.data);
      
      if (summaryRes.success) {
        const statsMap = {};
        summaryRes.data.forEach(item => {
          statsMap[item._id] = {
            lastPayout: item.lastPayout,
            totalFY: item.totalFY,
            lastMonthName: item.lastMonthName 
          };
        });
        setStats(statsMap);
      }
    } catch (err) {
      console.error("Commission Sync Error:", err);
      toast.error("Failed to sync commission records");
    } finally {
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [request, selectedFY, selectedARN]);

  const handleSaveCommission = async (payload) => {
    try {
      const result = await request('/commissions/save', 'POST', payload);
      if (result.success) {
        toast.success(`Commissions saved for ${payload.accountingMonth}`);
        setIsFormOpen(false);
        fetchMasterData(true);
      }
    } catch {
      toast.error("Failed to save commission entries");
    }
  };

  useEffect(() => {
    fetchMasterData(true);
  }, [selectedFY, fetchMasterData]);

  if (isInitialLoad && apiLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-transparent">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading commission ledger...</p>
      </div>
    );
  }

  // Filtered active count for display
  const nonDummyArns = arns.filter(arn => {
    if (!arn) return false;
    if (arn.isDummy === true) return false;
    const code = String(arn.arnCode || '').toUpperCase();
    const nick = String(arn.nickname || '').toUpperCase();
    return !code.includes('DUMMY') && !nick.includes('DUMMY');
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              <Sparkles size={13} className="text-emerald-500" />
              Commission Hub
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[1000] uppercase tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent leading-none">
            Commissions & Payouts
          </h1>
          
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Reconcile mutual fund brokerage, inspect entity metrics, and log monthly entries.
          </p>
        </div>

        {/* Global Utility Controls (FY Stepper + Sync) */}
        <div className="flex items-center gap-4 self-start lg:self-auto shrink-0">
          {/* Fiscal Year Stepper Pill */}
          <div className="flex items-center bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-1.5 shadow-sm">
            <button
              onClick={handlePrevYear}
              disabled={isFirstYear || refreshing}
              className={`p-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer ${
                isFirstYear ? 'opacity-25 cursor-not-allowed' : 'active:scale-95'
              }`}
              title="Previous Fiscal Year"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2.5 px-4 py-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono select-none tracking-tight">
              <Calendar size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>FY {selectedFY}</span>
            </div>

            <button
              onClick={handleNextYear}
              disabled={isLastYear || refreshing}
              className={`p-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer ${
                isLastYear ? 'opacity-25 cursor-not-allowed' : 'active:scale-95'
              }`}
              title="Next Fiscal Year"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Sync Trigger Button */}
          <button 
            onClick={() => fetchMasterData(true)} 
            disabled={refreshing}
            className={`inline-flex items-center gap-2.5 px-5 py-3.5 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
              refreshing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
            }`}
            title="Refresh records from ledger"
          >
            <RefreshCcw size={16} className={refreshing ? 'animate-spin text-emerald-500' : 'text-slate-500 dark:text-slate-400'} />
            <span className="font-bold uppercase tracking-wider">{refreshing ? 'Syncing...' : 'Sync Feed'}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION STRIP */}
      <div className="w-full py-2 border-b-2 border-slate-200/80 dark:border-white/10">
        <nav className="flex items-center gap-10 -mb-0.5">
          <button
            onClick={() => setViewMode('overview')}
            className={`group flex items-center gap-3 pb-4 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative outline-none cursor-pointer ${
              viewMode === 'overview'
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers 
              size={18} 
              strokeWidth={viewMode === 'overview' ? 2.5 : 2} 
              className={viewMode === 'overview' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} 
            />
            <span>Firmwide Overview</span>
            {viewMode === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-in fade-in duration-200" />
            )}
          </button>

          <button
            onClick={() => setViewMode('workspaces')}
            className={`group flex items-center gap-3 pb-4 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative outline-none cursor-pointer ${
              viewMode === 'workspaces'
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Building2 
              size={18} 
              strokeWidth={viewMode === 'workspaces' ? 2.5 : 2} 
              className={viewMode === 'workspaces' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} 
            />
            <span>ARN Workspaces</span>
            {viewMode === 'workspaces' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-in fade-in duration-200" />
            )}
          </button>
        </nav>
      </div>

      {/* 3. DYNAMIC WORKSPACE STAGE */}
      <div className="w-full py-6">
        
        {/* MODE A: FIRMWIDE OVERVIEW */}
        {viewMode === 'overview' && (
          <section className="w-full animate-in fade-in duration-200">
            <GlobalCommissionAggregator 
              data={globalData} 
              loading={refreshing} 
              selectedFY={selectedFY} 
            />
          </section>
        )}

        {/* MODE B: ARN WORKSPACES */}
        {viewMode === 'workspaces' && (
          <section className="w-full space-y-8 animate-in fade-in duration-200">
            
            {/* ARN Selector Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select ARN Workspace ({nonDummyArns.length} Active)
                  </h2>
                </div>
                {selectedARN && (
                  <span className="text-xs sm:text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Active: {selectedARN.nickname || selectedARN.name}
                  </span>
                )}
              </div>

              <ARNSelectorStrip 
                arns={arns}
                stats={stats}
                selectedARN={selectedARN}
                onSelectARN={(clickedArn) => setSelectedARN(clickedArn)}
                selectedFY={selectedFY}
              />
            </div>

            {/* Seamless Natural Page Flow (Unboxed Layout) */}
            {selectedARN ? (
              <div className="w-full space-y-8 pt-2">
                
                {/* Active Entity Identity & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <BookUser size={22} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                          {selectedARN.nickname}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                          {selectedARN.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Performance analytics and monthly commission history for FY {selectedFY}
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Log Monthly Commission</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Performance Analytics Section */}
                <div className="w-full">
                  <WorkspaceAnalytics 
                    key={`analytics-${selectedARN.id}-${selectedFY}`} 
                    arnId={selectedARN.id} 
                    fiscalYear={selectedFY} 
                  />
                </div>

                {/* Section Separator */}
                <div className="w-full border-t border-slate-200/80 dark:border-white/10" />

                {/* History Ledger Section */}
                <div className="w-full">
                  <WorkspaceHistory 
                    key={`history-${selectedARN.id}-${selectedFY}`} 
                    arnId={selectedARN.id} 
                    fiscalYear={selectedFY} 
                  />
                </div>

              </div>
            ) : (
              /* Empty Selection State */
              <div className="p-12 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center">
                <LayoutDashboard className="mx-auto text-slate-400 mb-3" size={28} />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No ARN Selected</p>
                <p className="text-xs text-slate-400 mt-1">Please select an ARN tab above to inspect its metrics.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* 4. COMMISSION LOGGING MODAL FORM */}
      {selectedARN && (
        <CommissionForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          arnName={selectedARN.nickname}
          arnNickname={selectedARN.name}
          arnId={selectedARN.id}
          amcList={arns.find(a => a._id === selectedARN.id)?.allowedAmcs || []}
          onSave={handleSaveCommission}
          saving={apiLoading} 
        />
      )}
    </div>
  );
};

export default Commissions;