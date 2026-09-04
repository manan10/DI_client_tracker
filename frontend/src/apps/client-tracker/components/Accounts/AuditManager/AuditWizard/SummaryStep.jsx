import React, { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  ArrowRightLeft,
  Coins,
  Activity,
  FileText,
  Banknote,
  Layers,
  Wallet,
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import CommissionMapperModal from "./SummaryStep/CommissionMapperModal";

const SummaryStep = ({ selection, arns = [] }) => {
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isCommissionCommitted, setIsCommissionCommitted] = useState(false);
  const [userSelectedBank, setUserSelectedBank] = useState(null);

  // HELPER: Strict Boolean Parser
  const isTrue = (val) => val === true || String(val).toLowerCase() === "true";

  // 1. ROBUST BANK & DATA PARSING
  const bankSummaries = useMemo(() => {
    if (
      selection?.audit?.bankSummaries &&
      selection.audit.bankSummaries.length > 0
    ) {
      return selection.audit.bankSummaries;
    }
    if (selection?.tallyLedger) {
      return [
        {
          tallyLedgerName: selection.tallyLedger,
          openingBalance: selection?.audit?.summary?.openingBalance || 0,
          closingBalance: selection?.audit?.summary?.closingBalance || 0,
        },
      ];
    }
    return [];
  }, [selection]);

  const activeBank =
    userSelectedBank ||
    (bankSummaries.length > 0 ? bankSummaries[0].tallyLedgerName : null);

  const allTransactions = useMemo(() => {
    return (selection?.stagedData?.transactions || []).filter(
      (t) => t && t.narration !== "EMPTY_FILE_MARKER",
    );
  }, [selection?.stagedData?.transactions]);

  // 2. GLOBAL COMMISSION EXTRACTOR
  const globalCommissionLines = useMemo(() => {
    return allTransactions.filter((t) => isTrue(t?.isCommission));
  }, [allTransactions]);

  // 3. ACTIVE BANK FILTERING
  const activeBankTransactions = useMemo(() => {
    if (bankSummaries.length <= 1) return allTransactions;
    return allTransactions.filter((t) => {
      const txBank =
        t.bank || t.bankAccount || t.bankLedger || t.tallyLedgerName || "";
      return txBank.toUpperCase() === (activeBank || "").toUpperCase();
    });
  }, [allTransactions, activeBank, bankSummaries.length]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    })
      .format(Math.abs(amount || 0))
      .replace("₹", "₹ ");
  };

  const activeBankMetrics = useMemo(() => {
    return (
      bankSummaries.find((b) => b.tallyLedgerName === activeBank) || {
        openingBalance: 0,
        closingBalance: 0,
      }
    );
  }, [bankSummaries, activeBank]);

  const isGstCompliant = useMemo(() => {
    if (!selection?.arnId) return false;
    const activeArnObject = arns.find(
      (a) =>
        String(a._id) === String(selection.arnId) ||
        String(a.arnCode) === String(selection.arnId),
    );
    return !!activeArnObject?.gstCompliant;
  }, [arns, selection?.arnId]);

  // 4. THE STRICT FORWARD-MATH GROUPING ENGINE
  const transactionGroups = useMemo(() => {
    const groupsMap = new Map();
    let manualCounter = 0;

    activeBankTransactions.forEach((tx) => {
      const party =
        tx?.suggestedLedger ||
        tx?.partyLedger ||
        tx?.ledgerName ||
        tx?.partyName;
      const isManual = isTrue(tx?.isMarkedForManualEntry) || !party;

      let groupKey;
      if (isManual) {
        groupKey = `MANUAL_${manualCounter++}`;
      } else {
        groupKey = `${tx.type}_${party}`;
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          id: groupKey,
          partyLedger: isManual ? "Manual Exception" : party,
          type: isManual ? "MANUAL" : tx.type,
          transactions: [],
          vouchers: [],
          totalBankAmount: 0,
          isManual: isManual,
        });
      }

      const group = groupsMap.get(groupKey);
      group.transactions.push(tx);
      group.totalBankAmount += Math.abs(tx.amount || 0);
    });

    const groups = Array.from(groupsMap.values());

    groups.forEach((group) => {
      if (group.isManual) {
        group.vouchers.push({
          type: "MANUAL",
          amount: group.totalBankAmount,
          data: group.transactions[0],
        });
        return;
      }

      if (group.type === "RECEIPT") {
        const salesTxs = group.transactions.filter((t) => isTrue(t.isSales));

        salesTxs.forEach((tx) => {
          let partyName =
            tx.suggestedLedger ||
            tx.partyLedger ||
            tx.ledgerName ||
            tx.partyName ||
            group.partyLedger;
          let activeSalesLedger =
            tx.individualSalesLedger ||
            selection?.salesIncomeLedger ||
            "SUSPENSE SALES LEDGER";
          let invoiceDate = tx.invoiceBillingDate || tx.date || "";

          let baseAmount =
            tx.baseAmount !== undefined &&
            tx.baseAmount !== null &&
            tx.baseAmount !== ""
              ? Number(tx.baseAmount)
              : Math.abs(tx.amount || 0);

          let cgst = 0,
            sgst = 0,
            igst = 0;

          if (isGstCompliant) {
            const applyCG = isTrue(tx.applyCGST);
            const applySG = isTrue(tx.applySGST);
            const applyIG = isTrue(tx.applyIGST);

            cgst =
              tx.cgst !== undefined && tx.cgst !== null && tx.cgst !== ""
                ? Number(tx.cgst)
                : applyCG
                  ? baseAmount * 0.09
                  : 0;
            sgst =
              tx.sgst !== undefined && tx.sgst !== null && tx.sgst !== ""
                ? Number(tx.sgst)
                : applySG
                  ? baseAmount * 0.09
                  : 0;
            igst =
              tx.igst !== undefined && tx.igst !== null && tx.igst !== ""
                ? Number(tx.igst)
                : applyIG
                  ? baseAmount * 0.18
                  : 0;
          }

          let grossTotal = baseAmount + cgst + sgst + igst;

          group.vouchers.push({
            type: "SALES",
            grossTotal,
            baseAmount,
            cgst,
            sgst,
            igst,
            partyName,
            activeSalesLedger,
            invoiceBillingDate: invoiceDate,
            data: tx,
          });
        });

        group.transactions.forEach((tx) => {
          group.vouchers.push({
            type: "RECEIPT",
            amount: Math.abs(tx.amount || 0),
            data: tx,
          });
        });
      } else if (group.type === "PAYMENT") {
        group.transactions.forEach((tx) => {
          group.vouchers.push({
            type: "PAYMENT",
            amount: Math.abs(tx.amount || 0),
            data: tx,
          });
        });
      }
    });

    return groups.sort((a, b) => {
      if (a.isManual) return 1;
      if (b.isManual) return -1;
      const aHasSales = a.vouchers.some((v) => v.type === "SALES");
      const bHasSales = b.vouchers.some((v) => v.type === "SALES");
      if (aHasSales && !bHasSales) return -1;
      if (!aHasSales && bHasSales) return 1;
      return 0;
    });
  }, [activeBankTransactions, selection?.salesIncomeLedger, isGstCompliant]);

  const activeBankVoucherStats = useMemo(() => {
    let receiptTotal = 0,
      paymentTotal = 0;
    let counts = { receipt: 0, payment: 0, sales: 0, manual: 0 };

    transactionGroups.forEach((g) => {
      g.vouchers.forEach((v) => {
        if (v.type === "RECEIPT") {
          receiptTotal += v.amount;
          counts.receipt++;
        }
        if (v.type === "PAYMENT") {
          paymentTotal += v.amount;
          counts.payment++;
        }
        if (v.type === "SALES") {
          counts.sales++;
        }
        if (v.type === "MANUAL") {
          counts.manual++;
        }
      });
    });
    return { receiptTotal, paymentTotal, counts };
  }, [transactionGroups]);

  const globalCounts = useMemo(() => {
    return {
      sales: allTransactions.filter(
        (t) =>
          isTrue(t.isSales) &&
          t.type === "RECEIPT" &&
          !isTrue(t.isMarkedForManualEntry),
      ).length,
      receipts: allTransactions.filter(
        (t) =>
          t.type === "RECEIPT" &&
          !isTrue(t.isMarkedForManualEntry) &&
          !!(t.suggestedLedger || t.partyLedger || t.ledgerName || t.partyName),
      ).length,
      payments: allTransactions.filter(
        (t) =>
          t.type === "PAYMENT" &&
          !isTrue(t.isMarkedForManualEntry) &&
          !!(t.suggestedLedger || t.partyLedger || t.ledgerName || t.partyName),
      ).length,
      manual: allTransactions.filter(
        (t) =>
          isTrue(t.isMarkedForManualEntry) ||
          !(t.suggestedLedger || t.partyLedger || t.ledgerName || t.partyName),
      ).length,
    };
  }, [allTransactions]);

  const monthName = useMemo(() => {
    return new Date(
      selection?.year || new Date().getFullYear(),
      (selection?.month || 1) - 1,
    ).toLocaleString("default", { month: "long" });
  }, [selection?.month, selection?.year]);

  if (!selection?.stagedData?.transactions || !activeBank) {
    return (
      <div className="h-full w-full bg-white dark:bg-[#07090E] flex flex-col items-center justify-center gap-4 text-slate-500 py-32">
        <Activity
          size={24}
          className="animate-spin text-emerald-600 dark:text-emerald-400"
        />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Loading Voucher Manifesto...
        </span>
      </div>
    );
  }

  // Pure status color accents (no neon headers, pure clean text & subtle tags)
  const getGroupTheme = (type) => {
    if (type === "RECEIPT") {
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-b-2 border-emerald-500",
        badge:
          "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20",
        icon: <ArrowRightLeft size={14} strokeWidth={2.5} />,
      };
    }
    if (type === "PAYMENT") {
      return {
        text: "text-rose-600 dark:text-rose-400",
        border: "border-b-2 border-rose-500",
        badge:
          "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20",
        icon: <Coins size={14} strokeWidth={2.5} />,
      };
    }
    return {
      text: "text-amber-600 dark:text-amber-400",
      border: "border-b-2 border-amber-500",
      badge:
        "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20",
      icon: <AlertCircle size={14} strokeWidth={2.5} />,
    };
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />

      {/* Scrollable Container with guaranteed clearance for the fixed bottom bar */}
      <div className="w-full min-h-screen bg-white dark:bg-[#07090E] overflow-y-auto custom-scroll text-slate-900 dark:text-slate-100 pb-48 select-none font-sans">
        {/* ===================== EXECUTIVE HEADER ===================== */}
        <div className="bg-[#0B1120] text-white w-full px-6 lg:px-12 pt-7 pb-10 relative border-b border-slate-800">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full">
            {/* Left: Entity Identification */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} />{" "}
                    {selection?.tallyCompany || "Company"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {monthName} {selection?.year}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  Voucher Manifesto Review
                </h2>
              </div>
            </div>

            {/* Right: Auto-Log Action Card + Global Counts */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Global Voucher Batch Metrics */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-md">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-r border-slate-800 pr-2.5 mr-0.5 hidden sm:inline">
                  Batch
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20">
                  {globalCounts.sales} Sales
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  {globalCounts.receipts} Rec
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                  {globalCounts.payments} Pay
                </span>
                {globalCounts.manual > 0 && (
                  <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                    {globalCounts.manual} Holds
                  </span>
                )}
              </div>

              {/* HIGH-PROMINENCE AUTO-LOG COMMISSION ACTION */}
              {globalCommissionLines.length > 0 && (
                <div className="flex items-center gap-3 bg-slate-900 border border-emerald-500/40 px-3.5 py-1.5 rounded-md">
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        Auto-Log Commissions
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {globalCommissionLines.length} Entries Ready
                    </span>
                  </div>

                  {isCommissionCommitted ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider">
                      <CheckCircle2 size={13} />
                      <span>Mapped</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMapperOpen(true)}
                      className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowUpRight size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BANK ACCOUNT TABS */}
          {bankSummaries.length > 0 && (
            <div className="w-full mt-6 border-b border-slate-800 flex gap-4 overflow-x-auto no-scrollbar">
              {bankSummaries.map((bank) => {
                const isActive = activeBank === bank.tallyLedgerName;
                return (
                  <button
                    key={bank.tallyLedgerName}
                    onClick={() => setUserSelectedBank(bank.tallyLedgerName)}
                    className={`pb-2.5 px-1 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "text-emerald-400 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Landmark
                      size={13}
                      className={
                        isActive ? "text-emerald-400" : "text-slate-500"
                      }
                    />
                    <span>{bank.tallyLedgerName}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================== FINANCIAL METRICS STRIP ===================== */}
        <div className="w-full px-6 lg:px-12 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 lg:gap-10">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                  <Wallet size={12} className="text-slate-400" /> Opening
                  Balance
                </span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(activeBankMetrics.openingBalance)}
                </span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800" />

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                  <TrendingUp size={12} /> Receipts Inflow
                </span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatINR(activeBankVoucherStats.receiptTotal)}
                </span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800" />

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">
                  <TrendingDown size={12} /> Payments Outflow
                </span>
                <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                  -{formatINR(activeBankVoucherStats.paymentTotal)}
                </span>
              </div>
            </div>

            <div className="flex flex-col text-left sm:text-right">
              <span className="flex items-center sm:justify-end gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                <Landmark size={12} className="text-slate-400" /> Closing
                Balance
              </span>
              <span className="font-mono text-base font-black text-slate-900 dark:text-white leading-none">
                {formatINR(activeBankMetrics.closingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* ===================== FLAT DOCUMENT LEDGER PIPELINE ===================== */}
        <div className="w-full px-6 lg:px-12 mt-8">
          <div className="flex items-center justify-between pb-2 mb-6 border-b border-slate-300 dark:border-white/10">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bank Statement Lines vs Generated Tally Vouchers
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              {transactionGroups.length} Ledger Groups
            </span>
          </div>

          {transactionGroups.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-white/10 rounded-sm">
              <Layers
                size={32}
                className="mb-2 text-slate-300 dark:text-slate-700"
              />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                No Transactions Found
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                This bank statement period has no actionable entries.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {transactionGroups.map((group, idx) => {
                const theme = getGroupTheme(group.type);

                return (
                  <div key={group.id || idx} className="w-full">
                    {/* FLAT GROUP HEADER (NO COLORED BACKGROUND) */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 mb-3 ${theme.border}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${theme.badge}`}
                        >
                          {theme.icon}
                          {group.type}
                        </span>
                        <h4
                          className={`text-base font-black uppercase tracking-tight ${theme.text} truncate`}
                        >
                          {group.partyLedger}
                        </h4>
                        <span className="text-slate-400 text-xs font-mono font-bold">
                          ({group.transactions.length})
                        </span>
                      </div>

                      <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0">
                        <span
                          className={`font-mono text-base font-black ${theme.text}`}
                        >
                          {group.type === "RECEIPT" ? "+" : "-"}
                          {formatINR(group.totalBankAmount)}
                        </span>
                      </div>
                    </div>

                    {/* DUAL PANE LEDGER TABLE */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_36px_1fr] w-full gap-4 items-start">
                      {/* LEFT: Raw Bank Statement Lines */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                          <Banknote size={12} /> Source Statement
                        </div>

                        {group.transactions.map((tx, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-2.5 bg-slate-50/80 dark:bg-white/2 border border-slate-200 dark:border-white/10 rounded-sm flex justify-between items-start gap-3 hover:bg-slate-100/80 dark:hover:bg-white/4 transition-colors"
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                {tx.date
                                  ? new Date(tx.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )
                                  : "No Date"}
                              </span>
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 wrap-break-word leading-tight">
                                {tx.narration ||
                                  tx.description ||
                                  tx.particulars ||
                                  "No Narration"}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white shrink-0">
                              {formatINR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* MIDDLE: Visual Flow Indicator */}
                      <div className="hidden lg:flex flex-col items-center justify-center pt-8 text-slate-300 dark:text-slate-700">
                        <ArrowRight size={16} strokeWidth={2} />
                      </div>

                      {/* RIGHT: Generated Tally Vouchers */}
                      <div className="space-y-1.5 border-t lg:border-t-0 border-slate-200 dark:border-white/10 pt-3 lg:pt-0">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                          <FileText size={12} /> Generated Tally Vouchers
                        </div>

                        {group.vouchers.map((v, vIdx) => {
                          // 1. RECEIPT VOUCHER
                          if (v.type === "RECEIPT") {
                            const party =
                              v.data.suggestedLedger ||
                              v.data.partyLedger ||
                              v.data.ledgerName ||
                              v.data.partyName ||
                              group.partyLedger;
                            return (
                              <div
                                key={vIdx}
                                className="p-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 border-l-3 border-l-emerald-500 rounded-sm flex justify-between items-center gap-3"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    Receipt Voucher
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">
                                    {party}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          // 2. SALES VOUCHER INVOICE
                          if (v.type === "SALES") {
                            return (
                              <div
                                key={vIdx}
                                className="p-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 border-l-3 border-l-blue-500 rounded-sm flex flex-col gap-1.5"
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                        Sales Invoice
                                      </span>
                                      {v.invoiceBillingDate && (
                                        <span className="text-[9px] font-mono text-slate-400">
                                          Doc:{" "}
                                          {new Date(
                                            v.invoiceBillingDate,
                                          ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                          })}
                                        </span>
                                      )}
                                    </div>

                                    {/* PARTY NAME & SALES LEDGER BREAKDOWN */}
                                    <div className="flex flex-col mt-0.5">
                                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                                        Party: {v.partyName}
                                      </span>
                                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase truncate">
                                        Income A/C: {v.activeSalesLedger}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end shrink-0">
                                    <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                                      {formatINR(v.grossTotal)}
                                    </span>
                                  </div>
                                </div>

                                {/* GST Tax Breakdown */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  <span>
                                    Base:{" "}
                                    <strong className="text-slate-900 dark:text-white">
                                      {formatINR(v.baseAmount).replace("₹", "")}
                                    </strong>
                                  </span>
                                  {v.cgst > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        CGST:{" "}
                                        <strong className="text-slate-900 dark:text-white">
                                          {formatINR(v.cgst).replace("₹", "")}
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                  {v.sgst > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        SGST:{" "}
                                        <strong className="text-slate-900 dark:text-white">
                                          {formatINR(v.sgst).replace("₹", "")}
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                  {v.igst > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        IGST:{" "}
                                        <strong className="text-blue-600 dark:text-blue-400">
                                          {formatINR(v.igst).replace("₹", "")}
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // 3. PAYMENT VOUCHER
                          if (v.type === "PAYMENT") {
                            const party =
                              v.data.suggestedLedger ||
                              v.data.partyLedger ||
                              v.data.ledgerName ||
                              v.data.partyName ||
                              group.partyLedger;
                            return (
                              <div
                                key={vIdx}
                                className="p-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 border-l-3 border-l-rose-500 rounded-sm flex justify-between items-center gap-3"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                    Payment Voucher
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">
                                    {party}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          // 4. MANUAL HOLD VOUCHER
                          if (v.type === "MANUAL") {
                            return (
                              <div
                                key={vIdx}
                                className="p-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 border-l-3 border-l-amber-500 rounded-sm flex justify-between items-center gap-3"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                    Hold / Manual Review
                                  </span>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 italic truncate">
                                    Missing Ledger Mapping
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
                                  {formatINR(v.amount)}
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spacer block guaranteeing scroll room above bottom bar */}
          <div className="h-20 w-full" />
        </div>

        {/* COMMISSION MAPPER MODAL */}
        {isMapperOpen && (
          <CommissionMapperModal
            isOpen={isMapperOpen}
            onClose={() => setIsMapperOpen(false)}
            selection={selection}
            commissionLines={globalCommissionLines}
            formatINR={formatINR}
            onSuccess={() => {
              setIsCommissionCommitted(true);
              setIsMapperOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default SummaryStep;
