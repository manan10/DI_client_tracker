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
  LogOut,
  Building2,
  Receipt,
  SlidersHorizontal,
  Home,
  Settings as SettingsIcon,
} from "lucide-react";

// Hooks
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

// Assets & Layout
import Logo from "../../assets/logo_nobrand.png";
import WorkspaceShell from "../components/WorkspaceShell";

// Modular Subcomponents
import SettingsSection from "../components/Settings/SettingsSection";
import SettingsDetailView from "../components/Settings/SettingsDetailView";

/**
 * Settings Orchestrator
 * Controls app scoping, theme state, API synchronization, and card routing.
 */
const Settings = ({ mode, hideTopBar = false, navbar = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { request, loading } = useApi();
  const { user, setUser, logout } = useAuth();

  const [activeItem, setActiveItem] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // Load Warm Household Typography Suite when in Expense Tracker mode
  useEffect(() => {
    if (!isExpenseOnly) return;
    const linkId = "kharcha-paani-sage-fonts";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Lora:wght@600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, [isExpenseOnly]);

  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

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

  const [wallets, setWallets] = useState([]);

  // Read the active DOM theme first so switching tabs never overrides Light/Dark mode
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return localStorage.getItem("theme") === "dark";
  });

  // Keep Settings state in sync if the user toggles theme via the top Navbar
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const applyTheme = useCallback((nextDark) => {
    const root = document.documentElement;
    if (nextDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      localStorage.setItem("app-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      localStorage.setItem("app-theme", "light");
    }
    setIsDark(nextDark);
  }, []);

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
    const nextDark = !isDark;
    const nextTheme = nextDark ? "dark" : "light";
    applyTheme(nextDark);
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
      <div
        className={`min-h-screen w-full flex items-center justify-center ${
          isExpenseOnly
            ? "bg-[#F5F4F0] dark:bg-[#121315]"
            : "bg-[#F6F8FB] dark:bg-[#131720]"
        }`}
      >
        <Loader2
          className={`animate-spin ${
            isExpenseOnly
              ? "text-emerald-700 dark:text-[#4EA885]"
              : "text-sky-600 dark:text-sky-400"
          }`}
          size={32}
        />
      </div>
    );
  }

  const standaloneTopBar = isStandalone ? (
    <nav className="sticky top-0 z-40 bg-[#232730]/95 dark:bg-[#16181D]/95 backdrop-blur-2xl border-b border-stone-400/20 dark:border-white/10 text-white shadow-md dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 font-sans">
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-stone-400/40 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="relative flex justify-between items-center h-[72px]">
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

          {activeItem && (
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center rounded-xl p-1 shadow-inner z-10 bg-black/45 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-white/10 transition-all outline-none cursor-pointer"
              >
                <ArrowLeft size={14} className="text-sky-400" />
                <span>All Settings</span>
              </button>
              <span className="text-stone-600 text-xs px-1 select-none">/</span>
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/[0.12] border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                {selectedSetting?.label}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 z-20 font-sans">
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

            <div className="hidden sm:block w-px h-6 bg-white/15 mx-0.5" />

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
  ) : null;

  const pageDescription = isExpenseOnly
    ? "Manage family cash wallets, spending categories, monthly top-ups, and appearance preferences."
    : isClientOnly
    ? "Manage client tier rules, mutual fund AMCs, synchronization pipelines, and system users."
    : "Manage general platform preferences, client tracking rules, integrations, and treasury vaults.";

  const settingsContent = !activeItem ? (
    <div className="space-y-9 sm:space-y-10 animate-in fade-in duration-200">
      <SettingsSection
        variant={isExpenseOnly ? "expense" : "default"}
        title="General Settings"
        icon={SlidersHorizontal}
        iconColor="text-sky-600 dark:text-sky-400"
        iconBg="bg-sky-50 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-500/25"
        cards={generalCards}
        isAdmin={user?.isAdmin}
        onCardClick={setActiveItem}
      />

      {showClientSection && (
        <SettingsSection
          variant={isExpenseOnly ? "expense" : "default"}
          title="Client Tracker Operations"
          icon={Building2}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-500/25"
          cards={businessCards}
          isAdmin={user?.isAdmin}
          onCardClick={setActiveItem}
        />
      )}

      {showExpenseSection && (
        <SettingsSection
          variant={isExpenseOnly ? "expense" : "default"}
          title="Expense Tracker Management"
          icon={Receipt}
          iconColor="text-sky-600 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-500/25"
          cards={expenseCards}
          isAdmin={user?.isAdmin}
          onCardClick={setActiveItem}
        />
      )}
    </div>
  ) : (
    <SettingsDetailView
      variant={isExpenseOnly ? "expense" : "default"}
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
  );

  // Expense Tracker (Kharcha Paani) Warm Household Editorial Shell
  if (isExpenseOnly) {
    return (
      <div
        style={{
          fontFamily: "'Nunito Sans', sans-serif",
          "--kp-font-title": "'Lora', serif",
          "--kp-font-body": "'Nunito Sans', sans-serif",
          "--kp-font-mono": "'IBM Plex Mono', monospace",
        }}
        className="min-h-screen bg-[#F5F4F0] dark:bg-[#121315] text-stone-900 dark:text-stone-100 selection:bg-emerald-700/15 dark:selection:bg-[#4EA885]/25 overflow-x-hidden pb-32 relative transition-colors duration-200"
      >
        {navbar}

        {/* Warm Editorial Header Band */}
        <header className="relative z-10 w-full bg-[#FAF9F6] dark:bg-[#16181C] border-b border-stone-200/90 dark:border-white/[0.07]">
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold text-emerald-700 dark:text-[#68C19D]">
                  Kharcha Paani
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <SettingsIcon
                    size={12}
                    className="text-emerald-700 dark:text-[#68C19D]"
                  />
                  <span>Preferences</span>
                </span>
              </div>

              <h1
                style={{ fontFamily: "'Lora', serif" }}
                className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-none text-stone-950 dark:text-stone-50"
              >
                Settings
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 max-w-xl">
                {pageDescription}
              </p>
            </div>

            {activeItem && (
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 dark:bg-[#1A1C20] dark:hover:bg-[#22252C] text-xs font-bold text-stone-700 dark:text-stone-200 border border-stone-200/90 dark:border-white/[0.08] shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowLeft
                    size={14}
                    className="text-emerald-700 dark:text-[#68C19D]"
                  />
                  <span>Back to All Settings</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="relative z-10 w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14 pt-6 sm:pt-9">
          {settingsContent}
        </main>
      </div>
    );
  }

  // Default / Client Tracker WorkspaceShell (Sora Architectural Edition)
  return (
    <WorkspaceShell
      navbar={navbar || standaloneTopBar}
      badge="System Configuration"
      badgeIcon={SettingsIcon}
      title="Application"
      accent="Settings"
      description={pageDescription}
      rightSlot={
        activeItem ? (
          <button
            type="button"
            onClick={() => setActiveItem(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#161B26] dark:hover:bg-[#1C2230] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Back to All Settings</span>
          </button>
        ) : null
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>
      {settingsContent}
    </WorkspaceShell>
  );
};

export default Settings;