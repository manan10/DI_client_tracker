import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldCheck, Bell, History, Save, Loader2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

import Navbar from '../components/Navbar';
import TierConfig from '../components/Settings/TierConfig';
import ComplianceConfig from '../components/Settings/ComplianceConfig';
import AppearanceConfig from '../components/Settings/AppearanceConfig';
import SyncLog from '../components/Settings/SyncLog';

const Settings = () => {
  const { request, loading } = useApi();
  const { user, setUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('business');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Component States
  const [thresholds, setThresholds] = useState({ diamond: 5, gold: 2, silver: 0.5, bronze: 0.1 });
  const [compliance, setCompliance] = useState({ arn: '', euin: '', disclaimer: '' });
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  // 2. Fetch Data on Mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalData = await request('/settings');
        if (globalData) {
          if (globalData.business?.thresholds) {
            setThresholds(globalData.business.thresholds);
          }
          if (globalData.compliance) {
            setCompliance(globalData.compliance);
          }
        }
        // Sync local theme state with user preferences from Auth context
        if (user?.preferences) {
          setIsDark(user.preferences.theme === 'dark');
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadSettings();
    // Added dependencies to satisfy ESLint rules
  }, [request, user?.preferences]);

  // 3. Theme Toggle Logic (User-specific)
  const toggleTheme = async () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    
    // Immediate UI Feedback (DOM manipulation)
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Persist to User document in Backend
    try {
      await request('/settings/preferences', 'PATCH', { theme: newTheme });
      // Update local auth context so Navbar/Other pages stay in sync
      setUser({ ...user, preferences: { ...user?.preferences, theme: newTheme } });
    } catch {
      console.error("Failed to save theme preference");
    }
  };

  // 4. Global Save (Business & Compliance Logic)
  const handleGlobalSave = async () => {
    try {
      const payload = { 
        business: { thresholds }, 
        compliance 
      };
      await request('/settings', 'PUT', payload);
      alert("Business settings updated successfully!");
    } catch {
      alert("Failed to save global settings.");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'business': return <TierConfig thresholds={thresholds} setThresholds={setThresholds} />;
      case 'compliance': return <ComplianceConfig compliance={compliance} setCompliance={setCompliance} />;
      case 'system': return <AppearanceConfig isDark={isDark} onToggleTheme={toggleTheme} />;
      case 'data': return <SyncLog />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'business', label: 'Logic', fullLabel: 'Business Logic', icon: BarChart3 },
    { id: 'compliance', label: 'ARN', fullLabel: 'Compliance & ARN', icon: ShieldCheck },
    { id: 'system', label: 'Theme', fullLabel: 'Appearance', icon: Bell },
    { id: 'data', label: 'Sync', fullLabel: 'Sync History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 pb-24 lg:pb-0">
      <Navbar />
      
      <main className="max-w-[98%] mx-auto px-3 sm:px-6 lg:py-12 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          
          {/* Sidebar / Mobile Horizontal Nav */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-28">
            <div className="hidden lg:block mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Settings</h2>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mt-1">Portal Configuration</p>
            </div>

            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-3 px-3 lg:mx-0 lg:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none' 
                      : 'bg-white lg:bg-transparent dark:bg-slate-900 lg:dark:bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-100 lg:border-transparent dark:border-slate-800'
                  }`}
                >
                  <tab.icon size={16} className="lg:w-5 lg:h-5" />
                  <span className="lg:hidden">{tab.label}</span>
                  <span className="hidden lg:inline">{tab.fullLabel}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Card */}
          <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-3xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl lg:shadow-2xl relative min-h-125 lg:min-h-187.5 overflow-hidden">
            <div className="p-5 sm:p-8 lg:p-14 mb-20 lg:mb-0">
              {renderContent()}
            </div>

            {/* Sticky Save Button (Mobile) / Absolute (Desktop) */}
            {(activeTab === 'business' || activeTab === 'compliance') && (
              <div className="sticky lg:absolute bottom-0 left-0 right-0 p-4 lg:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex justify-center lg:justify-end items-center gap-6 z-20">
                 <span className="hidden lg:block text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                   Changes affect all distributor data
                 </span>
                 <button 
                  disabled={loading}
                  onClick={handleGlobalSave}
                  className="w-full lg:w-auto flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 lg:px-10 py-4 rounded-xl lg:rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all disabled:opacity-50 shadow-lg shadow-amber-200 dark:shadow-none"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                   Save Settings
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