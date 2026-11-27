import React from "react";
import { Users, ChevronDown, Check } from "lucide-react";
import ClientTableRow from "./ClientTableRow";
import SortableHeader from "./SortableHeader";

const ClientTableContainer = ({
  currentRecords,
  totalRecords,
  sortConfig,
  requestSort,
  handleClientClick,
  loading,
  currentPage,
  setCurrentPage,
  recordsPerPage,
  setRecordsPerPage,
  indexOfFirstRecord,
  indexOfLastRecord,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAllPage,
  onQuickLog,
}) => {
  const allPageSelected =
    currentRecords.length > 0 &&
    currentRecords.every((r) => selectedIds.has(r._id));

  return (
    <div className="w-full md:bg-white md:dark:bg-[#161B26] md:border md:border-slate-200 md:dark:border-slate-800/80 rounded-lg overflow-hidden flex flex-col gap-2.5 md:gap-0 shadow-2xs">
      {/* MOBILE CARD LIST (< md) */}
      <div className="md:hidden flex flex-col gap-2 w-full">
        {currentRecords.map((family, index) => (
          <ClientTableRow
            key={`mob-${family._id}`}
            client={family}
            index={index}
            onClick={handleClientClick}
            variant="mobile"
            isSelected={selectedIds.has(family._id)}
            onToggleSelect={onToggleSelect}
            onQuickLog={onQuickLog}
          />
        ))}
        {currentRecords.length === 0 && !loading && (
          <div className="px-6 py-14 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg text-center flex flex-col items-center justify-center">
            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-800 text-slate-400 mb-2.5">
              <Users size={22} strokeWidth={1.75} />
            </div>
            <p className="sora-font text-xs font-semibold text-slate-600 dark:text-slate-300">
              No matching portfolios found
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Try clearing your search or switching filter chips.
            </p>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE (>= md) */}
      <div className="hidden md:block w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="bg-slate-50/90 dark:bg-[#1C2230] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80">
            <tr>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onToggleSelectAllPage}
                    aria-label="Select all on page"
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      allPageSelected
                        ? "bg-sky-600 border-sky-600 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-transparent"
                    }`}
                  >
                    {allPageSelected && <Check size={10} strokeWidth={3} />}
                  </button>
                  <div className="w-6 shrink-0" />
                  <button
                    type="button"
                    onClick={() => requestSort("name")}
                    className="uppercase tracking-wider text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 cursor-pointer"
                  >
                    Client / Family Name
                  </button>
                </div>
              </th>

              <SortableHeader
                label="Family AUM"
                sortKey="aum"
                sortConfig={sortConfig}
                requestSort={requestSort}
              />

              <th className="px-4 py-3 font-semibold text-xs">
                Primary Contact
              </th>

              <SortableHeader
                label="Last Touch"
                sortKey="updatedAt"
                sortConfig={sortConfig}
                requestSort={requestSort}
              />

              <th className="px-4 py-3 font-semibold text-xs text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {currentRecords.map((family, index) => (
              <ClientTableRow
                key={family._id}
                client={family}
                index={index}
                onClick={handleClientClick}
                variant="desktop"
                isSelected={selectedIds.has(family._id)}
                onToggleSelect={onToggleSelect}
                onQuickLog={onQuickLog}
              />
            ))}
            {currentRecords.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-md bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-800 text-slate-400 mb-3">
                      <Users size={26} strokeWidth={1.75} />
                    </div>
                    <p className="sora-font text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No matching portfolios found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Refine your search parameters or adjust the active filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION & RECORDS PER PAGE TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-[#161B26] md:bg-slate-50/90 md:dark:bg-[#1C2230] border border-slate-200 dark:border-slate-800/80 md:border-0 md:border-t rounded-lg md:rounded-none gap-2.5 mt-auto">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold font-mono text-slate-900 dark:text-white">
                {totalRecords > 0 ? indexOfFirstRecord + 1 : 0}
              </span>
              –
              <span className="font-semibold font-mono text-slate-900 dark:text-white">
                {Math.min(indexOfLastRecord, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-semibold font-mono text-slate-900 dark:text-white">
                {totalRecords}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Show:
            </span>
            <div className="relative">
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 rounded-md px-2.5 py-1 pr-7 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={12} strokeWidth={2.2} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161B26] hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center px-3 py-1.5 bg-white dark:bg-[#161B26] rounded-md border border-slate-200 dark:border-slate-700/80 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            Page {currentPage}
          </div>

          <button
            disabled={indexOfLastRecord >= totalRecords || loading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientTableContainer;