import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet as WalletIcon, Settings as SettingsIcon, Moon, Sun, 
  ShieldCheck, ChevronRight, Loader2, RotateCw, 
  FileSpreadsheet, ArrowLeft, UserPlus, Lock, Tags, Sparkles
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";

import ExpenseNavbar from "../../components/ExpenseNavbar";
import WalletManager from "../../components/ExpenseTracker/Settings/WalletManager";
import UserManager from "../../components/ExpenseTracker/Settings/UserManager";
import MonthlyRefill from "../../components/ExpenseTracker/Settings/MonthlyRefill";
import ThemeManager from "../../components/ExpenseTracker/Settings/ThemeManager"; 
import SpendingCategories from "../../components/ExpenseTracker/Settings/SpendingCategories/SpendingCategories";

const ExpenseSettings = () => {
  const { request, loading } = useApi();
  const [activeSection, setActiveSection] = useState("wallets"); 
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const [wallets, setWallets] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await request('/spending/summary');
      if (data?.wallets) setWallets(data.wallets);
    } catch (err) {
      console.error("Settings Load Error", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const toggleTheme = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem('theme', newTheme);
    toast.success(`Appearance set to ${newTheme.toUpperCase()}`);
  };

  const handlePocketRefill = async () => {
    try {
      await request("/spending/process-allowance", "POST");
      toast.success("Balances Refilled", { description: "Monthly limits added successfully." });
      loadDashboardData();
    } catch (err) {
      toast.error("Refill Failed", { description: err.message });
    }
  };

  const menuItems = [
    { id: "wallets", label: "Wallets", sub: "Manage members & monthly goals", icon: WalletIcon, color: "text-emerald-500" },
    { id: "categories", label: "Categories", sub: "Classification & Icon logic", icon: Tags, color: "text-rose-500" },
    { id: "access", label: "Access Control", sub: "Family members & security", icon: UserPlus, color: "text-purple-500" },
    { id: "cycle", label: "Monthly Top-ups", sub: "Execute refill protocol", icon: RotateCw, color: "text-blue-500" },
    { id: "appearance", label: "Theme", sub: "Visual mode configuration", icon: isDark ? Sun : Moon, color: "text-amber-500" },
    { id: "export", label: "Download Data", sub: "Export spending to XLSX", icon: FileSpreadsheet, color: "text-slate-400", isLocked: true }
  ];

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "access": return <UserManager />;
      case "wallets": return <WalletManager wallets={wallets} onUpdate={loadDashboardData} />;
      case "cycle": return <MonthlyRefill wallets={wallets} onRefill={handlePocketRefill} loading={loading} />;
      case "categories": return <SpendingCategories />;
      case "appearance": return <ThemeManager isDark={isDark} onToggle={toggleTheme} />;
      case "export": return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6 animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
            <Lock size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Module Locked</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Authorization Pending</p>
          </div>
          <p className="max-w-xs text-[10px] font-bold text-slate-400/80 uppercase tracking-widest leading-relaxed">
            Data export functionality is currently restricted. Please contact the system administrator to enable XLSX reports.
          </p>
        </div>
      );
      default: return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
          <SettingsIcon size={48} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 font-sans pb-20 text-left selection:bg-emerald-500/20">
      <ExpenseNavbar />

      <main className="w-full max-w-350 mx-auto pt-6 md:pt-10 sm: pb-10">
        
        {/* PREMIUM HEADER - Matched to other pages */}
        <header className={`px-5 sm:px-8 mb-6 lg:mb-10 ${!isMobileMenu ? 'hidden lg:block' : 'block'}`}>
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm mb-3 md:mb-4">
              <Sparkles size={10} className="text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 uppercase tracking-widest">
                System Preferences
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
              Expense <span className="text-emerald-500">Settings</span>
            </h1>
          </div>
        </header>

        {/* Dashboard Container */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 min-h-[75vh] px-0 sm:px-4 lg:px-8">
          
          {/* NAVIGATION SIDEBAR */}
          <aside className={`w-full lg:w-80 shrink-0 flex flex-col ${isMobileMenu ? "block" : "hidden lg:flex"}`}>
            <nav className="px-5 lg:px-0 space-y-2.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setIsMobileMenu(false); }}
                  className={`w-full flex items-center justify-between p-4 lg:p-5 rounded-2xl transition-all duration-300 active:scale-[0.98] ${
                    activeSection === item.id 
                    ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 shadow-[0_8px_30px_rgb(16,185,129,0.12)]' 
                    : 'bg-white dark:bg-[#0B1120] border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4 lg:gap-5">
                    <div className={`p-2 rounded-xl ${activeSection === item.id ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                      <item.icon size={20} className={activeSection === item.id ? 'text-emerald-500 dark:text-emerald-400' : item.color} />
                    </div>
                    <div className="text-left leading-none">
                      <p className={`text-[11px] lg:text-xs font-black uppercase tracking-widest ${activeSection === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{item.label}</p>
                      <p className="text-[9px] font-bold opacity-50 mt-1.5 uppercase tracking-tighter">{item.sub}</p>
                    </div>
                  </div>
                  {item.isLocked ? <Lock size={14} className="opacity-30" /> : <ChevronRight size={18} className={`transition-transform duration-300 ${activeSection === item.id ? 'opacity-100 text-emerald-500 translate-x-1' : 'opacity-20'}`} />}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <section className={`flex-1 flex flex-col h-full lg:min-h-[70vh] bg-transparent lg:bg-white lg:dark:bg-[#0B1120] lg:border border-slate-200 lg:dark:border-slate-800 lg:rounded-4xl lg:shadow-sm overflow-hidden ${isMobileMenu ? "hidden lg:flex" : "flex"}`}>
            
            {/* Header (Visible only on Mobile when a tab is open) - Now completely seamless */}
            <div className="px-5 sm:px-8 pt-5 pb-2 flex items-center justify-between lg:hidden sticky top-0 z-20 bg-[#F8FAFC] dark:bg-[#020617]">
                <button onClick={() => setIsMobileMenu(true)} className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                    <ArrowLeft size={16} className="text-emerald-500" /> Settings
                </button>
            </div>
            
            {/* Scrollable Content - Added generous padding for mobile */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 py-6 lg:py-10 no-scrollbar">
                {renderContent()}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ExpenseSettings;