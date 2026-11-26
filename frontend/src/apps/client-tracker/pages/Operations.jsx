import React, { useState } from "react";
import { Kanban, Send, FileText, Calculator, Layers } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../components/Shared/Navbar";
import WorkspaceShell from "../../../shared/components/WorkspaceShell";
import OperationsDashboard from "../components/Operations/TaskBoard";
import Submissions from "../components/Operations/Submissions";
import FormsVault from "../components/Operations/FormsVault";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("submissions");

  const tabs = [
    {
      id: "submissions",
      name: "Submissions",
      mobileName: "Submissions",
      subtitle: "Fulfillment Queue",
      icon: Send,
      isLocked: false,
    },
    {
      id: "dashboard",
      name: "Task Board",
      mobileName: "Tasks",
      subtitle: "Team Action Items",
      icon: Kanban,
      isLocked: false,
    },
    {
      id: "forms",
      name: "Forms Vault",
      mobileName: "Forms",
      subtitle: "KYC & Mandate PDFs",
      icon: FileText,
      isLocked: false,
    }
  ];

  const handleTabChange = (tabId, tabObj) => {
    if (tabObj?.isLocked) {
      toast.info("Audit Vault is currently restricted.", {
        description: "This module requires Senior Partner authorization.",
      });
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <WorkspaceShell
      navbar={<Navbar />}
      badge="Operations Desk"
      badgeIcon={Layers}
      title="Operations"
      accent="Center"
      description="Manage submission fulfillment, track operational tasks, and access regulatory forms from one centralized hub."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === "submissions" && <Submissions />}
      {activeTab === "dashboard" && <OperationsDashboard />}
      {activeTab === "forms" && <FormsVault />}
    </WorkspaceShell>
  );
};

export default Operations;