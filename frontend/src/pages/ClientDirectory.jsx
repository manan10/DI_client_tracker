import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import { useApi } from "../hooks/useApi";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import ClientTableRow from "../components/Directory/ClientTableRow";

// Declared outside to prevent re-creation during render
const SortableHeader = ({ label, sortKey, sortConfig, requestSort, align = "left" }) => {
  const isActive = sortConfig.key === sortKey;
  return (
    <th 
      className={`px-8 py-5 cursor-pointer transition-all hover:bg-slate-50 group select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className={`transition-colors ${isActive ? 'text-amber-600 font-black' : 'text-slate-400'}`}>
          {label}
        </span>
        <div className="flex items-center">
          {isActive ? (
            sortConfig.direction === 'asc' ? 
              <ChevronUp size={14} className="text-amber-600 animate-in fade-in zoom-in duration-200" /> : 
              <ChevronDown size={14} className="text-amber-600 animate-in fade-in zoom-in duration-200" />
          ) : (
            <ArrowUpDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </th>
  );
};

const ClientDirectory = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const navigate = useNavigate();
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await request("/clients/");
        setClients(data);
      } catch { /* Handled by hook */ }
    };
    fetchClients();
  }, [request]);

  // Handlers to reset pagination without using useEffect
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleTierChange = (value) => {
    setFilterTier(value);
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig({ key: null, direction: 'asc' });
      return;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset page on sort change for UX consistency
  };

  const processedClients = useMemo(() => {
    let filtered = [...clients].filter((c) => {
      const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.pan?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = filterTier === "All" || c.category === filterTier;
      return matchesSearch && matchesTier;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] ?? '';
        let bValue = b[sortConfig.key] ?? '';
        if (sortConfig.key === 'aum') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        if (sortConfig.key === "updatedAt") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [clients, searchTerm, filterTier, sortConfig]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = processedClients.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(processedClients.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 hover:text-amber-700 transition-all group"
            >
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Client Directory</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">
              {loading ? "Refreshing..." : `Managing ${clients.length} Total Records`}
            </p>
          </div>
          <DirectoryFilters onSearchChange={handleSearchChange} onTierChange={handleTierChange} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 border-t-4 border-t-amber-500 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] border-b">
                <tr>
                  <SortableHeader label="Client Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Category & AUM" sortKey="aum" sortConfig={sortConfig} requestSort={requestSort} />
                  <th className="px-8 py-5 text-slate-400">Contact Details</th>
                  <SortableHeader label="Last Updated" sortKey="updatedAt" sortConfig={sortConfig} requestSort={requestSort} align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentRecords.map((client) => (
                  <ClientTableRow key={client._id} client={client} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-10 py-6 bg-slate-50/50 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing {processedClients.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, processedClients.length)} of {processedClients.length}
            </p>
            <div className="flex gap-3">
              <button 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 text-[10px] font-black uppercase border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-white transition-all shadow-sm"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages || loading || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-amber-100 disabled:opacity-30 hover:bg-amber-700 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDirectory;