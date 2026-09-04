import React, { useState, useEffect } from "react";
import {
  BarChart3,
  ShieldCheck,
  Bell,
  History,
  Save,
  Loader2,
  Landmark,
  UserCheck,
  Lock,
  Wallet,
  Terminal,
  ChevronRight,
  Users,
  GitBranch,
  ArrowLeft,
} from "lucide-react";
import { useApi } from "../../../shared/hooks/useApi";
import { useAuth } from "../../../shared/hooks/useAuth";
import { toast } from "sonner";

import Navbar from "../components/Shared/Navbar";
import AccessDenied from "../components/Shared/AccessDenied";

import TierConfig from "../components/Settings/TierConfig";
import ComplianceConfig from "../components/Settings/ComplianceConfig";
import AppearanceConfig from "../components/Settings/AppearanceConfig";
import AmcManagement from "../components/Settings/AmcManagement";
import ArnManagement from "../components/Settings/ArnManagement";
import BankAccounts from "../components/Settings/BankAccounts";
import DataSync from "../components/Settings/DataSync";
import TallyLedgerImport from "../components/Settings/TallyLedgerImport";
import UserManagement from "../components/Settings/UserManagement";
import WorkflowManagement from "../components/Settings/WorkflowManagement";
import DeviceRegistration from "../components/Settings/DeviceRegistration";

const Settings = () => {
  const { request } = useApi();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState(user?.isAdmin ? "users" : "amcs");
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalData = await request("/settings");
        if (globalData) {
          if (globalData.business?.thresholds)
            setThresholds(globalData.business.thresholds);
          if (globalData.compliance) setCompliance(globalData.compliance);
        }
        setIsDark(document.documentElement.classList.contains("dark"));
      } catch (err) {
        console.error(err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadSettings();
  }, [request]);

  const toggleTheme = async () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    try {
      await request("/settings/preferences", "PATCH", { theme: newTheme });
      setUser({
        ...user,
        preferences: { ...user?.preferences, theme: newTheme },
      });
    } catch {
      toast.error("Failed to save preference");
    }
  };

  const tabs = [
    {
      id: "users",
      label: "User Management",
      description: "Manage platform access, roles, and user permissions.",
      icon: Users,
      admin: true,
    },
    {
      id: "amcs",
      label: "AMC Registry",
      description: "Configure and map Asset Management Company ledgers.",
      icon: Landmark,
    },
    {
      id: "arns",
      label: "ARN List",
      description: "Manage mutual fund distribution ARN codes and compliances.",
      icon: UserCheck,
    },
    {
      id: "accounts",
      label: "Bank Accounts",
      description: "Configure system bank accounts and true-up balances.",
      icon: Wallet,
      admin: true,
    },
    {
      id: "business",
      label: "AUM Thresholds",
      description: "Set business logic and categorization thresholds for AUM.",
      icon: BarChart3,
    },
    {
      id: "data",
      label: "WE Sync",
      description: "Manage data synchronization with Wealth Elite systems.",
      icon: History,
    },
    {
      id: "workflows",
      label: "Workflow Engine",
      description: "Configure automated triggers and background processes.",
      icon: GitBranch,
    },
    {
      id: "tally",
      label: "Tally Ledgers",
      description: "Map and synchronize master ledgers with Tally ERP.",
      icon: Terminal,
    },
    {
      id: "system",
      label: "Appearance",
      description: "Customize the interface theme and visual preferences.",
      icon: Bell,
    },
    {
      id: "device",
      label: "Biometric Login",
      description: "Register devices for secure WebAuthn/Biometric access.",
      icon: Lock,
    },
    {
      id: "compliance",
      label: "Compliance",
      description: "Manage regulatory settings, disclaimers, and EUINs.",
      icon: ShieldCheck,
      locked: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => !t.admin || user?.isAdmin);
  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];

  const renderContent = () => {
    if ((activeTab === "users" || activeTab === "accounts") && !user?.isAdmin)
      return <AccessDenied />;
    switch (activeTab) {
      case "business":
        return (
          <TierConfig thresholds={thresholds} setThresholds={setThresholds} />
        );
      case "users":
        return <UserManagement />;
      case "workflows":
        return <WorkflowManagement />;
      case "tally":
        return <TallyLedgerImport />;
      case "compliance":
        return (
          <ComplianceConfig
            compliance={compliance}
            setCompliance={setCompliance}
          />
        );
      case "amcs":
        return <AmcManagement />;
      case "arns":
        return <ArnManagement />;
      case "accounts":
        return <BankAccounts />;
      case "system":
        return <AppearanceConfig isDark={isDark} onToggleTheme={toggleTheme} />;
      case "device":
        return <DeviceRegistration />;
      case "data":
        return <DataSync />;
      default:
        return null;
    }
  };

  if (isInitialLoading)
    return (
      <div className="h-screen flex items-center justify-center dark:bg-slate-950">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 overflow-hidden">
      <Navbar />

      <main className="flex-1 flex max-w-400 w-full mx-auto overflow-hidden bg-white dark:bg-[#0B1120] lg:border-x border-slate-200 dark:border-white/5 shadow-sm">
        {/* NAVIGATION SIDEBAR (LEFT PANE) */}
        <aside
          className={`w-full lg:w-80 shrink-0 flex flex-col bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 ${isMobileMenu ? "flex" : "hidden lg:flex"}`}
        >
          {/* Mobile-Only Header - Hidden on Desktop to prevent duplicate headings */}
          <div className="p-6 lg:hidden shrink-0 border-b border-transparent dark:border-white/5">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              System Control
            </p>
          </div>

          {/* Desktop Spacer */}
          <div className="hidden lg:block h-6 shrink-0"></div>

          {/* Scrollable Navigation List */}
          <nav className="flex-1 overflow-y-auto py-4 lg:py-0 space-y-1 no-scrollbar">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all
                    ${
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border-l-4 border-transparent"
                    }`}
                >
                  <tab.icon
                    size={18}
                    className={isActive ? "text-emerald-500" : "opacity-60"}
                  />
                  {tab.label}
                  <ChevronRight
                    size={16}
                    className={`ml-auto transition-transform ${isActive ? "opacity-100 translate-x-1" : "opacity-0 -translate-x-2"}`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT AREA (RIGHT PANE) */}
        <section
          className={`flex-1 flex flex-col h-full bg-white dark:bg-[#0B1120] relative ${isMobileMenu ? "hidden lg:flex" : "flex"}`}
        >
          {/* Mobile Back Button */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center lg:hidden bg-slate-50 dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setIsMobileMenu(true)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} /> Menu
            </button>
          </div>

          {/* Desktop Content Header (Unified Breadcrumb) */}
          <div className="hidden lg:flex flex-col px-10 py-8 border-b border-slate-100 dark:border-white/5 shrink-0 bg-white/50 dark:bg-[#0B1120]/50 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter italic">
                Settings
              </h1>
              <span className="text-slate-200 dark:text-slate-800 font-light text-2xl">
                /
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <activeTabData.icon
                  className="text-emerald-500"
                  size={22}
                  strokeWidth={2.5}
                />
                {activeTabData.label}
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {activeTabData.description}
            </p>
          </div>

          {/* Scrollable Settings View */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
            <div className="w-full max-w-400 mx-auto">{renderContent()}</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
