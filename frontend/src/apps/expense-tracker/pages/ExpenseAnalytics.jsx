import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../shared/hooks/useApi";

import AnalyticsHeader from "../components/Analytics/AnalyticsHeader";
import AnalyticsHero from "../components/Analytics/AnalyticsHero";
import CategoryDistribution from "../components/Analytics/CategoryDistribution";
import TimelineTrendChart from "../components/Analytics/TimelineTrendChart";

const formatINR = (num) => new Intl.NumberFormat("en-IN").format(num || 0);

const ExpenseAnalytics = () => {
  const { request } = useApi();
  const { refreshKey } = useOutletContext() || {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  // States for Categories & Historical Trends
  const [allCategories, setAllCategories] = useState([]);
  const [trendHistorical, setTrendHistorical] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  // Pagination for Category Breakdown
  const [categoryPage, setCategoryPage] = useState(1);

  // Active Category Filter for Trend Chart
  const [trendCategory, setTrendCategory] = useState("All Categories");

  // 1. Fetch Global Categories for Tree Filter
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

  // 2. Fetch Selected Month Analytics
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
        setCategoryPage(1);
      }
    } catch (e) {
      console.error("Sync Failed", e);
    } finally {
      setLoading(false);
    }
  }, [request, selectedDate]);

  // 3. Fetch Historical Data (Trailing 6 Months)
  const fetchHistory = useCallback(async () => {
    setIsTrendLoading(true);
    try {
      const promises = [];
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

  useEffect(() => {
    fetchAnalytics();
    fetchHistory();
  }, [fetchAnalytics, fetchHistory, refreshKey]);

  const handleForceRefresh = () => {
    fetchAnalytics();
    fetchHistory();
  };

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const activeCategories = useMemo(
    () => (data?.categoryWise || []).slice().sort((a, b) => b.amount - a.amount),
    [data?.categoryWise],
  );

  const totalSpend = data?.aggregated?.monthNetSpend || 0;

  const dropdownOptions = useMemo(() => {
    const activeCategoryLabels = activeCategories.map((c) => c.category);
    return [...new Set([...allCategories, ...activeCategoryLabels])];
  }, [allCategories, activeCategories]);

  const trendData = useMemo(() => {
    return trendHistorical.map((hist) => {
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
  }, [trendHistorical, trendCategory]);

  const maxTrendAmount = useMemo(
    () => Math.max(...trendData.map((d) => d.amount), 1),
    [trendData],
  );

  if (loading && !data) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#030712] z-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-800 border-t-emerald-500 mb-4" />
        <p className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 text-center">
          Loading Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] text-left transition-colors duration-300 pb-24 font-sans">
      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-10 space-y-10 sm:space-y-12 min-w-0">
        
        {/* Section 1: Standardized Header & Period Switcher */}
        <AnalyticsHeader
          selectedDate={selectedDate}
          onChangeMonth={changeMonth}
        />

        {/* Section 2: Macro Metrics & Account Outflows */}
        <section className="w-full">
          <AnalyticsHero
            data={data}
            loading={loading}
            selectedMonth={selectedDate.getMonth()}
            selectedYear={selectedDate.getFullYear()}
            onRefresh={handleForceRefresh}
            isRefreshing={loading || isTrendLoading}
          />
        </section>

        {/* Section 3: Deep Ledger Analysis (Continuous Grid) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch min-w-0">
          <CategoryDistribution
            categories={activeCategories}
            totalSpend={totalSpend}
            categoryPage={categoryPage}
            onPageChange={setCategoryPage}
            onSelectCategory={setTrendCategory}
            formatINR={formatINR}
          />

          <TimelineTrendChart
            trendData={trendData}
            maxTrendAmount={maxTrendAmount}
            isTrendLoading={isTrendLoading}
            trendCategory={trendCategory}
            onSelectCategory={setTrendCategory}
            dropdownOptions={dropdownOptions}
            formatINR={formatINR}
          />
        </section>
      </main>
    </div>
  );
};

export default ExpenseAnalytics;