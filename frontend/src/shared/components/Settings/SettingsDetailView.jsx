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
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-300 dark:border-white/10 shadow-xs">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Module Locked
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-300/80 dark:border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={16} className="text-emerald-500" />
            <span>Back to Settings</span>
          </button>
          <div className="h-4 w-px bg-slate-300 dark:border-white/10" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {selectedSetting.app}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 ${selectedSetting.bgLight}`}>
            {selectedSetting.icon && (
              <selectedSetting.icon size={17} className={selectedSetting.color} />
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {selectedSetting.label}
          </h1>
        </div>
      </div>

      {/* Render Subcomponent */}
      <div className="w-full">{renderContent()}</div>
    </div>
  );
};

export default SettingsDetailView;