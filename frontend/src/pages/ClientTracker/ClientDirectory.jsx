import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Users, Search, Sparkles, Layers } from "lucide-react";

// Components
import Navbar from "../../components/Navbar";
import DirectoryFilters from "../../components/Directory/DirectoryFilters";
import TierSummary from "../../components/Directory/TierSummary";
import ClientTableContainer from "../../components/Directory/ClientTableContainer";

// Hooks
import { useApi } from "../../hooks/useApi";
import { useClientData } from "../../hooks/useClientData";

const ClientDirectory = () => {
  const [clients, setClients] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "aum",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(30); // Default set to 30

  const navigate = useNavigate();
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, settingsRes] = await Promise.all([
          request("/clients/"),
          request("/settings"),
        ]);

        if (clientRes?.success) {
          setClients(clientRes.data || []);
        } else {
          setClients([]);
        }

        const incomingThresholds = settingsRes?.data?.business?.thresholds || settingsRes?.business?.thresholds;
        if (incomingThresholds) {
          setThresholds(incomingThresholds);
        }
      } catch (err) {
        console.error("Directory data fetch failed", err);
        setClients([]); 
      }
    };
    fetchData();
  }, [request]);

  const { allFamilies, filteredFamilies } = useClientData(
    clients,
    searchTerm,
    filterTier,
    sortConfig,
    thresholds,
  );

  const handleClientClick = (client) => {
    navigate(`/client/${client._id}`);
  };

  const requestSort = (key) => {
    let direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredFamilies.slice(
    indexOfFirstRecord,
    indexOfLastRecord,
  );
  const totalRecords = filteredFamilies.length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      {/* EXPANDED FLUID WORKSPACE */}
      <main className="w-full max-w-384 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 pb-32">
        
        {/* COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end pb-8 mb-8 border-b border-slate-200 dark:border-white/10 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white">
              Client Directory
            </h1>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                Registry Ledger
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {loading ? "Synchronizing registry..." : `Managing ${totalRecords} active family wealth portfolios`}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <DirectoryFilters
              onSearchChange={(v) => {
                setSearchTerm(v);
                setCurrentPage(1);
              }}
              onTierChange={(v) => {
                setFilterTier(v);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* HORIZONTAL SPLIT LAYOUT FOR DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Tier Summary Rail */}
          {thresholds && allFamilies.length > 0 && (
            <div className="lg:col-span-4 xl:col-span-3">
              <TierSummary
                families={allFamilies}
                activeTier={filterTier}
                thresholds={thresholds}
              />
            </div>
          )}

          {/* RIGHT MAIN AREA: Client Records Table Container */}
          <div className={`${thresholds && allFamilies.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} min-w-0`}>
            <ClientTableContainer
              currentRecords={currentRecords}
              totalRecords={totalRecords}
              sortConfig={sortConfig}
              requestSort={requestSort}
              handleClientClick={handleClientClick}
              loading={loading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              recordsPerPage={recordsPerPage}
              setRecordsPerPage={setRecordsPerPage}
              indexOfFirstRecord={indexOfFirstRecord}
              indexOfLastRecord={indexOfLastRecord}
            />
          </div>

        </div>

      </main>
    </div>
  );
};

export default ClientDirectory;