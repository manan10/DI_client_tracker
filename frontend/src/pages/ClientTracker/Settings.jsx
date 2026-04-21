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
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

import Navbar from "../../components/Navbar";
import TierConfig from "../../components/Settings/TierConfig";
import ComplianceConfig from "../../components/Settings/ComplianceConfig";
import AppearanceConfig from "../../components/Settings/AppearanceConfig";
import AmcManagement from "../../components/Settings/AmcManagement";
import ArnManagement from "../../components/Settings/ArnManagement";
import BankAccounts from "../../components/Settings/BankAccounts";
import DataSync from "../../components/Settings/DataSync";
import TallyLedgerImport from "../../components/Settings/TallyLedgerImport";

const Settings = () => {
  const { request, loading } = useApi();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState("business");
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
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalData = await request("/settings");
        if (globalData) {
          if (globalData.business?.thresholds)
            setThresholds(globalData.business.thresholds);
          if (globalData.compliance) setCompliance(globalData.compliance);
        }
        if (user?.preferences) setIsDark(user.preferences.theme === "dark");
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadSettings();
  }, [request, user?.preferences]);

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
      toast.success(`Theme updated to ${newTheme}`);
    } catch {
      toast.error("Failed to save theme preference");
    }
  };

  const handleGlobalSave = async () => {
    try {
      const payload = { business: { thresholds }, compliance };
      await request("/settings", "PUT", payload);
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Failed to save global settings.");
    }
  };

  const tabs = [
    {
      id: "business",
      label: "Logic",
      fullLabel: "AUM Thresholds",
      icon: BarChart3,
      locked: false,
    },
    {
      id: "tally",
      label: "Tally",
      fullLabel: "Import Ledgers",
      icon: Terminal,
      locked: false,
    },
    {
      id: "amcs",
      label: "AMCs",
      fullLabel: "AMC Registry",
      icon: Landmark,
      locked: false,
    },
    {
      id: "arns",
      label: "ARNs",
      fullLabel: "ARN List",
      icon: UserCheck,
      locked: false,
    },
    {
      id: "accounts",
      label: "Banks",
      fullLabel: "Bank Accounts",
      icon: Wallet,
      locked: false,
    },
    {
      id: "system",
      label: "Theme",
      fullLabel: "Appearance",
      icon: Bell,
      locked: false,
    },
    {
      id: "data",
      label: "Sync",
      fullLabel: "WE Sync",
      icon: History,
      locked: false,
    },
    {
      id: "compliance",
      label: "Compliance",
      fullLabel: "Compliance",
      icon: ShieldCheck,
      locked: true,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "business":
        return (
          <TierConfig thresholds={thresholds} setThresholds={setThresholds} />
        );
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
      case "data":
        return <DataSync />;
      default:
        return null;
    }
  };

  const handleTabClick = (tab) => {
    if (tab.locked) {
      toast.info("Module Locked", {
        description: `${tab.fullLabel} is currently under maintenance.`,
        icon: <Lock size={16} className="text-emerald-500" />,
      });
      return;
    }
    setActiveTab(tab.id);
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#08090A]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">
            Synchronizing Core
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#08090A] transition-colors duration-500 pb-24 lg:pb-0 font-sans">
      <Navbar />

      <main className="max-w-[98%] mx-auto px-4 sm:px-8 lg:py-16 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-10 border-l-8 border-emerald-500 pl-6">
          <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic leading-none">
            Settings
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            Control & Configuration
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Navigation Aside */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-32 z-40">
            <div className="hidden lg:block mb-12 border-l-8 border-slate-950 dark:border-emerald-500 pl-8">
              <h2 className="text-5xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic leading-none">
                Settings
              </h2>
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] mt-3">
                Portal Engine
              </p>
            </div>

            <nav className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-col gap-3 w-full">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    disabled={tab.locked}
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center gap-4 px-6 py-5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative group overflow-hidden
                      ${tab.locked ? "opacity-30 grayscale cursor-not-allowed bg-slate-50 dark:bg-white/5" : ""}
                      ${
                        isActive
                          ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-[1.02] border-l-8 border-emerald-500"
                          : "bg-white dark:bg-[#111218] text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-100 dark:border-white/5"
                      }`}
                  >
                    <tab.icon
                      size={18}
                      strokeWidth={isActive ? 3 : 2}
                      className="shrink-0 transition-transform group-hover:scale-110"
                    />
                    <span className="truncate">{tab.fullLabel}</span>

                    {!tab.locked && isActive && (
                      <ChevronRight
                        size={14}
                        className="ml-auto animate-in slide-in-from-left-2"
                      />
                    )}

                    {tab.locked && (
                      <Lock size={12} className="ml-auto opacity-50" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Stage */}
          <div className="flex-1 w-full bg-white dark:bg-[#0E1012] border border-slate-100 dark:border-white/5 shadow-[20px_20px_60px_rgba(0,0,0,0.02)] dark:shadow-none relative min-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex-1 p-6 md:p-12 lg:p-20">{renderContent()}</div>

            {/* Sticky Save Bar for specific tabs */}
            {(activeTab === "business" || activeTab === "compliance") && (
              <div className="sticky bottom-0 left-0 right-0 p-8 lg:px-20 bg-white/90 dark:bg-[#0E1012]/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center z-50 gap-6">
                <div className="hidden lg:flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Auto-validation engine active
                  </span>
                </div>

                <button
                  disabled={loading}
                  onClick={handleGlobalSave}
                  className="w-full md:w-auto flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-16 py-6 font-black text-xs uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-2xl"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Commit Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
