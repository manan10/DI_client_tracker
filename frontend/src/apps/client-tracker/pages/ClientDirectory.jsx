import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Users,
  Search,
  Sparkles,
  Layers,
  UserPlus,
  X,
  ShieldCheck,
  CreditCard,
  User,
  Network,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Components
import Navbar from "../components/Shared/Navbar";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import TierSummary from "../components/Directory/TierSummary";
import ClientTableContainer from "../components/Directory/ClientTableContainer";

// Hooks
import { useApi } from "../../../shared/hooks/useApi";
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
  const [recordsPerPage, setRecordsPerPage] = useState(30);

  // Modal & Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPan, setFormPan] = useState("");
  const [familyMode, setFamilyMode] = useState("new"); // "new" | "existing"
  const [selectedFamilyClient, setSelectedFamilyClient] = useState(null);
  const [familySearchQuery, setFamilySearchQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { request, loading } = useApi();

  const fetchDirectoryData = async () => {
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

      const incomingThresholds =
        settingsRes?.data?.business?.thresholds ||
        settingsRes?.business?.thresholds;
      if (incomingThresholds) {
        setThresholds(incomingThresholds);
      }
    } catch (err) {
      console.error("Directory data fetch failed", err);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchDirectoryData();
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

  // Filter existing clients for the family attachment selector
  const eligibleExistingFamilyClients = useMemo(() => {
    if (!familySearchQuery.trim()) return clients.slice(0, 8);
    const q = familySearchQuery.toLowerCase();
    return clients
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) || c.pan?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [clients, familySearchQuery]);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setFormName("");
    setFormPan("");
    setFamilyMode("new");
    setSelectedFamilyClient(null);
    setFamilySearchQuery("");
    setFormError("");
    setIsSubmitting(false);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedName = formName.trim();
    const trimmedPan = formPan.trim().toUpperCase();

    if (!trimmedName) {
      setFormError("Client full legal name is required.");
      return;
    }

    if (!trimmedPan) {
      setFormError("Permanent Account Number (PAN) is required.");
      return;
    }

    // Standard PAN regex verification (5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(trimmedPan)) {
      setFormError("Invalid PAN card format (Expected: ABCDE1234F).");
      return;
    }

    if (familyMode === "existing" && !selectedFamilyClient) {
      setFormError(
        "Please choose an existing client or family head to attach to.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: trimmedName,
        pan: trimmedPan,
        isFamilyHead: familyMode === "new",
        familyId:
          familyMode === "existing"
            ? selectedFamilyClient.familyId || selectedFamilyClient._id
            : undefined, // Backend or controller will assign new UUID if omitted
      };

      const res = await request("/clients/", "POST", payload);

      if (res?.success || res?._id || res?.data) {
        handleCloseModal();
        await fetchDirectoryData();
      } else {
        setFormError(
          res?.message || res?.error || "Failed to register new client.",
        );
      }
    } catch (err) {
      console.error("Client creation failed:", err);
      setFormError(
        err?.message || "Server error occurred while registering client.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {loading
                  ? "Synchronizing registry..."
                  : `Managing ${totalRecords} active family wealth portfolios`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
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

            {/* CREATE CLIENT BUTTON */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <UserPlus size={15} strokeWidth={2.5} />
              <span>Create New Client</span>
            </button>
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
          <div
            className={`${thresholds && allFamilies.length > 0 ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"} min-w-0`}
          >
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

      {/* CREATE NEW CLIENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <UserPlus size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Register New Client
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Registry Ledger Provisioning
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateClient} className="p-6 space-y-6">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAJESH HARILAL SHAH"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-slate-400" />
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={formPan}
                    onChange={(e) =>
                      setFormPan(
                        e.target.value.toUpperCase().replace(/\s/g, ""),
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 font-mono tracking-wider"
                  />
                </div>

                {/* Family Configuration Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Network size={13} className="text-slate-400" />
                    Family Structure Assignment
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFamilyMode("new");
                        setSelectedFamilyClient(null);
                      }}
                      className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                        familyMode === "new"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wide">
                        New Family Group
                      </span>
                      <span className="text-[10px] font-medium opacity-80 mt-1">
                        Make this client the head of a new family portfolio
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFamilyMode("existing")}
                      className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                        familyMode === "existing"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Existing Family
                      </span>
                      <span className="text-[10px] font-medium opacity-80 mt-1">
                        Attach as a member to an existing family ledger
                      </span>
                    </button>
                  </div>

                  {/* Existing Family Client Selector */}
                  {familyMode === "existing" && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Search & Select Family Member / Head
                      </label>

                      {selectedFamilyClient ? (
                        <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-white/5 border border-emerald-500/30 rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {selectedFamilyClient.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              PAN: {selectedFamilyClient.pan} • ID:{" "}
                              {selectedFamilyClient.familyId || "Primary"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFamilyClient(null)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="relative">
                            <Search
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              size={13}
                            />
                            <input
                              type="text"
                              placeholder="Search family by client name or PAN..."
                              value={familySearchQuery}
                              onChange={(e) =>
                                setFamilySearchQuery(e.target.value)
                              }
                              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-lg divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0B1120]">
                            {eligibleExistingFamilyClients.length > 0 ? (
                              eligibleExistingFamilyClients.map((item) => (
                                <button
                                  type="button"
                                  key={item._id}
                                  onClick={() => setSelectedFamilyClient(item)}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs transition-colors"
                                >
                                  <div className="flex flex-col truncate">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                      {item.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 tracking-wider">
                                      {item.pan}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/10 rounded">
                                    Select
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-xs text-slate-400">
                                No clients match your search
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-emerald-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm & Register</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
