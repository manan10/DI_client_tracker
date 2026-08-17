import React from 'react';
import { Users, ArrowUpDown, ChevronRight } from 'lucide-react';
import ClientTableRow from './ClientTableRow';
import SortableHeader from './SortableHeader';

const ClientTableContainer = ({
  currentRecords,
  totalRecords,
  sortConfig,
  requestSort,
  handleClientClick,
  loading,
  currentPage,
  setCurrentPage,
  indexOfFirstRecord,
  indexOfLastRecord
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/2 dark:shadow-none overflow-hidden flex flex-col">
      
      {/* TABLE SCROLL CONTAINER */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse block md:table min-w-full">
          <thead className="hidden md:table-header-group bg-slate-50/90 dark:bg-white/3 text-[10px] font-[1000] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-200/80 dark:border-white/10">
            <tr>
              <SortableHeader
                label="Client / Family Name"
                sortKey="name"
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
              <SortableHeader
                label="Total Family AUM"
                sortKey="aum"
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
              <th className="hidden md:table-cell px-6 py-4 font-[1000] tracking-[0.2em]">
                Relationship Status
              </th>
              <SortableHeader
                label="Last Interaction"
                sortKey="updatedAt"
                sortConfig={sortConfig}
                requestSort={requestSort}
                align="right"
                className="hidden md:table-cell"
              />
            </tr>
          </thead>
          
          <tbody className="block md:table-row-group divide-y divide-slate-100 dark:divide-white/5">
            {currentRecords.map((family, index) => (
              <ClientTableRow
                key={family._id}
                client={family}
                index={index} 
                onClick={handleClientClick}
              />
            ))}
            {currentRecords.length === 0 && !loading && (
              <tr className="block md:table-row">
                <td colSpan="4" className="block md:table-cell px-8 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <Users size={22} strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mt-2">
                      No matching records found
                    </p>
                    <p className="text-xs text-slate-400">
                      Refine your search parameters or adjust the active tier filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EXECUTIVE PAGINATION & METRICS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-8 py-4 bg-slate-50/50 dark:bg-white/1 border-t border-slate-200/80 dark:border-white/10 gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold font-mono text-slate-900 dark:text-white">{totalRecords > 0 ? indexOfFirstRecord + 1 : 0}</span> to{" "}
            <span className="font-bold font-mono text-slate-900 dark:text-white">{Math.min(indexOfLastRecord, totalRecords)}</span> of{" "}
            <span className="font-bold font-mono text-slate-900 dark:text-white">{totalRecords}</span> entries
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all outline-none cursor-pointer select-none shadow-2xs"
          >
            Previous
          </button>
          
          <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
            Page {currentPage}
          </div>

          <button
            disabled={indexOfLastRecord >= totalRecords || loading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-30 transition-all shadow-sm outline-none cursor-pointer select-none"
          >
            Next
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ClientTableContainer;