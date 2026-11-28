import React from "react";
import { ArrowLeft, Lock } from "lucide-react";

// Client Tracker Subcomponents
import AccessDenied from "../../../apps/client-tracker/components/Shared/AccessDenied";
import TierConfig from "../../components/Settings/AllSettings/TierConfig"; 
import ComplianceConfig from "../../components/Settings/AllSettings/ComplianceConfig";
import AmcManagement from "../../components/Settings/AllSettings/AmcManagement";
import ArnManagement from "../../components/Settings/AllSettings/ArnManagement";
import BankAccounts from "../../components/Settings/AllSettings/BankAccounts";
import DataSync from "../../components/Settings/AllSettings/DataSync";
import TallyLedgerImport from "../../components/Settings/AllSettings/TallyLedgerImport";
import UserManagement from "../../components/Settings/AllSettings/UserManagement";
import WorkflowManagement from "../../components/Settings/AllSettings/WorkflowManagement";
import DeviceRegistration from "../../components/Settings/AllSettings/DeviceRegistration";

// Expense Tracker Subcomponents
import WalletManager from "../../components/Settings/AllSettings/WalletManager";
import MonthlyRefill from "../../components/Settings/AllSettings/MonthlyRefill";
import ThemeManager from "../../components/Settings/AllSettings/ThemeManager";
import SpendingCategories from "../../components/Settings/AllSettings/SpendingCategories/SpendingCategories";

/**
 * SettingsDetailView
 * Wraps the full view when a settings card is opened, providing breadcrumb back buttons and component mounting.
 */
const SettingsDetailView = ({
  variant = "default",
  selectedSetting,
  isAdmin,
  thresholds,
  setThresholds,
  compliance,
  setCompliance,
  wallets,
  loadInitialData,
  isDark,
  toggleTheme,
  handlePocketRefill,
  loading,
  onBack,
}) => {
  if (!selectedSetting) return null;

  const isExpense = variant === "expense";
  const isSelectedAdminProtected = selectedSetting.adminOnly && !isAdmin;

  const renderContent = () => {
    if (isSelectedAdminProtected) {
      return <AccessDenied />;
    }

    switch (selectedSetting.id) {
      // General Views
      case "gen-team":
        return <UserManagement />;
      case "gen-device":
        return <DeviceRegistration />;
      case "gen-theme":
        return <ThemeManager isDark={isDark} onToggle={toggleTheme} />;

      // Business Views
      case "biz-amcs":
        return <AmcManagement />;
      case "biz-arns":
        return <ArnManagement />;
      case "biz-accounts":
        return <BankAccounts />;
      case "biz-business":
        return <TierConfig thresholds={thresholds} setThresholds={setThresholds} />;
      case "biz-data":
        return <DataSync />;
      case "biz-workflows":
        return <WorkflowManagement />;
      case "biz-tally":
        return <TallyLedgerImport />;
      case "biz-compliance":
        return (
          <ComplianceConfig
            compliance={compliance}
            setCompliance={setCompliance}
          />
        );

      // Expense Views
      case "exp-wallets":
        return <WalletManager wallets={wallets} onUpdate={loadInitialData} />;
      case "exp-categories":
        return <SpendingCategories />;
      case "exp-cycle":
        return (
          <MonthlyRefill
            wallets={wallets}
            onRefill={handlePocketRefill}
            loading={loading}
          />
        );
      case "exp-export":
        return (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#161B26] flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800">
              <Lock size={22} />
            </div>
            <h3 className="sora-font text-lg font-bold text-slate-900 dark:text-white">
              Module Locked
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Data export to spreadsheet format is disabled on this installation.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb Context Header */}
      {isExpense ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/90 dark:border-white/[0.07] gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-white/[0.08] bg-white dark:bg-[#1A1C20] hover:border-emerald-700/50 dark:hover:border-[#4EA885]/50 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft
                size={14}
                className="text-emerald-700 dark:text-[#68C19D]"
              />
              <span>Back to Settings</span>
            </button>
            <div className="h-4 w-px bg-stone-200 dark:bg-white/[0.08]" />
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-xs font-semibold text-stone-500 dark:text-stone-400"
            >
              {selectedSetting.app}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/10 dark:bg-[#4EA885]/15 text-emerald-700 dark:text-[#68C19D] flex items-center justify-center shrink-0">
              {selectedSetting.icon && <selectedSetting.icon size={16} />}
            </div>
            <h2
              style={{ fontFamily: "'Lora', serif" }}
              className="text-lg sm:text-xl font-bold tracking-tight text-stone-950 dark:text-stone-50"
            >
              {selectedSetting.label}
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] hover:border-sky-500 dark:hover:border-sky-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Back to Settings</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
              {selectedSetting.app}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md border border-slate-200/70 dark:border-slate-700/70 ${selectedSetting.bgLight}`}>
              {selectedSetting.icon && (
                <selectedSetting.icon size={16} className={selectedSetting.color} />
              )}
            </div>
            <h1 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {selectedSetting.label}
            </h1>
          </div>
        </div>
      )}

      {/* Render Subcomponent */}
      <div className="w-full">{renderContent()}</div>
    </div>
  );
};

export default SettingsDetailView;