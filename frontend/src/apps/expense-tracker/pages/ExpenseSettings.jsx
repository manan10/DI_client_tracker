import React from "react";
import ExpenseNavbar from "../components/ExpenseNavbar";
import Settings from "../../../shared/pages/Settings"

const ExpenseSettings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060913] font-sans selection:bg-emerald-500/20">
      <ExpenseNavbar />
      <Settings mode="expense" hideTopBar={true} />
    </div>
  );
};

export default ExpenseSettings;