import React from "react";
import { Search, CheckSquare, ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ChooseClientsStep = ({
  clientSearch, setClientSearch, isLoadingClients, paginatedClients, 
  filteredClients, selectedClientIds, toggleClientSelection, 
  selectAllFiltered, deselectAllFiltered, currentPage, 
  setCurrentPage, totalPages, setCurrentStep
}) => {

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full animate-in slide-in-from-right-8 duration-500 max-w-6xl mx-auto w-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl bg-emerald-100 text-emerald-800 shrink-0">
            2
          </div>
          <div>
            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tight">CHOOSE CLIENTS</h2>
            <p className={`text-xs font-bold tracking-widest uppercase mt-0.5 ${selectedClientIds.size > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {selectedClientIds.size > 0 ? `${selectedClientIds.size} Clients Selected` : "Select recipients"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col grow">
        {/* Search & Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search by client name or email address..." 
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <button onClick={selectAllFiltered} className="h-12 px-6 text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors shrink-0">Select All</button>
          <button onClick={deselectAllFiltered} className="h-12 px-6 text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors shrink-0">Clear Selection</button>
        </div>

        {/* Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-4 pl-6 w-16 text-center">Sel</th>
                <th className="py-4 px-4">Client Name</th>
                <th className="py-4 px-4">Email Address</th>
                <th className="py-4 pr-6 text-right">AUM (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingClients ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3 text-slate-300" />
                    Loading Client Registry...
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    No clients found matching criteria
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const isSelected = selectedClientIds.has(client._id);
                  return (
                    <tr 
                      key={client._id} 
                      onClick={() => toggleClientSelection(client._id)}
                      className={`cursor-pointer transition-all ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-4 pl-6 text-center">
                        <div className={`inline-flex items-center justify-center w-5 h-5 rounded transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 bg-white'}`}>
                          {isSelected && <CheckSquare size={14} strokeWidth={3} />}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>{client.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-500">{client.contactDetails.email}</span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(client.aum)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {paginatedClients.length} of {filteredClients.length} Clients
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold text-slate-700 px-4">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
        <button onClick={() => setCurrentStep(1)} className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-2">
          <ChevronLeft size={18} /> Back
        </button>
        <button 
          onClick={() => {
            if(selectedClientIds.size === 0) {
              toast.error("Select at least one client");
              return;
            }
            setCurrentStep(3);
          }} 
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
        >
          Review Template <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChooseClientsStep;