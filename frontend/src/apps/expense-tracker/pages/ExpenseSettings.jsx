import React from "react";
import ExpenseNavbar from "../components/ExpenseNavbar";
import Settings from "../../../shared/pages/Settings"

const ExpenseSettings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4F0] dark:bg-[#121315] selection:bg-emerald-700/15 dark:selection:bg-[#4EA885]/25">
      <ExpenseNavbar />
      <Settings mode="expense" hideTopBar={true} />
    </div>
  );
};

export default ExpenseSettings;