import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, CheckSquare, Square, Loader2, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../hooks/useApi"; 

// --- HELPER FUNCTION ---
const isValidEmail = (email) => {
  if (!email) return false;
  // Standard Regex for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const ClientEmailExtractor = () => {
  const { request } = useApi();

  // --- CLIENT DATA STATES ---
  const [allClients, setAllClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedClientIds, setSelectedClientIds] = useState(new Set());
  
  // --- TABLE STATES ---
  const [clientSearch, setClientSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- EFFECTS ---
  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
      try {
        const res = await request('/clients', 'GET');
        if (isMounted) {
          const clientsData = res?.data || res || [];
          
          // Sort strictly by highest AUM
          const sortedClients = [...clientsData].sort((a, b) => (b.aum || 0) - (a.aum || 0));
          
          setAllClients(sortedClients);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Database Error", { description: "Could not retrieve client list." });
      } finally {
        if (isMounted) setIsLoadingClients(false);
      }
    };

    fetchClients();
    return () => { isMounted = false; };
  }, [request]);

  useEffect(() => {
    setCurrentPage(1);
  }, [clientSearch]);


  // --- HANDLERS ---
  const toggleClientSelection = (clientId) => {
    const newSelection = new Set(selectedClientIds);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClientIds(newSelection);
  };

  const selectAllFiltered = () => {
    const newSelection = new Set(selectedClientIds);
    filteredClients.forEach(c => newSelection.add(c._id));
    setSelectedClientIds(newSelection);
  };

  const deselectAllFiltered = () => {
    const newSelection = new Set(selectedClientIds);
    filteredClients.forEach(c => newSelection.delete(c._id));
    setSelectedClientIds(newSelection);
  };

  const handleCopyEmail = (email, e) => {
    e.stopPropagation(); // Prevents the row from toggling selection when copying
    navigator.clipboard.writeText(email);
    toast.success("Copied to Clipboard", { description: `${email} has been copied.` });
  };

  const handleExportEmails = () => {
    if (selectedClientIds.size === 0) {
      toast.error("No Clients Selected", { description: "Please select at least one client to export." });
      return;
    }
    
    // Filter selected clients, ensure they have an email, AND ensure the email is valid
    const selectedData = allClients.filter(c => {
      const email = c.contactDetails?.email;
      return selectedClientIds.has(c._id) && email && isValidEmail(email);
    });
    
    if (selectedData.length === 0) {
      toast.error("No Valid Emails Found", { description: "None of the selected clients have a correctly formatted email address." });
      return;
    }

    // Join valid emails with a newline character
    const emailString = selectedData.map(c => c.contactDetails.email.trim().toLowerCase()).join('\n');
    
    // Create and trigger download
    const blob = new Blob([emailString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `client_emails_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Export Successful", {
      description: `Downloaded a text file containing ${selectedData.length} valid email addresses.`,
    });
  };

  // --- DERIVED DATA & PAGINATION ---
  const filteredClients = useMemo(() => {
    if (!clientSearch) return allClients;
    const lower = clientSearch.toLowerCase();
    
    // Search references the updated schema paths
    return allClients.filter(c => 
      c.name?.toLowerCase().includes(lower) || 
      c.contactDetails?.email?.toLowerCase().includes(lower) ||
      c.pan?.toLowerCase().includes(lower)
    );
  }, [allClients, clientSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isAllCurrentPageSelected = paginatedClients.length > 0 && paginatedClients.every(c => selectedClientIds.has(c._id));

  // Helper to format AUM visually
  const formatAUM = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24 font-sans w-full px-4 md:px-8 mt-8">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">
            Client Email <span className="text-emerald-600">Extractor</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Select clients and export valid emails to a text file
          </p>
        </div>
        
        <button
          onClick={handleExportEmails}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Download size={18} />
          Export {selectedClientIds.size > 0 ? selectedClientIds.size : ""} Emails
        </button>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white dark:bg-[#161B22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name, Email or PAN..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium dark:text-white"
            />
          </div>

          <div className="flex gap-3 text-sm">
            <button 
              onClick={selectAllFiltered}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
            >
              Select All Filtered
            </button>
            <button 
              onClick={deselectAllFiltered}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* CLIENT LIST TABLE */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                  <th className="p-4 w-16 text-center">
                    <button 
                      onClick={isAllCurrentPageSelected ? deselectAllFiltered : selectAllFiltered}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {isAllCurrentPageSelected ? <CheckSquare size={20} className="text-emerald-500" /> : <Square size={20} />}
                    </button>
                  </th>
                  <th className="p-4 font-bold">Client Name</th>
                  <th className="p-4 font-bold">AUM</th>
                  <th className="p-4 font-bold">Email Address</th>
                  <th className="p-4 font-bold">PAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {isLoadingClients ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Loading your clients...
                    </td>
                  </tr>
                ) : paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                      No clients found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client) => {
                    const isSelected = selectedClientIds.has(client._id);
                    const email = client.contactDetails?.email;
                    const hasEmail = Boolean(email && email.trim() !== "");
                    const isEmailValid = hasEmail && isValidEmail(email);

                    return (
                      <tr 
                        key={client._id} 
                        onClick={() => toggleClientSelection(client._id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                      >
                        <td className="p-4 text-center">
                          {isSelected 
                            ? <CheckSquare size={20} className="text-emerald-500 mx-auto" /> 
                            : <Square size={20} className="text-slate-300 dark:text-slate-600 mx-auto" />
                          }
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {client.name || "N/A"}
                          {client.category && (
                            <span className="ml-2 text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                              {client.category}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">
                          {formatAUM(client.aum)}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {!hasEmail ? (
                            <span className="text-rose-500 text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded">No Email</span>
                          ) : !isEmailValid ? (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded w-fit">
                               <AlertCircle size={14} />
                               <span className="text-xs font-bold uppercase tracking-wider line-through opacity-70">{email}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span>{email}</span>
                              <button 
                                onClick={(e) => handleCopyEmail(email, e)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                title="Copy to clipboard"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-xs">
                          {client.pan || "---"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300"
                >
                  Prev
                </button>
                <div className="flex items-center px-3 font-bold text-emerald-600">
                  {currentPage} / {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
           <p className="text-xs text-slate-400 font-medium">
             Total Selected: <span className="font-bold text-emerald-600">{selectedClientIds.size}</span>
           </p>
        </div>

      </div>
    </div>
  );
};

export default ClientEmailExtractor;