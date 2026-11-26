import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Trophy,
  Calendar,
  Zap,
  Loader2,
  AlertCircle,
  CircleDot,
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";

const THEME_COLORS = [
  "#0284c7", // sky-600
  "#0891b2", // cyan-600
  "#38bdf8", // sky-400
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#22d3ee", // cyan-400
  "#0ea5e9", // sky-500
  "#14b8a6", // teal-500
];

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(val || 0);
};

const PremiumChartTooltip = ({ active, payload, label, isCurrency = true }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const displayVal = isCurrency ? formatINR(item.value) : item.value;
    const name =
      item.payload?.fullName ||
      item.payload?.name ||
      item.payload?.month ||
      label;
    const color = item.payload?.color || item.fill || item.color || "#0284c7";

    return (
      <div className="bg-white/95 dark:bg-[#1C2230]/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-lg space-y-1 z-50 min-w-35">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <p className="font-semibold text-slate-700 dark:text-slate-200 font-mono text-[10px] uppercase tracking-wider truncate">
            {name}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <span className="font-bold font-mono text-slate-900 dark:text-white text-xs sm:text-sm">
            {displayVal}
          </span>
          {item.payload?.percentage && (
            <span className="text-[10px] font-mono font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 px-1.5 py-0.5 rounded border border-sky-200/70 dark:border-sky-500/25">
              {item.payload.percentage}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const WorkspaceAnalytics = ({ arnId, fiscalYear }) => {
  const [data, setData] = useState(null);
  const { request, loading: apiLoading } = useApi();
  const [isSyncing, setIsSyncing] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!arnId) return;
    setIsSyncing(true);
    try {
      const json = await request(
        `/commissions/workspace-analytics/${arnId}?fiscalYear=${fiscalYear}`,
      );
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Analytics Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [arnId, fiscalYear, request]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if ((isSyncing || apiLoading) && !data) {
    return (
      <div className="h-56 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-[#131720] rounded-lg border border-slate-200 dark:border-slate-800">
        <Loader2
          className="animate-spin text-sky-600 dark:text-sky-400"
          size={22}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading workspace analytics...
        </p>
      </div>
    );
  }

  if (!data || !data.amcBreakdown || data.amcBreakdown.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-[#131720] rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
        <AlertCircle size={20} className="text-slate-400" />
        <p className="sora-font text-xs font-bold text-slate-700 dark:text-slate-200">
          No Data Recorded for FY {fiscalYear}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Log monthly commissions in this workspace to view trends and AMC breakdown.
        </span>
      </div>
    );
  }

  const allTimeTotal = data?.stats?.allTimeTotal || 0;
  const sortedAmcs = (data?.amcBreakdown || [])
    .filter((amc) => (amc.value || 0) > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const maxAmcVal = sortedAmcs.length > 0 ? sortedAmcs[0].value || 1 : 1;

  const amcStemData = sortedAmcs.map((amc, idx) => {
    const raw = amc._id || "Other";
    const short = raw.replace(/Mutual Fund|MF|Asset Management/gi, "").trim();
    return {
      name: short,
      fullName: raw,
      value: amc.value || 0,
      percentage:
        allTimeTotal > 0
          ? `${(((amc.value || 0) / allTimeTotal) * 100).toFixed(1)}%`
          : "0%",
      color: THEME_COLORS[idx % THEME_COLORS.length],
    };
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200/90 dark:border-slate-800 p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Monthly Average
            </span>
            <p className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(data.stats.avgMonthly)}
            </p>
            <span className="text-xs text-sky-600 dark:text-sky-300 font-medium">
              Average per logged month
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Calendar size={17} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200/90 dark:border-slate-800 p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              FY {fiscalYear} Total
            </span>
            <p className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(data.stats.allTimeTotal)}
            </p>
            <span className="text-xs text-cyan-600 dark:text-cyan-300 font-medium">
              Total commission earned
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/70 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Trophy size={17} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200/90 dark:border-slate-800 p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Logged Months
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {data.stats.monthCount || 0}
              </span>
              <span className="text-xs font-medium text-slate-400 font-mono">
                / 12 months
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Recorded cycles
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Zap size={17} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* 2. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: MONTHLY PAYOUT TREND */}
        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200/90 dark:border-slate-800 p-5 rounded-lg flex flex-col justify-between h-88">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <TrendingUp size={15} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Monthly{" "}
                  <span className="font-normal text-sky-600 dark:text-sky-300">
                    Payouts
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Monthly trend for FY {fiscalYear}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 uppercase">
              Trend
            </span>
          </div>

          <div className="flex-1 min-h-0 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="skyWorkspaceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148, 163, 184, 0.14)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0284c7"
                  strokeWidth={2.25}
                  fill="url(#skyWorkspaceGradient)"
                  activeDot={{
                    r: 4.5,
                    stroke: "#0284c7",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{(data.trend || []).length} months logged</span>
            <span className="font-bold text-sky-600 dark:text-sky-300">
              Total: {formatINR(data.stats.allTimeTotal)}
            </span>
          </div>
        </div>

        {/* CHART 2: AMC SHARE */}
        <div className="bg-slate-50/70 dark:bg-[#131720] border border-slate-200/90 dark:border-slate-800 p-5 rounded-lg flex flex-col justify-between h-88">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/70 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <BarChart3 size={15} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  AMC{" "}
                  <span className="font-normal text-sky-600 dark:text-sky-300">
                    Share
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Commission split by fund house
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-500/20 uppercase">
              {amcStemData.length} AMCs
            </span>
          </div>

          {/* Stem Visual Track */}
          <div className="flex-1 min-h-0 w-full overflow-x-auto no-scrollbar flex items-end justify-between px-2 pt-5 pb-1 gap-2.5">
            {amcStemData.map((item, idx) => {
              const heightPct = Math.max(
                Math.round(((item.value || 0) / maxAmcVal) * 100),
                14,
              );
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer shrink-0 min-w-9 max-w-17.5"
                  title={`${item.fullName}: ${formatINR(item.value)} (${item.percentage})`}
                >
                  <span className="text-[9px] font-mono font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                    {item.percentage}
                  </span>

                  <div
                    className="flex flex-col items-center w-full relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#131720] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-125 z-10"
                      style={{ backgroundColor: item.color }}
                    >
                      <CircleDot size={7} className="text-white" />
                    </div>

                    <div
                      className="w-0.5 flex-1 opacity-75 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>

                  <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multi-Column AMC Legend */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-20 overflow-y-auto no-scrollbar">
            {amcStemData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate"
                    title={item.fullName}
                  >
                    {item.fullName}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  {item.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceAnalytics;