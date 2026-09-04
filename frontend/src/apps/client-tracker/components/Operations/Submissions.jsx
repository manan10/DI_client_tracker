// src/components/Operations/Submissions.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Landmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";

// Sub-components
import NewSubmission from "./Submissions/NewSubmission";
import SubmissionDetail from "./Submissions/SubmissionDetail";
import CommandHeader from "./Submissions/CommandHeader";
import CategoryCards from "./Submissions/CategoryCards";
import DesktopTable from "./Submissions/DesktopTable";
import MobileCards from "./Submissions/MobileCards";

const Submissions = () => {
  const { request } = useApi();

  // Registry State
  const [submissions, setSubmissions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("PURCHASE_SIP");
  const [viewMode, setViewMode] = useState("ACTIVE"); // ACTIVE | FINALIZED
  const [searchTerm, setSearchTerm] = useState("");

  // Sort & Pagination State
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [prevFilters, setPrevFilters] = useState({
    searchTerm,
    activeCategory,
    viewMode,
  });

  // Panel Control
  const [isNewPanelOpen, setIsNewPanelOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // 1. Unified Registry Sync Effect
  useEffect(() => {
    let isMounted = true;
    const loadRegistry = async () => {
      try {
        const res = await request("/submissions");
        if (res?.success && isMounted) {
          setSubmissions(res.data);
        }
      } catch (err) {
        console.error("Registry sync failed:", err);
      }
    };
    loadRegistry();
    return () => {
      isMounted = false;
    };
  }, [request]);

  // 2. Render-phase state reset for Pagination
  if (
    searchTerm !== prevFilters.searchTerm ||
    activeCategory !== prevFilters.activeCategory ||
    viewMode !== prevFilters.viewMode
  ) {
    setCurrentPage(1);
    setPrevFilters({ searchTerm, activeCategory, viewMode });
  }

  // 3. Generate Counts for Command Tabs
  const counts = useMemo(() => {
    const map = {
      PURCHASE_SIP: 0,
      PURCHASE_LUMPSUM: 0,
      REDEMPTION: 0,
      SWP: 0,
      NON_FINANCIAL: 0,
    };
    submissions.forEach((sub) => {
      const isMatch =
        viewMode === "FINALIZED" ? sub.isFinalized : !sub.isFinalized;
      if (isMatch && map[sub.type] !== undefined) map[sub.type]++;
    });
    return map;
  }, [submissions, viewMode]);

  // 4. Pipeline: Filter -> Sort -> Paginate
  const processedData = useMemo(() => {
    let result = submissions.filter((sub) => {
      const matchesView =
        viewMode === "FINALIZED" ? sub.isFinalized : !sub.isFinalized;
      const matchesCategory = sub.type === activeCategory;
      const matchesSearch =
        sub.schemeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.folioNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.rtaReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subType?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesView && matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.creationDate || a.createdAt).getTime();
        const dateB = new Date(b.creationDate || b.createdAt).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === "client") {
        const nameA = (a.client?.name || "").toLowerCase();
        const nameB = (b.client?.name || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      return 0;
    });

    return result;
  }, [activeCategory, submissions, searchTerm, viewMode, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Event Handlers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleRecordUpdate = (updatedRecord) => {
    setSubmissions((prev) =>
      prev.map((s) => (s._id === updatedRecord._id ? updatedRecord : s)),
    );
  };
  const handleRecordDelete = (deletedId) => {
    setSubmissions((prev) => prev.filter((s) => s._id !== deletedId));
  };

  const handleRowClick = (id) => {
    setSelectedSubmissionId(id);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <CommandHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewClick={() => setIsNewPanelOpen(true)}
      />

      <CategoryCards
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        counts={counts}
      />

      {/* CONTENT REGISTRY CONTAINER */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-125">
        <DesktopTable
          data={paginatedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={handleRowClick}
        />

        <MobileCards data={paginatedData} onRowClick={handleRowClick} />

        {/* EMPTY STATE */}
        {processedData.length === 0 && (
          <div className="px-6 py-20 text-center flex flex-col items-center justify-center opacity-40 flex-1">
            <Landmark
              size={40}
              strokeWidth={1.5}
              className="mb-4 text-slate-500"
            />
            <p className="text-[11px] font-[1000] uppercase tracking-[0.3em] text-slate-500">
              Registry List Clear
            </p>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {processedData.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 p-4 flex items-center justify-between mt-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Showing{" "}
              <span className="text-slate-900 dark:text-white font-[1000]">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-900 dark:text-white font-[1000]">
                {Math.min(currentPage * itemsPerPage, processedData.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-900 dark:text-white font-[1000]">
                {processedData.length}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-[1000] text-slate-700 dark:text-slate-300 px-3 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <NewSubmission
        isOpen={isNewPanelOpen}
        onClose={() => setIsNewPanelOpen(false)}
        onCreated={(newSub) => {
          setSubmissions((prev) => [newSub, ...prev]);
          setActiveCategory(newSub.type);
        }}
      />

      <SubmissionDetail
        submissionId={selectedSubmissionId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSubmissionId(null);
        }}
        onUpdate={handleRecordUpdate}
        onDelete={handleRecordDelete}
      />
    </div>
  );
};

export default Submissions;
