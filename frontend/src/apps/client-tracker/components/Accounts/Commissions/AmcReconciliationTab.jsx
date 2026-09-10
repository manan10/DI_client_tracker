import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  ChevronDown,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Layers,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../../../shared/hooks/useApi";

// Vibrant, distinct FinTech theme tags for entity sub-rows
const ENTITY_THEMES = [
  {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  {
    badge: "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
    dot: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
  },
  {
    badge: "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    dot: "bg-cyan-500",
    text: "text-cyan-700 dark:text-cyan-400",
  },
  {
    badge: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  {
    badge: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    dot: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-400",
  },
  {
    badge: "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400",
  },
];

const formatINR = (val) => {
  if (!val || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatSignedINR = (val) => {
  if (!val || isNaN(val)) return "₹0";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(val));
  return val > 0 ? `+${formatted}` : `-${formatted}`;
};

const AmcReconciliationTab = ({ selectedFY }) => {
  const { request } = useApi();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedAmcs, setExpandedAmcs] = useState({});

  // 12 Fiscal Months (Apr -> Mar)
  const fiscalMonths = useMemo(() => {
    const [startYearStr, endYearShort] = selectedFY.split("-");
    const startYear = parseInt(startYearStr, 10);
    const endYear = 2000 + parseInt(endYearShort, 10);

    return [
      { key: `${startYear}-04`, short: "Apr" },
      { key: `${startYear}-05`, short: "May" },
      { key: `${startYear}-06`, short: "Jun" },
      { key: `${startYear}-07`, short: "Jul" },
      { key: `${startYear}-08`, short: "Aug" },
      { key: `${startYear}-09`, short: "Sep" },
      { key: `${startYear}-10`, short: "Oct" },
      { key: `${startYear}-11`, short: "Nov" },
      { key: `${startYear}-12`, short: "Dec" },
      { key: `${endYear}-01`, short: "Jan" },
      { key: `${endYear}-02`, short: "Feb" },
      { key: `${endYear}-03`, short: "Mar" },
    ];
  }, [selectedFY]);

  const toggleExpand = (amcName) => {
    setExpandedAmcs((prev) => ({
      ...prev,
      [amcName]: !prev[amcName],
    }));
  };

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request(
        `/commissions/reconciliation-matrix?fiscalYear=${selectedFY}`
      );
      if (res.success) {
        setRawData(res.data || []);
      }
    } catch (err) {
      console.error("AMC Reconciliation Fetch Error:", err);
      toast.error("Failed to load AMC reconciliation table");
    } finally {
      setLoading(false);
    }
  }, [request, selectedFY]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Aggregate master and per-ARN figures
  const { rows, monthTotals, grandTotal } = useMemo(() => {
    const monthTotalsMap = {};
    fiscalMonths.forEach((m) => {
      monthTotalsMap[m.key] = 0;
    });

    let mappedRows = rawData.map((item) => {
      const amcName = item._id || "Other";
      const monthlyLookup = {};
      const arnSubRowsMap = {};

      fiscalMonths.forEach((m) => {
        monthlyLookup[m.key] = 0;
      });

      (item.monthlyData || []).forEach((mItem) => {
        if (monthlyLookup[mItem.month] !== undefined) {
          monthlyLookup[mItem.month] = mItem.amount || 0;
          monthTotalsMap[mItem.month] =
            (monthTotalsMap[mItem.month] || 0) + (mItem.amount || 0);

          (mItem.arnBreakdown || []).forEach((arnSplit) => {
            const id = arnSplit.arnId;
            if (!arnSubRowsMap[id]) {
              arnSubRowsMap[id] = {
                arnId: id,
                arnCode: arnSplit.arnCode,
                arnNickname: arnSplit.arnNickname,
                byMonth: {},
                total: 0,
              };
              fiscalMonths.forEach((m) => {
                arnSubRowsMap[id].byMonth[m.key] = 0;
              });
            }
            arnSubRowsMap[id].byMonth[mItem.month] = arnSplit.amount;
            arnSubRowsMap[id].total += arnSplit.amount;
          });
        }
      });

      return {
        name: amcName,
        byMonth: monthlyLookup,
        total: item.fyTotal || 0,
        arnSubRows: Object.values(arnSubRowsMap),
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      mappedRows = mappedRows.filter((r) => r.name.toLowerCase().includes(q));
    }

    mappedRows.sort((a, b) => a.name.localeCompare(b.name));
    const totalAll = Object.values(monthTotalsMap).reduce((s, v) => s + v, 0);

    return { rows: mappedRows, monthTotals: monthTotalsMap, grandTotal: totalAll };
  }, [rawData, fiscalMonths, search]);

  return (
    <section className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. VIBRANT COMMAND BANNER */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Scale size={14} /> Cross-ARN Reconciliation
            </span>
            <span className="text-xs font-mono font-bold text-emerald-100 uppercase">
              FY {selectedFY}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tight drop-shadow-xs">
            Consolidated AMC Run-Rate Ledger
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-2xl">
            Month-over-month variances across all active family ARNs. Click any AMC row to inspect individual ARN payout workings.
          </p>
        </div>

        <div className="bg-black/25 backdrop-blur-md rounded-xl p-4 border border-white/15 shrink-0 text-right">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-200 block">
            FY Gross Consolidated
          </span>
          <span className="text-2xl sm:text-3xl font-[1000] font-mono text-white tracking-tight tabular-nums block mt-0.5">
            {formatINR(grandTotal)}
          </span>
          <span className="text-[10px] font-mono text-emerald-100/80 block mt-1">
            {rows.length} Fund Houses Aggregated
          </span>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS RIBBON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-white/10 rounded-2xl shadow-xs">
        <div className="relative max-w-md w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search AMC (e.g. ABSL, SBI, Nippon, HDFC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#070B14] border-2 border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
          <span className="font-mono text-slate-900 dark:text-white">
            {rows.length} AMCs Logged
          </span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            Click row to view ARN breakdown
          </span>
        </div>
      </div>

      {/* 3. HIGH-LEGIBILITY RECONCILIATION TABLE */}
      <div className="w-full bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <span className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">
              Consolidating AMC commissions across all ARNs...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-350">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-white/4 border-b-2 border-slate-300 dark:border-white/15">
                  <th className="py-4 px-6 font-[1000] uppercase tracking-wider text-sm sm:text-base text-slate-900 dark:text-white sticky left-0 bg-slate-100 dark:bg-[#0C1220] z-20 shadow-r min-w-65">
                    AMC / Fund House
                  </th>
                  {fiscalMonths.map((m) => (
                    <th
                      key={m.key}
                      className="py-4 px-4 text-right font-[1000] uppercase tracking-wider font-mono text-sm sm:text-base text-slate-700 dark:text-slate-300 min-w-38.75"
                    >
                      {m.short}
                    </th>
                  ))}
                  <th className="py-4 px-6 text-right font-[1000] uppercase tracking-wider text-sm sm:text-base text-slate-900 dark:text-white bg-slate-200/80 dark:bg-white/10 min-w-40">
                    FY Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-200/70 dark:divide-white/5">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="py-20 text-center text-slate-400 text-sm font-bold"
                    >
                      No commission records match your selection for FY {selectedFY}.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isExpanded = !!expandedAmcs[row.name];
                    const hasSubRows = (row.arnSubRows || []).length > 0;

                    return (
                      <React.Fragment key={row.name}>
                        {/* AMC Master Row */}
                        <tr
                          onClick={() => hasSubRows && toggleExpand(row.name)}
                          className={`transition-colors cursor-pointer group ${
                            isExpanded
                              ? "bg-emerald-500/8 dark:bg-emerald-500/12"
                              : "hover:bg-slate-50 dark:hover:bg-white/2"
                          }`}
                        >
                          {/* AMC Header Cell */}
                          <td className="py-4.5 px-6 font-bold text-slate-950 dark:text-white sticky left-0 bg-white dark:bg-[#0B1120] group-hover:bg-slate-50 dark:group-hover:bg-[#0E1626] z-20 shadow-r border-r-2 border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                              {hasSubRows ? (
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                                    isExpanded
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-white/10 group-hover:border-slate-400"
                                  }`}
                                >
                                  <ChevronDown
                                    size={16}
                                    strokeWidth={3}
                                    className={`transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6" />
                              )}
                              <span className="text-base font-[1000] uppercase tracking-tight">
                                {row.name}
                              </span>
                            </div>
                          </td>

                          {/* 12 Months with Dual Variance Badges */}
                          {fiscalMonths.map((m, idx) => {
                            const curr = row.byMonth[m.key] || 0;
                            const prevKey = idx > 0 ? fiscalMonths[idx - 1].key : null;
                            const prev = prevKey ? row.byMonth[prevKey] || 0 : null;

                            let diff = 0;
                            let diffPct = 0;
                            if (prev !== null && prev > 0 && curr > 0) {
                              diff = curr - prev;
                              diffPct = ((diff / prev) * 100).toFixed(0);
                            }

                            return (
                              <td
                                key={m.key}
                                className="py-4.5 px-4 text-right font-mono border-r border-slate-100 dark:border-white/5"
                              >
                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`text-base sm:text-lg font-[1000] tabular-nums tracking-tight ${
                                      curr > 0
                                        ? "text-slate-950 dark:text-white"
                                        : "text-slate-300 dark:text-slate-600 font-normal"
                                    }`}
                                  >
                                    {curr > 0 ? formatINR(curr) : "—"}
                                  </span>

                                  {/* Dual Variance Badge: Absolute ₹ and % */}
                                  {prev !== null && prev > 0 && curr > 0 && diff !== 0 && (
                                    <div
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-black tracking-tight border ${
                                        diff > 0
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                                          : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
                                      }`}
                                    >
                                      {diff > 0 ? (
                                        <ArrowUpRight
                                          size={12}
                                          strokeWidth={3}
                                          className="shrink-0"
                                        />
                                      ) : (
                                        <ArrowDownRight
                                          size={12}
                                          strokeWidth={3}
                                          className="shrink-0"
                                        />
                                      )}
                                      <span>{formatSignedINR(diff)}</span>
                                      <span className="opacity-65 font-medium">
                                        ({Math.abs(diffPct)}%)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          {/* Row Total */}
                          <td className="py-4.5 px-6 text-right font-mono font-[1000] text-lg sm:text-xl text-slate-950 dark:text-white bg-slate-50 dark:bg-white/3">
                            {formatINR(row.total)}
                          </td>
                        </tr>

                        {/* Expanded Workings / Per-ARN Contributions */}
                        {isExpanded &&
                          row.arnSubRows.map((arnSub, aIdx) => {
                            const theme = ENTITY_THEMES[aIdx % ENTITY_THEMES.length];
                            return (
                              <tr
                                key={arnSub.arnId}
                                className="bg-slate-100/90 dark:bg-[#070C18] border-t border-slate-200 dark:border-white/10"
                              >
                                <td className="py-3.5 pl-14 pr-6 sticky left-0 bg-slate-100 dark:bg-[#070C18] z-20 shadow-r border-r-2 border-slate-300 dark:border-white/10">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} shrink-0`} />
                                    <span className={`font-mono text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border ${theme.badge}`}>
                                      {arnSub.arnNickname || arnSub.arnCode}
                                    </span>
                                  </div>
                                </td>

                                {fiscalMonths.map((m) => {
                                  const val = arnSub.byMonth[m.key] || 0;
                                  return (
                                    <td
                                      key={m.key}
                                      className="py-3.5 px-4 text-right font-mono text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300 border-r border-slate-200/60 dark:border-white/5"
                                    >
                                      {val > 0 ? formatINR(val) : "—"}
                                    </td>
                                  );
                                })}

                                <td className="py-3.5 px-6 text-right font-mono text-sm font-black tabular-nums text-slate-800 dark:text-slate-200 bg-slate-200/50 dark:bg-white/4">
                                  {formatINR(arnSub.total)}
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>

              {/* Total Firm Summary Row */}
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-200/90 dark:bg-white/6 border-t-4 border-slate-300 dark:border-white/20 font-[1000]">
                    <td className="py-5 px-6 uppercase tracking-wider text-base sm:text-lg text-slate-950 dark:text-white sticky left-0 bg-slate-200 dark:bg-[#0B1120] z-20 shadow-r border-r-2 border-slate-300 dark:border-white/10">
                      Total Firm Brokerage
                    </td>
                    {fiscalMonths.map((m, idx) => {
                      const currTotal = monthTotals[m.key] || 0;
                      const prevKey = idx > 0 ? fiscalMonths[idx - 1].key : null;
                      const prevTotal = prevKey ? monthTotals[prevKey] || 0 : null;

                      let diff = 0;
                      let diffPct = 0;
                      if (prevTotal !== null && prevTotal > 0 && currTotal > 0) {
                        diff = currTotal - prevTotal;
                        diffPct = ((diff / prevTotal) * 100).toFixed(0);
                      }

                      return (
                        <td
                          key={m.key}
                          className="py-5 px-4 text-right font-mono border-r border-slate-300/60 dark:border-white/10"
                        >
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-base sm:text-lg font-[1000] text-slate-950 dark:text-white tracking-tight">
                              {formatINR(currTotal)}
                            </span>
                            {prevTotal !== null && prevTotal > 0 && currTotal > 0 && diff !== 0 && (
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-black tracking-tight border ${
                                  diff > 0
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
                                    : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
                                }`}
                              >
                                {diff > 0 ? (
                                  <ArrowUpRight
                                    size={12}
                                    strokeWidth={3}
                                    className="shrink-0"
                                  />
                                ) : (
                                  <ArrowDownRight
                                    size={12}
                                    strokeWidth={3}
                                    className="shrink-0"
                                  />
                                )}
                                <span>{formatSignedINR(diff)}</span>
                                <span className="opacity-65 font-medium">
                                  ({Math.abs(diffPct)}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-5 px-6 text-right font-mono font-[1000] text-xl sm:text-2xl text-emerald-700 dark:text-emerald-400 bg-emerald-500/20">
                      {formatINR(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AmcReconciliationTab;