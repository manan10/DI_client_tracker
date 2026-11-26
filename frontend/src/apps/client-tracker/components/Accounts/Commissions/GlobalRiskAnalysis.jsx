import React from "react";
import {
  Layers3,
  Building2,
  CalendarDays,
  Info,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const THEME_COLORS = [
  "#0284c7", // sky-600
  "#0891b2", // cyan-600
  "#38bdf8", // sky-400
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#22d3ee", // cyan-400
  "#f59e0b", // amber-500
  "#0ea5e9", // sky-500
  "#14b8a6", // teal-500
  "#64748b", // slate-500
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
    const name = item.payload?.fullName || item.payload?.name || label;
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
          {item.payload?.share && (
            <span className="text-[10px] font-mono font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 px-1.5 py-0.5 rounded border border-sky-200/70 dark:border-sky-500/25">
              {item.payload.share}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const ChartHeader = ({ Icon, title, accent, subtitle, info, badgeText }) => (
  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
        <Icon size={15} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h4 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
          {title}
          {accent && (
            <span className="ml-1.5 font-normal text-sky-600 dark:text-sky-300">
              {accent}
            </span>
          )}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {badgeText && (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
          {badgeText}
        </span>
      )}
      <div className="group relative">
        <Info
          size={14}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help transition-colors"
        />
        <div className="absolute right-0 bottom-full mb-1.5 w-52 bg-slate-900 dark:bg-[#1C2230] text-slate-200 text-[11px] p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700 leading-snug">
          {info}
        </div>
      </div>
    </div>
  </div>
);

const GlobalRiskAnalysis = ({ data }) => {
  if (!data) return null;

  const {
    arnConcentration = [],
    seasonality = [],
    arnNicknameMap = {},
    amcConcentration = [],
  } = data;

  const totalArnVal = arnConcentration.reduce(
    (acc, curr) => acc + (curr.value || 0),
    0
  );
  const arnPieData = arnConcentration.map((arn, index) => {
    const rawName = arnNicknameMap[arn._id] || arn.nickname || "Unknown";
    const share =
      totalArnVal > 0 ? `${((arn.value / totalArnVal) * 100).toFixed(1)}%` : "0%";
    return {
      name: rawName,
      fullName: rawName,
      value: arn.value,
      share,
      color: THEME_COLORS[index % THEME_COLORS.length],
    };
  });

  const totalAmcVal = amcConcentration.reduce(
    (acc, curr) => acc + (curr.value || 0),
    0
  );
  const sortedAmcs = [...amcConcentration].sort(
    (a, b) => (b.value || 0) - (a.value || 0)
  );
  const maxAmcVal = sortedAmcs.length > 0 ? sortedAmcs[0].value || 1 : 1;

  const allAmcLollipops = sortedAmcs.map((amc, index) => {
    const raw = amc.name || "Other";
    const short = raw.replace(/Mutual Fund|MF|Asset Management/gi, "").trim();
    return {
      name: short,
      fullName: raw,
      value: amc.value || 0,
      share:
        totalAmcVal > 0 ? `${((amc.value / totalAmcVal) * 100).toFixed(1)}%` : "0%",
      color: THEME_COLORS[index % THEME_COLORS.length],
    };
  });

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ROW 1: ARN SHARE DONUT + MONTHLY TREND AREA CHART */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. ARN SHARE DONUT CHART */}
        <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col justify-between h-90 relative overflow-hidden">
          <ChartHeader
            Icon={Layers3}
            title="ARN"
            accent="Share"
            subtitle="Commission split across family ARNs"
            info="Share of total commission generated by each family ARN license."
            badgeText={`${arnPieData.length} ARNs`}
          />

          <div className="flex-1 min-h-0 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={arnPieData}
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {arnPieData.map((e, i) => (
                    <Cell key={`donut-cell-${i}`} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Total
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white">
                {formatINR(totalArnVal)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 max-h-20 overflow-y-auto no-scrollbar">
            {arnPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  {item.share}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. MONTHLY PAYOUT TREND */}
        <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col justify-between h-90">
          <ChartHeader
            Icon={CalendarDays}
            title="Monthly"
            accent="Trend"
            subtitle="Commission trend across months"
            info="Monthly payout progression across the selected fiscal year."
            badgeText="Trend"
          />

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={seasonality}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="skyGlobalAreaGradient"
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
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                  tickFormatter={(v) =>
                    [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ][parseInt(v, 10) - 1] || v
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<PremiumChartTooltip isCurrency={true} />} />
                <Area
                  type="monotone"
                  dataKey="avgRevenue"
                  stroke="#0284c7"
                  strokeWidth={2.25}
                  fill="url(#skyGlobalAreaGradient)"
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

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{seasonality.length} months recorded</span>
            <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-300">
              <TrendingUp size={12} /> Monthly Flow
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2: FULL-WIDTH TOP FUND HOUSES */}
      <div className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
        <ChartHeader
          Icon={Building2}
          title="Top Fund"
          accent="Houses"
          subtitle="Commission earned from each mutual fund house"
          info="Breakdown of total commission across all contributing mutual fund houses."
          badgeText={`${allAmcLollipops.length} AMCs`}
        />

        <div className="w-full h-48 flex items-end justify-between px-2 pt-6 pb-2 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {allAmcLollipops.map((item, idx) => {
            const heightPct = Math.max(
              Math.round(((item.value || 0) / maxAmcVal) * 100),
              12
            );
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer min-w-10 max-w-22.5"
                title={`${item.fullName}: ${formatINR(item.value)} (${item.share})`}
              >
                <span className="text-[9px] font-mono font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                  {item.share}
                </span>

                <div
                  className="flex flex-col items-center w-full relative"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-[#161B26] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-125 z-10"
                    style={{ backgroundColor: item.color }}
                  >
                    <CircleDot size={9} className="text-white" />
                  </div>

                  <div
                    className="w-0.5 flex-1 opacity-75 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: item.color }}
                  />
                </div>

                <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 mt-2 truncate w-full text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
            );
          })}

          {allAmcLollipops.length === 0 && (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
              No AMC records found for this year
            </div>
          )}
        </div>

        {/* Multi-Column AMC Directory */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {allAmcLollipops.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md bg-slate-50/70 dark:bg-[#131720] border border-slate-200/70 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate"
                    title={item.fullName}
                  >
                    {item.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                    {formatINR(item.value)}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    ({item.share})
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>
              Top AMC:{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {allAmcLollipops[0]?.fullName || "N/A"}
              </strong>
            </span>
            <span className="text-sky-600 dark:text-sky-300 font-semibold">
              {formatINR(allAmcLollipops[0]?.value)} (
              {allAmcLollipops[0]?.share})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRiskAnalysis;