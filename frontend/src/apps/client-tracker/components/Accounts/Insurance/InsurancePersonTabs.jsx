import React from "react";
import { Users, User, ChevronDown, Search, Plus, Umbrella } from "lucide-react";
import { getNormalizedPersonName } from "./insuranceUtils";

const InsurancePersonTabs = ({
  peopleList,
  policies,
  selectedPerson,
  onSelectPerson,
  search,
  onSearchChange,
  onOpenAddModal,
}) => {
  return (
    <div className="w-full space-y-4 pt-1">
      {/* 1. TOP HEADER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Section Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 shrink-0">
            <Umbrella size={18} strokeWidth={2} />
          </div>
          <div>
            <h2 className="sora-font text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Family{" "}
              <span className="font-normal text-sky-600 dark:text-sky-300">
                Policies
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a member to view their policies, or view everyone together
            </p>
          </div>
        </div>

        {/* Search Input & Add Button */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search policy, insurer, vehicle..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 active:scale-[0.99]"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* 2. MEMBER TABS RAIL */}
      <div className="border-b border-slate-200 dark:border-slate-800/80">
        {/* Mobile View (< sm): Dropdown */}
        <div className="sm:hidden w-full relative pb-3">
          <div className="relative">
            <select
              value={selectedPerson}
              onChange={(e) => onSelectPerson(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 pr-9 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Members ({policies.length})</option>
              {peopleList.map((person) => {
                const count = policies.filter(
                  (p) =>
                    getNormalizedPersonName(p.policyHolder).toLowerCase() ===
                    person.toLowerCase()
                ).length;
                return (
                  <option key={person} value={person}>
                    {person} ({count})
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={15} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Desktop View (sm & up): Clean Underline Tabs */}
        <nav className="hidden sm:flex items-center gap-6 overflow-x-auto no-scrollbar w-full">
          <button
            type="button"
            onClick={() => onSelectPerson("ALL")}
            className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
              selectedPerson === "ALL"
                ? "border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>All Members</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                selectedPerson === "ALL"
                  ? "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300"
                  : "bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-400"
              }`}
            >
              {policies.length}
            </span>
          </button>

          {peopleList.map((person) => {
            const count = policies.filter(
              (p) =>
                getNormalizedPersonName(p.policyHolder).toLowerCase() ===
                person.toLowerCase()
            ).length;
            const isActive = selectedPerson === person;

            return (
              <button
                key={person}
                type="button"
                onClick={() => onSelectPerson(person)}
                className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
                  isActive
                    ? "border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-300"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User size={14} />
                <span className="capitalize">{person.toLowerCase()}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300"
                      : "bg-slate-100 dark:bg-[#1C2230] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default InsurancePersonTabs;