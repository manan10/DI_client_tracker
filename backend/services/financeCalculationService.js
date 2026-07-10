/**
 * ============================================================================
 * CORE MATH ENGINE: FINANCE CALCULATION SERVICE
 * ============================================================================
 * This service acts as the strict "bank teller" of the app. It does NOT talk 
 * to the database. It only applies mathematical rules to the wallet balances 
 * in memory to ensure money is never artificially created or destroyed.
 * * ALGORITHM:
 * 1. IF DEBIT (Expense):
 * - Is it a physical wallet? 
 * - YES: Subtract amount. If balance < 0, throw "Insufficient funds".
 * - NO (Virtual): Do nothing to the balance.
 * * 2. IF TOP-UP or MONTHLY_RESET (Income):
 * - Is it a physical member's wallet?
 * - YES: Add amount to the wallet.
 * - Did this money come from the outside world (isExternal)?
 * - NO (Internal): Subtract amount from the Drawer. If Drawer < 0, throw error.
 * - YES (External): Do not touch the Drawer.
 * - Is it a virtual wallet OR the Drawer itself?
 * - YES: Just add the amount directly to its balance.
 * ============================================================================
 */

exports.adjustWalletBalances = (wallet, drawer, amount, type, isExternal) => {
    if (type === 'DEBIT') {
        if (!wallet.isVirtual) {
            wallet.balance += amount; // Amount is negative for subtractions
            if (wallet.balance < 0) {
                throw new Error(`Insufficient funds in ${wallet.walletName}.`);
            }
        }
    } 
    else if (type === 'TOP_UP' || type === 'MONTHLY_RESET') {
        if (!wallet.isGeneralPool && !wallet.isVirtual) {
            // Physical Member Wallet Top-Up
            wallet.balance += amount; 
            
            // If it's NOT an external top-up, the funds MUST come from the Drawer
            if (!isExternal) {
                if (!drawer) {
                    throw new Error("General Pool (Drawer) not found to process transfer.");
                }
                drawer.balance -= amount; // Opposite math for the drawer
                if (drawer.balance < 0) {
                    throw new Error("Drawer has insufficient funds to cover this transaction.");
                }
            }
        } else {
            // Virtual Wallet or Drawer Top-Up (Direct Inflow)
            wallet.balance += amount;
        }
    }
};