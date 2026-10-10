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
    <div className="w-full space-y-5 pt-1">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SEARCH CONTROLS                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Umbrella size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
              Insurance Members
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Pick a person to see their policies, or choose All Members for the family overview.
            </p>
          </div>
        </div>

        {/* Right Search Input & Add Button */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by policy, car number..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-md text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all shadow-2xs placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-black uppercase tracking-wider shadow-2xs transition-all cursor-pointer shrink-0 active:scale-98"
          >
            <Plus size={15} strokeWidth={3} />
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH MEMBER TABS RAIL                                            */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200 dark:border-white/10 pb-0.5">
        {/* Mobile View (< sm): Dropdown Selector */}
        <div className="sm:hidden w-full relative pb-2.5">
          <div className="relative">
            <select
              value={selectedPerson}
              onChange={(e) => onSelectPerson(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-md px-3.5 py-2.5 pr-9 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
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
              <ChevronDown size={15} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Desktop View (sm & up): Tab Rail */}
        <nav className="hidden sm:flex items-center gap-7 overflow-x-auto no-scrollbar w-full">
          <button
            type="button"
            onClick={() => onSelectPerson("ALL")}
            className={`flex items-center gap-2 pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
              selectedPerson === "ALL"
                ? "border-emerald-600 dark:border-emerald-400 text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>All Members</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono font-bold">
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
                className={`flex items-center gap-2 pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
                  isActive
                    ? "border-emerald-600 dark:border-emerald-400 text-slate-900 dark:text-white"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User size={14} />
                <span>{person}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono font-bold">
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