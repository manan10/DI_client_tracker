import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom"; 
import { ChevronLeft, ChevronRight, BarChart3, Sparkles, Filter, Calendar, Check, ChevronDown, Activity } from "lucide-react";
import AnalyticsHero from "../../components/ExpenseTracker/Analytics/AnalyticsHero";
import { useApi } from "../../hooks/useApi";

const formatINR = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

const CHART_COLORS = [
  "from-emerald-400 to-emerald-600",
  "from-sky-400 to-sky-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-violet-400 to-violet-600",
  "from-fuchsia-400 to-fuchsia-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600"
];

const ExpenseAnalytics = () => {
  const { request } = useApi();
  const { refreshKey } = useOutletContext();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  
  // States for Categories & Trends
  const [allCategories, setAllCategories] = useState([]);
  const [trendHistorical, setTrendHistorical] = useState([]);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  // Custom Dropdown State
  const [trendCategory, setTrendCategory] = useState("All Spending");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch Global Categories for the Dropdown
  useEffect(() => {
    const fetchGlobalCategories = async () => {
      try {
        const res = await request('/category/tree').catch(() => request('/categories/tree')); 
        const treeData = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        
        if (treeData && treeData.length > 0) {
          let flatList = [];
          treeData.forEach(parent => {
            flatList.push(parent.label);
            if (parent.subCategories && parent.subCategories.length > 0) {
              parent.subCategories.forEach(sub => flatList.push(sub.label));
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
      const res = await request(`/spending/analytics?month=${month}&year=${year}`);
      if (res?.success) setData(res);
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
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let i = 5; i >= 0; i--) {
        let d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
        let m = d.getMonth() + 1;
        let y = d.getFullYear();
        
        promises.push(
          request(`/spending/analytics?month=${m}&year=${y}`)
            .then(res => ({
              label: `${months[d.getMonth()]} '${y.toString().substring(2)}`,
              data: res
            }))
            .catch(() => ({ label: `${months[d.getMonth()]} '${y.toString().substring(2)}`, data: null }))
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

  const activeCategories = data?.categoryWise?.sort((a, b) => b.amount - a.amount) || [];
  const totalSpend = data?.aggregated?.monthNetSpend || 0;

  const activeCategoryLabels = activeCategories.map(c => c.category);
  const dropdownOptions = [...new Set([...allCategories, ...activeCategoryLabels])];

  const trendData = trendHistorical.map(hist => {
    let amount = 0;
    if (hist.data && hist.data.success) {
      if (trendCategory === "All Spending") {
        amount = hist.data.aggregated?.monthNetSpend || 0;
      } else {
        const cat = hist.data.categoryWise?.find(c => c.category === trendCategory);
        amount = cat ? cat.amount : 0;
      }
    }
    return { label: hist.label, amount };
  });

  const maxTrendAmount = Math.max(...trendData.map(d => d.amount), 1); 

  if (loading && !data) return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#0B1120] z-50 flex flex-col items-center justify-center p-6">
      <BarChart3 className="text-emerald-500 animate-pulse mb-6" size={48} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Compiling Ledgers</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-left transition-colors duration-500 pb-24">
      
      <main className="w-full max-w-400 mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="shrink-0 w-full md:w-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm mb-3 md:mb-4">
              <Sparkles size={10} className="text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 uppercase tracking-widest">
                Spending Trends
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              Spending <span className="text-emerald-500">Analytics</span>
            </h1>
          </div>

          {/* UPGRADED STRUCTURED MONTH CHANGER */}
          <div className="w-full md:w-auto flex justify-start md:justify-end">
            <div className="inline-flex items-center bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-12 w-full sm:w-auto p-1">
              <button 
                onClick={() => changeMonth(-1)}
                className="h-full px-4 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              
              <div className="flex-1 sm:flex-none px-4 min-w-37.5 flex items-center justify-center gap-2 h-full">
                <Calendar size={14} className="text-indigo-500 shrink-0" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest whitespace-nowrap">
                  {selectedDate.toLocaleString('default', { month: 'short' })} {selectedDate.getFullYear()}
                </span>
              </div>
              
              <button 
                onClick={() => changeMonth(1)}
                disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                className="h-full px-4 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. CATEGORY DISTRIBUTION */}
            <div className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Category Breakdown</h3>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {activeCategories.length} Nodes
                </span>
              </div>

              {activeCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 font-medium">No categorical data available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeCategories.map((cat, idx) => {
                    const percentage = ((cat.amount / totalSpend) * 100).toFixed(1);
                    const gradient = CHART_COLORS[idx % CHART_COLORS.length];

                    return (
                      <div key={idx} className="group cursor-pointer" onClick={() => setTrendCategory(cat.category)}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cat.category}
                          </span>
                          <div className="text-right flex items-baseline gap-3">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">₹{formatINR(cat.amount)}</span>
                            <span className="text-xs font-medium text-slate-400 w-10 text-right">{percentage}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-linear-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2. REAL TREND ANALYSIS WITH CUSTOM DROPDOWN */}
            <div className="bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col relative overflow-hidden">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 relative z-30">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Trend Analysis</h3>
                  {isTrendLoading && <Activity size={14} className="text-indigo-500 animate-pulse" />}
                </div>
                
                {/* CUSTOM DROPDOWN */}
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate max-w-40">
                        {trendCategory}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Safely populated Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 origin-top z-50">
                      <button
                        onClick={() => { setTrendCategory("All Spending"); setIsDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors ${trendCategory === "All Spending" ? 'text-indigo-600 bg-indigo-50/50 dark:bg-slate-800/50' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        All Spending
                        {trendCategory === "All Spending" && <Check size={14} className="text-indigo-500" />}
                      </button>
                      
                      <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />
                      
                      <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {dropdownOptions.length === 0 ? (
                           <div className="px-4 py-3 text-xs text-slate-400 font-medium italic">No categories found</div>
                        ) : dropdownOptions.map((catLabel, i) => (
                          <button
                            key={i}
                            onClick={() => { setTrendCategory(catLabel); setIsDropdownOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors ${trendCategory === catLabel ? 'text-indigo-600 bg-indigo-50/50 dark:bg-slate-800/50' : 'text-slate-600 dark:text-slate-300'}`}
                          >
                            <span className="truncate pr-4">{catLabel}</span>
                            {trendCategory === catLabel && <Check size={14} className="text-indigo-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Component */}
              <div className={`flex-1 min-h-62.5 flex items-end justify-between gap-2 sm:gap-4 relative pt-6 z-10 transition-opacity duration-500 ${isTrendLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/60" />
                  ))}
                </div>

                {trendData.map((d, i) => {
                  const heightPercent = maxTrendAmount === 0 ? 0 : (d.amount / maxTrendAmount) * 100;
                  const isCurrentMonth = i === trendData.length - 1;

                  return (
                    <div key={i} className="flex flex-col items-center w-full group relative z-20 h-full justify-end">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-xl">
                        ₹{formatINR(d.amount)}
                      </div>

                      <div 
                        className={`w-full max-w-12 transition-all duration-1000 ease-out rounded-t-md cursor-pointer
                          ${isCurrentMonth 
                            ? 'bg-linear-to-t from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                          }`}
                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                      />
                      
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-3">
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