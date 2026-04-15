import * as XLSX from 'xlsx';

/**
 * Transforms staged bank transactions into a Tally-compliant 
 * Double Entry Excel structure.
 */
export const exportToTallyExcel = (stagedData, checkedIds, accounts) => {
  const allTransactions = stagedData.flatMap(group => group.transactions);
  const dataToExport = allTransactions.filter(t => checkedIds.includes(t._id));

  if (dataToExport.length === 0) return false;

  const rows = dataToExport.map(t => {
    const account = accounts.find(acc => acc._id === t.accountId);
    const bankLedger = account ? account.name : "Unknown Bank";
    const suggestedLedger = t.suggestedLedger || "Suspense Account";
    const isReceipt = t.type === 'RECEIPT';
    
    return {
      "Date": t.date,
      "Voucher Type": isReceipt ? "Receipt" : "Payment",
      "Voucher No": t.refNo || "",
      "Ledger (Debit)": isReceipt ? bankLedger : suggestedLedger,
      "Ledger (Credit)": isReceipt ? suggestedLedger : bankLedger,
      "Amount": t.amount,
      // CHANGE: Use customNarration if provided, else leave empty for Tally
      "Narration": t.customNarration ? t.customNarration.toUpperCase() : ""
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tally_Import");

  const dateTag = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Tally_Batch_Export_${dateTag}.xlsx`);
  
  return true;
};