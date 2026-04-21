import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet as WalletIcon, Settings as SettingsIcon, Moon, Sun, 
  ShieldCheck, ChevronRight, Loader2, RotateCw, 
  FileSpreadsheet, ArrowLeft, UserPlus, Lock, Tags
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";
import ExpenseNavbar from "../../components/ExpenseNavbar";
import WalletManager from "../../components/ExpenseTracker/Settings/WalletManager";
import UserManager from "../../components/ExpenseTracker/Settings/UserManager";
import MonthlyRefill from "../../components/ExpenseTracker/Settings/MonthlyRefill";
import ThemeManager from "../../components/ExpenseTracker/Settings/ThemeManager"; 
import SpendingCategories from "../../components/ExpenseTracker/Settings/SpendingCategories/SpendingCategories"; // New Import

const ExpenseSettings = () => {
  const { request, loading } = useApi();
  const [activeSection, setActiveSection] = useState("main"); 
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
    { id: "categories", label: "Categories", sub: "Classification & Icon logic", icon: Tags, color: "text-rose-500" }, // Added New Item
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 font-sans pb-20 text-left">
      <ExpenseNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-10">
          
          <aside className={`w-full md:w-80 shrink-0 ${activeSection !== 'main' ? 'hidden md:block' : 'block'}`}>
            <div className="border-l-[6px] border-emerald-500 pl-6 mb-12">
              <h2 className="text-5xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Settings</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Family Command Center</p>
            </div>

            <nav className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all active:scale-[0.98] ${
                    activeSection === item.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xl' 
                    : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <item.icon size={22} className={activeSection === item.id ? '' : item.color} />
                    <div className="text-left leading-none">
                      <p className={`text-xs font-black uppercase tracking-widest ${activeSection === item.id ? 'text-inherit' : 'text-slate-900 dark:text-white'}`}>{item.label}</p>
                      <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-tighter">{item.sub}</p>
                    </div>
                  </div>
                  {item.isLocked ? <Lock size={14} className="opacity-40" /> : <ChevronRight size={18} className="opacity-30" />}
                </button>
              ))}
            </nav>
          </aside>

          <div className={`flex-1 bg-white dark:bg-[#0B1120] rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[65vh] flex flex-col ${activeSection === 'main' ? 'hidden md:flex' : 'flex'}`}>
            <div className="md:hidden p-6 border-b border-slate-100 dark:border-slate-800 text-left">
               <button onClick={() => setActiveSection("main")} className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <ArrowLeft size={18} /> Back
               </button>
            </div>

            <div className="flex-1 p-8 md:p-16">
              {activeSection === "main" && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20">
                  <SettingsIcon size={48} />
                </div>
              )}

              {activeSection === "access" && <UserManager />}
              {activeSection === "wallets" && <WalletManager wallets={wallets} onUpdate={loadDashboardData} />}
              {activeSection === "cycle" && <MonthlyRefill wallets={wallets} onRefill={handlePocketRefill} loading={loading} />}
              
              {/* Added New View */}
              {activeSection === "categories" && <SpendingCategories />}
              
              {activeSection === "appearance" && (
                <ThemeManager isDark={isDark} onToggle={toggleTheme} />
              )}

              {activeSection === "export" && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-8 animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                    <Lock size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Module Locked</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Authorization Pending</p>
                  </div>
                  <p className="max-w-xs text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Data export functionality is currently restricted. Please contact the system administrator to enable XLSX reports.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpenseSettings;