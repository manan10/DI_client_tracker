import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Wallet, PieChart, FileText, ShieldCheck, Landmark } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../components/Shared/Navbar";
import WorkspaceShell from "../../../shared/components/WorkspaceShell";
import AccountBalances from "../components/Accounts/AccountBalances";
import Commissions from "../components/Accounts/Commissions";
import AuditManager from "../components/Accounts/AuditManager";
import Insurance from "../components/Accounts/Insurance";
import AccessDenied from "../components/Shared/AccessDenied";
import { useAuth } from "../../../shared/hooks/useAuth";

const Accounts = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "balances"
  );

  const tabs = [
    {
      id: "balances",
      name: "Account Balances",
      mobileName: "Balances",
      subtitle: "Bank & Cash Ledgers",
      icon: Wallet,
      isLocked: false,
    },
    {
      id: "insurance",
      name: "Insurance",
      mobileName: "Insurance",
      subtitle: "Policies & Renewals",
      icon: ShieldCheck,
      isLocked: false,
    },
    {
      id: "commissions",
      name: "Commissions",
      mobileName: "Commissions",
      subtitle: "Trail & Brokerage Payouts",
      icon: PieChart,
      isLocked: false,
    },
    {
      id: "audit",
      name: "Tally Zone",
      mobileName: "Tally",
      subtitle: "Voucher & Ledger Sync",
      icon: FileText,
      isLocked: false,
    },
  ];

  const handleTabChange = (tabId, tabObj) => {
    if (tabObj?.isLocked) {
      toast.info("Tally Sync module is currently in final audit.", {
        description:
          "This feature will be enabled following system verification.",
      });
      return;
    }
    setActiveTab(tabId);
  };

  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#131720] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <AccessDenied />
      </div>
    );
  }

  return (
    <WorkspaceShell
      navbar={<Navbar />}
      badge="Finance & Treasury"
      badgeIcon={Landmark}
      title="Accounting"
      accent="Hub"
      description="Track account balances, manage commissions, and access insurance and audit tools from one centralized hub."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === "balances" && <AccountBalances />}
      {activeTab === "commissions" && <Commissions />}
      {activeTab === "audit" && <AuditManager />}
      {activeTab === "insurance" && <Insurance />}
    </WorkspaceShell>
  );
};

export default Accounts;