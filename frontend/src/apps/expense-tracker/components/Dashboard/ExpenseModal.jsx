import React, { useEffect } from "react";
import ExpenseModalContent from "./ExpenseModalContent";

const initialExpenseState = {
  amount: "",
  category: "",
  description: "",
  sourceWallet: "",
  type: "DEBIT",
};

const ExpenseModal = ({
  isOpen,
  setOpen,
  wallets = [],
  expenseData = initialExpenseState,
  setExpenseData,
  onSubmit,
  loading,
}) => {
  // Clear all parent state immediately when modal closes
  useEffect(() => {
    if (!isOpen && setExpenseData) {
      setExpenseData(initialExpenseState);
    }
  }, [isOpen, setExpenseData]);

  if (!isOpen) return null;

  // Key guarantees that any change between blank (floating action) and pre-selected wallet
  // completely remounts all steps, wiping internal navigation and inputs
  const modalKey = expenseData?._id
    ? `edit-${expenseData._id}`
    : `new-${expenseData?.sourceWallet || "none"}`;

  return (
    <ExpenseModalContent
      key={modalKey}
      setOpen={setOpen}
      wallets={wallets}
      expenseData={expenseData}
      setExpenseData={setExpenseData}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};

export default ExpenseModal;