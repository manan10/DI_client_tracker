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

import TabHeader from "../../../../shared/components/TabHeader";
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
  }, [request]);

  const fetchMasterData = useCallback(async () => {
    try {
      const arnRes = await request("/arns", "GET");
      setArns(arnRes?.data || []);
    } catch {
      // Silent catch
    }
  }, [request]);

  const refreshData = useCallback(async () => {
    try {
      const res = await request("/audit/summary-list", "GET");
      if (res?.success) setAudits(res.data);
      await checkConnection();
      await fetchMasterData();
    } catch (err) {
      console.error("Error refreshing data", err);
    }
  }, [request, checkConnection, fetchMasterData]);

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
  }, [refreshData, checkConnection]);

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return;

    try {
      const res = await request(`/audit/${auditToDelete}`, "DELETE");
      if (res?.success) {
        setAudits((prev) => prev.filter((a) => a._id !== auditToDelete));
        toast.success("Batch deleted successfully.");
      } else {
        toast.error("Failed to delete batch.");
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

          const rootGstinMatch =
            block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i) ||
            block.match(/<GSTIN[^>]*>(.*?)<\/GSTIN>/i);
          let gstin = rootGstinMatch
            ? tallyTemplates.unescapeXml(rootGstinMatch[1]).trim()
            : "";

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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <div className="w-full flex flex-col text-left min-w-0 space-y-6 animate-in fade-in duration-300">
        {/* SUBORDINATE TAB HEADER WITH BRIDGE STATUS & START CTA */}
        <TabHeader
          kicker="Voucher & Ledger Sync"
          title="Tally"
          accent="Zone"
          description="Sync Tally master ledgers, map bank statements, and push reconciled vouchers directly to Tally."
          actions={
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Bridge Status Badge */}
              <div
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 border text-xs font-semibold transition-colors ${
                  isTallyOnline
                    ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200/80 dark:border-sky-500/25 text-sky-700 dark:text-sky-300"
                    : "bg-rose-50 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/25 text-rose-700 dark:text-rose-300"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isTallyOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isTallyOnline ? "bg-sky-500" : "bg-rose-500"
                    }`}
                  />
                </span>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
                  {isTallyOnline ? "Bridge Online" : "Bridge Offline"}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={refreshData}
                disabled={syncState.isSyncing}
                className="group inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 hover:border-sky-500/40 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw
                  size={13}
                  className={`${
                    syncState.isSyncing
                      ? "animate-spin text-sky-500"
                      : "group-active:rotate-180 transition-transform duration-500"
                  }`}
                />
                <span>Refresh</span>
              </button>

              {/* Start New Batch CTA */}
              <button
                type="button"
                onClick={() => {
                  setSelection({
                    ...selection,
                    isFreshStart: true,
                    tallyCompanyName: null,
                    audit: null,
                  });
                  setIsWizardOpen(true);
                }}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all active:scale-[0.99] flex justify-center items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Start New Batch</span>
              </button>
            </div>
          }
        />

        {/* WORKSPACE CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6 min-w-0">
          {/* MOBILE BRIDGE ENTITIES STRIP */}
          <div className="lg:hidden w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSync
                  size={15}
                  className="text-sky-600 dark:text-sky-400"
                />
                <h2 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Open Tally Companies
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleSync(null)}
                disabled={!isTallyOnline || activeFirms.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold active:scale-95 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <CloudSync size={13} /> Sync All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {activeFirms.length > 0 ? (
                activeFirms.map((firm, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/70 dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-md flex items-center justify-between gap-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2
                        size={14}
                        className="text-sky-600 dark:text-sky-400 shrink-0"
                      />
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {firm}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSync(firm)}
                      className="p-1.5 rounded bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors shrink-0 cursor-pointer"
                      title={`Sync ${firm}`}
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    No open companies detected in Tally
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP SIDEBAR */}
          <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4">
            <div className="p-4 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                    Tally Bridge
                  </span>
                  <h2 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                    Open Companies
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleSync(null)}
                  disabled={!isTallyOnline || activeFirms.length === 0}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold transition-colors active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CloudSync size={13} /> Sync All
                </button>
              </div>

              <div className="space-y-2.5">
                {activeFirms.length > 0 ? (
                  activeFirms.map((firm, idx) => (
                    <div
                      key={idx}
                      className="group p-3 bg-slate-50/70 dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-md hover:border-sky-500/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2
                            size={14}
                            className="text-sky-600 dark:text-sky-400 shrink-0"
                          />
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/25 text-[10px] font-mono font-semibold uppercase">
                            Live
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSync(firm)}
                          className="p-1.5 rounded bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
                          title={`Sync ${firm} Ledgers`}
                        >
                          <RefreshCw size={11} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {firm}
                      </p>
                      <div className="h-px bg-slate-200/60 dark:bg-slate-800 w-full" />
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Connected to Tally
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md">
                    <WifiOff
                      size={20}
                      className="mx-auto mb-2 text-slate-400 opacity-60"
                    />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Bridge offline — open Tally to connect
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#161B26] rounded-lg space-y-2 border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  className="text-sky-600 dark:text-sky-400"
                />
                <span className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Sync Checklist
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sync Tally master ledgers before mapping bank statements so new party accounts are matched automatically.
              </p>
            </div>
          </aside>

          {/* MAIN BATCH WORKBENCH */}
          <section className="flex-1 flex flex-col min-w-0 space-y-4">
            <div className="p-3 bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex p-1 bg-slate-100 dark:bg-[#131720] rounded-md w-full sm:w-auto border border-slate-200/70 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("current")}
                  className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "current"
                      ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  In Progress (
                  {audits.filter((a) => a.status === "DRAFT").length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "history"
                      ? "bg-white dark:bg-[#1C2230] text-sky-600 dark:text-sky-300 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Completed (
                  {audits.filter((a) => a.status === "EXPORTED").length})
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 px-1 text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last Ledger Sync:
                </span>
                <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {lastGlobalSync}
                </span>
              </div>
            </div>

            {displayAudits.length > 0 ? (
              <>
                <div className="hidden lg:block w-full overflow-hidden bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-5 py-3.5 w-1/2">Company & Period</th>
                        <th className="px-5 py-3.5 text-center w-1/4">
                          Current Stage
                        </th>
                        <th className="px-5 py-3.5 text-right w-1/4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
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
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#161B26] text-slate-400">
                <Inbox
                  size={32}
                  strokeWidth={1.6}
                  className="mb-2 opacity-60"
                />
                <p className="sora-font text-xs font-bold text-slate-700 dark:text-slate-200">
                  No Batches Here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click Start New Batch above to begin reconciling statements.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* SYNC MODAL OVERLAY */}
        {syncState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg p-6 md:p-7 shadow-2xl space-y-5 text-center">
              <div className="relative inline-flex mx-auto">
                {syncState.isComplete ? (
                  <div className="w-12 h-12 rounded-lg bg-sky-600 flex items-center justify-center text-white animate-in zoom-in">
                    <Check size={24} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20">
                    <RefreshCw
                      className="animate-spin"
                      size={24}
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {syncState.isComplete
                    ? "Ledger Sync Complete"
                    : "Syncing Tally Ledgers"}
                </h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-300 truncate px-4">
                  {syncState.isComplete
                    ? "All accounts updated successfully"
                    : `Syncing: ${syncState.currentFirm || "Connecting..."}`}
                </p>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-[#131720] rounded-md overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-500 ease-out"
                  style={{ width: `${syncState.progress}%` }}
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-md bg-slate-50 dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 text-left custom-scroll">
                {syncState.logs.map((log, i) => (
                  <p
                    key={i}
                    className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-snug"
                  >
                    • {log}
                  </p>
                ))}
              </div>

              <button
                type="button"
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
                className={`w-full py-2.5 rounded-lg font-semibold text-xs tracking-wide transition-colors ${
                  syncState.isComplete
                    ? "bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                {syncState.isComplete ? "Done" : "Syncing..."}
              </button>
            </div>
          </div>
        )}

        {/* CUSTOM DELETE CONFIRMATION MODAL */}
        {auditToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-200/80 dark:border-rose-500/25 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={18} strokeWidth={2.2} />
              </div>

              <div className="space-y-1">
                <h3 className="sora-font text-base font-bold text-slate-900 dark:text-white">
                  Delete Batch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete this batch? All uploaded statement entries for this month will be removed.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAuditToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1C2230] hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAudit}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
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
          "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25",
      };
    if (bankSummaries.length > 0)
      return {
        label: "Steps 3–5: Mapping & GST",
        color:
          "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/25",
      };
    return {
      label: "Step 2: Upload Statements",
      color:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/25",
    };
  };

  const stage = getStageDisplay();

  return (
    <React.Fragment>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group transition-colors cursor-pointer ${
          isExpanded
            ? "bg-sky-50/40 dark:bg-sky-500/[0.04]"
            : "hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
        }`}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded bg-slate-100 dark:bg-[#1C2230] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            <div
              className={`w-1 h-7 rounded-xs shrink-0 ${
                isDraft ? "bg-amber-400" : "bg-sky-500"
              }`}
            />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {audit?.tallyCompanyName ||
                  audit?.clientName ||
                  "Client Accounts"}
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                Period: {audit?.month || 1}/{audit?.year || 2026} •{" "}
                {bankSummaries.length} Bank Account(s)
              </p>
            </div>
          </div>
        </td>

        <td className="px-5 py-3.5 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold ${stage.color}`}
          >
            {stage.label}
          </span>
        </td>

        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Batch"
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 shrink-0 cursor-pointer ${
                isDraft
                  ? isOnline
                    ? "bg-sky-600 hover:bg-sky-500 text-white"
                    : "bg-slate-100 dark:bg-[#1C2230] text-slate-400 cursor-not-allowed"
                  : "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25"
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
            className="p-0 bg-slate-50/70 dark:bg-[#131720] border-t border-b border-slate-200/80 dark:border-slate-800"
          >
            <div className="p-4 animate-in fade-in duration-200">
              {bankSummaries.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#161B26]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="px-3.5 py-2.5">Bank Account</th>
                        <th className="px-3.5 py-2.5 text-right">Receipts</th>
                        <th className="px-3.5 py-2.5 text-right">Sales</th>
                        <th className="px-3.5 py-2.5 text-right">Payments</th>
                        <th className="px-3.5 py-2.5 text-right text-sky-700 dark:text-sky-300">
                          Total Inflow
                        </th>
                        <th className="px-3.5 py-2.5 text-right text-rose-700 dark:text-rose-400">
                          Total Outflow
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {bankSummaries.map((bank, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {bank.tallyLedgerName}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                            {bank.receiptCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-medium text-cyan-700 dark:text-cyan-300">
                            {bank.salesCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                            {bank.paymentCount || 0}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-sky-600 dark:text-sky-300">
                            ₹{formatINRValue(bank.totalReceipts)}
                          </td>
                          <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                            ₹{formatINRValue(bank.totalPayments)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/90 dark:bg-[#1C2230] border-t border-slate-200 dark:border-slate-800 font-bold">
                        <td className="px-3.5 py-2 text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Grand Total
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {audit?.summary?.receiptCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300">
                          {audit?.summary?.salesCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {audit?.summary?.paymentCount || 0}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-sky-600 dark:text-sky-300">
                          ₹{formatINRValue(audit?.summary?.totalReceipts)}
                        </td>
                        <td className="px-3.5 py-2 text-right text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                          ₹{formatINRValue(audit?.summary?.totalPayments)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="w-full p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    No bank statements uploaded in this batch yet
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
          "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25",
      };
    if (bankSummaries.length > 0)
      return {
        label: "Mapping & GST",
        color:
          "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/25",
      };
    return {
      label: "Upload Statements",
      color:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/25",
    };
  };

  const stage = getStageDisplay();

  return (
    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isDraft ? "bg-amber-400" : "bg-sky-500"
              }`}
            />
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${stage.color}`}
            >
              {stage.label}
            </span>
          </div>
          <h3 className="sora-font text-sm font-bold text-slate-900 dark:text-white truncate">
            {audit?.tallyCompanyName ||
              audit?.clientName ||
              "Client Accounts"}
          </h3>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Period: {audit?.month || 1}/{audit?.year || 2026} •{" "}
            {bankSummaries.length} Bank Account(s)
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={onAction}
        className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs transition-all active:scale-98 cursor-pointer ${
          isDraft
            ? isOnline
              ? "bg-sky-600 hover:bg-sky-500 text-white"
              : "bg-slate-100 dark:bg-[#1C2230] text-slate-400 cursor-not-allowed"
            : "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25"
        }`}
      >
        {isDraft ? (
          isOnline ? (
            <>
              <LayoutList size={14} /> Open Batch <ArrowRight size={14} />
            </>
          ) : (
            <>Tally Offline</>
          )
        ) : (
          <>
            <CheckCircle2 size={14} /> Completed
          </>
        )}
      </button>

      {bankSummaries.length > 0 && (
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 py-1 cursor-pointer"
          >
            <span>Bank Summary ({bankSummaries.length})</span>
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
                  className="p-2.5 bg-slate-50 dark:bg-[#131720] rounded-md border border-slate-200/70 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {bank.tallyLedgerName}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                      {bank.salesCount || 0} Sales
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-sky-600 dark:text-sky-300 font-bold">
                      In: ₹{formatINRValue(bank.totalReceipts)}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
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