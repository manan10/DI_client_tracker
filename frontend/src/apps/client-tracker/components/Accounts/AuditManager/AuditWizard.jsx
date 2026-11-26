import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  X,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Layers,
  Building2,
} from "lucide-react";
import { useApi } from "../../../../../shared/hooks/useApi";
import { toast } from "sonner";

import IdentityStep from "./AuditWizard/IdentityStep";
import SyncStep from "./AuditWizard/SyncStep";
import AuditStep from "./AuditWizard/AuditStep";
import SalesStep from "./AuditWizard/SalesStep";
import SummaryStep from "./AuditWizard/SummaryStep";
import ResultStep from "./AuditWizard/ResultStep";

const AuditWizard = ({
  onClose,
  refreshData,
  initialSelection,
  audits,
  isTallyOnline,
  parentArns = [],
}) => {
  const { request } = useApi();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncComplete, setIsSyncComplete] = useState(false);

  const arns = parentArns;
  const [allAccounts, setAccounts] = useState([]);
  const [masterLedgers, setMasterLedgers] = useState([]);

  const isTrue = (val) => val === true || String(val).toLowerCase() === "true";

  const [step, setStep] = useState(() => {
    if (
      initialSelection?.audit ||
      (initialSelection?.tallyCompanyName && initialSelection?.stagedData)
    )
      return 3;
    return 1;
  });

  const [selection, setSelection] = useState(() => {
    const auditObj = initialSelection?.audit;
    const resolvedArnId =
      initialSelection?.arnId ||
      initialSelection?.arn ||
      auditObj?.arnId?._id ||
      auditObj?.arnId;
    if (auditObj) {
      return {
        ...initialSelection,
        account: initialSelection.account || auditObj.accountId,
        month: initialSelection.month || auditObj.month,
        year: initialSelection.year || auditObj.year,
        arnId: resolvedArnId,
        arn: resolvedArnId,
        tallyCompany:
          initialSelection.tallyCompany || auditObj.tallyCompanyName,
        tallyLedger: initialSelection.tallyLedger || auditObj.tallyLedgerName,
        salesIncomeLedger:
          initialSelection.salesIncomeLedger || auditObj.salesIncomeLedger,
        stagedFiles: {},
        isFreshStart: false,
      };
    }
    return {
      ...initialSelection,
      arnId: resolvedArnId,
      arn: resolvedArnId,
      stagedFiles: {},
    };
  });

  const isAccountsFetched = useRef(false);
  useEffect(() => {
    if (isAccountsFetched.current) return;
    isAccountsFetched.current = true;

    let isMounted = true;
    const loadAccounts = async () => {
      try {
        const accRes = await request("/accounts", "GET");
        if (isMounted && accRes?.data) {
          setAccounts(accRes.data);
        }
      } catch (err) {
        console.error("Accounts load error:", err);
      }
    };
    loadAccounts();
    return () => {
      isMounted = false;
    };
  }, [request]);

  useEffect(() => {
    if (!selection.tallyCompany) return;
    let isMounted = true;
    const fetchLedgers = async () => {
      try {
        const res = await request(
          `/ledgers?company=${encodeURIComponent(selection.tallyCompany)}`,
          "GET",
        );
        if (res?.data && isMounted) setMasterLedgers(res.data);
      } catch (err) {
        console.error("Ledger Fetch Error:", err);
      }
    };
    fetchLedgers();
    return () => {
      isMounted = false;
    };
  }, [selection.tallyCompany, request]);

  const activeLoadedAuditId = useRef(null);
  const stagedTxsLength = selection.stagedData?.transactions?.length || 0;

  useEffect(() => {
    const currentAuditId = selection.audit?._id;
    if (!currentAuditId) return;
    if (activeLoadedAuditId.current === currentAuditId && stagedTxsLength > 0)
      return;

    activeLoadedAuditId.current = currentAuditId;
    let isMounted = true;

    const fetchAuditTransactions = async () => {
      try {
        const res = await request(
          `/audit/${currentAuditId}/transactions`,
          "GET",
        );
        if (res?.success && res.transactions && isMounted) {
          const fetchedTxs = res.transactions;

          setSelection((prev) => ({
            ...prev,
            stagedData: { transactions: fetchedTxs },
            verifiedIds: fetchedTxs
              .filter((t) => isTrue(t.isChecked))
              .map((t) => t._id),
          }));

          const validTxs = fetchedTxs.filter(
            (t) => t.narration !== "EMPTY_FILE_MARKER",
          );
          const isAuditDone =
            validTxs.length > 0 && validTxs.every((t) => isTrue(t.isChecked));

          const salesTxs = fetchedTxs.filter(
            (t) => isTrue(t.isSales) && t.type === "RECEIPT",
          );
          const isSalesDone =
            salesTxs.length === 0 ||
            salesTxs.every((t) => isTrue(t.isSalesApproved));

          const hasSyncedItems = validTxs.some(
            (t) =>
              t.isSynced ||
              t.tallySyncStatus === "COMPLETED" ||
              t.tallySyncStatus === "SUCCESS",
          );
          const allItemsSynced =
            validTxs.length > 0 &&
            validTxs.every(
              (t) =>
                t.isSynced ||
                t.tallySyncStatus === "COMPLETED" ||
                t.tallySyncStatus === "SUCCESS",
            );

          if (allItemsSynced) {
            setIsSyncComplete(true);
          }

          if (hasSyncedItems) {
            setStep(6);
          } else if (isAuditDone && isSalesDone) {
            setStep(5);
          } else if (isAuditDone) {
            setStep(4);
          }
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      }
    };

    fetchAuditTransactions();
    return () => {
      isMounted = false;
    };
  }, [selection.audit?._id, stagedTxsLength, request]);

  const validateAndProceed = useCallback(() => {
    const duplicate = audits?.find((a) => {
      return (
        a.tallyCompanyName === selection.tallyCompany &&
        a.month === parseInt(selection.month) &&
        a.year === parseInt(selection.year)
      );
    });

    if (duplicate) {
      if (duplicate.status === "EXPORTED")
        return toast.error(
          "This period is already finalized for this company.",
        );

      const resolvedArnId =
        duplicate.arnId?._id ||
        duplicate.arnId ||
        selection.arnId ||
        selection.arn;
      setSelection((prev) => ({
        ...prev,
        audit: duplicate,
        arnId: resolvedArnId,
        arn: resolvedArnId,
        tallyCompany: duplicate.tallyCompanyName,
        isFreshStart: false,
      }));

      if (duplicate.sourceFiles && duplicate.sourceFiles.length > 0) {
        setStep(3);
        return toast.info("Resuming existing batch...");
      } else {
        setStep(2);
        return toast.info("Batch initialized. Please upload bank statements.");
      }
    }
    setStep(2);
  }, [
    audits,
    selection.tallyCompany,
    selection.month,
    selection.year,
    selection.arnId,
    selection.arn,
  ]);

  const handleBatchFileUpload = useCallback(async () => {
    const stagedFileMap = selection.stagedFiles || {};
    const bankLedgersToProcess = Object.keys(stagedFileMap);
    const activeArn = selection.arnId || selection.arn;

    if (bankLedgersToProcess.length === 0) return;
    if (!selection.tallyCompany || !activeArn) {
      return toast.error("Missing Company or ARN selection.");
    }

    setIsProcessing(true);
    let cumulativeTransactions = [];
    let updatedAuditObj = selection.audit;

    try {
      for (const bankName of bankLedgersToProcess) {
        const files = stagedFileMap[bankName];
        if (!files || files.length === 0) continue;

        const matchedAccount =
          allAccounts.find(
            (a) =>
              a.tallyMapping?.companyName === selection.tallyCompany &&
              a.tallyMapping?.ledgerName === bankName,
          ) || allAccounts.find((a) => a.name === bankName);

        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        formData.append("tallyCompany", selection.tallyCompany);
        formData.append("tallyLedger", bankName);
        formData.append("arnId", activeArn);
        formData.append("month", selection.month);
        formData.append("year", selection.year);
        if (matchedAccount?._id)
          formData.append("accountId", matchedAccount._id);

        const res = await request("/audit/upload-bulk", "POST", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res?.success) {
          cumulativeTransactions = [
            ...cumulativeTransactions,
            ...res.transactions,
          ];
          updatedAuditObj = res.audit;
        }
      }

      setSelection((prev) => ({
        ...prev,
        audit: updatedAuditObj,
        stagedData: { transactions: cumulativeTransactions },
        verifiedIds: cumulativeTransactions
          .filter((t) => isTrue(t.isChecked))
          .map((t) => t._id),
        stagedFiles: {},
      }));

      setStep(3);
      toast.success(
        `Uploaded statements for ${bankLedgersToProcess.length} bank(s).`,
      );
    } catch (err) {
      toast.error(err.message || "File upload encountered an error.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    selection.stagedFiles,
    selection.tallyCompany,
    selection.arnId,
    selection.arn,
    selection.month,
    selection.year,
    selection.audit,
    allAccounts,
    request,
  ]);

  const handleSalesValidationComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      const payloadTxs = (selection.stagedData?.transactions || [])
        .filter((t) => isTrue(t.isSales) && t.type === "RECEIPT")
        .map((t) => ({
          _id: t._id,
          isSalesApproved: isTrue(t.isSalesApproved),
          invoiceBillingDate: t.invoiceBillingDate || null,
          individualSalesLedger: t.individualSalesLedger || null,
          baseAmount: t.baseAmount || t.amount,
          cgst: t.cgst || 0,
          sgst: t.sgst || 0,
          igst: t.igst || 0,
          grossVoucherTotal: t.grossVoucherTotal || t.amount,
          isLocalAmc: t.isLocalAmc || false,
        }));

      const res = await request(
        `/audit/${selection.audit._id}/sales-checkpoint`,
        "PUT",
        { transactions: payloadTxs },
      );
      if (res?.success) setStep(5);
    } catch {
      toast.error("Failed to save sales details");
    } finally {
      setIsProcessing(false);
    }
  }, [request, selection.audit?._id, selection.stagedData?.transactions]);

  const handleFinalizeAudit = useCallback(async () => {
    setIsProcessing(true);
    try {
      await request(`/audit/${selection.audit._id}/finalize`, "POST");
      toast.success("Batch finalized and saved!");
      if (refreshData) refreshData();
      onClose();
    } catch {
      toast.error("Failed to finalize batch.");
    } finally {
      setIsProcessing(false);
    }
  }, [selection.audit?._id, request, refreshData, onClose]);

  const steps = [
    { id: 1, label: "Company & Month", subtitle: "Select Entity" },
    { id: 2, label: "Upload Statements", subtitle: "Bank Files" },
    { id: 3, label: "Map Transactions", subtitle: "Verify Ledgers" },
    { id: 4, label: "Sales & GST", subtitle: "Commission Invoices" },
    { id: 5, label: "Batch Summary", subtitle: "Review Totals" },
    { id: 6, label: "Push to Tally", subtitle: "Create Vouchers" },
  ];

  const isStep3Valid = useMemo(() => {
    const txs = (selection.stagedData?.transactions || []).filter(
      (t) => t.narration !== "EMPTY_FILE_MARKER",
    );
    if (txs.length === 0) return false;
    return txs.every((t) => (selection.verifiedIds || []).includes(t._id));
  }, [selection.stagedData?.transactions, selection.verifiedIds]);

  const isStep4Valid = useMemo(() => {
    const txs = selection.stagedData?.transactions || [];
    const salesTxs = txs.filter(
      (t) => isTrue(t.isSales) && t.type === "RECEIPT",
    );
    if (salesTxs.length === 0) return true;

    return salesTxs.every((t) => {
      const hasValidLedger = !!(
        t.individualSalesLedger || selection.salesIncomeLedger
      );
      const hasValidDate = !!(t.invoiceBillingDate || t.date);
      return isTrue(t.isSalesApproved) && hasValidDate && hasValidLedger;
    });
  }, [selection.stagedData?.transactions, selection.salesIncomeLedger]);

  const footerConfig = useMemo(() => {
    switch (step) {
      case 1:
        return {
          label: selection.stagedData ? "Resume Batch" : "Next: Upload Statements",
          disabled: !selection.tallyCompany,
          action: validateAndProceed,
        };
      case 2: {
        const banksStagedCount = Object.keys(
          selection.stagedFiles || {},
        ).length;
        return {
          label: isProcessing
            ? "Processing..."
            : banksStagedCount > 0
              ? `Process Statements (${banksStagedCount} Banks)`
              : "Upload Statements to Continue",
          disabled: banksStagedCount === 0 || isProcessing,
          action: handleBatchFileUpload,
        };
      }
      case 3:
        return {
          label: "Next: Sales & GST",
          disabled: !isStep3Valid,
          action: () => setStep(4),
        };
      case 4:
        return {
          label: isProcessing ? "Saving..." : "Confirm Sales & GST",
          disabled: isProcessing || !isStep4Valid,
          action: handleSalesValidationComplete,
        };
      case 5:
        return {
          label: isTallyOnline
            ? "Next: Push to Tally"
            : "Tally Bridge Offline",
          disabled: !isTallyOnline,
          action: () => {
            setIsSyncComplete(false);
            setStep(6);
          },
        };
      case 6:
        return {
          label: isProcessing
            ? "Finalizing..."
            : isSyncComplete
              ? "Finish & Close Batch"
              : "Push Vouchers First",
          disabled: isProcessing || !isSyncComplete,
          action: handleFinalizeAudit,
        };
      default:
        return { label: "Next", action: () => setStep((s) => s + 1) };
    }
  }, [
    step,
    selection.stagedData,
    selection.tallyCompany,
    selection.stagedFiles,
    isProcessing,
    isTallyOnline,
    isStep3Valid,
    isStep4Valid,
    isSyncComplete,
    validateAndProceed,
    handleBatchFileUpload,
    handleSalesValidationComplete,
    handleFinalizeAudit,
  ]);

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

      <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
        <div className="w-full h-full flex flex-col overflow-hidden text-left bg-[#F6F8FB] dark:bg-[#131720] min-w-0">
          {/* TOP WIZARD HEADER */}
          <header className="px-4 lg:px-8 py-3.5 bg-white dark:bg-[#161B26] border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 shrink-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Layers size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="sora-font text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      Tally Batch{" "}
                      <span className="font-normal text-sky-600 dark:text-sky-300">
                        Wizard
                      </span>
                    </h2>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1C2230] text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Step {step} of 6
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {steps[step - 1]?.label} • {steps[step - 1]?.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                title="Close Wizard"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* DESKTOP 6-STEP PROGRESS TRACK */}
            <div className="hidden lg:grid grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2.5 p-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-sky-50/80 dark:bg-sky-500/10 border border-sky-300/80 dark:border-sky-500/30 text-sky-800 dark:text-sky-300"
                        : isDone
                          ? "bg-slate-50 dark:bg-[#1C2230]/60 text-slate-700 dark:text-slate-300 border border-transparent"
                          : "opacity-45 text-slate-400 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? "bg-sky-600 text-white"
                          : isDone
                            ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isDone ? <Check size={11} strokeWidth={3} /> : s.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">
                        {s.label}
                      </p>
                      <p className="text-[10px] opacity-75 truncate">
                        {s.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MOBILE STEP PILLS */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shrink-0 text-[11px] font-semibold border ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30 text-sky-700 dark:text-sky-300"
                        : isDone
                          ? "bg-slate-100 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          : "border-transparent text-slate-400 opacity-60"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-mono ${
                        isActive
                          ? "bg-sky-600 text-white"
                          : isDone
                            ? "bg-slate-700 text-white"
                            : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      {isDone ? <Check size={9} strokeWidth={3} /> : s.id}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </header>

          {/* MAIN WIZARD CONTENT */}
          <main className="flex-1 overflow-hidden relative min-w-0">
            <div className="h-full w-full flex flex-col overflow-y-auto lg:overflow-hidden no-scrollbar">
              {step === 1 && (
                <IdentityStep
                  arns={arns}
                  selection={selection}
                  setSelection={setSelection}
                />
              )}
              {step === 2 && (
                <SyncStep
                  selection={selection}
                  isProcessing={isProcessing}
                  setSelection={setSelection}
                />
              )}
              {step === 3 && (
                <AuditStep
                  selection={selection}
                  setSelection={setSelection}
                  masterLedgers={masterLedgers}
                  arns={arns}
                />
              )}
              {step === 4 && (
                <SalesStep
                  selection={selection}
                  setSelection={setSelection}
                  masterLedgers={masterLedgers}
                  arns={arns}
                />
              )}
              {step === 5 && <SummaryStep selection={selection} arns={arns} />}
              {step === 6 && (
                <ResultStep
                  transactions={selection.stagedData?.transactions || []}
                  companyName={selection.tallyCompany}
                  bankLedgerName={
                    selection.account?.name || selection.tallyLedger
                  }
                  salesIncomeLedger={selection.salesIncomeLedger}
                  arns={arns}
                  arnId={selection.arnId || selection.arn}
                  masterLedgers={masterLedgers}
                  onComplete={() => setIsSyncComplete(true)}
                />
              )}
            </div>
          </main>

          {/* BOTTOM ACTION BAR */}
          <footer className="px-4 lg:px-8 py-3.5 bg-white dark:bg-[#161B26] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 z-30">
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <div
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 border text-[11px] font-mono font-semibold uppercase shrink-0 ${
                  isTallyOnline
                    ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200/80 dark:border-sky-500/25 text-sky-700 dark:text-sky-300"
                    : "bg-slate-100 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isTallyOnline ? "bg-sky-500" : "bg-slate-400"
                  }`}
                />
                <span>
                  {isTallyOnline ? "Bridge Online" : "Bridge Offline"}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {selection.tallyCompany || "No Company Selected"}
                </span>
                {selection.month && (
                  <span className="hidden md:inline text-[11px] font-mono text-slate-400 shrink-0">
                    ({selection.month}/{selection.year})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              {[2, 4, 5].includes(step) && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1C2230] hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft size={13} className="inline mr-1" /> Back
                </button>
              )}

              <button
                type="button"
                disabled={footerConfig.disabled}
                onClick={footerConfig.action}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wide transition-all cursor-pointer active:scale-98 select-none ${
                  footerConfig.disabled
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{footerConfig.label}</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AuditWizard;