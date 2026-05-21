import React, { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutDashboard, ArrowRight, Loader2, RefreshCcw, BookUser } from 'lucide-react';
import ARNCommissionCard from './Commissions/ARNCommissionCard';
import CommissionForm from './Commissions/CommissionForm';
import WorkspaceAnalytics from './Commissions/WorkspaceAnalytics'; 
import WorkspaceHistory from './Commissions/WorkspaceHistory'; 
import GlobalCommissionAggregator from './Commissions/GlobalCommissionAggregator'; 
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const Commissions = () => {
  const { request, loading: apiLoading } = useApi();
  
  const [arns, setArns] = useState([]);
  const [stats, setStats] = useState({}); 
  const [globalData, setGlobalData] = useState(null);
  const [selectedARN, setSelectedARN] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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

  const fetchMasterData = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);

    try {
      const [arnRes, summaryRes, globalRes] = await Promise.all([
        request('/arns'),
        request(`/commissions/dashboard-summary?fiscalYear=${selectedFY}`),
        request('/analytics/global-summary')
      ]);
      
      if (arnRes.success) {
        const activeArns = arnRes.data.filter(arn => !arn?.isDummy);
        setArns(activeArns);
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
      console.error("Ledger Sync Error:", err);
      toast.error("Failed to sync financial data");
    } finally {
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [request, selectedFY]);

  const handleSaveCommission = async (payload) => {
    try {
      const result = await request('/commissions/save', 'POST', payload);
      if (result.success) {
        toast.success(`Records committed for ${payload.accountingMonth}`);
        setIsFormOpen(false);
        fetchMasterData(true);
      }
    } catch {
      toast.error("System failed to commit records");
    }
  };

  useEffect(() => {
    fetchMasterData(true);
  }, [selectedFY, fetchMasterData]);

  if (isInitialLoad && apiLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-2xl md:text-4xl font-[1000] text-slate-950 dark:text-white uppercase italic tracking-tighter">Commissions</h2>
          <p className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            Audit View: FY {selectedFY}
          </p>
        </div>
        <button 
          onClick={() => fetchMasterData(true)} 
          disabled={refreshing}
          className={`p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${refreshing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`}
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <section className="bg-slate-50/50 dark:bg-slate-950/20 p-4 md:p-6 rounded-2xl md:rounded-[3rem]">
         <GlobalCommissionAggregator 
            data={globalData} 
            loading={refreshing} 
            selectedFY={selectedFY} 
            setSelectedFY={setSelectedFY} 
         />
      </section>

      <div className="px-1 md:px-2">
        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 px-2">Workspace Selection</h4>
        {/* MOBILE: grid-cols-2 | DESKTOP: grid-cols-3/5 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
          {arns.map((arn) => (
            <ARNCommissionCard 
              key={arn._id} 
              arn={{
                id: arn._id,
                name: arn.arnCode,
                nickname: arn.nickname,
                lastPayout: stats[arn._id]?.lastPayout || 0,
                lastMonthName: stats[arn._id]?.lastMonthName || 'N/A', 
                totalFY: stats[arn._id]?.totalFY || 0
              }} 
              isActive={selectedARN?.id === arn._id}
              onClick={(clickedArn) => setSelectedARN(clickedArn)} 
            />
          ))}
        </div>
      </div>

      <div className="relative min-h-[50vh] transition-all duration-500">
        {selectedARN ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg rotate-3 shrink-0">
                  <BookUser size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-[1000] text-slate-950 dark:text-white uppercase italic tracking-tighter">
                    {selectedARN.nickname} <span className="text-emerald-500 ml-2">/ Workspace</span>
                  </h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedARN.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full md:w-auto group flex items-center justify-center gap-3 px-8 py-4 bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={18} strokeWidth={4} />
                Manage Commissions
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-12">
              <WorkspaceAnalytics arnId={selectedARN.id} fiscalYear={selectedFY} />
              <div className="border-t border-slate-100 dark:border-slate-800" />
              <WorkspaceHistory arnId={selectedARN.id} fiscalYear={selectedFY} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl p-10 h-64 flex flex-col items-center justify-center transition-all">
              <LayoutDashboard className="text-slate-300 mb-4" size={32} />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] text-center">
                Select an ARN to initiate the workspace
              </p>
          </div>
        )}
      </div>

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