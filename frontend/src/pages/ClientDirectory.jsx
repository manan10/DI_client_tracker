import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import { useApi } from "../hooks/useApi";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import ClientTableRow from "../components/Directory/ClientTableRow";
import ClientDrawer from "../components/Directory/ClientDrawer";
import InteractionModal from "../components/InteractionModal";

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
              <ChevronUp size={14} className="text-amber-600" /> : 
              <ChevronDown size={14} className="text-amber-600" />
          ) : (
            <ArrowUpDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />
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

  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preSelectedClient, setPreSelectedClient] = useState(null);

  const navigate = useNavigate();
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await request("/clients/");
        setClients(data);
      } catch { /* Handled */ }
    };
    fetchClients();
  }, [request]);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleOpenModalFromDrawer = () => {
    setPreSelectedClient(selectedClient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreSelectedClient(null);
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
    setCurrentPage(1);
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
  const totalRecords = processedClients.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 hover:text-amber-700"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Client Directory</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">
              {loading ? "Refreshing..." : `Managing ${clients.length} Total Records`}
            </p>
          </div>
          <DirectoryFilters onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} onTierChange={(v) => { setFilterTier(v); setCurrentPage(1); }} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-t-amber-500 overflow-hidden">
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
                  <ClientTableRow key={client._id} client={client} onClick={() => handleClientClick(client)} />
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center px-10 py-6 bg-slate-50 border-t">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {totalRecords > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, totalRecords)} of {totalRecords}
            </p>
            <div className="flex gap-3">
              <button 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 text-[10px] font-black uppercase border rounded-lg disabled:opacity-30"
              >Previous</button>
              <button 
                disabled={indexOfLastRecord >= totalRecords || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-30"
              >Next</button>
            </div>
          </div>
        </div>
      </main>

      <ClientDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        client={selectedClient}
        onLogInteraction={handleOpenModalFromDrawer}
      />

      <InteractionModal 
        key={preSelectedClient?._id || 'new-interaction'}
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onRefresh={() => { /* re-fetch if needed */ }}
        initialClient={preSelectedClient} 
      />
    </div>
  );
};

export default ClientDirectory;