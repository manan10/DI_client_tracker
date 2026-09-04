import React, { useState, useEffect } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  WifiOff,
  Calendar,
  Sparkles,
  ShieldCheck,
  Hash,
  Layers,
} from "lucide-react";
import { tallyTemplates } from "../../../../utils/tallyTemplates";
import { useApi } from "../../../../../../shared/hooks/useApi";

const IdentityStep = ({ selection, setSelection, arns }) => {
  const { request } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [tallyFirms, setTallyFirms] = useState([]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonthName = months[selection.month - 1];

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const xml = tallyTemplates.getCompanies();
        const res = await request("/tally/proxy", "POST", { xml });
        const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(
          (m) => m[1],
        );
        const filtered = [...new Set(matches)].filter(
          (n) => !n.includes("migrated-to"),
        );
        setTallyFirms(filtered);
      } catch (err) {
        console.error("Bridge Connection Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFirms();
  }, [request]);

  const handleFirmSelect = (firmName) => {
    const matchedArn = arns?.find((a) =>
      a.linkedTallyFirms?.includes(firmName),
    );
    setSelection({
      ...selection,
      tallyCompany: firmName,
      arnId: matchedArn?._id || null,
      account: null,
      tallyLedger: null,
    });
  };

  const matchedArnObject = arns?.find(
    (a) =>
      a._id === selection.arnId ||
      a.linkedTallyFirms?.includes(selection.tallyCompany),
  );

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

      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative min-w-0">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ACTIVE COMPANY REGISTRY SELECTION                            */}
        {/* ========================================================================= */}
        <section className="flex flex-col flex-1 lg:border-r border-slate-200/80 dark:border-white/10 overflow-hidden min-w-0">
          {/* Header Strip */}
          <div className="px-5 lg:px-8 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles size={13} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Stage 1 • Scope Definition
                </span>
              </div>
              <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                Select Active Tally Company
              </h3>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                <Loader2 size={13} className="animate-spin" />
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">
                  Scanning Bridge
                </span>
              </div>
            )}
          </div>

          {/* Company Cards List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 space-y-2.5 min-w-0">
            {tallyFirms.map((firm) => {
              const isSelected = selection.tallyCompany === firm;
              const firmArn = arns?.find((a) =>
                a.linkedTallyFirms?.includes(firm),
              );

              return (
                <button
                  key={firm}
                  onClick={() => handleFirmSelect(firm)}
                  className={`w-full p-4 text-left border rounded-xl transition-all duration-200 flex items-center justify-between gap-3 group shrink-0 cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-sm ring-1 ring-emerald-500/40"
                      : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                      }`}
                    >
                      <Building2 size={17} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p
                        className={`text-xs lg:text-sm font-black uppercase tracking-tight truncate ${
                          isSelected
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {firm}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                        <span>Tally ERP Connection</span>
                        {firmArn && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              ARN: {firmArn.arnCode || firmArn.nickname}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 border ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "border-slate-300 dark:border-white/20 text-transparent"
                    }`}
                  >
                    <Check size={11} strokeWidth={3.5} />
                  </div>
                </button>
              );
            })}

            {tallyFirms.length === 0 && !isLoading && (
              <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 dark:border-white/10 rounded-xl p-6 text-center space-y-2 bg-slate-50/40 dark:bg-slate-900/20">
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                  <WifiOff size={20} strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    No Open Companies Found
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-xs">
                    Ensure Tally ERP is open with an active company loaded and
                    ODBC/XML bridge enabled on port 9000.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: TARGET PERIOD SELECTION & CONTEXT HUD                       */}
        {/* ========================================================================= */}
        <section className="w-full lg:w-96 flex flex-col shrink-0 bg-slate-50/60 dark:bg-slate-900/30 overflow-y-auto no-scrollbar min-w-0 p-4 lg:p-6 space-y-5">
          {/* Target HUD Card */}
          <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-xl p-5 shadow-lg border border-slate-800 dark:border-white/10 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={13} /> Batch Scope Context
              </span>
              {matchedArnObject && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300">
                  {matchedArnObject.arnCode}
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Entity
              </p>
              <h4 className="text-sm font-black uppercase tracking-tight text-white truncate">
                {selection.tallyCompany || "Awaiting Company Selection"}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="space-y-0.5">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Batch Period
                </p>
                <p className="text-xs font-black uppercase text-emerald-400">
                  {currentMonthName}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Fiscal Year
                </p>
                <p className="text-xs font-black uppercase text-white font-mono">
                  {selection.year}
                </p>
              </div>
            </div>
          </div>

          {/* Month & Year Selection Grid */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <Calendar
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Accounting Cycle
                </span>
              </div>

              {/* Year Selector Control */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/60 dark:border-white/5">
                <button
                  onClick={() =>
                    setSelection((prev) => ({ ...prev, year: prev.year - 1 }))
                  }
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-90 cursor-pointer"
                  title="Previous Year"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-xs font-mono font-black text-slate-900 dark:text-white select-none">
                  {selection.year}
                </span>
                <button
                  onClick={() =>
                    setSelection((prev) => ({ ...prev, year: prev.year + 1 }))
                  }
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-90 cursor-pointer"
                  title="Next Year"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* 12-Month Matrix */}
            <div className="grid grid-cols-3 gap-1.5">
              {months.map((m, i) => {
                const isSelected = selection.month === i + 1;
                return (
                  <button
                    key={m}
                    onClick={() => setSelection({ ...selection, month: i + 1 })}
                    className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default IdentityStep;
