import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useApi } from "../../../../../../shared/hooks/useApi";
import { toast } from "sonner";

import BankSidebar from "./AuditStep/BankSidebar";
import TransactionInspector from "./AuditStep/TransactionInspector";
import LedgerSearchModal from "./AuditStep/LedgerSearchModal";
import ShortcutsModal from "./AuditStep/ShortcutsModal";

const AuditStep = ({
  selection,
  setSelection,
  masterLedgers = [],
  arns = [],
}) => {
  const { request } = useApi();

  // Navigation & Bank Selection States
  const [activeTab, setActiveTab] = useState("RECEIPT");
  const [selectedBank, setSelectedBank] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Modal & Search States
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState("");

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const companyLedgers = useMemo(() => {
    return masterLedgers.filter(
      (l) => l.tallyCompanyName === selection.tallyCompany,
    );
  }, [masterLedgers, selection.tallyCompany]);

  const transactions = useMemo(() => {
    return (selection.stagedData?.transactions || []).filter(
      (t) => t.narration !== "EMPTY_FILE_MARKER",
    );
  }, [selection.stagedData]);

  const availableBanks = useMemo(() => {
    const banks = [...new Set(transactions.map((t) => t.bank).filter(Boolean))];
    return banks.length > 0 ? banks : ["Default Bank"];
  }, [transactions]);

  const currentBank = useMemo(() => {
    if (selectedBank && availableBanks.includes(selectedBank))
      return selectedBank;
    return availableBanks.length > 0 ? availableBanks[0] : "";
  }, [selectedBank, availableBanks]);

  // Current Working Stream for the Selected Bank and Type
  const displayTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) => t.type === activeTab && (t.bank === currentBank || !t.bank),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, activeTab, currentBank]);

  // Align current index when bank/tab changes
  useEffect(() => {
    const firstUnverified = displayTransactions.findIndex(
      (t) => !(selection.verifiedIds || []).includes(t._id),
    );
    setCurrentIndex(firstUnverified !== -1 ? firstUnverified : 0);
  }, [activeTab, currentBank]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTx = displayTransactions[currentIndex] || null;
  const isCurrentVerified = activeTx
    ? (selection.verifiedIds || []).includes(activeTx._id)
    : false;

  // Grand Totals Across All Banks & Files
  const grandTotals = useMemo(() => {
    const receipts = transactions.filter((t) => t.type === "RECEIPT");
    const payments = transactions.filter((t) => t.type === "PAYMENT");

    const receiptTotal = receipts.reduce(
      (acc, t) => acc + Math.abs(t.amount || 0),
      0,
    );
    const paymentTotal = payments.reduce(
      (acc, t) => acc + Math.abs(t.amount || 0),
      0,
    );

    const verifiedReceipts = receipts.filter((t) =>
      (selection.verifiedIds || []).includes(t._id),
    ).length;
    const verifiedPayments = payments.filter((t) =>
      (selection.verifiedIds || []).includes(t._id),
    ).length;

    return {
      receiptTotal,
      paymentTotal,
      totalCount: transactions.length,
      verifiedCount: (selection.verifiedIds || []).length,
      receiptCount: receipts.length,
      paymentCount: payments.length,
      verifiedReceipts,
      verifiedPayments,
    };
  }, [transactions, selection.verifiedIds]);

  // Bank directory hierarchy metrics
  const bankDirectory = useMemo(() => {
    return availableBanks.map((bank) => {
      const bankTxs = transactions.filter(
        (t) => t.bank === bank || (!t.bank && availableBanks[0] === bank),
      );

      const receipts = bankTxs.filter((t) => t.type === "RECEIPT");
      const payments = bankTxs.filter((t) => t.type === "PAYMENT");

      const verifiedReceipts = receipts.filter((t) =>
        (selection.verifiedIds || []).includes(t._id),
      ).length;
      const verifiedPayments = payments.filter((t) =>
        (selection.verifiedIds || []).includes(t._id),
      ).length;

      const totalReceiptAmount = receipts.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );
      const totalPaymentAmount = payments.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );

      const totalTxs = bankTxs.length;
      const verifiedTxs = verifiedReceipts + verifiedPayments;

      return {
        bankName: bank,
        totalTxs,
        verifiedTxs,
        isCompleted: totalTxs > 0 && verifiedTxs === totalTxs,
        receipts: {
          total: receipts.length,
          verified: verifiedReceipts,
          pending: receipts.length - verifiedReceipts,
          amount: totalReceiptAmount,
        },
        payments: {
          total: payments.length,
          verified: verifiedPayments,
          pending: payments.length - verifiedPayments,
          amount: totalPaymentAmount,
        },
      };
    });
  }, [transactions, selection.verifiedIds, availableBanks]);

  // OPTIMISTIC DATABASE UPDATE
  const handleUpdate = useCallback(
    async (txId, payload, silent = false) => {
      const originalTx = transactions.find((t) => t._id === txId);
      const wasVerified = (selection.verifiedIds || []).includes(txId);

      setSelection((prev) => {
        const updatedTransactions = (prev.stagedData?.transactions || []).map(
          (t) => (t._id === txId ? { ...t, ...payload } : t),
        );
        let newVerified = [...(prev.verifiedIds || [])];
        if (payload.isChecked !== undefined) {
          newVerified = payload.isChecked
            ? [...new Set([...newVerified, txId])]
            : newVerified.filter((id) => id !== txId);
        }
        return {
          ...prev,
          verifiedIds: newVerified,
          stagedData: { ...prev.stagedData, transactions: updatedTransactions },
        };
      });

      try {
        const res = await request(
          `/audit/transactions/${txId}`,
          "PATCH",
          payload,
        );
        if (!res?.success && res?.success !== undefined)
          throw new Error("API Update Failed");
      } catch {
        if (!silent) toast.error("Database sync failed. Reverting changes.");
        setSelection((prev) => {
          const revertedTransactions = (
            prev.stagedData?.transactions || []
          ).map((t) => (t._id === txId ? { ...t, ...originalTx } : t));
          let revertedVerified = [...(prev.verifiedIds || [])];
          if (payload.isChecked !== undefined) {
            revertedVerified = wasVerified
              ? [...new Set([...revertedVerified, txId])]
              : revertedVerified.filter((id) => id !== txId);
          }
          return {
            ...prev,
            verifiedIds: revertedVerified,
            stagedData: {
              ...prev.stagedData,
              transactions: revertedTransactions,
            },
          };
        });
      }
    },
    [transactions, selection.verifiedIds, request, setSelection],
  );

  // Main Action: Verify & Advance
  const handleVerifyAndNext = useCallback(async () => {
    if (!activeTx || isVerifying) return;

    setIsVerifying(true);
    try {
      await handleUpdate(activeTx._id, { isChecked: true }, true);

      const nextUnverifiedIdx = displayTransactions.findIndex(
        (t, idx) =>
          idx > currentIndex && !(selection.verifiedIds || []).includes(t._id),
      );

      if (nextUnverifiedIdx !== -1) {
        setCurrentIndex(nextUnverifiedIdx);
      } else {
        const wrapIdx = displayTransactions.findIndex(
          (t) => !(selection.verifiedIds || []).includes(t._id),
        );
        if (wrapIdx !== -1 && wrapIdx !== currentIndex) {
          setCurrentIndex(wrapIdx);
        } else if (currentIndex < displayTransactions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          toast.success(
            `All ${activeTab.toLowerCase()}s for ${currentBank} verified!`,
          );
        }
      }
    } finally {
      setIsVerifying(false);
    }
  }, [
    activeTx,
    isVerifying,
    handleUpdate,
    displayTransactions,
    currentIndex,
    selection.verifiedIds,
    activeTab,
    currentBank,
  ]);

  const toggleComm = useCallback(() => {
    if (!activeTx) return;
    const payload = { isCommission: !activeTx.isCommission };
    if (!activeTx.isCommission) payload.isSales = true;
    handleUpdate(activeTx._id, payload);
  }, [activeTx, handleUpdate]);

  const handleJumpNextPending = useCallback(() => {
    const nextUnverifiedIdx = displayTransactions.findIndex(
      (t, idx) =>
        idx > currentIndex && !(selection.verifiedIds || []).includes(t._id),
    );
    if (nextUnverifiedIdx !== -1) {
      setCurrentIndex(nextUnverifiedIdx);
    } else {
      const wrapIdx = displayTransactions.findIndex(
        (t) => !(selection.verifiedIds || []).includes(t._id),
      );
      if (wrapIdx !== -1) setCurrentIndex(wrapIdx);
    }
  }, [displayTransactions, currentIndex, selection.verifiedIds]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputActive = ["input", "textarea"].includes(
        document.activeElement?.tagName?.toLowerCase(),
      );

      if (e.key === "Escape") {
        if (ledgerModalOpen) {
          setLedgerModalOpen(false);
          setLedgerSearch("");
          return;
        }
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
      }

      if (isInputActive) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleVerifyAndNext();
      }

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCurrentIndex((prev) =>
          Math.min(prev + 1, displayTransactions.length - 1),
        );
      }

      if (e.key.toLowerCase() === "l" && activeTx && !ledgerModalOpen) {
        e.preventDefault();
        setLedgerModalOpen(true);
      }

      if (e.key.toLowerCase() === "s" && activeTx) {
        e.preventDefault();
        handleUpdate(activeTx._id, { isSales: !activeTx.isSales });
      }

      if (e.key.toLowerCase() === "c" && activeTx) {
        e.preventDefault();
        toggleComm();
      }

      if (e.key.toLowerCase() === "m" && activeTx) {
        e.preventDefault();
        handleUpdate(activeTx._id, {
          isMarkedForManualEntry: !activeTx.isMarkedForManualEntry,
        });
      }

      if (e.key === "1") {
        e.preventDefault();
        setActiveTab("RECEIPT");
      }
      if (e.key === "2") {
        e.preventDefault();
        setActiveTab("PAYMENT");
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    ledgerModalOpen,
    showShortcuts,
    activeTx,
    handleVerifyAndNext,
    handleUpdate,
    toggleComm,
    displayTransactions.length,
  ]);

  const pendingCount = displayTransactions.filter(
    (t) => !(selection.verifiedIds || []).includes(t._id),
  ).length;
  const verifiedCount = displayTransactions.length - pendingCount;

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

      <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden absolute inset-0 bg-white dark:bg-[#06080E] font-sans text-left min-w-0">
        {/* LEFT PANEL (40%) */}
        <BankSidebar
          companyName={selection.tallyCompany}
          bankDirectory={bankDirectory}
          grandTotals={grandTotals}
          currentBank={currentBank}
          activeTab={activeTab}
          onSelectBank={(b) => setSelectedBank(b)}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenShortcuts={() => setShowShortcuts(true)}
          formatINR={formatINR}
          arns={arns}
        />

        {/* RIGHT PANEL (60%) */}
        <section className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden bg-slate-100/90 dark:bg-[#07090E] h-full border-l border-slate-200/80 dark:border-white/10 shadow-inner">
          <TransactionInspector
            activeTx={activeTx}
            activeTab={activeTab}
            currentBank={currentBank}
            currentIndex={currentIndex}
            displayTransactions={displayTransactions}
            verifiedIds={selection.verifiedIds || []}
            totalItems={displayTransactions.length}
            verifiedCount={verifiedCount}
            isCurrentVerified={isCurrentVerified}
            isVerifying={isVerifying}
            pendingCount={pendingCount}
            onOpenLedgerModal={() => setLedgerModalOpen(true)}
            onToggleSale={() =>
              handleUpdate(activeTx._id, { isSales: !activeTx.isSales })
            }
            onToggleComm={toggleComm}
            onToggleManual={() =>
              handleUpdate(activeTx._id, {
                isMarkedForManualEntry: !activeTx.isMarkedForManualEntry,
              })
            }
            onCustomNarrationChange={(val) =>
              handleUpdate(activeTx._id, { customNarration: val }, true)
            }
            onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            onNext={() =>
              setCurrentIndex((prev) =>
                Math.min(prev + 1, displayTransactions.length - 1),
              )
            }
            onSetIndex={(idx) => setCurrentIndex(idx)}
            onVerifyAndAdvance={handleVerifyAndNext}
            onJumpNextPending={handleJumpNextPending}
            formatINR={formatINR}
          />
        </section>

        {/* LEDGER SEARCH MODAL */}
        <LedgerSearchModal
          isOpen={ledgerModalOpen}
          activeTx={activeTx}
          searchQuery={ledgerSearch}
          companyLedgers={companyLedgers}
          onSearchChange={(q) => setLedgerSearch(q)}
          onSelectLedger={(ledgerName) => {
            handleUpdate(activeTx._id, { suggestedLedger: ledgerName });
            setLedgerModalOpen(false);
            setLedgerSearch("");
          }}
          onClose={() => {
            setLedgerModalOpen(false);
            setLedgerSearch("");
          }}
        />

        {/* SHORTCUTS MODAL */}
        <ShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </>
  );
};

export default AuditStep;
