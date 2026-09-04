import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Inbox,
  RefreshCw,
  WifiOff,
  Check,
  Building2,
  Trash2,
  AlertTriangle,
  CloudSync,
  LayoutList,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useApi } from "../../../../shared/hooks/useApi";
import { tallyTemplates } from "../../utils/tallyTemplates";
import AuditWizard from "./AuditManager/AuditWizard";

const AuditManager = () => {
  const { request } = useApi();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [arns, setArns] = useState([]);

  // Custom Delete Modal State
  const [auditToDelete, setAuditToDelete] = useState(null);

  // Tally Sync States
  const [isTallyOnline, setIsTallyOnline] = useState(false);
  const [activeFirms, setActiveFirms] = useState([]);
  const [syncState, setSyncState] = useState({
    isOpen: false,
    isComplete: false,
    logs: [],
    currentFirm: "",
    progress: 0,
    isSyncing: false,
  });
  const [lastGlobalSync, setLastGlobalSync] = useState(
    localStorage.getItem("last_global_sync") || "Never",
  );

  const now = new Date();
  const currentMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const currentYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const [selection, setSelection] = useState({
    arn: null,
    tallyCompanyName: null,
    month: currentMonth,
    year: currentYear,
    files: [],
    stagedData: null,
    audit: null,
    verifiedIds: [],
    isFreshStart: false,
  });

  const checkConnection = useCallback(async () => {
    try {
      const res = await request("/tally/proxy", "POST", {
        xml: tallyTemplates.getCompanies(),
      });
      if (res) {
        const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(
          (m) => m[1],
        );
        const filtered = [...new Set(matches)].filter(
          (n) => !n.includes("migrated-to"),
        );
        setActiveFirms(filtered);
        setIsTallyOnline(filtered.length > 0);
      } else {
        setIsTallyOnline(false);
        setActiveFirms([]);
      }
    } catch {
      setIsTallyOnline(false);
      setActiveFirms([]);
    }
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      const arnRes = await request("/arns", "GET");
      setArns(arnRes?.data || []);
    } catch {
      // Silent catch
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await request("/audit/summary-list", "GET");
      if (res?.success) setAudits(res.data);
      await checkConnection();
      await fetchMasterData();
    } catch (err) {
      console.error("Error refreshing data", err);
    }
  }, [checkConnection, fetchMasterData]);

  // STABLE: Run once on component mount only
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      refreshData();
    }
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return;

    try {
      const res = await request(`/audit/${auditToDelete}`, "DELETE");
      if (res?.success) {
        setAudits((prev) => prev.filter((a) => a._id !== auditToDelete));
        toast.success("Company dossier deleted successfully.");
      } else {
        toast.error("Failed to delete dossier.");
      }
    } catch (err) {
      console.error("Delete Audit Error:", err);
      toast.error(err.message || "An error occurred while deleting.");
    } finally {
      setAuditToDelete(null);
    }
  };

  const handleSync = async (targetFirm = null) => {
    setSyncState({
      isOpen: true,
      isComplete: false,
      logs: ["Initiating secure connection..."],
      currentFirm: "",
      progress: 5,
      isSyncing: true,
    });
    try {
      const companyRes = await request("/tally/proxy", "POST", {
        xml: tallyTemplates.getCompanies(),
      });
      const matches = [...companyRes.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(
        (m) => m[1],
      );
      const activeFirmsList = [...new Set(matches)].filter(
        (n) => !n.includes("migrated-to"),
      );

      if (activeFirmsList.length === 0) {
        setSyncState((prev) => ({
          ...prev,
          logs: [...prev.logs, "No active companies found in Tally."],
          isSyncing: false,
        }));
        return;
      }

      const firmsToSync = targetFirm
        ? activeFirmsList.filter((f) => f === targetFirm)
        : activeFirmsList;

      if (firmsToSync.length === 0 && targetFirm) {
        setSyncState((prev) => ({
          ...prev,
          logs: [...prev.logs, `⚠️ ${targetFirm} is no longer open in Tally.`],
          isSyncing: false,
        }));
        return;
      }

      for (let i = 0; i < firmsToSync.length; i++) {
        const firm = firmsToSync[i];
        const matchedArn = arns.find((a) => a.linkedTallyFirms?.includes(firm));

        if (!matchedArn) {
          setSyncState((prev) => ({
            ...prev,
            logs: [
              ...prev.logs,
              `⚠️ Skipped ${firm}: No ARN link found in Settings.`,
            ],
          }));
          continue;
        }

        setSyncState((prev) => ({
          ...prev,
          currentFirm: firm,
          logs: [...prev.logs, `Synchronizing: ${firm}`],
        }));

        const ledgerRes = await request("/tally/proxy", "POST", {
          xml: tallyTemplates.getLedgers(firm),
        });

        const ledgerMatches = [
          ...ledgerRes.matchAll(
            /<LEDGER NAME="([^"]*)"[^>]*>([\s\S]*?)<\/LEDGER>/gi,
          ),
        ];

        const mapped = ledgerMatches.map((m) => {
          const name = tallyTemplates.unescapeXml(m[1]);
          const block = m[2];

          const parentMatch = block.match(/<PARENT[^>]*>(.*?)<\/PARENT>/i);
          const stateMatch =
            block.match(
              /<(?:LED)?STATENAME[^>]*>(.*?)<\/(?:LED)?STATENAME>/i,
            ) || block.match(/<PRIORSTATENAME[^>]*>(.*?)<\/PRIORSTATENAME>/i);
          const countryMatch = block.match(
            /<COUNTRY(?:NAME|OFRESIDENCE)[^>]*>(.*?)<\/COUNTRY(?:NAME|OFRESIDENCE)>/i,
          );

          // 1. Root-level GSTIN extraction
          const rootGstinMatch =
            block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i) ||
            block.match(/<GSTIN[^>]*>(.*?)<\/GSTIN>/i);
          let gstin = rootGstinMatch
            ? tallyTemplates.unescapeXml(rootGstinMatch[1]).trim()
            : "";

          // 2. Sub-collection fallback (TallyPrime 3.0+ multi-GST effective registrations)
          if (!gstin) {
            const nestedGstinMatch =
              block.match(
                /<GSTREGISTRATIONDETAILS[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTREGISTRATIONDETAILS>/i,
              ) ||
              block.match(
                /<LEDGSTREGDETAILS\.LIST[^>]*>[\s\S]*?<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>[\s\S]*?<\/LEDGSTREGDETAILS\.LIST>/i,
              ) ||
              block.match(
                /<GSTDETAILS\.LIST[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTDETAILS\.LIST>/i,
              );
            if (nestedGstinMatch && nestedGstinMatch[1].trim()) {
              gstin = tallyTemplates.unescapeXml(nestedGstinMatch[1]).trim();
            }
          }

          // 3. GST Registration Type
          const regTypeMatch =
            block.match(
              /<GSTREGISTRATIONTYPE[^>]*>(.*?)<\/GSTREGISTRATIONTYPE>/i,
            ) ||
            block.match(/<REGISTRATIONTYPE[^>]*>(.*?)<\/REGISTRATIONTYPE>/i);
          const gstRegistrationType = regTypeMatch
            ? tallyTemplates.unescapeXml(regTypeMatch[1]).trim()
            : gstin
              ? "Regular"
              : "Unregistered";

          const addressMatches = [
            ...block.matchAll(/<ADDRESS[^>]*>(.*?)<\/ADDRESS>/gi),
          ];
          const addressList = addressMatches
            .map((a) => tallyTemplates.unescapeXml(a[1]).trim())
            .filter(Boolean);

          return {
            name: name,
            parent: parentMatch
              ? tallyTemplates.unescapeXml(parentMatch[1]).trim()
              : "",
            stateName: stateMatch
              ? tallyTemplates.unescapeXml(stateMatch[1]).trim()
              : "",
            country: countryMatch
              ? tallyTemplates.unescapeXml(countryMatch[1]).trim()
              : "India",
            gstin: gstin,
            gstRegistrationType: gstRegistrationType,
            address: addressList,
          };
        });

        await request("/ledgers/bulk-sync", "POST", {
          ledgers: mapped,
          company: firm,
          arnId: matchedArn._id,
        });

        setSyncState((prev) => ({
          ...prev,
          progress: ((i + 1) / firmsToSync.length) * 100,
          logs: [
            ...prev.logs,
            `Successfully updated ${mapped.length} accounts from ${firm}`,
          ],
        }));
      }

      const time = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLastGlobalSync(time);
      localStorage.setItem("last_global_sync", time);
      setSyncState((prev) => ({
        ...prev,
        isComplete: true,
        isSyncing: false,
        logs: [...prev.logs, "Sync operation finalized successfully."],
      }));
    } catch (err) {
      console.error("Sync Error:", err);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        logs: [...prev.logs, "Connection to Bridge failed."],
      }));
    }
  };

  const displayAudits = useMemo(() => {
    return audits.filter((a) =>
      activeTab === "current" ? a.status === "DRAFT" : a.status === "EXPORTED",
    );
  }, [audits, activeTab]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <div className="w-full flex flex-col font-sans text-left min-w-0">
        {/* TOP COMMAND STRIP & WORKSPACE HEADER */}
        <header className="w-full pb-6 pt-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 border-b border-slate-200/80 dark:border-white/10">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-3 py-1 rounded-md flex items-center gap-2 border text-xs font-bold transition-all shadow-sm ${
                  isTallyOnline
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isTallyOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${isTallyOnline ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isTallyOnline ? "Tally Bridge Online" : "Bridge Offline"}
                </span>
              </div>

              <button
                onClick={refreshData}
                disabled={syncState.isSyncing}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw
                  size={12}
                  className={`${syncState.isSyncing ? "animate-spin" : "group-active:rotate-180 transition-transform duration-500"}`}
                />
                Refresh
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-xl md:text-3xl uppercase font-1000 tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-emerald-500 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
                Tally Automation Zone
              </h1>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                • Tally Batch Processing and Reconciliation Engine
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelection({
                ...selection,
                isFreshStart: true,
                tallyCompanyName: null,
                audit: null,
              });
              setIsWizardOpen(true);
            }}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-98 flex justify-center items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Start New Batch
          </button>
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6 pt-6 min-w-0">
          {/* MOBILE BRIDGE INTELLIGENCE STRIP */}
          <div className="lg:hidden w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSync
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Live Bridge Entities
                </h2>
              </div>
              <button
                onClick={() => handleSync(null)}
                disabled={!isTallyOnline || activeFirms.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <CloudSync size={12} /> Sync All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {activeFirms.length > 0 ? (
                activeFirms.map((firm, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-lg shadow-xs flex items-center justify-between gap-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2
                        size={14}
                        className="text-emerald-600 dark:text-emerald-400 shrink-0"
                      />
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                        {firm}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSync(firm)}
                      className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer"
                      title={`Sync ${firm}`}
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    No active entities detected in Tally
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP SIDEBAR */}
          <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-5">
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Bridge Intelligence
                  </h2>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Active Tally Entities
                  </p>
                </div>
                <button
                  onClick={() => handleSync(null)}
                  disabled={!isTallyOnline || activeFirms.length === 0}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CloudSync size={12} /> Sync All
                </button>
              </div>

              <div className="space-y-2.5">
                {activeFirms.length > 0 ? (
                  activeFirms.map((firm, idx) => (
                    <div
                      key={idx}
                      className="group p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-lg shadow-xs hover:border-emerald-500/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2
                            size={14}
                            className="text-emerald-600 dark:text-emerald-400 shrink-0"
                          />
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                            Live
                          </span>
                        </div>

                        <button
                          onClick={() => handleSync(firm)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-all cursor-pointer"
                          title={`Sync ${firm} Ledgers`}
                        >
                          <RefreshCw size={11} />
                        </button>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                        {firm}
                      </p>
                      <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Tally Connected
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-lg">
                    <WifiOff
                      size={20}
                      className="mx-auto mb-2 text-slate-400 opacity-60"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Bridge Offline • Open Tally
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Auditor Protocol
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
                Ensure all bank statements are synchronized with the active
                Tally master ledgers before triggering export files.
              </p>
            </div>
          </aside>

          {/* MAIN DOSSIER WORKBENCH */}
          <section className="flex-1 flex flex-col min-w-0 space-y-4">
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex p-1 bg-slate-200/70 dark:bg-slate-900/60 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === "current"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Incomplete (
                  {audits.filter((a) => a.status === "DRAFT").length})
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Archives (
                  {audits.filter((a) => a.status === "EXPORTED").length})
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 px-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Master Sync:
                </span>
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                  {lastGlobalSync}
                </span>
              </div>
            </div>

            {displayAudits.length > 0 ? (
              <>
                <div className="hidden lg:block w-full overflow-hidden bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xs">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3.5 w-1/2">Company Scope</th>
                        <th className="px-5 py-3.5 text-center w-1/4">
                          Status Stage
                        </th>
                        <th className="px-5 py-3.5 text-right w-1/4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {displayAudits.map((audit) => (
                        <AuditTableRow
                          key={audit._id}
                          audit={audit}
                          isOnline={isTallyOnline}
                          onAction={() => {
                            if (audit.status === "EXPORTED") return;
                            setSelection({
                              audit,
                              tallyCompanyName: audit.tallyCompanyName,
                              arnId: audit.arnId?._id || audit.arnId,
                              arn: audit.arnId?._id || audit.arnId,
                              month: audit.month,
                              year: audit.year,
                              stagedData: null,
                              verifiedIds: [],
                              isFreshStart: false,
                            });
                            setIsWizardOpen(true);
                          }}
                          onDelete={() => setAuditToDelete(audit._id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden space-y-3">
                  {displayAudits.map((audit) => (
                    <AuditMobileCard
                      key={audit._id}
                      audit={audit}
                      isOnline={isTallyOnline}
                      onAction={() => {
                        if (audit.status === "EXPORTED") return;
                        setSelection({
                          audit,
                          tallyCompanyName: audit.tallyCompanyName,
                          arnId: audit.arnId?._id || audit.arnId,
                          arn: audit.arnId?._id || audit.arnId,
                          month: audit.month,
                          year: audit.year,
                          stagedData: null,
                          verifiedIds: [],
                          isFreshStart: false,
                        });
                        setIsWizardOpen(true);
                      }}
                      onDelete={() => setAuditToDelete(audit._id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50/30 dark:bg-slate-900/20 text-slate-400">
                <Inbox
                  size={36}
                  strokeWidth={1.5}
                  className="mb-2 opacity-50"
                />
                <p className="text-xs font-black uppercase tracking-widest">
                  Workspace Clear
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  No dossiers found for this status view.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* SYNC MODAL OVERLAY */}
        {syncState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
              <div className="relative inline-flex mx-auto">
                {syncState.isComplete ? (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 animate-in zoom-in">
                    <Check size={28} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                    <RefreshCw
                      className="animate-spin"
                      size={28}
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {syncState.isComplete
                    ? "Sync Completed"
                    : "Synchronizing Tally Masters"}
                </h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate px-4">
                  {syncState.isComplete
                    ? "Bridge operations reconciled successfully"
                    : `Processing: ${syncState.currentFirm || "Connecting..."}`}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${syncState.progress}%` }}
                />
              </div>

              {/* Logs Viewport */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 text-left custom-scroll">
                {syncState.logs.map((log, i) => (
                  <p
                    key={i}
                    className="text-[11px] font-mono text-slate-600 dark:text-slate-300 leading-tight"
                  >
                    • {log}
                  </p>
                ))}
              </div>

              <button
                onClick={() =>
                  setSyncState({
                    isOpen: false,
                    isComplete: false,
                    logs: [],
                    currentFirm: "",
                    progress: 0,
                    isSyncing: false,
                  })
                }
                disabled={!syncState.isComplete}
                className={`w-full py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider transition-all shadow-sm ${
                  syncState.isComplete
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white cursor-pointer"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {syncState.isComplete ? "Done" : "Sync In Progress..."}
              </button>
            </div>
          </div>
        )}

        {/* CUSTOM DELETE CONFIRMATION MODAL */}
        {auditToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-200 dark:border-rose-500/20 text-rose-500">
                <AlertTriangle size={18} strokeWidth={2.5} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Delete Batch
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this batch? This
                  will discard all staged data for this month.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setAuditToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAudit}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/20 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT WIZARD MODAL */}
        {isWizardOpen && (
          <AuditWizard
            onClose={() => {
              setIsWizardOpen(false);
              refreshData();
            }}
            initialSelection={selection}
            existingAudits={audits}
            isTallyOnline={isTallyOnline}
            parentArns={arns}
          />
        )}
      </div>
    </>
  );
};

const AuditTableRow = ({ audit, onAction, onDelete, isOnline }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraft = audit?.status === "DRAFT" || audit?.status === "Draft";
  const bankSummaries = audit?.bankSummaries || [];

  const formatINRValue = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      notation: "compact",
      compactDisplay: "short",
    }).format(amount || 0);
  };

  const getStageDisplay = () => {
    if (!isDraft)
      return {
        label: "Step 6: Exported",
        color:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
      };
    if (bankSummaries.length > 0)
      return {
        label: "Step 3-5: Matrix Verification",
        color:
          "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20",
      };
    return {
      label: "Step 2: Ingestion Staging",
      color:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    };
  };

  const stage = getStageDisplay();

  return (
    <React.Fragment>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group transition-all cursor-pointer ${
          isExpanded
            ? "bg-slate-50/80 dark:bg-slate-800/40"
            : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
        }`}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            <div
              className={`w-1 h-8 rounded-full shrink-0 ${isDraft ? "bg-amber-400" : "bg-emerald-500"}`}
            />
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight truncate">
                {audit?.tallyCompanyName ||
                  audit?.clientName ||
                  "Client Accounts A/C"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate">
                Period: {audit?.month || 1}/{audit?.year || 2026} •{" "}
                {bankSummaries.length} Bank Account(s)
              </p>
            </div>
          </div>
        </td>

        <td className="px-5 py-3.5 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${stage.color}`}
          >
            {stage.label}
          </span>
        </td>

        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Batch"
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer ${
                isDraft
                  ? isOnline
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100"
              }`}
            >
              {isDraft ? (
                isOnline ? (
                  <>
                    <LayoutList size={13} /> Open Batch <ArrowRight size={13} />
                  </>
                ) : (
                  <>Tally Offline</>
                )
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  Completed
                </>
              )}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan="3"
            className="p-0 bg-slate-50/50 dark:bg-slate-900/30 border-t border-b border-slate-200/80 dark:border-white/5"
          >
            <div className="p-4 animate-in fade-in duration-200">
              {bankSummaries.length > 0 ? (
                <div className="border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <th className="px-3.5 py-2.5">Bank Ledger Account</th>
                        <th className="px-3.5 py-2.5 text-right">Receipts</th>
                        <th className="px-3.5 py-2.5 text-right">Sales</th>
                        <th className="px-3.5 py-2.5 text-right">Payments</th>
                        <th className="px-3.5 py-2.5 text-right text-emerald-700 dark:text-emerald-400">
                          Total Inflow
                        </th>
                        <th className="px-3.5 py-2.5 text-right text-rose-700 dark:text-rose-400">
                          Total Outflow
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {bankSummaries.map((bank, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-3.5 py-2 text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                            {bank.tallyLedgerName}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                            {bank.receiptCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {bank.salesCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                            {bank.paymentCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{formatINRValue(bank.totalReceipts)}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                            ₹{formatINRValue(bank.totalPayments)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-t border-slate-200 dark:border-white/10 font-bold">
                        <td className="px-3.5 py-2 text-[10px] uppercase tracking-wider text-slate-900 dark:text-white">
                          Grand Total
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-black text-slate-900 dark:text-white">
                          {audit?.summary?.receiptCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {audit?.summary?.salesCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-black text-slate-900 dark:text-white">
                          {audit?.summary?.paymentCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ₹{formatINRValue(audit?.summary?.totalReceipts)}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                          ₹{formatINRValue(audit?.summary?.totalPayments)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="w-full p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-lg text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    No bank statement items parsed in this dossier
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const AuditMobileCard = ({ audit, onAction, onDelete, isOnline }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraft = audit?.status === "DRAFT" || audit?.status === "Draft";
  const bankSummaries = audit?.bankSummaries || [];

  const formatINRValue = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      notation: "compact",
      compactDisplay: "short",
    }).format(amount || 0);
  };

  const getStageDisplay = () => {
    if (!isDraft)
      return {
        label: "Exported",
        color:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
      };
    if (bankSummaries.length > 0)
      return {
        label: "Matrix Verification",
        color:
          "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20",
      };
    return {
      label: "Ingestion Staging",
      color:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    };
  };

  const stage = getStageDisplay();

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${isDraft ? "bg-amber-400" : "bg-emerald-500"}`}
            />
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${stage.color}`}
            >
              {stage.label}
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
            {audit?.tallyCompanyName ||
              audit?.clientName ||
              "Client Accounts A/C"}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Period: {audit?.month || 1}/{audit?.year || 2026} •{" "}
            {bankSummaries.length} Bank Account(s)
          </p>
        </div>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <button
        onClick={onAction}
        className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-98 ${
          isDraft
            ? isOnline
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
        }`}
      >
        {isDraft ? (
          isOnline ? (
            <>
              <LayoutList size={14} /> Open Dossier <ArrowRight size={14} />
            </>
          ) : (
            <>Tally Offline</>
          )
        ) : (
          <>
            <CheckCircle2 size={14} /> View Exported File
          </>
        )}
      </button>

      {bankSummaries.length > 0 && (
        <div className="pt-1 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 py-1"
          >
            <span>Breakdown ({bankSummaries.length} Banks)</span>
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {isExpanded && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              {bankSummaries.map((bank, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                      {bank.tallyLedgerName}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {bank.salesCount || 0} Sales
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-200/50 dark:border-white/5">
                    <span className="text-emerald-600 font-bold">
                      In: ₹{formatINRValue(bank.totalReceipts)}
                    </span>
                    <span className="text-rose-600 font-bold">
                      Out: ₹{formatINRValue(bank.totalPayments)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditManager;
