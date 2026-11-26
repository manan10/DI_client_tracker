import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Loader2,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useApi } from "../../../../shared/hooks/useApi";
import TabHeader from "../../../../shared/components/TabHeader";
import SnapshotForm from "./AccountBalances/SnapshotForm";
import HistoryTable from "./AccountBalances/HistoryTable";
import {
  groupAccountsByOwner,
  calculatePerformance,
} from "./AccountBalances/accountUtils";

const HOLDER_COLORS = [
  "#0284c7", // sky-600
  "#0891b2", // cyan-600
  "#38bdf8", // sky-400
  "#6366f1", // indigo-500
  "#0ea5e9", // sky-500
  "#22d3ee", // cyan-400
];

const AccountBalances = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Entry Drawer State
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [note, setNote] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Active Holder Scope Filter
  const [selectedOwner, setSelectedOwner] = useState("ALL");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const accRes = await request("/accounts", "GET");
      const histRes = await request("/accounts/history", "GET");

      setAccounts(accRes?.data || []);
      setHistory(histRes?.data || []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Checks if the selected date already exists in history
  const handleDateChange = (newDate) => {
    setEntryDate(newDate);

    const existingSnap = history.find(
      (h) => new Date(h.date).toISOString().split("T")[0] === newDate,
    );

    if (existingSnap) {
      setEditingId(existingSnap._id);
      setNote(existingSnap.note || "");
      const editValues = {};
      existingSnap.balances.forEach((b) => {
        if (b.accountId?._id || b.accountId) {
          editValues[b.accountId._id || b.accountId] = b.amount;
        }
      });
      setInputValues(editValues);
    } else {
      setEditingId(null);
    }
  };

  const handleOpenNewEntry = () => {
    if (isEntryOpen) {
      setIsEntryOpen(false);
      setEditingId(null);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    setInputValues({});
    setNote("");
    handleDateChange(today);
    setIsEntryOpen(true);
  };

  const startEdit = (snapshot) => {
    setEditingId(snapshot._id);
    setEntryDate(new Date(snapshot.date).toISOString().split("T")[0]);
    setNote(snapshot.note || "");
    const editValues = {};
    snapshot.balances.forEach((b) => {
      if (b.accountId?._id || b.accountId) {
        editValues[b.accountId._id || b.accountId] = b.amount;
      }
    });
    setInputValues(editValues);
    setIsEntryOpen(true);
  };

  const handleSaveSnapshot = async () => {
    setSaving(true);
    const balances = Object.entries(inputValues).map(([id, val]) => ({
      accountId: id,
      amount: Number(val) || 0,
    }));
    try {
      const endpoint = editingId
        ? `/accounts/snapshot/${editingId}`
        : "/accounts/snapshot";
      const method = editingId ? "PUT" : "POST";
      await request(endpoint, method, { balances, note, date: entryDate });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#0284c7", "#38bdf8", "#ffffff"],
      });
      setIsEntryOpen(false);
      setEditingId(null);
      await loadData();
    } catch {
      alert("Save Failed");
    } finally {
      setSaving(false);
    }
  };

  const groupedAccounts = useMemo(
    () => groupAccountsByOwner(accounts),
    [accounts],
  );

  // Map accountId -> Owner Key for quick filtering
  const accountOwnerMap = useMemo(() => {
    const map = {};
    Object.entries(groupedAccounts).forEach(([key, group]) => {
      group.list.forEach((acc) => {
        map[acc._id] = key;
      });
    });
    return map;
  }, [groupedAccounts]);

  // Overall & Filtered Performance Metrics
  const performance = useMemo(() => {
    if (!isEntryOpen && history.length > 0) {
      const latest = history[0];
      const previous = history.length > 1 ? history[1] : null;

      const filterByOwner = (b) => {
        if (selectedOwner === "ALL") return true;
        const id = b.accountId?._id || b.accountId;
        return accountOwnerMap[id] === selectedOwner;
      };

      const currentVal = latest.balances
        .filter(filterByOwner)
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      const prevVal = previous
        ? previous.balances
            .filter(filterByOwner)
            .reduce((sum, b) => sum + (b.amount || 0), 0)
        : currentVal;

      return { currentTotal: currentVal, growth: currentVal - prevVal };
    }
    return calculatePerformance(inputValues, history);
  }, [inputValues, history, isEntryOpen, selectedOwner, accountOwnerMap]);

  // Holder Breakdown Data for Donut Chart (Latest Entry)
  const holderChartData = useMemo(() => {
    const latest = history[0];
    const latestMap = {};
    if (latest) {
      latest.balances.forEach((b) => {
        const id = b.accountId?._id || b.accountId;
        latestMap[id] = b.amount || 0;
      });
    }

    const entries = Object.entries(groupedAccounts).map(([key, group], idx) => {
      const value = group.list.reduce(
        (sum, acc) => sum + (latestMap[acc._id] || 0),
        0,
      );
      return {
        key,
        name: group.name,
        count: group.list.length,
        value,
        color: HOLDER_COLORS[idx % HOLDER_COLORS.length],
      };
    });

    const grandTotal = entries.reduce((sum, e) => sum + e.value, 0);
    return entries
      .sort((a, b) => b.value - a.value)
      .map((e) => ({
        ...e,
        share:
          grandTotal > 0 ? `${((e.value / grandTotal) * 100).toFixed(1)}%` : "0%",
      }));
  }, [groupedAccounts, history]);

  const totalLatestAllHolders = useMemo(
    () => holderChartData.reduce((sum, item) => sum + item.value, 0),
    [holderChartData],
  );

  // Historical Area Chart Series (Chronological)
  const trendData = useMemo(() => {
    return [...history].reverse().map((snap) => {
      const filteredBalances = snap.balances.filter((b) => {
        if (selectedOwner === "ALL") return true;
        const id = b.accountId?._id || b.accountId;
        return accountOwnerMap[id] === selectedOwner;
      });
      const total = filteredBalances.reduce(
        (sum, b) => sum + (b.amount || 0),
        0,
      );
      return {
        id: snap._id,
        dateLabel: new Date(snap.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
        fullDate: new Date(snap.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        total,
        totalLakhs: Number((total / 100000).toFixed(2)),
        note: snap.note || "",
      };
    });
  }, [history, selectedOwner, accountOwnerMap]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      amount || 0,
    );

  const formatLakhs = (val) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format((val || 0) / 100000);

  if (loading) {
    return (
      <div className="h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2
          size={26}
          className="text-sky-600 dark:text-sky-400 animate-spin"
          strokeWidth={2.25}
        />
        <p className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
          Loading Account Balances...
        </p>
      </div>
    );
  }

  const isPositive = performance.growth >= 0;
  const activeOwnerLabel =
    selectedOwner === "ALL"
      ? "Total Balance"
      : `${groupedAccounts[selectedOwner]?.name || selectedOwner}'s Balance`;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* COMPLEMENTARY TAB HEADER */}
      <TabHeader
        kicker="Bank & Cash Ledgers"
        title="Account"
        accent="Balances"
        description="Track liquid bank balances across family holders and compare historical entries."
        actions={
          <button
            onClick={handleOpenNewEntry}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 outline-none cursor-pointer select-none shrink-0 ${
              isEntryOpen
                ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-700"
                : "bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99]"
            }`}
          >
            {isEntryOpen ? (
              <X size={15} strokeWidth={2.5} />
            ) : (
              <Plus size={15} strokeWidth={2.5} />
            )}
            <span>
              {editingId
                ? "Cancel Edit"
                : isEntryOpen
                  ? "Close Panel"
                  : "Record Balances"}
            </span>
          </button>
        }
      />

      {/* 1. SUMMARY METRIC & HOLDER FILTER PILLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
              {activeOwnerLabel}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="sora-font text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                ₹{formatLakhs(performance.currentTotal)}
              </span>
              <span className="sora-font text-xs sm:text-sm font-medium text-sky-600 dark:text-sky-300">
                Lakhs
              </span>
            </div>
          </div>

          {history.length > 1 && (
            <div className="flex items-center gap-2 self-end pb-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums border ${
                  isPositive
                    ? "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25"
                    : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight size={13} strokeWidth={2.5} />
                )}
                {isPositive ? "+" : "-"}₹
                {formatLakhs(Math.abs(performance.growth))}L
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs. last entry
              </span>
            </div>
          )}
        </div>

        {/* Holder Filter Pills */}
        <div className="flex items-center bg-slate-100/90 dark:bg-[#161B26] p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedOwner("ALL")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedOwner === "ALL"
                ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({accounts.length})
          </button>
          {holderChartData.map((holder) => (
            <button
              key={holder.key}
              onClick={() => setSelectedOwner(holder.key)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedOwner === holder.key
                  ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {holder.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CHARTS ROW: BALANCE TREND & BALANCE BY HOLDER */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Cols: Balance History Area Chart */}
          <div className="lg:col-span-7 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20">
                  <TrendingUp size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Balance{" "}
                    <span className="font-normal text-sky-600 dark:text-sky-300">
                      History
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total balance across {trendData.length} saved dates
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#1C2230] px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700/70">
                ₹ in Lakhs
              </span>
            </div>

            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="skyBalanceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#0284c7"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor="#0284c7"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148, 163, 184, 0.15)"
                  />
                  <XAxis
                    dataKey="dateLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-[#1C2230]/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-slate-500 dark:text-slate-400">
                            {item.fullDate}
                          </p>
                          <p className="font-mono font-bold text-sm text-sky-600 dark:text-sky-300">
                            ₹{formatLakhs(item.total)} Lakhs
                          </p>
                          <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            ₹{formatCurrency(item.total)}
                          </p>
                          {item.note && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800 max-w-[200px] truncate">
                              “{item.note}”
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalLakhs"
                    stroke="#0284c7"
                    strokeWidth={2.25}
                    fill="url(#skyBalanceGradient)"
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
          </div>

          {/* Right 5 Cols: Balance by Holder Donut Chart */}
          <div className="lg:col-span-5 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20">
                  <Users size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="sora-font text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Balance by{" "}
                    <span className="font-normal text-sky-600 dark:text-sky-300">
                      Holder
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Share across account holders
                  </p>
                </div>
              </div>
              {selectedOwner !== "ALL" && (
                <button
                  onClick={() => setSelectedOwner("ALL")}
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-300 hover:underline cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Donut Chart with Center Callout */}
            <div className="w-full h-36 relative flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height={144}>
                <PieChart>
                  <Pie
                    data={holderChartData}
                    innerRadius={44}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    onClick={(entry) => {
                      if (!entry?.key) return;
                      setSelectedOwner((prev) =>
                        prev === entry.key ? "ALL" : entry.key,
                      );
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {holderChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.key}`}
                        fill={entry.color}
                        opacity={
                          selectedOwner === "ALL" || selectedOwner === entry.key
                            ? 1
                            : 0.3
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-[#1C2230]/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg shadow-lg text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.name}
                            </span>
                          </div>
                          <p className="font-mono font-bold text-sky-600 dark:text-sky-300">
                            ₹{formatLakhs(item.value)}L ({item.share})
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  Total
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  ₹{formatLakhs(totalLatestAllHolders)}L
                </span>
              </div>
            </div>

            {/* Compact Multi-Column Legend */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2">
              {holderChartData.map((holder) => {
                const isSelected = selectedOwner === holder.key;
                return (
                  <button
                    key={holder.key}
                    onClick={() =>
                      setSelectedOwner(isSelected ? "ALL" : holder.key)
                    }
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/80 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40"
                        : "bg-slate-50/60 dark:bg-[#1C2230]/50 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: holder.color }}
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {holder.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0 font-mono">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">
                        ₹{formatLakhs(holder.value)}L
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        ({holder.share})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODULAR LEDGER TABLE COMPONENT */}
      <HistoryTable
        accounts={accounts}
        history={history}
        selectedOwner={selectedOwner}
        groupedAccounts={groupedAccounts}
        accountOwnerMap={accountOwnerMap}
        onEdit={startEdit}
      />

      {/* 4. RIGHT-DOCKED ENTRY DRAWER */}
      <SnapshotForm
        isOpen={isEntryOpen}
        onClose={() => {
          setIsEntryOpen(false);
          setEditingId(null);
        }}
        groupedAccounts={groupedAccounts}
        inputValues={inputValues}
        setInputValues={setInputValues}
        entryDate={entryDate}
        onDateChange={handleDateChange}
        note={note}
        setNote={setNote}
        onSave={handleSaveSnapshot}
        saving={saving}
        editingId={editingId}
      />
    </div>
  );
};

export default AccountBalances;