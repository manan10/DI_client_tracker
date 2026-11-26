import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

import TabHeader from "../../../../shared/components/TabHeader";
import ARNSelectorStrip from "./Commissions/ARNSelectorStrip";
import CommissionForm from "./Commissions/CommissionForm";
import WorkspaceAnalytics from "./Commissions/WorkspaceAnalytics";
import WorkspaceHistory from "./Commissions/WorkspaceHistory";
import GlobalCommissionAggregator from "./Commissions/GlobalCommissionAggregator";
import AmcReconciliationTab from "./Commissions/AmcReconciliationTab";
import { useApi } from "../../../../shared/hooks/useApi";

const availableYears = ["2024-25", "2025-26", "2026-27"];

const Commissions = () => {
  const { request, loading: apiLoading } = useApi();

  const [arns, setArns] = useState([]);
  const [stats, setStats] = useState({});
  const [globalData, setGlobalData] = useState(null);
  const [selectedARN, setSelectedARN] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // View Modes: 'overview' | 'workspaces' | 'reconciliation'
  const [viewMode, setViewMode] = useState("overview");

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
  const isLastYear =
    availableYears.indexOf(selectedFY) === availableYears.length - 1;

  const fetchMasterData = useCallback(
    async (isSilent = false) => {
      if (isSilent) setRefreshing(true);

      try {
        const [arnRes, summaryRes, globalRes] = await Promise.all([
          request("/arns"),
          request(`/commissions/dashboard-summary?fiscalYear=${selectedFY}`),
          request("/analytics/global-summary"),
        ]);

        if (arnRes.success) {
          const activeArns = (arnRes.data || []).filter((arn) => {
            if (!arn) return false;
            if (arn.isDummy === true) return false;
            const code = String(arn.arnCode || "").toUpperCase();
            const nick = String(arn.nickname || "").toUpperCase();
            return !code.includes("DUMMY") && !nick.includes("DUMMY");
          });

          setArns(activeArns);
          if (!selectedARN && activeArns.length > 0) {
            setSelectedARN({
              id: activeArns[0]._id,
              name: activeArns[0].arnCode,
              nickname: activeArns[0].nickname,
            });
          }
        }

        if (globalRes.success) setGlobalData(globalRes.data);

        if (summaryRes.success) {
          const statsMap = {};
          summaryRes.data.forEach((item) => {
            statsMap[item._id] = {
              lastPayout: item.lastPayout,
              totalFY: item.totalFY,
              lastMonthName: item.lastMonthName,
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
    },
    [request, selectedFY, selectedARN]
  );

  const handleSaveCommission = async (payload) => {
    try {
      const result = await request("/commissions/save", "POST", payload);
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

  const nonDummyArns = useMemo(() => {
    return arns.filter((arn) => {
      if (!arn) return false;
      if (arn.isDummy === true) return false;
      const code = String(arn.arnCode || "").toUpperCase();
      const nick = String(arn.nickname || "").toUpperCase();
      return !code.includes("DUMMY") && !nick.includes("DUMMY");
    });
  }, [arns]);

  if (isInitialLoad && apiLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2
          className="animate-spin text-sky-600 dark:text-sky-400"
          size={26}
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Loading commission ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* 1. SUBORDINATE TAB HEADER WITH FISCAL YEAR & SYNC CONTROLS */}
      <TabHeader
        kicker="Trail & Brokerage Payouts"
        title="Commissions &"
        accent="Payouts"
        description="Track mutual fund brokerage, compare entity yields, and audit monthly payouts across AMCs."
        actions={
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Fiscal Year Stepper */}
            <div className="flex items-center bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={handlePrevYear}
                disabled={isFirstYear || refreshing}
                className={`p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2230] transition-colors cursor-pointer ${
                  isFirstYear ? "opacity-30 cursor-not-allowed" : ""
                }`}
                title="Previous Fiscal Year"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>

              <div className="flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono select-none">
                <Calendar
                  size={14}
                  className="text-sky-600 dark:text-sky-400"
                />
                <span>FY {selectedFY}</span>
              </div>

              <button
                type="button"
                onClick={handleNextYear}
                disabled={isLastYear || refreshing}
                className={`p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2230] transition-colors cursor-pointer ${
                  isLastYear ? "opacity-30 cursor-not-allowed" : ""
                }`}
                title="Next Fiscal Year"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Sync Button */}
            <button
              type="button"
              onClick={() => fetchMasterData(true)}
              disabled={refreshing}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                refreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
              title="Refresh commission records"
            >
              <RefreshCcw
                size={14}
                className={
                  refreshing
                    ? "animate-spin text-sky-500"
                    : "text-slate-500 dark:text-slate-400"
                }
              />
              <span>{refreshing ? "Syncing..." : "Sync Feed"}</span>
            </button>
          </div>
        }
      />

      {/* 2. SUB-VIEW TAB NAVIGATION STRIP */}
      <div className="w-full border-b border-slate-200 dark:border-slate-800/80">
        <nav className="flex items-center gap-7 -mb-px overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setViewMode("overview")}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors relative outline-none cursor-pointer whitespace-nowrap border-b-2 ${
              viewMode === "overview"
                ? "border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers size={16} />
            <span>Firmwide Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("workspaces")}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors relative outline-none cursor-pointer whitespace-nowrap border-b-2 ${
              viewMode === "workspaces"
                ? "border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 size={16} />
            <span>ARN Workspaces</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("reconciliation")}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors relative outline-none cursor-pointer whitespace-nowrap border-b-2 ${
              viewMode === "reconciliation"
                ? "border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Scale size={16} />
            <span>AMC Reconciliation</span>
          </button>
        </nav>
      </div>

      {/* 3. DYNAMIC WORKSPACE STAGE */}
      <div className="w-full">
        {/* MODE A: FIRMWIDE OVERVIEW */}
        {viewMode === "overview" && (
          <section className="w-full animate-in fade-in duration-200">
            <GlobalCommissionAggregator
              data={globalData}
              loading={refreshing}
              selectedFY={selectedFY}
            />
          </section>
        )}

        {/* MODE B: ARN WORKSPACES */}
        {viewMode === "workspaces" && (
          <section className="w-full space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <Building2
                    size={15}
                    className="text-sky-600 dark:text-sky-400"
                  />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Select ARN ({nonDummyArns.length} Active)
                  </h3>
                </div>
                {selectedARN && (
                  <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-300">
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

            {selectedARN ? (
              <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
                <div className="p-5 bg-slate-50/70 dark:bg-[#1C2230]/60 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <BookUser size={22} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-2.5">
                        <h3 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                          {selectedARN.nickname}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-white dark:bg-[#131720] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {selectedARN.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Performance summary and monthly payouts for FY{" "}
                        {selectedFY}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 active:scale-[0.99]"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Log Monthly Commission</span>
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  <WorkspaceAnalytics
                    key={`analytics-${selectedARN.id}-${selectedFY}`}
                    arnId={selectedARN.id}
                    fiscalYear={selectedFY}
                  />
                  <div className="border-t border-slate-200 dark:border-slate-800/80" />
                  <WorkspaceHistory
                    key={`history-${selectedARN.id}-${selectedFY}`}
                    arnId={selectedARN.id}
                    fiscalYear={selectedFY}
                  />
                </div>
              </div>
            ) : (
              <div className="p-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center bg-white dark:bg-[#161B26]">
                <LayoutDashboard
                  className="mx-auto text-slate-400 mb-2.5"
                  size={28}
                />
                <p className="sora-font text-sm font-bold text-slate-800 dark:text-slate-200">
                  No ARN Selected
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select an ARN card above to view its commission records.
                </p>
              </div>
            )}
          </section>
        )}

        {/* MODE C: AMC RECONCILIATION */}
        {viewMode === "reconciliation" && (
          <AmcReconciliationTab selectedFY={selectedFY} />
        )}
      </div>

      {/* 4. FORM MODAL */}
      {selectedARN && (
        <CommissionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          arnName={selectedARN.nickname}
          arnNickname={selectedARN.name}
          arnId={selectedARN.id}
          amcList={
            arns.find((a) => a._id === selectedARN.id)?.allowedAmcs || []
          }
          onSave={handleSaveCommission}
          saving={apiLoading}
        />
      )}
    </div>
  );
};

export default Commissions;