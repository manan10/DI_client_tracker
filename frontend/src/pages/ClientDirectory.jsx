import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import ClientTableRow from "../components/Directory/ClientTableRow";
import TierSummary from "../components/Directory/TierSummary";
import SortableHeader from "../components/Directory/SortableHeader";

// Hooks
import { useApi } from "../hooks/useApi";
import { useClientData } from "../hooks/useClientData";

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
  const recordsPerPage = 10;

  const navigate = useNavigate();
  const { request, loading } = useApi();

  // Parallel fetch for Clients and Business Settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, settingsData] = await Promise.all([
          request("/clients/"),
          request("/settings"),
        ]);

        setClients(clientData || []);
        if (settingsData?.business?.thresholds) {
          setThresholds(settingsData.business.thresholds);
        }
      } catch (err) {
        console.error("Directory data fetch failed", err);
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

  // Directly route to the new ClientDetail page
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="w-full max-w-[98%] mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none">
              Client Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">
              {loading
                ? "Refreshing..."
                : `Managing ${totalRecords} Wealth Portfolios`}
            </p>
          </div>
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

        {/* Global Business Summary with dynamic thresholds */}
        {!loading && thresholds && (
          <TierSummary
            families={allFamilies}
            activeTier={filterTier}
            thresholds={thresholds}
          />
        )}

        {/* Main Records Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border-t-4 border-t-emerald-500 border-x border-b border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100 dark:border-slate-800">
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
                  <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black">
                    Relationship Status
                  </th>
                  <SortableHeader
                    label="Last Interaction"
                    sortKey="updatedAt"
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentRecords.map((family) => (
                  <ClientTableRow
                    key={family._id}
                    client={family}
                    onClick={handleClientClick}
                  />
                ))}
                {currentRecords.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <p className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.2em]">
                        No records found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center px-10 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Showing {totalRecords > 0 ? indexOfFirstRecord + 1 : 0} to{" "}
              {Math.min(indexOfLastRecord, totalRecords)} of {totalRecords}{" "}
              Records
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 text-[10px] font-black uppercase border rounded-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <button
                disabled={indexOfLastRecord >= totalRecords || loading}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-sm hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-md"
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