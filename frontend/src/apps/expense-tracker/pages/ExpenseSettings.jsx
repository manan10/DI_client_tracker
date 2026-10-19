import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet as WalletIcon,
  Settings as SettingsIcon,
  Moon,
  Sun,
  RotateCw,
  FileSpreadsheet,
  ArrowLeft,
  UserPlus,
  Lock,
  Tags,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { toast } from "sonner";

import ExpenseNavbar from "../components/ExpenseNavbar";
import WalletManager from "../components/Settings/WalletManager";
import UserManager from "../components/Settings/UserManager";
import MonthlyRefill from "../components/Settings/MonthlyRefill";
import ThemeManager from "../components/Settings/ThemeManager";
import SpendingCategories from "../components/Settings/SpendingCategories/SpendingCategories";

const ExpenseSettings = () => {
  const { request, loading } = useApi();
  const [activeSection, setActiveSection] = useState("wallets");
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [wallets, setWallets] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await request("/spending/summary");
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
    localStorage.setItem("theme", newTheme);
    toast.success(`Appearance set to ${newTheme.toUpperCase()}`);
  };

  const handlePocketRefill = async () => {
    try {
      await request("/spending/process-allowance", "POST");
      toast.success("Balances Refilled", {
        description: "Monthly limits added successfully.",
      });
      loadDashboardData();
    } catch (err) {
      toast.error("Refill Failed", { description: err.message });
    }
  };

  const menuItems = [
    {
      id: "wallets",
      label: "Wallets",
      sub: "Manage members & monthly goals",
      badge: `${wallets.length} Active`,
      icon: WalletIcon,
      color: "text-emerald-500",
      bgLight: "bg-emerald-500/10",
      borderLight: "border-emerald-500/20",
    },
    {
      id: "categories",
      label: "Categories",
      sub: "Classification & icon logic",
      badge: "Taxonomy",
      icon: Tags,
      color: "text-rose-500",
      bgLight: "bg-rose-500/10",
      borderLight: "border-rose-500/20",
    },
    {
      id: "access",
      label: "Access Control",
      sub: "Family members & security",
      badge: "Security",
      icon: UserPlus,
      color: "text-purple-500",
      bgLight: "bg-purple-500/10",
      borderLight: "border-purple-500/20",
    },
    {
      id: "cycle",
      label: "Monthly Top-ups",
      sub: "Execute refill protocol",
      badge: "Cycle",
      icon: RotateCw,
      color: "text-blue-500",
      bgLight: "bg-blue-500/10",
      borderLight: "border-blue-500/20",
    },
    {
      id: "appearance",
      label: "Theme",
      sub: "Visual mode configuration",
      badge: isDark ? "Dark" : "Light",
      icon: isDark ? Sun : Moon,
      color: "text-amber-500",
      bgLight: "bg-amber-500/10",
      borderLight: "border-amber-500/20",
    },
    {
      id: "export",
      label: "Download Data",
      sub: "Export spending to XLSX",
      badge: "Locked",
      icon: FileSpreadsheet,
      color: "text-slate-400",
      bgLight: "bg-slate-500/10",
      borderLight: "border-slate-500/20",
      isLocked: true,
    },
  ];

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={32} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "access":
        return <UserManager />;
      case "wallets":
        return <WalletManager wallets={wallets} onUpdate={loadDashboardData} />;
      case "cycle":
        return (
          <MonthlyRefill
            wallets={wallets}
            onRefill={handlePocketRefill}
            loading={loading}
          />
        );
      case "categories":
        return <SpendingCategories />;
      case "appearance":
        return <ThemeManager isDark={isDark} onToggle={toggleTheme} />;
      case "export":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 sm:py-20 space-y-4">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/10">
              <Lock size={24} />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100">
                Module <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Locked</span>
              </h3>
              <p className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                Data export functionality is currently restricted. Please contact
                the system administrator to enable spreadsheet downloads.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
            <SettingsIcon size={44} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 pb-20">
      <ExpenseNavbar />

      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-8 flex flex-col gap-6">
        {/* Title & Explainer Header */}
        <header
          className={`pb-5 border-b border-slate-200 dark:border-white/10 ${
            !isMobileMenu ? "hidden lg:block" : "block"
          }`}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Expense <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Settings</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm lg:text-base font-sans font-normal text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Track category breakdown shifts, analyze multi-month outflow patterns, and monitor your household liquidity reserves in real time.
            </p>
          </div>
        </header>

        {/* Dashboard Container */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 min-h-[72vh] items-start">
          {/* NAVIGATION SIDEBAR */}
          <aside
            className={`w-full lg:w-84 shrink-0 flex flex-col ${
              isMobileMenu ? "block" : "hidden lg:flex"
            }`}
          >
            {/* On mobile: stripped outer box; on desktop: clean rounded container */}
            <div className="bg-transparent lg:bg-white lg:dark:bg-[#0B1120] border-0 lg:border border-slate-200 lg:dark:border-white/10 rounded-none lg:rounded-xl p-0 lg:p-3 shadow-none lg:shadow-xs flex flex-col gap-1.5">
              <nav className="flex flex-col gap-1.5 sm:gap-1">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 sm:p-3 rounded-xl lg:rounded-lg transition-all duration-150 cursor-pointer outline-none active:scale-[0.99] border text-left ${
                        isActive
                          ? "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-500/50 dark:border-emerald-500/40 shadow-xs"
                          : "bg-white dark:bg-[#0B1120] lg:bg-transparent border-slate-200/70 dark:border-white/5 lg:border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-200 dark:hover:border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 sm:gap-3 min-w-0 pr-2">
                        <div
                          className={`w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive
                              ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                              : `${item.bgLight} ${item.color}${item.borderLight}`
                          }`}
                        >
                          <item.icon size={18} strokeWidth={2.3} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-xs sm:text-[13px] font-sans font-semibold tracking-tight truncate ${
                              isActive
                                ? "text-emerald-950 dark:text-emerald-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.sub}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-sans font-medium tracking-wide px-2 sm:px-1.5 py-0.5 rounded border ${
                              isActive
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.isLocked ? (
                          <Lock size={14} className="text-slate-400 opacity-60" />
                        ) : (
                          <ChevronRight
                            size={16}
                            className={`transition-transform duration-150 ${
                              isActive
                                ? "text-emerald-600 dark:text-emerald-400 translate-x-0.5"
                                : "text-slate-400 opacity-40"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <section
            className={`flex-1 w-full flex flex-col bg-transparent lg:bg-white lg:dark:bg-[#0B1120] border-0 lg:border border-slate-200 lg:dark:border-white/10 rounded-none lg:rounded-xl shadow-none lg:shadow-xs min-h-[640px] ${
              isMobileMenu ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Mobile Sub-Header */}
            <div className="pt-1 pb-4 flex items-center justify-between lg:hidden border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsMobileMenu(true)}
                className="flex items-center gap-2 text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={16} className="text-emerald-500" /> Back to Settings
              </button>
              <span className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
                {menuItems.find((m) => m.id === activeSection)?.label}
              </span>
            </div>

            {/* Scrollable Content Viewport */}
            <div className="flex-1 py-4 sm:py-6 lg:p-8 no-scrollbar">
              {renderContent()}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ExpenseSettings;