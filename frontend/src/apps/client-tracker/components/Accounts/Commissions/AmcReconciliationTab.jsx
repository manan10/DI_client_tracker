import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../../../shared/hooks/useApi";

const ENTITY_THEMES = [
  {
    badge:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
    dot: "bg-sky-500",
  },
  {
    badge:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  {
    badge:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
    dot: "bg-indigo-500",
  },
  {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  {
    badge:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
    dot: "bg-teal-500",
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

    return {
      rows: mappedRows,
      monthTotals: monthTotalsMap,
      grandTotal: totalAll,
    };
  }, [rawData, fiscalMonths, search]);

  return (
    <section className="w-full space-y-5 animate-in fade-in duration-200">
      {/* 1. ARCHITECTURAL SUMMARY STRIP */}
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-sky-600 via-cyan-400 to-transparent" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 text-[11px] font-mono font-semibold uppercase tracking-wider">
              <Scale size={13} /> Cross-ARN Ledger
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              FY {selectedFY}
            </span>
          </div>
          <h3 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Monthly AMC{" "}
            <span className="font-normal text-sky-600 dark:text-sky-300">
              Comparison
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Compare month-over-month payouts across all family ARNs. Click any AMC row to view individual ARN breakdowns.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-[#131720] rounded-lg px-4 py-3 border border-slate-200/80 dark:border-slate-800 shrink-0 text-left md:text-right">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Total FY Brokerage
          </span>
          <span className="sora-font text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-300 tabular-nums block mt-0.5">
            {formatINR(grandTotal)}
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
            {rows.length} Fund Houses
          </span>
        </div>
      </div>

      {/* 2. SEARCH & COUNT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search AMC (e.g. ABSL, SBI, HDFC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {rows.length} AMCs
          </span>
          <span>•</span>
          <span>Click any row to view ARN split</span>
        </div>
      </div>

      {/* 3. RECONCILIATION MATRIX TABLE */}
      <div className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2
              className="animate-spin text-sky-600 dark:text-sky-400"
              size={24}
            />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Loading AMC reconciliation table...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-350">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="py-3.5 px-5 sticky left-0 bg-slate-50 dark:bg-[#1C2230] z-20 border-r border-slate-200/80 dark:border-slate-800/80 min-w-60">
                    AMC / Fund House
                  </th>
                  {fiscalMonths.map((m) => (
                    <th
                      key={m.key}
                      className="py-3.5 px-4 text-right font-mono min-w-36"
                    >
                      {m.short}
                    </th>
                  ))}
                  <th className="py-3.5 px-5 text-right text-slate-900 dark:text-white bg-slate-100/80 dark:bg-white/[0.04] min-w-38">
                    FY Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs"
                    >
                      No commission records found for FY {selectedFY}.
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
                              ? "bg-sky-50/60 dark:bg-sky-500/[0.06]"
                              : "hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-[#161B26] group-hover:bg-slate-50 dark:group-hover:bg-[#1C2230] z-20 border-r border-slate-200/70 dark:border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                              {hasSubRows ? (
                                <div
                                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                    isExpanded
                                      ? "bg-sky-600 text-white border-sky-600"
                                      : "bg-slate-100 dark:bg-[#1C2230] text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  <ChevronDown
                                    size={13}
                                    strokeWidth={2.5}
                                    className={`transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              ) : (
                                <div className="w-5 h-5" />
                              )}
                              <span className="text-xs sm:text-sm font-bold tracking-tight">
                                {row.name}
                              </span>
                            </div>
                          </td>

                          {/* 12 Months */}
                          {fiscalMonths.map((m, idx) => {
                            const curr = row.byMonth[m.key] || 0;
                            const prevKey =
                              idx > 0 ? fiscalMonths[idx - 1].key : null;
                            const prev = prevKey
                              ? row.byMonth[prevKey] || 0
                              : null;

                            let diff = 0;
                            let diffPct = 0;
                            if (prev !== null && prev > 0 && curr > 0) {
                              diff = curr - prev;
                              diffPct = ((diff / prev) * 100).toFixed(0);
                            }

                            return (
                              <td
                                key={m.key}
                                className="py-3.5 px-4 text-right font-mono border-r border-slate-100/80 dark:border-slate-800/50"
                              >
                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                                      curr > 0
                                        ? "text-slate-900 dark:text-white"
                                        : "text-slate-300 dark:text-slate-600 font-normal"
                                    }`}
                                  >
                                    {curr > 0 ? formatINR(curr) : "—"}
                                  </span>

                                  {prev !== null &&
                                    prev > 0 &&
                                    curr > 0 &&
                                    diff !== 0 && (
                                      <div
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                                          diff > 0
                                            ? "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30"
                                            : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
                                        }`}
                                      >
                                        {diff > 0 ? (
                                          <ArrowUpRight
                                            size={10}
                                            strokeWidth={2.5}
                                            className="shrink-0"
                                          />
                                        ) : (
                                          <ArrowDownRight
                                            size={10}
                                            strokeWidth={2.5}
                                            className="shrink-0"
                                          />
                                        )}
                                        <span>{formatSignedINR(diff)}</span>
                                        <span className="opacity-70">
                                          ({Math.abs(diffPct)}%)
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </td>
                            );
                          })}

                          {/* Row FY Total */}
                          <td className="py-3.5 px-5 text-right font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-50/70 dark:bg-white/[0.02]">
                            {formatINR(row.total)}
                          </td>
                        </tr>

                        {/* Expanded Per-ARN Sub-Rows */}
                        {isExpanded &&
                          row.arnSubRows.map((arnSub, aIdx) => {
                            const theme =
                              ENTITY_THEMES[aIdx % ENTITY_THEMES.length];
                            return (
                              <tr
                                key={arnSub.arnId}
                                className="bg-slate-50/90 dark:bg-[#131720] border-t border-slate-200/70 dark:border-slate-800/80"
                              >
                                <td className="py-2.5 pl-12 pr-5 sticky left-0 bg-slate-50 dark:bg-[#131720] z-20 border-r border-slate-200/70 dark:border-slate-800/80">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${theme.dot} shrink-0`}
                                    />
                                    <span
                                      className={`font-mono text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${theme.badge}`}
                                    >
                                      {arnSub.arnNickname || arnSub.arnCode}
                                    </span>
                                  </div>
                                </td>

                                {fiscalMonths.map((m) => {
                                  const val = arnSub.byMonth[m.key] || 0;
                                  return (
                                    <td
                                      key={m.key}
                                      className="py-2.5 px-4 text-right font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300 border-r border-slate-200/50 dark:border-slate-800/40"
                                    >
                                      {val > 0 ? formatINR(val) : "—"}
                                    </td>
                                  );
                                })}

                                <td className="py-2.5 px-5 text-right font-mono text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200 bg-slate-100/60 dark:bg-white/[0.03]">
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
                  <tr className="bg-slate-100/90 dark:bg-[#1C2230] border-t-2 border-slate-200 dark:border-slate-700 font-bold">
                    <td className="py-4 px-5 uppercase tracking-wider text-xs text-slate-800 dark:text-slate-100 sticky left-0 bg-slate-100 dark:bg-[#1C2230] z-20 border-r border-slate-200 dark:border-slate-700">
                      Total Brokerage
                    </td>
                    {fiscalMonths.map((m, idx) => {
                      const currTotal = monthTotals[m.key] || 0;
                      const prevKey =
                        idx > 0 ? fiscalMonths[idx - 1].key : null;
                      const prevTotal = prevKey
                        ? monthTotals[prevKey] || 0
                        : null;

                      let diff = 0;
                      let diffPct = 0;
                      if (
                        prevTotal !== null &&
                        prevTotal > 0 &&
                        currTotal > 0
                      ) {
                        diff = currTotal - prevTotal;
                        diffPct = ((diff / prevTotal) * 100).toFixed(0);
                      }

                      return (
                        <td
                          key={m.key}
                          className="py-4 px-4 text-right font-mono border-r border-slate-200/70 dark:border-slate-800"
                        >
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {formatINR(currTotal)}
                            </span>
                            {prevTotal !== null &&
                              prevTotal > 0 &&
                              currTotal > 0 &&
                              diff !== 0 && (
                                <div
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                                    diff > 0
                                      ? "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40"
                                      : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40"
                                  }`}
                                >
                                  {diff > 0 ? (
                                    <ArrowUpRight
                                      size={10}
                                      strokeWidth={2.5}
                                      className="shrink-0"
                                    />
                                  ) : (
                                    <ArrowDownRight
                                      size={10}
                                      strokeWidth={2.5}
                                      className="shrink-0"
                                    />
                                  )}
                                  <span>{formatSignedINR(diff)}</span>
                                  <span className="opacity-70">
                                    ({Math.abs(diffPct)}%)
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-4 px-5 text-right font-mono font-bold text-sm sm:text-base text-sky-700 dark:text-sky-300 bg-sky-500/10">
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