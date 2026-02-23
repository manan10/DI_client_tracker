import { Search } from "lucide-react";

const DirectoryFilters = ({ onSearchChange, onTierChange }) => (
  <div className="flex gap-3 w-full md:w-auto">
    <div className="relative flex-1 md:w-80">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={16}
      />
      <input
        type="text"
        placeholder="Search Name or PAN..."
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 shadow-sm transition-all"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    <select
      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-600 shadow-sm cursor-pointer"
      onChange={(e) => onTierChange(e.target.value)}
    >
      <option value="All">All Tiers</option>
      <option value="Diamond">Diamond</option>
      <option value="Gold">Gold</option>
      <option value="Silver">Silver</option>
      <option value="Bronze">Bronze</option>
    </select>
  </div>
);

export default DirectoryFilters;
