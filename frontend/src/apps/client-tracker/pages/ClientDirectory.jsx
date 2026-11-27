import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Users,
  Search,
  UserPlus,
  X,
  CreditCard,
  User,
  Network,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";

// Components
import Navbar from "../components/Shared/Navbar";
import WorkspaceShell from "../../../shared/components/WorkspaceShell";
import DirectoryFilters from "../components/Directory/DirectoryFilters";
import TierSummary from "../components/Directory/TierSummary";
import ClientTableContainer from "../components/Directory/ClientTableContainer";
import InteractionModal from "../components/Shared/InteractionModal";

// Hooks
import { useApi } from "../../../shared/hooks/useApi";
import { useClientData } from "../hooks/useClientData";

const ClientDirectory = () => {
  const [clients, setClients] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "aum",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(30);

  // Selection & Quick Interaction States
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [quickLogClient, setQuickLogClient] = useState(null);

  // Slide-over / Bottom Sheet States for New Client
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPan, setFormPan] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
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
    quickFilter,
    sortConfig,
    thresholds
  );

  // Compute chip counts from allFamilies
  const chipCounts = useMemo(() => {
    return {
      all: allFamilies.length,
      attention: allFamilies.filter((f) => f.isQuiet).length,
      families: allFamilies.filter((f) => f.members.length > 1).length,
      individuals: allFamilies.filter((f) => f.members.length === 1).length,
      incomplete: allFamilies.filter((f) => f.hasMissingInfo).length,
    };
  }, [allFamilies]);

  const handleClientClick = (client) => {
    navigate(`/client/${client._id}`);
  };

  const requestSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredFamilies.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalRecords = filteredFamilies.length;

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllPage = () => {
    const allOnPageSelected =
      currentRecords.length > 0 &&
      currentRecords.every((r) => selectedIds.has(r._id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        currentRecords.forEach((r) => next.delete(r._id));
      } else {
        currentRecords.forEach((r) => next.add(r._id));
      }
      return next;
    });
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    const rowsToExport =
      selectedIds.size > 0
        ? filteredFamilies.filter((f) => selectedIds.has(f._id))
        : filteredFamilies;

    if (!rowsToExport.length) return;

    const headers = [
      "Family Head",
      "PAN",
      "Tier",
      "Family AUM (INR)",
      "Members Count",
      "Phone",
      "Email",
      "Days Since Last Touch",
    ];

    const csvLines = [
      headers.join(","),
      ...rowsToExport.map((f) =>
        [
          `"${(f.name || "").replace(/"/g, '""')}"`,
          `"${f.pan || ""}"`,
          `"${f.category || ""}"`,
          f.familyAum || 0,
          f.members?.length || 1,
          `"${f.contactDetails?.phoneNo || ""}"`,
          `"${f.contactDetails?.email || ""}"`,
          f.daysSinceUpdate ?? "",
        ].join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `client-registry-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter existing clients for family attachment
  const eligibleExistingFamilyClients = useMemo(() => {
    if (!familySearchQuery.trim()) return clients.slice(0, 8);
    const q = familySearchQuery.toLowerCase();
    return clients
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) || c.pan?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [clients, familySearchQuery]);

  const handleCloseDrawer = () => {
    setIsCreateDrawerOpen(false);
    setFormName("");
    setFormPan("");
    setFormPhone("");
    setFormEmail("");
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

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(trimmedPan)) {
      setFormError("Invalid PAN card format (Expected: ABCDE1234F).");
      return;
    }

    if (familyMode === "existing" && !selectedFamilyClient) {
      setFormError(
        "Please choose an existing client or family head to attach to."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: trimmedName,
        pan: trimmedPan,
        contactDetails: {
          phoneNo: formPhone.trim() || "N/A",
          email: formEmail.trim().toLowerCase() || "N/A",
        },
        isFamilyHead: familyMode === "new",
        familyId:
          familyMode === "existing"
            ? selectedFamilyClient.familyId || selectedFamilyClient._id
            : undefined,
      };

      const res = await request("/clients/", "POST", payload);

      if (res?.success || res?._id || res?.data) {
        handleCloseDrawer();
        await fetchDirectoryData();
      } else {
        setFormError(
          res?.message || res?.error || "Failed to register new client."
        );
      }
    } catch (err) {
      console.error("Client creation failed:", err);
      setFormError(
        err?.message || "Server error occurred while registering client."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      <WorkspaceShell
        navbar={<Navbar />}
        badge="Portfolio Registry"
        badgeIcon={Users}
        title="Client"
        accent="Registry"
        description={`Managing ${totalRecords} active family wealth portfolios`}
        rightSlot={
          <button
            type="button"
            onClick={() => setIsCreateDrawerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-[0.99] shrink-0 cursor-pointer shadow-xs"
          >
            <UserPlus size={15} strokeWidth={2.5} />
            <span>Register Client</span>
          </button>
        }
      >
        <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-300 w-full min-w-0">
          {/* 1. Unified Compact AUM & Tier Intelligence Strip */}
          {thresholds && allFamilies.length > 0 && (
            <TierSummary
              families={allFamilies}
              activeTier={filterTier}
              thresholds={thresholds}
              onTierSelect={(tier) => {
                setFilterTier(tier);
                setCurrentPage(1);
              }}
            />
          )}

          {/* 2. Search, Sort, Export & Quick Filter Chips */}
          <DirectoryFilters
            searchTerm={searchTerm}
            selectedTierValue={filterTier}
            quickFilter={quickFilter}
            sortConfig={sortConfig}
            counts={chipCounts}
            selectedCount={selectedIds.size}
            onSearchChange={(v) => {
              setSearchTerm(v);
              setCurrentPage(1);
            }}
            onTierChange={(v) => {
              setFilterTier(v);
              setCurrentPage(1);
            }}
            onQuickFilterChange={(chipId) => {
              setQuickFilter(chipId);
              setCurrentPage(1);
            }}
            onSortChange={(nextSort) => {
              setSortConfig(nextSort);
              setCurrentPage(1);
            }}
            onExportCsv={handleExportCsv}
          />

          {/* 3. Actionable Client Records Ledger */}
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
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAllPage={handleToggleSelectAllPage}
            onQuickLog={(client) => setQuickLogClient(client)}
          />
        </div>
      </WorkspaceShell>

      {/* QUICK INTERACTION MODAL (1-Click Log Touch from Directory) */}
      {quickLogClient && (
        <InteractionModal
          key={quickLogClient._id}
          isOpen={!!quickLogClient}
          onClose={() => setQuickLogClient(null)}
          initialClient={quickLogClient}
          onRefresh={fetchDirectoryData}
        />
      )}

      {/* RESPONSIVE SLIDE-OVER (Desktop) / BOTTOM SHEET (Mobile) FOR NEW CLIENT */}
      {isCreateDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          <div className="relative w-full sm:max-w-md bg-white dark:bg-[#161B26] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 rounded-t-lg sm:rounded-none shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-screen animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
            {/* Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#1C2230]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/25">
                  <UserPlus size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="sora-font text-sm font-bold text-slate-900 dark:text-white">
                    Register{" "}
                    <span className="font-normal text-sky-600 dark:text-sky-300">
                      New Client
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Manual ledger entry (Wealth Elite sync-safe)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleCreateClient}
              className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
            >
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-lg text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User size={12} className="text-slate-400" />
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAJESH HARILAL SHAH"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-900 dark:text-white uppercase outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CreditCard size={12} className="text-slate-400" />
                  PAN Card Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={formPan}
                  onChange={(e) =>
                    setFormPan(e.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold text-slate-900 dark:text-white uppercase outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400 font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9825012345"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Network size={12} className="text-slate-400" />
                  Family Structure Assignment
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFamilyMode("new");
                      setSelectedFamilyClient(null);
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      familyMode === "new"
                        ? "bg-sky-50/80 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/40 text-sky-700 dark:text-sky-300"
                        : "bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="sora-font text-xs font-bold">
                      New Family
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5 leading-snug">
                      Standalone head portfolio
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFamilyMode("existing")}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      familyMode === "existing"
                        ? "bg-sky-50/80 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/40 text-sky-700 dark:text-sky-300"
                        : "bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="sora-font text-xs font-bold">
                      Existing Family
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5 leading-snug">
                      Link to existing household
                    </span>
                  </button>
                </div>

                {familyMode === "existing" && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    {selectedFamilyClient ? (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1C2230] border border-sky-300 dark:border-sky-500/40 rounded-lg">
                        <div className="flex flex-col min-w-0">
                          <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {selectedFamilyClient.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            PAN: {selectedFamilyClient.pan}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFamilyClient(null)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
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
                            placeholder="Search family by name or PAN..."
                            value={familySearchQuery}
                            onChange={(e) =>
                              setFamilySearchQuery(e.target.value)
                            }
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#131720]">
                          {eligibleExistingFamilyClients.length > 0 ? (
                            eligibleExistingFamilyClients.map((item) => (
                              <button
                                type="button"
                                key={item._id}
                                onClick={() => setSelectedFamilyClient(item)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-[#1C2230] flex items-center justify-between text-xs transition-colors cursor-pointer"
                              >
                                <div className="flex flex-col truncate pr-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {item.pan}
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-300 px-2 py-0.5 bg-sky-50 dark:bg-sky-500/10 rounded-md border border-sky-200/70 dark:border-sky-500/25 shrink-0">
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

              {/* Sticky Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C2230] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
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