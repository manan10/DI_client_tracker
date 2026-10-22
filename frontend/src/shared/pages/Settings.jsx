import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Wallet as WalletIcon,
  Moon,
  Sun,
  RotateCw,
  FileSpreadsheet,
  ArrowLeft,
  Lock,
  Tags,
  Loader2,
  BarChart3,
  ShieldCheck,
  History,
  Landmark,
  UserCheck,
  Terminal,
  Users,
  GitBranch,
  Grid,
  LogOut,
  Building2,
  Receipt,
  SlidersHorizontal,
  Home,
} from "lucide-react";

// Hooks
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

// Assets & Headers
import Logo from "../../assets/logo_nobrand.png";
import PageHeader from "../components/Auth/PageHeader";

// Modular Subcomponents
import SettingsSection from "../components/Settings/SettingsSection";
import SettingsDetailView from "../components/Settings/SettingsDetailView";

/**
 * Settings Orchestrator
 * Controls app scoping, theme state, API synchronization, and card routing.
 */
const Settings = ({ mode, hideTopBar = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { request, loading } = useApi();
  const { user, setUser, logout } = useAuth();

  const [activeItem, setActiveItem] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Determine current routing mode
  const currentPath = location.pathname.toLowerCase();
  const effectiveMode =
    mode ||
    (currentPath.includes("/client")
      ? "client"
      : currentPath.includes("/expense")
      ? "expense"
      : "all");

  const isStandalone = effectiveMode === "all" && !hideTopBar;
  const isClientOnly = effectiveMode === "client";
  const isExpenseOnly = effectiveMode === "expense";

  // App Permissions for standalone route
  const userAllowedApps = user?.allowedApps || [];
  const canAccessClientApp =
    user?.isAdmin ||
    userAllowedApps.includes("CLIENT_TRACKER") ||
    userAllowedApps.includes("client-tracker");
  const canAccessExpenseApp =
    user?.isAdmin ||
    userAllowedApps.includes("EXPENSE_TRACKER") ||
    userAllowedApps.includes("expense-tracker");

  const showClientSection = isClientOnly || (isStandalone && canAccessClientApp);
  const showExpenseSection = isExpenseOnly || (isStandalone && canAccessExpenseApp);

  // User Initials Glyph
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  // Business state
  const [thresholds, setThresholds] = useState({
    diamond: 5,
    gold: 2,
    silver: 0.5,
    bronze: 0.1,
  });
  const [compliance, setCompliance] = useState({
    arn: "",
    euin: "",
    disclaimer: "",
  });

  // Expense state
  const [wallets, setWallets] = useState([]);
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      localStorage.getItem("app-theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      localStorage.setItem("app-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      localStorage.setItem("app-theme", "light");
    }
  }, [isDark]);

  const loadInitialData = useCallback(async () => {
    try {
      const calls = [];
      if (showClientSection) calls.push(request("/settings"));
      if (showExpenseSection) calls.push(request("/spending/summary"));

      const results = await Promise.allSettled(calls);

      results.forEach((res) => {
        if (res.status === "fulfilled" && res.value) {
          if (res.value.business?.thresholds) {
            setThresholds(res.value.business.thresholds);
          }
          if (res.value.compliance) {
            setCompliance(res.value.compliance);
          }
          if (res.value.wallets) {
            setWallets(res.value.wallets);
          }
        }
      });
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [request, showClientSection, showExpenseSection]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const toggleTheme = async () => {
    const nextTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    try {
      await request("/settings/preferences", "PATCH", { theme: nextTheme });
      if (setUser && user) {
        setUser({
          ...user,
          preferences: { ...user?.preferences, theme: nextTheme },
        });
      }
    } catch {
      //
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const handlePocketRefill = async () => {
    try {
      await request("/spending/process-allowance", "POST");
      toast.success("Balances Refilled", {
        description: "Monthly limits added successfully.",
      });
      loadInitialData();
    } catch (err) {
      toast.error("Refill Failed", { description: err.message });
    }
  };

  // 1. General System Modules
  const generalCards = useMemo(
    () => [
      {
        id: "gen-team",
        app: "General Settings",
        label: "Users",
        sub: "Staff & users",
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-purple-600 dark:hover:border-purple-400",
        bgLight: "bg-purple-500/10",
        adminOnly: true,
      },
      {
        id: "gen-device",
        app: "General Settings",
        label: "Biometrics",
        sub: "Passkey login",
        icon: Lock,
        color: "text-rose-600 dark:text-rose-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-rose-600 dark:hover:border-rose-400",
        bgLight: "bg-rose-500/10",
      },
      {
        id: "gen-theme",
        app: "General Settings",
        label: "Themes",
        sub: "Dark & light",
        icon: isDark ? Sun : Moon,
        color: "text-amber-600 dark:text-amber-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-amber-600 dark:hover:border-amber-400",
        bgLight: "bg-amber-500/10",
      },
    ],
    [isDark]
  );

  // 2. Client Tracker Business Modules
  const businessCards = useMemo(
    () => [
      {
        id: "biz-amcs",
        app: "Client Tracker",
        label: "AMCs",
        sub: "Fund houses",
        icon: Landmark,
        color: "text-emerald-600 dark:text-emerald-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-emerald-600 dark:hover:border-emerald-400",
        bgLight: "bg-emerald-500/10",
      },
      {
        id: "biz-arns",
        app: "Client Tracker",
        label: "ARNs",
        sub: "Distributor codes",
        icon: UserCheck,
        color: "text-blue-600 dark:text-blue-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-blue-600 dark:hover:border-blue-400",
        bgLight: "bg-blue-500/10",
      },
      {
        id: "biz-accounts",
        app: "Client Tracker",
        label: "Accounts",
        sub: "Bank balances",
        icon: WalletIcon,
        color: "text-indigo-600 dark:text-indigo-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-indigo-600 dark:hover:border-indigo-400",
        bgLight: "bg-indigo-500/10",
        adminOnly: true,
      },
      {
        id: "biz-business",
        app: "Client Tracker",
        label: "Tiers",
        sub: "Client logic",
        icon: BarChart3,
        color: "text-amber-600 dark:text-amber-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-amber-600 dark:hover:border-amber-400",
        bgLight: "bg-amber-500/10",
      },
      {
        id: "biz-data",
        app: "Client Tracker",
        label: "WE Sync",
        sub: "Wealth Elite",
        icon: History,
        color: "text-teal-600 dark:text-teal-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-teal-600 dark:hover:border-teal-400",
        bgLight: "bg-teal-500/10",
      },
      {
        id: "biz-workflows",
        app: "Client Tracker",
        label: "Workflows",
        sub: "Background jobs",
        icon: GitBranch,
        color: "text-sky-600 dark:text-sky-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-sky-600 dark:hover:border-sky-400",
        bgLight: "bg-sky-500/10",
      },
      {
        id: "biz-tally",
        app: "Client Tracker",
        label: "Tally Link",
        sub: "Ledger import",
        icon: Terminal,
        color: "text-slate-600 dark:text-slate-300",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-slate-600 dark:hover:border-slate-300",
        bgLight: "bg-slate-500/10",
      },
      {
        id: "biz-compliance",
        app: "Client Tracker",
        label: "Rules",
        sub: "Disclaimers",
        icon: ShieldCheck,
        color: "text-slate-400 dark:text-slate-500",
        border: "border-slate-300 dark:border-slate-800 hover:border-slate-500",
        bgLight: "bg-slate-500/10",
        isLocked: true,
      },
    ],
    []
  );

  // 3. Expense Modules
  const expenseCards = useMemo(
    () => [
      {
        id: "exp-wallets",
        app: "Expense Tracker",
        label: "Wallets",
        sub: `${wallets.length} active`,
        icon: WalletIcon,
        color: "text-emerald-600 dark:text-emerald-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-emerald-600 dark:hover:border-emerald-400",
        bgLight: "bg-emerald-500/10",
      },
      {
        id: "exp-categories",
        app: "Expense Tracker",
        label: "Categories",
        sub: "Expense tags",
        icon: Tags,
        color: "text-rose-600 dark:text-rose-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-rose-600 dark:hover:border-rose-400",
        bgLight: "bg-rose-500/10",
      },
      {
        id: "exp-cycle",
        app: "Expense Tracker",
        label: "Top-Up",
        sub: "Monthly pool",
        icon: RotateCw,
        color: "text-blue-600 dark:text-blue-400",
        border:
          "border-slate-300 dark:border-slate-700/80 hover:border-blue-600 dark:hover:border-blue-400",
        bgLight: "bg-blue-500/10",
      },
      {
        id: "exp-export",
        app: "Expense Tracker",
        label: "Export",
        sub: "Excel XLSX",
        icon: FileSpreadsheet,
        color: "text-slate-400 dark:text-slate-500",
        border: "border-slate-300 dark:border-slate-800 hover:border-slate-500",
        bgLight: "bg-slate-500/10",
        isLocked: true,
      },
    ],
    [wallets.length]
  );

  const allCards = useMemo(
    () => [...generalCards, ...businessCards, ...expenseCards],
    [generalCards, businessCards, expenseCards]
  );

  const selectedSetting = allCards.find((c) => c.id === activeItem);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#060913]">
        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20 pb-28">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* ========================================================================= */}
      {/* TOP COMMAND BAR (Inspired by Dalal Portal Navbar UI)                       */}
      {/* ========================================================================= */}
      {isStandalone && (
        <nav className="sticky top-0 z-40 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl border-b border-stone-400/20 dark:border-white/10 text-white shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 font-sans">
          {/* Subtle horizon line flare */}
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-stone-400/40 to-transparent pointer-events-none" />

          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
            <div className="relative flex justify-between items-center h-[72px]">
              
              {/* --- LEFT: LOGO & BRAND TITLE --- */}
              <div className="flex items-center shrink-0 min-w-0 z-20">
                <Link to="/settings" className="group outline-none min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img
                      src={Logo}
                      alt="Dalal Investments"
                      className="h-8 sm:h-8.5 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
                      <span className="text-[13px] sm:text-base font-serif font-bold text-white tracking-tight leading-tight sm:leading-none">
                        Dalal Investments
                      </span>
                      <span className="hidden sm:inline text-stone-500 font-light select-none text-xs">
                        |
                      </span>
                      <span className="text-[10px] sm:text-xs font-sans font-medium text-stone-400 leading-tight sm:leading-none tracking-wide sm:tracking-normal">
                        All Settings
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* --- CENTER: TACTILE DECK RAIL (When active item is selected) --- */}
              {activeItem && (
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-black/45 border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                  >
                    <ArrowLeft size={14} className="text-emerald-400" />
                    <span>All Settings</span>
                  </button>
                  <span className="text-stone-600 text-xs px-1 select-none">/</span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                    {selectedSetting?.label}
                  </span>
                </div>
              )}

              {/* --- RIGHT: ACTIONS & DISCRETE GLYPH USER PROFILE --- */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 z-20 font-sans">
                
                {/* Utility Dock (App Switcher & Theme Toggle) */}
                <div className="flex items-center p-0.5 rounded-lg bg-black/25 border border-white/10">
                  <Link
                    to="/app-picker"
                    className="flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none"
                    aria-label="App Switcher"
                    title="App Switcher"
                  >
                    <Home size={16} strokeWidth={2.2} />
                  </Link>

                  <div className="w-px h-4 bg-white/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
                    aria-label="Toggle Theme"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDark ? (
                      <Sun size={16} strokeWidth={2.2} className="text-amber-400" />
                    ) : (
                      <Moon size={16} strokeWidth={2.2} className="text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Hardware Vertical Divider */}
                <div className="hidden sm:block w-px h-6 bg-white/15 mx-0.5" />

                {/* User Profile Glyph & Logout */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-white/15 text-white border border-white/30 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                    title={
                      user?.name
                        ? `${user.name} (${user?.isAdmin ? "Admin" : "Staff"})`
                        : "User"
                    }
                  >
                    {userInitials}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer outline-none"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </nav>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1840px] mx-auto px-4 sm:px-8 xl:px-14 2xl:px-20 pt-6 sm:pt-8 flex flex-col gap-8">
        
        {/* VIEW 1: OVERVIEW CARD GRID */}
        {!activeItem ? (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="pt-1">
              <PageHeader
                title="Application"
                accent="Settings"
                description={
                  isExpenseOnly
                    ? "Manage family cash vaults, spending tags, top-ups, and appearance preferences."
                    : isClientOnly
                    ? "Manage client tier rules, mutual fund AMCs, synchronization pipelines, and system users."
                    : "Manage general platform preferences, client tracking rules, integrations, and treasury vaults."
                }
              />
            </div>

            {/* General Settings Section */}
            <SettingsSection
              title="General Settings"
              icon={SlidersHorizontal}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-500/10 border-purple-500/20"
              cards={generalCards}
              isAdmin={user?.isAdmin}
              onCardClick={setActiveItem}
            />

            {/* Client Tracker Operations Section */}
            {showClientSection && (
              <SettingsSection
                title="Client Tracker Operations"
                icon={Building2}
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-500/10 border-emerald-500/20"
                cards={businessCards}
                isAdmin={user?.isAdmin}
                onCardClick={setActiveItem}
              />
            )}

            {/* Expense Tracker Management Section */}
            {showExpenseSection && (
              <SettingsSection
                title="Expense Tracker Management"
                icon={Receipt}
                iconColor="text-rose-600 dark:text-rose-400"
                iconBg="bg-rose-500/10 border-rose-500/20"
                cards={expenseCards}
                isAdmin={user?.isAdmin}
                onCardClick={setActiveItem}
              />
            )}
          </div>
        ) : (
          /* VIEW 2: ACTIVE DETAIL VIEW */
          <SettingsDetailView
            selectedSetting={selectedSetting}
            isAdmin={user?.isAdmin}
            thresholds={thresholds}
            setThresholds={setThresholds}
            compliance={compliance}
            setCompliance={setCompliance}
            wallets={wallets}
            loadInitialData={loadInitialData}
            isDark={isDark}
            toggleTheme={toggleTheme}
            handlePocketRefill={handlePocketRefill}
            loading={loading}
            onBack={() => setActiveItem(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;