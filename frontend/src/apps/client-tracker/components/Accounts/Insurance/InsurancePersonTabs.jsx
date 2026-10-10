import React from "react";
import { Users, User, ChevronDown, Search, Plus } from "lucide-react";

const InsurancePersonTabs = ({
  peopleList,
  policies,
  selectedPerson,
  onSelectPerson,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        {/* Mobile View: Dropdown Selector[cite: 1] */}
        <div className="sm:hidden w-full relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
            Select Member View
          </label>
          <div className="relative">
            <select
              value={selectedPerson}
              onChange={(e) => onSelectPerson(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pr-10 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Members Summary ({policies.length} Policies)</option>
              {peopleList.map((person) => {
                const count = policies.filter(
                  (p) => p.policyHolder?.trim().toLowerCase() === person.toLowerCase()
                ).length;
                return (
                  <option key={person} value={person}>
                    {person} ({count})
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={16} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Desktop View: Tabs[cite: 1] */}
        <nav className="hidden sm:flex items-center gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectPerson("ALL")}
            className={`flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              selectedPerson === "ALL"
                ? "border-emerald-600 dark:border-emerald-400 text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>All Members</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
              {policies.length}
            </span>
          </button>

          {peopleList.map((person) => {
            const count = policies.filter(
              (p) => p.policyHolder?.trim().toLowerCase() === person.toLowerCase()
            ).length;
            const isActive = selectedPerson === person;

            return (
              <button
                key={person}
                onClick={() => onSelectPerson(person)}
                className={`flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-emerald-600 dark:border-emerald-400 text-slate-900 dark:text-white"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User size={14} />
                <span>{person}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Search, Status Filter & Action Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-60">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search policy, PRAN, vehicle..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="GRACE_PERIOD">Grace Period</option>
            <option value="PAID_UP">Paid Up</option>
            <option value="LAPSED">Lapsed</option>
            <option value="MATURED">Matured</option>
            <option value="SURRENDERED">Surrendered</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={3} /> Add Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsurancePersonTabs;