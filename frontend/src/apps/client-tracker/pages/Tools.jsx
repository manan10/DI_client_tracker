import React, { useState } from "react";
import { Calculator, Megaphone, ShieldCheck, Compass } from "lucide-react";

import Navbar from "../components/Shared/Navbar";
import WorkspaceShell from "../../../shared/components/WorkspaceShell";
import Calculators from "../components/Tools/Calculators";
import MarketingHub from "../components/Tools/MarketingHub";
import RiskProfiler from "../components/Tools/RiskProfiler";

const Tools = () => {
  const [activeTab, setActiveTab] = useState("calculators");

  const tabs = [
    {
      id: "calculators",
      name: "Calculators",
      mobileName: "Calculators",
      subtitle: "SIP, SWP, Lumpsum & Tax",
      icon: Calculator,
    },
    {
      id: "marketing",
      name: "Marketing & Pitch",
      mobileName: "Marketing",
      subtitle: "WhatsApp Client Creatives",
      icon: Megaphone,
    },
    {
      id: "risk-profiler",
      name: "Risk Profiler",
      mobileName: "Risk Profile",
      subtitle: "SEBI Suitability & Audit",
      icon: ShieldCheck,
    },
  ];

  return (
    <WorkspaceShell
      navbar={<Navbar />}
      badge="Advisory Workspace"
      badgeIcon={Compass}
      title="Advisory"
      accent="Tools"
      description="Run client wealth calculators, build WhatsApp marketing pitches, and assess investor risk profiles."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "calculators" && <Calculators />}
      {activeTab === "marketing" && <MarketingHub />}
      {activeTab === "risk-profiler" && <RiskProfiler />}
    </WorkspaceShell>
  );
};

export default Tools;