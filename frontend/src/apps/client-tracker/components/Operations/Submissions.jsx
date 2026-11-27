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
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

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
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden flex flex-col min-h-125">
        <DesktopTable
          data={paginatedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={handleRowClick}
        />

        <MobileCards data={paginatedData} onRowClick={handleRowClick} />

        {/* EMPTY STATE */}
        {processedData.length === 0 && (
          <div className="px-6 py-20 text-center flex flex-col items-center justify-center flex-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 mb-3">
              <Landmark size={28} strokeWidth={1.75} />
            </div>
            <p className="sora-font text-xs font-semibold text-slate-600 dark:text-slate-300">
              No submissions found
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Try switching categories or clearing your search filter.
            </p>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {processedData.length > 0 && (
          <div className="bg-slate-50/90 dark:bg-[#1C2230] border-t border-slate-200 dark:border-slate-800/80 px-5 py-3.5 flex items-center justify-between mt-auto">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, processedData.length)}
              </span>{" "}
              of{" "}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {processedData.length}
              </span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-sky-600 dark:hover:text-sky-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 px-2.5 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-sky-600 dark:hover:text-sky-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={15} />
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
