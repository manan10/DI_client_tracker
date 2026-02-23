import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { useApi } from "../hooks/useApi";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import ClientTableRow from "../components/Directory/ClientTableRow";

const ClientDirectory = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const navigate = useNavigate();
  const { request, loading } = useApi();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await request("/clients/");
        setClients(data);
      } catch { /* Error handled by hook */ }
    };
    fetchClients();
  }, [request]);

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.pan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "All" || c.category === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate("/")} className="flex items-center text-blue-600 text-xs font-black uppercase tracking-widest mb-2 hover:gap-2 transition-all">
              <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Client Directory</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {loading ? "Loading clients..." : `Managing ${clients.length} Total Database Records`}
            </p>
          </div>
          <DirectoryFilters onSearchChange={setSearchTerm} onTierChange={setFilterTier} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                <tr>
                  <th className="px-8 py-5">Client Name</th>
                  <th className="px-8 py-5">Category & AUM</th>
                  <th className="px-8 py-5">Contact Details</th>
                  <th className="px-8 py-5 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map((client) => (
                  <ClientTableRow key={client._id} client={client} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDirectory;