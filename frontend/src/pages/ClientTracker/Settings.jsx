import React, { useState, useEffect } from "react";
import {
  BarChart3, ShieldCheck, Bell, History, Save, Loader2, Landmark,
  UserCheck, Lock, Wallet, Terminal, ChevronRight, Users, GitBranch,
  ArrowLeft
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
import UserManagement from "../../components/Settings/UserManagement";
import WorkflowManagement from "../../components/Settings/WorkflowManagement";
import AccessDenied from "../../components/AccessDenied";

const Settings = () => {
  const { request, loading } = useApi();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState(user?.isAdmin ? "users" : "amcs");
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [thresholds, setThresholds] = useState({ diamond: 5, gold: 2, silver: 0.5, bronze: 0.1 });
  const [compliance, setCompliance] = useState({ arn: "", euin: "", disclaimer: "" });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalData = await request("/settings");
        if (globalData) {
          if (globalData.business?.thresholds) setThresholds(globalData.business.thresholds);
          if (globalData.compliance) setCompliance(globalData.compliance);
        }
        setIsDark(document.documentElement.classList.contains("dark"));
      } catch (err) { console.error(err); } finally { setIsInitialLoading(false); }
    };
    loadSettings();
  }, [request]);

  const toggleTheme = async () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    try {
      await request("/settings/preferences", "PATCH", { theme: newTheme });
      setUser({ ...user, preferences: { ...user?.preferences, theme: newTheme } });
    } catch { toast.error("Failed to save preference"); }
  };

  const handleGlobalSave = async () => {
    try {
      await request("/settings", "PUT", { business: { thresholds }, compliance });
      toast.success("Settings saved successfully.");
    } catch { toast.error("Failed to save changes."); }
  };

  const tabs = [
    { id: "users", label: "User Management", icon: Users, admin: true },
    { id: "amcs", label: "AMC Registry", icon: Landmark },
    { id: "arns", label: "ARN List", icon: UserCheck },
    { id: "accounts", label: "Bank Accounts", icon: Wallet, admin: true },
    { id: "business", label: "AUM Thresholds", icon: BarChart3 },
    { id: "data", label: "WE Sync", icon: History },
    { id: "workflows", label: "Workflow Engine", icon: GitBranch },
    { id: "tally", label: "Tally Ledgers", icon: Terminal },
    { id: "system", label: "Appearance", icon: Bell },
    { id: "compliance", label: "Compliance", icon: ShieldCheck, locked: true },
  ];

  const visibleTabs = tabs.filter(t => !t.admin || user?.isAdmin);

  const renderContent = () => {
    if ((activeTab === 'users' || activeTab === 'accounts') && !user?.isAdmin) return <AccessDenied />;
    switch (activeTab) {
      case "business": return <TierConfig thresholds={thresholds} setThresholds={setThresholds} />;
      case "users": return <UserManagement />;
      case "workflows": return <WorkflowManagement />;
      case "tally": return <TallyLedgerImport />;
      case "compliance": return <ComplianceConfig compliance={compliance} setCompliance={setCompliance} />;
      case "amcs": return <AmcManagement />;
      case "arns": return <ArnManagement />;
      case "accounts": return <BankAccounts />;
      case "system": return <AppearanceConfig isDark={isDark} onToggleTheme={toggleTheme} />;
      case "data": return <DataSync />;
      default: return null;
    }
  };

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20">
      <Navbar />

      <main className="w-full max-w-350 mx-auto pt-6 md:pt-10">
        <header className="px-6 mb-8 lg:mb-12">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Settings</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Configuration & System Control</p>
        </header>

        {/* Dashboard Container */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 min-h-[70vh]">
          
          {/* NAVIGATION SIDEBAR */}
          <aside className={`w-full lg:w-72 shrink-0 flex flex-col ${isMobileMenu ? "block" : "hidden lg:flex"}`}>
            <nav className="px-2 space-y-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsMobileMenu(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase transition-all rounded-lg
                    ${activeTab === tab.id 
                      ? "text-emerald-600 bg-emerald-50 dark:bg-white/5" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA - Transitions between "Page" look (mobile) and "Container" look (desktop) */}
          <section className={`flex-1 flex flex-col h-full overflow-hidden bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:border border-slate-200 dark:border-white/5 lg:rounded-3xl lg:shadow-sm ${isMobileMenu ? "hidden lg:flex" : "flex"}`}>
            
            {/* Header (Hidden on Desktop) */}
            <div className="px-6 py-6 border-b border-slate-100 dark:border-white/5 flex items-center lg:hidden">
                <button onClick={() => setIsMobileMenu(true)} className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <ArrowLeft size={14} /> Back
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
                {renderContent()}
            </div>

            {/* Sticky Action Footer */}
            {(activeTab === "business" || activeTab === "compliance") && (
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end shrink-0">
                <button
                    onClick={handleGlobalSave}
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                >
                    {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />} Commit Changes
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;