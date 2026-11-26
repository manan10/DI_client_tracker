import React, { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Copy,
  Share2,
  Eye,
  Database,
  CheckCheck,
  Trash2,
  RefreshCw,
  UserCheck,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const RemoteSubmissionsLedger = ({
  invites = [],
  loading,
  filterTab: controlledFilter,
  onFilterChange,
  onRefresh,
  onInspectInvite,
  onSyncAndComplete,
  onToggleReviewed,
  onDeleteInvite
}) => {
  const [internalFilter, setInternalFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const filterTab = controlledFilter ?? internalFilter;
  const setFilterTab = onFilterChange ?? setInternalFilter;

  const counts = useMemo(() => {
    const receivedNew = invites.filter(
      (i) => i.status === "completed" && !i.isReviewed
    ).length;
    const pending = invites.filter((i) => i.status === "pending").length;
    const archived = invites.filter(
      (i) => i.status === "completed" && i.isReviewed
    ).length;

    return {
      all: invites.length,
      receivedNew,
      pending,
      archived
    };
  }, [invites]);

  const filteredInvites = useMemo(() => {
    return invites.filter((inv) => {
      if (filterTab === "received") {
        return inv.status === "completed" && !inv.isReviewed;
      }
      if (filterTab === "pending") {
        return inv.status === "pending";
      }
      if (filterTab === "archived") {
        return inv.status === "completed" && inv.isReviewed;
      }
      return true;
    });
  }, [invites, filterTab]);

  const handleCopyLink = async (token) => {
    const url = `${window.location.origin}/assess/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Form link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleResendWhatsapp = (inv) => {
    const url = `${window.location.origin}/assess/${inv.token}`;
    const msg = [
      `Namaste *${inv.investorName}*,`,
      ``,
      `Gentle reminder to complete your *SEBI Investor Risk Profile Assessment* for *Dalal Investments*:`,
      `${url}`,
      ``,
      `It takes under 2 minutes.`
    ].join("\n");

    const encoded = encodeURIComponent(msg);
    const phone = inv.clientId?.contactDetails?.phoneNo?.replace(/\D/g, "");
    const waUrl =
      phone && phone.length >= 10
        ? `https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const runAction = async (id, fn) => {
    setProcessingId(id);
    try {
      await fn();
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-4">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Remote Client Assessments
            </h3>
            {counts.receivedNew > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tabular-nums bg-sky-600 dark:bg-sky-500 text-white">
                {counts.receivedNew} New
              </span>
            )}
          </div>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-300/80 mt-0.5">
            Track sent links, inspect submitted client risk reports, and sync directly to CRM.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#232B3D] p-0.5 text-xs">
            {[
              { id: "all", label: `All (${counts.all})` },
              { id: "received", label: `Received (${counts.receivedNew})` },
              { id: "pending", label: `Pending (${counts.pending})` },
              { id: "archived", label: `Completed (${counts.archived})` }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterTab(t.id)}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  filterTab === t.id
                    ? "bg-sky-600 dark:bg-sky-500 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh submissions"
            className="p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#232B3D] text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredInvites.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#1B2230] rounded-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
            No remote assessment links in this view yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-md">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#232B3D] border-b border-slate-200 dark:border-slate-700/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                <th className="py-3 px-4">Investor / Client</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assessed Result</th>
                <th className="py-3 px-4">Sent / Received</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80 text-xs bg-white dark:bg-[#1B2230]">
              {filteredInvites.map((inv) => {
                const isCompleted = inv.status === "completed";
                const isBusy = processingId === inv._id;
                const linkedClient = inv.clientId;
                const snap = inv.resultSnapshot;

                return (
                  <tr
                    key={inv._id}
                    className={`transition-colors ${
                      isCompleted && !inv.isReviewed
                        ? "bg-sky-50/60 dark:bg-sky-500/10"
                        : "hover:bg-slate-50/80 dark:hover:bg-[#232B3D]/70"
                    }`}
                  >
                    {/* Investor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{inv.investorName}</span>
                        {linkedClient && (
                          <span
                            title="Linked to CRM Client"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/70 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/30"
                          >
                            <UserCheck className="w-3 h-3" />
                            CRM
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300/80 mt-0.5">
                        {inv.pan || "Walk-in Prospect"} • {inv.lang?.toUpperCase()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {!isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/35">
                          <Clock className="w-3 h-3" />
                          Pending Client
                        </span>
                      ) : inv.isReviewed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#232B3D] dark:text-slate-200 dark:border-slate-600">
                          <CheckCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                          {inv.syncedToCrm ? "Synced & Completed" : "Reviewed"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-500/25 dark:text-sky-200 dark:border-sky-400/45">
                          <CheckCircle2 className="w-3 h-3" />
                          Submission Received
                        </span>
                      )}
                    </td>

                    {/* Assessed Result */}
                    <td className="py-3.5 px-4">
                      {isCompleted && snap ? (
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {snap.riskTier || snap.riskProfile}
                          </span>
                          <span className="ml-2 tabular-nums text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                            ({snap.riskScore}/100)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-400 italic">
                          Awaiting response
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 tabular-nums text-[11px]">
                      {isCompleted
                        ? `Recd: ${formatDate(inv.completedAt)}`
                        : `Sent: ${formatDate(inv.createdAt)}`}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {!isCompleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.token)}
                              title="Copy Form Link"
                              className="px-2.5 py-1.5 rounded text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResendWhatsapp(inv)}
                              title="Send Reminder on WhatsApp"
                              className="px-2.5 py-1.5 rounded text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                              Remind
                            </button>

                            <a
                              href={`/assess/${inv.token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Form Preview"
                              className="p-1.5 rounded text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onInspectInvite(inv)}
                              className="px-2.5 py-1.5 rounded text-xs font-semibold bg-white hover:bg-sky-50 dark:bg-[#232B3D] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              Inspect Report
                            </button>

                            {linkedClient && !inv.syncedToCrm && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  runAction(inv._id, () => onSyncAndComplete(inv))
                                }
                                className="px-2.5 py-1.5 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Database className="w-3 h-3" />
                                Save to CRM & Complete
                              </button>
                            )}

                            {!inv.isReviewed && (!linkedClient || inv.syncedToCrm) && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  runAction(inv._id, () =>
                                    onToggleReviewed(inv._id, true)
                                  )
                                }
                                className="px-2.5 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark Completed
                              </button>
                            )}
                          </>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(inv._id, () => onDeleteInvite(inv._id))
                          }
                          title="Delete record"
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RemoteSubmissionsLedger;