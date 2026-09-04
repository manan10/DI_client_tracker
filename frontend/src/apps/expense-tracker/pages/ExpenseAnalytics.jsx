import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sparkles,
  Filter,
  Calendar,
  Check,
  ChevronDown,
  Activity,
} from "lucide-react";
import AnalyticsHero from "../components/Analytics/AnalyticsHero";
import { useApi } from "../../../shared/hooks/useApi";

const formatINR = (num) => new Intl.NumberFormat("en-IN").format(num || 0);

// Sleek, refined gradient palette
const CHART_COLORS = [
  "from-emerald-400 to-emerald-500",
  "from-blue-400 to-blue-500",
  "from-amber-400 to-amber-500",
  "from-rose-400 to-rose-500",
  "from-violet-400 to-violet-500",
  "from-cyan-400 to-cyan-500",
  "from-indigo-400 to-indigo-500",
  "from-teal-400 to-teal-500",
];

const ITEMS_PER_PAGE = 5;

const ExpenseAnalytics = () => {
  const { request } = useApi();
  const { refreshKey } = useOutletContext();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  // States for Categories & Trends
  const [allCategories, setAllCategories] = useState([]);
  const [trendHistorical, setTrendHistorical] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  // Pagination State for Category Breakdown
  const [categoryPage, setCategoryPage] = useState(1);

  // Custom Dropdown State
  const [trendCategory, setTrendCategory] = useState("All Categories");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch Global Categories for the Dropdown
  useEffect(() => {
    const fetchGlobalCategories = async () => {
      try {
        const res = await request("/categories/tree").catch(() =>
          request("/categories/tree"),
        );
        const treeData = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (treeData && treeData.length > 0) {
          let flatList = [];
          treeData.forEach((parent) => {
            flatList.push(parent.label);
            if (parent.subCategories && parent.subCategories.length > 0) {
              parent.subCategories.forEach((sub) => flatList.push(sub.label));
            }
          });
          setAllCategories([...new Set(flatList)]);
        }
      } catch (e) {
        console.error("Failed to fetch category tree", e);
      }
    };
    fetchGlobalCategories();
  }, [request]);

  // 2. Fetch Primary Monthly Analytics
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const res = await request(
        `/spending/analytics?month=${month}&year=${year}`,
      );
      if (res?.success) {
        setData(res);
        setCategoryPage(1); // Reset pagination to page 1 on new data
      }
    } catch (e) {
      console.error("Sync Failed", e);
    } finally {
      setLoading(false);
    }
  }, [request, selectedDate]);

  // 3. Fetch REAL Historical Data for the last 6 months
  const fetchHistory = useCallback(async () => {
    setIsTrendLoading(true);
    try {
      const promises = [];
      const months = [
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
      ];

      for (let i = 5; i >= 0; i--) {
        let d = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() - i,
          1,
        );
        let m = d.getMonth() + 1;
        let y = d.getFullYear();

        promises.push(
          request(`/spending/analytics?month=${m}&year=${y}`)
            .then((res) => ({
              label: `${months[d.getMonth()]} '${y.toString().substring(2)}`,
              data: res,
            }))
            .catch(() => ({
              label: `${months[d.getMonth()]} '${y.toString().substring(2)}`,
              data: null,
            })),
        );
      }

      const results = await Promise.all(promises);
      setTrendHistorical(results);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setIsTrendLoading(false);
    }
  }, [selectedDate, request]);

  // Unified load trigger
  useEffect(() => {
    fetchAnalytics();
    fetchHistory();
  }, [fetchAnalytics, fetchHistory, refreshKey]);

  // Combined manual refresh function passed to Hero
  const handleForceRefresh = () => {
    fetchAnalytics();
    fetchHistory();
  };

  // Dropdown click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  // Category & Pagination Calculations
  const activeCategories =
    data?.categoryWise?.sort((a, b) => b.amount - a.amount) || [];
  const totalCategories = activeCategories.length;
  const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);
  const startIndex = (categoryPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = activeCategories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const totalSpend = data?.aggregated?.monthNetSpend || 0;
  const activeCategoryLabels = activeCategories.map((c) => c.category);
  const dropdownOptions = [
    ...new Set([...allCategories, ...activeCategoryLabels]),
  ];

  const trendData = trendHistorical.map((hist) => {
    let amount = 0;
    if (hist.data && hist.data.success) {
      if (trendCategory === "All Categories") {
        amount = hist.data.aggregated?.monthNetSpend || 0;
      } else {
        const cat = hist.data.categoryWise?.find(
          (c) => c.category === trendCategory,
        );
        amount = cat ? cat.amount : 0;
      }
    }
    return { label: hist.label, amount };
  });

  const maxTrendAmount = Math.max(...trendData.map((d) => d.amount), 1);

  if (loading && !data)
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#030712] z-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-800 border-t-emerald-500 mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
          Compiling Ledgers
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-left transition-colors duration-300 pb-24">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-6 sm:space-y-8 min-w-0">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="shrink-0 w-full md:w-auto min-w-0 flex flex-col">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 shadow-sm w-max mb-2">
              <Sparkles size={12} className="text-emerald-500" />
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                Spending Trends
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white leading-none truncate italic">
              Spending{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                Analytics
              </span>
            </h1>
          </div>

          {/* STRUCTURED COMMAND BAR: MONTH CHANGER */}
          <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0">
            <div className="inline-flex items-center bg-white dark:bg-[#0B1120] rounded-lg border border-slate-200 dark:border-white/10 shadow-sm h-11 p-1">
              <button
                onClick={() => changeMonth(-1)}
                className="h-full px-3 flex items-center justify-center rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 outline-none"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              <div className="flex-1 sm:flex-none px-4 min-w-35 flex items-center justify-center gap-2 h-full">
                <Calendar
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400 shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap">
                  {selectedDate.toLocaleString("default", { month: "short" })}{" "}
                  {selectedDate.getFullYear()}
                </span>
              </div>

              <button
                onClick={() => changeMonth(1)}
                disabled={
                  selectedDate.getMonth() === new Date().getMonth() &&
                  selectedDate.getFullYear() === new Date().getFullYear()
                }
                className="h-full px-3 flex items-center justify-center rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-900/50 shrink-0 outline-none"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </header>

        {/* --- TOP LEVEL METRICS --- */}
        <AnalyticsHero
          data={data}
          loading={loading}
          selectedMonth={selectedDate.getMonth()}
          selectedYear={selectedDate.getFullYear()}
          onRefresh={handleForceRefresh}
          isRefreshing={loading || isTrendLoading}
        />

        {/* --- DEEP ANALYTICS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
          {/* 1. CATEGORY DISTRIBUTION */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5 sm:p-6 lg:p-8 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/5 min-w-0">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate pr-2">
                  Categorical Spend
                </h3>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-md text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest shrink-0 border border-slate-200 dark:border-white/5">
                  {totalCategories > 0
                    ? `${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, totalCategories)} OF ${totalCategories}`
                    : "0"}
                </span>
              </div>

              {activeCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    No categorical data
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {paginatedCategories.map((cat, idx) => {
                    const percentage = (
                      (cat.amount / totalSpend) *
                      100
                    ).toFixed(1);
                    // Offset the color index by the start index so colors match position consistently
                    const gradient =
                      CHART_COLORS[(startIndex + idx) % CHART_COLORS.length];

                    return (
                      <div
                        key={idx}
                        className="group cursor-pointer min-w-0"
                        onClick={() => setTrendCategory(cat.category)}
                      >
                        <div className="flex justify-between items-end mb-1.5 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-3">
                            {cat.category}
                          </span>
                          <div className="text-right flex items-baseline gap-2 shrink-0">
                            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                              ₹{formatINR(cat.amount)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 w-9 text-right tabular-nums">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-linear-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-6">
                <button
                  onClick={() => setCategoryPage((p) => Math.max(1, p - 1))}
                  disabled={categoryPage === 1}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors outline-none"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Page {categoryPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCategoryPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={categoryPage === totalPages}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors outline-none"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          {/* 2. REAL TREND ANALYSIS WITH CUSTOM DROPDOWN */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-5 border-b border-slate-200 dark:border-white/5 gap-3 relative z-30 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate pr-2">
                  Timeline Trend
                </h3>
                {isTrendLoading && (
                  <Activity
                    size={12}
                    className="text-indigo-500 animate-pulse shrink-0"
                  />
                )}
              </div>

              {/* CUSTOM DROPDOWN */}
              <div
                className="relative w-full sm:w-auto min-w-0"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-9 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-md px-3 transition-colors shadow-sm outline-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Filter
                      size={12}
                      className="text-indigo-600 dark:text-indigo-400 shrink-0"
                    />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate max-w-30 sm:max-w-40">
                      {trendCategory}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Safely populated Dropdown Options */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+4px)] w-[calc(100vw-2rem)] sm:w-64 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 origin-top z-50">
                    <button
                      onClick={() => {
                        setTrendCategory("All Categories");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors outline-none ${trendCategory === "All Categories" ? "text-indigo-700 bg-indigo-50/50 dark:text-indigo-400 dark:bg-slate-800" : "text-slate-600 dark:text-slate-300"}`}
                    >
                      ALL CATEGORIES
                      {trendCategory === "All Categories" && (
                        <Check
                          size={14}
                          className="text-indigo-600 dark:text-indigo-400 shrink-0"
                        />
                      )}
                    </button>

                    <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-1" />

                    <div className="max-h-48 overflow-y-auto custom-scroll">
                      {dropdownOptions.length === 0 ? (
                        <div className="px-3 py-2 text-[10px] text-slate-400 font-medium italic">
                          No categories found
                        </div>
                      ) : (
                        dropdownOptions.map((catLabel, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setTrendCategory(catLabel);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-colors outline-none ${trendCategory === catLabel ? "text-indigo-700 bg-indigo-50/50 dark:text-indigo-400 dark:bg-slate-800" : "text-slate-600 dark:text-slate-300"}`}
                          >
                            <span className="truncate pr-3">{catLabel}</span>
                            {trendCategory === catLabel && (
                              <Check
                                size={14}
                                className="text-indigo-600 dark:text-indigo-400 shrink-0"
                              />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Component */}
            <div
              className={`flex-1 min-h-55 flex items-end justify-between gap-1.5 sm:gap-4 relative pt-6 z-10 transition-opacity duration-300 ${isTrendLoading ? "opacity-40 blur-sm" : "opacity-100"}`}
            >
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-t border-dashed border-slate-200 dark:border-white/5"
                  />
                ))}
              </div>

              {trendData.map((d, i) => {
                const heightPercent =
                  maxTrendAmount === 0 ? 0 : (d.amount / maxTrendAmount) * 100;
                const isCurrentMonth = i === trendData.length - 1;

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center w-full group relative z-20 h-full justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap shadow-sm z-30">
                      ₹{formatINR(d.amount)}
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-10 transition-all duration-1000 ease-out rounded-t-sm cursor-pointer
                        ${
                          isCurrentMonth
                            ? "bg-indigo-500 dark:bg-indigo-600"
                            : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                        }`}
                      style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                    />

                    {/* X-Axis Label */}
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-2.5 truncate max-w-full px-0.5 ${
                        isCurrentMonth
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpenseAnalytics;
