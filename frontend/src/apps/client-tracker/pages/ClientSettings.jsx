import React from "react";
import Navbar from "../components/Shared/Navbar";
import Settings from "../../../shared/pages/Settings"

const ClientSettings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060913] font-sans selection:bg-emerald-500/20">
      <Navbar />
      <Settings mode="client" hideTopBar={true} />
    </div>
  );
};

export default ClientSettings;