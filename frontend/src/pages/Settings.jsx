import React, { useState, useEffect } from 'react';
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
  Wallet // New Icon for Bank Accounts
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

import Navbar from '../components/Navbar';
import TierConfig from '../components/Settings/TierConfig';
import ComplianceConfig from '../components/Settings/ComplianceConfig';
import AppearanceConfig from '../components/Settings/AppearanceConfig';
import AmcManagement from '../components/Settings/AmcManagement';
import ArnManagement from '../components/Settings/ArnManagement';
import BankAccounts from '../components/Settings/BankAccounts'; // Import new component
import DataSync from '../components/Settings/DataSync';

const Settings = () => {
  const { request, loading } = useApi();
  const { user, setUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('business');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [thresholds, setThresholds] = useState({ diamond: 5, gold: 2, silver: 0.5, bronze: 0.1 });
  const [compliance, setCompliance] = useState({ arn: '', euin: '', disclaimer: '' });
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalData = await request('/settings');
        if (globalData) {
          if (globalData.business?.thresholds) setThresholds(globalData.business.thresholds);
          if (globalData.compliance) setCompliance(globalData.compliance);
        }
        if (user?.preferences) setIsDark(user.preferences.theme === 'dark');
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadSettings();
  }, [request, user?.preferences]);

  const toggleTheme = async () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');

    try {
      await request('/settings/preferences', 'PATCH', { theme: newTheme });
      setUser({ ...user, preferences: { ...user?.preferences, theme: newTheme } });
      toast.success(`Theme updated to ${newTheme}`);
    } catch (err) {
      alert(`Error Name: ${err.name} | Message: ${err.message}`);
      toast.error("Failed to save theme preference");
    }
  };

  const handleGlobalSave = async () => {
    try {
      const payload = { business: { thresholds }, compliance };
      await request('/settings', 'PUT', payload);
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Failed to save global settings.");
    }
  };

  // 1. Updated Tab list with Bank Accounts
  const tabs = [
    { id: 'business', label: 'Logic', fullLabel: 'AUM Thresholds', icon: BarChart3, locked: false },
    { id: 'amcs', label: 'AMCs', fullLabel: 'AMC Registry', icon: Landmark, locked: false },
    { id: 'arns', label: 'ARNs', fullLabel: 'ARN List', icon: UserCheck, locked: false },
    { id: 'accounts', label: 'Banks', fullLabel: 'Bank Accounts', icon: Wallet, locked: false },
    { id: 'system', label: 'Theme', fullLabel: 'Appearance', icon: Bell, locked: false },
    { id: 'data', label: 'Sync', fullLabel: 'Wealth Elite Sync', icon: History },
    { id: 'compliance', label: 'ARN', fullLabel: 'Compliance', icon: ShieldCheck, locked: true },
  ];

  // 2. Updated Render Content with Bank Accounts case
  const renderContent = () => {
    switch (activeTab) {
      case 'business': return <TierConfig thresholds={thresholds} setThresholds={setThresholds} />;
      case 'compliance': return <ComplianceConfig compliance={compliance} setCompliance={setCompliance} />;
      case 'amcs': return <AmcManagement />;
      case 'arns': return <ArnManagement />;
      case 'accounts': return <BankAccounts />; // Integrated here
      case 'system': return <AppearanceConfig isDark={isDark} onToggleTheme={toggleTheme} />;
      case 'data': return <DataSync />;
      default: return null;
    }
  };

  const handleTabClick = (tab) => {
    if (tab.locked) {
      toast.info("Module Locked", {
        description: `${tab.fullLabel} is currently under maintenance.`,
        icon: <Lock size={16} className="text-amber-500" />
      });
      return;
    }
    setActiveTab(tab.id);
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-500" size={40} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Portal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 pb-24 lg:pb-0">
      <Navbar />
      
      <main className="max-w-[98%] mx-auto px-3 sm:px-6 lg:py-12 py-6">
        <div className="lg:hidden mb-6 px-2">
          <h2 className="text-3xl font-[1000] text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic leading-none">Settings</h2>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">Portal Configuration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          
          <aside className="w-full lg:w-72 lg:sticky lg:top-28 z-40">
            <div className="hidden lg:block mb-8 px-2">
              <h2 className="text-4xl font-[1000] text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic">Settings</h2>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">Portal Configuration</p>
            </div>

            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2 w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  disabled={tab.locked}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-4 rounded-2xl text-[10px] lg:text-[11px] font-[1000] uppercase tracking-widest transition-all duration-300 relative group
                    ${tab.locked ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/50' : ''}
                    ${!tab.locked && activeTab === tab.id 
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xl scale-[1.02]' 
                      : !tab.locked ? 'bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-100 lg:border-transparent dark:border-slate-800' : ''
                    }`}
                >
                  <tab.icon size={18} strokeWidth={2.5} className="shrink-0" />
                  <span className="lg:hidden">{tab.label}</span>
                  <span className="hidden lg:inline">{tab.fullLabel}</span>
                  
                  {tab.locked && (
                    <Lock size={12} className="ml-auto text-slate-400 group-hover:text-amber-500 transition-colors" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-4xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative min-h-125 flex flex-col overflow-hidden">
            <div className="flex-1 p-5 sm:p-10 lg:p-16">
              {renderContent()}
            </div>

            {(activeTab === 'business' || activeTab === 'compliance') && (
              <div className="sticky bottom-0 left-0 right-0 p-6 lg:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-between items-center z-50">
                <div className="hidden lg:flex items-center gap-3 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Live logic synchronization enabled
                  </span>
                </div>
                
                <button 
                  disabled={loading}
                  onClick={handleGlobalSave}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
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