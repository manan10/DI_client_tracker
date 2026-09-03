const mongoose = require('mongoose');

const Spending = require('../models/Spending');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const { adjustWalletBalances } = require('../services/financeCalculationService');

/**
 * ============================================================================
 * @desc    Add a new spending entry
 * @route   POST /api/spending
 * ============================================================================
 * ALGORITHM:
 * 1. Start: Lock the database session (Transaction).
 * 2. Fetch: Grab the user's wallet and the Master Drawer.
 * 3. Check Context: Determine if money involves an external source.
 * 4. Calculate: Send data to the Math Engine (Service) to update balances in memory.
 * 5. Record: Create the receipt (Spending doc), locking in `isExternal` status.
 * 6. Save: Save updated wallets, Drawer, and receipt to the database.
 * 7. Finish: Commit transaction successfully.
 * ============================================================================
 */
exports.addSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction(); 
    try {
        // Removed the default = false here to handle it strictly below
        const { amount, category, description, sourceWallet, date, type = 'DEBIT', isExternal } = req.body;
        const spendAmount = Number(amount);

        const wallet = await Wallet.findById(sourceWallet).session(session);
        if (!wallet) throw new Error("Wallet not found");
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);

        // FIX: Strictly parse to Boolean to prevent Mongoose CastErrors
        const explicitlyExternal = isExternal === true || isExternal === 'true';
        const descriptionHasExternal = typeof description === 'string' && description.includes('External source');
        const actuallyExternal = explicitlyExternal || descriptionHasExternal;

        // 1. CAPTURE BALANCE BEFORE
        const balanceBefore = wallet.balance;

        const mathAmount = type === 'DEBIT' ? -spendAmount : spendAmount;
        adjustWalletBalances(wallet, drawer, mathAmount, type, actuallyExternal);

        // 2. CAPTURE BALANCE AFTER
        const balanceAfter = wallet.balance;

        const newSpending = new Spending({
            amount: spendAmount,
            type,
            category,
            description,
            sourceWallet,
            isExternal: actuallyExternal, // Now guaranteed to be strictly true or false
            recordedBy: req.user.id,
            date: date || Date.now(),
            balanceBefore, 
            balanceAfter   
        });

        await wallet.save({ session });
        if (drawer) await drawer.save({ session });
        await newSpending.save({ session });

        await session.commitTransaction();
        res.status(201).json({ success: true, message: "Transaction successful" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
/**
 * ============================================================================
 * @desc    Monthly Reset Logic (Sequential Refill)
 * @route   POST /api/spending/process-allowance
 * ============================================================================
 * ALGORITHM:
 * 1. Start: Lock the database session.
 * 2. Fetch: Grab the Master Drawer and all physical member wallets.
 * 3. Setup: Ensure "System" category exists to hide these transfers from analytics.
 * 4. Phase 1 (Fund Drawer): Add baseline allowance to Drawer (as External money).
 * 5. Phase 2 (Fund Members): Loop through physical wallets, move funds from Drawer 
 * to member via the Math Engine, and write receipts.
 * 6. Save & Finish: Save all entities and commit.
 * ============================================================================
 */
exports.processMonthlyAllowance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        const memberWallets = await Wallet.find({ isGeneralPool: false, isVirtual: false }).session(session);
        if (!drawer) throw new Error("General Pool (Drawer) not found");

        let systemCategory = await Category.findOne({ label: 'System' }).session(session);
        if (!systemCategory) {
            systemCategory = new Category({
                label: 'System', icon: 'Settings', color: '#10b981', isParent: false
            });
            await systemCategory.save({ session });
        }

        // --- Phase 1: Master Drawer Inflow ---
        const drawerInflow = drawer.targetAllowance;
        const drawerBalanceBefore = drawer.balance; // CAPTURE BEFORE
        
        drawer.balance += drawerInflow;
        
        const drawerBalanceAfter = drawer.balance; // CAPTURE AFTER

        const drawerLog = new Spending({
            amount: drawerInflow, type: 'MONTHLY_RESET', category: systemCategory._id,
            description: `Master Fund replenished`, sourceWallet: drawer._id, recordedBy: req.user.id,
            isExternal: true,
            balanceBefore: drawerBalanceBefore, 
            balanceAfter: drawerBalanceAfter
        });
        await drawerLog.save({ session });

        // --- Phase 2: Member Distributions ---
        let totalDistributed = 0;
        for (let wallet of memberWallets) {
            const allowance = wallet.targetAllowance;
            
            const walletBalanceBefore = wallet.balance; // CAPTURE BEFORE
            
            adjustWalletBalances(wallet, drawer, allowance, 'MONTHLY_RESET', false);
            
            const walletBalanceAfter = wallet.balance; // CAPTURE AFTER
            
            const allowanceLog = new Spending({
                amount: allowance, type: 'MONTHLY_RESET', category: systemCategory._id,
                description: `Monthly top-up received`, sourceWallet: wallet._id, recordedBy: req.user.id,
                isExternal: false,
                balanceBefore: walletBalanceBefore,
                balanceAfter: walletBalanceAfter
            });

            totalDistributed += allowance;
            await wallet.save({ session });
            await allowanceLog.save({ session });
        }

        await drawer.save({ session });
        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Sequential refill complete" });
        
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};


/**
 * ============================================================================
 * @desc    Edit transaction amount/desc/cat
 * @route   PUT /api/spending/:id
 * ============================================================================
 * ALGORITHM:
 * 1. Start: Lock the database session.
 * 2. Safety Check: Block editing if it is a system-generated transfer.
 * 3. Fetch: Grab the receipt, the wallet, and the Drawer.
 * 4. Phase 1 (Undo): Take OLD amount and OLD external status. Flip math, run 
 * through Math Engine to restore balances to pre-receipt state.
 * 5. Phase 2 (Redo): Take NEW amount and NEW external status. Run through 
 * Math Engine to apply new financial reality.
 * 6. Update & Save: Update receipt document, save all entities, commit.
 * ============================================================================
 */
exports.editSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description, category, date, isExternal } = req.body;
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction not found");

        const isSystemLinked = spending.description?.includes('Internal transfer') || 
                               spending.description?.includes('Funds swept') || 
                               spending.description?.includes('Cleanup:');
        if (isSystemLinked) {
            throw new Error("System-linked transfers cannot be manually edited. Please reverse and recreate the transfer.");
        }

        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        
        const wasExternal = spending.isExternal !== undefined ? spending.isExternal : spending.description?.includes('External source');
        const nowExternal = isExternal !== undefined ? isExternal : wasExternal;
        const oldAmount = spending.amount;
        const newAmount = Number(amount);

        // Phase 1 (Undo): Strip away the old transaction's impact
        const reverseAmount = spending.type === 'DEBIT' ? oldAmount : -oldAmount;
        if (wallet) adjustWalletBalances(wallet, drawer, reverseAmount, spending.type, wasExternal);

        // CAPTURE BALANCE BEFORE NEW EDIT IS APPLIED
        const balanceBefore = wallet ? wallet.balance : undefined;

        // Phase 2 (Redo): Apply the new amount
        const applyAmount = spending.type === 'DEBIT' ? -newAmount : newAmount;
        if (wallet) adjustWalletBalances(wallet, drawer, applyAmount, spending.type, nowExternal);

        // CAPTURE BALANCE AFTER NEW EDIT IS APPLIED
        const balanceAfter = wallet ? wallet.balance : undefined;

        spending.amount = newAmount;
        spending.description = description || spending.description;
        spending.category = category || spending.category;
        spending.date = date || spending.date;
        if (isExternal !== undefined) spending.isExternal = nowExternal;
        
        // Save new balance markers
        if (wallet) {
            spending.balanceBefore = balanceBefore;
            spending.balanceAfter = balanceAfter;
        }

        if (wallet) await wallet.save({ session });
        if (drawer) await drawer.save({ session });
        await spending.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, updatedSpending: spending });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * ============================================================================
 * @desc    Delete transaction and reverse impact
 * @route   DELETE /api/spending/:id
 * ============================================================================
 * ALGORITHM:
 * 1. Start: Lock the database session.
 * 2. Safety Check: If receipt is system-generated (internal sweep), block deletion.
 * 3. Fetch: Grab the associated wallet and Drawer.
 * 4. Calculate Reversal: Look at what the transaction originally did, flip the math 
 * (e.g., DEBIT becomes positive refund).
 * 5. Apply Math: Send reversed amount through Math Engine to restore balances.
 * 6. Erase: Delete the receipt, save restored balances, and commit.
 * ============================================================================
 */
exports.deleteSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction record not found");

        // Step 2: Safety Check
        const isSystemLinked = spending.description?.includes('Internal transfer') || 
                               spending.description?.includes('Funds swept') || 
                               spending.description?.includes('Cleanup:');
        if (isSystemLinked) {
            throw new Error("System-linked transfers cannot be manually deleted.");
        }

        // Step 3: Fetch related entities
        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        
        // Ensure we use the exact same external logic used during creation
        const isExternal = spending.isExternal !== undefined ? spending.isExternal : false;

        // Step 4: Reverse Math
        // If it was a DEBIT (-), we add it back. If it was a TOP_UP (+), we subtract it.
        const reverseAmount = spending.type === 'DEBIT' ? spending.amount : -spending.amount;
        
        // Step 5: Adjust Balances
        if (wallet) {
            adjustWalletBalances(wallet, drawer, reverseAmount, spending.type, isExternal);
            await wallet.save({ session });
        }
        
        if (drawer) await drawer.save({ session });

        // Step 6: Finalize Deletion
        await spending.deleteOne({ session });
        
        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Transaction reversed and deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * ============================================================================
 * @desc    Get Detailed Analytics / Summaries
 * @route   GET /api/spending/analytics (and /summary)
 * ============================================================================
 * ALGORITHM:
 * 1. Fetch: Grab all wallets and spending records for requested timeframes.
 * 2. Filter: Strip out transactions categorized under "System" (so internal 
 * transfers don't skew real-world spending metrics).
 * 3. Group: Split physical vs virtual, sum up amounts per wallet and category.
 * 4. Return: Send formatted report to frontend.
 * ============================================================================
 */
exports.getDetailedAnalytics = async (req, res) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const startOfYear = new Date(targetYear, 0, 1);

        // Step 1
        const wallets = await Wallet.find({}).populate('user', 'name');
        const systemCategory = await Category.findOne({ label: 'System' });

        // Step 2
        const yearMatchStage = { date: { $gte: startOfYear, $lte: endDate }, type: 'DEBIT' };
        const monthMatchStage = { date: { $gte: startDate, $lte: endDate }, type: 'DEBIT' };

        if (systemCategory) {
            yearMatchStage.category = { $ne: systemCategory._id };
            monthMatchStage.category = { $ne: systemCategory._id };
        }

        // Step 3
        const spendStats = await Spending.aggregate([
            { $match: yearMatchStage },
            { $group: {
                _id: "$sourceWallet",
                yearSpend: { $sum: "$amount" },
                monthSpend: {
                    $sum: {
                        $cond: [
                            { $and: [{ $gte: ["$date", startDate] }, { $lte: ["$date", endDate] }] },
                            "$amount", 0
                        ]
                    }
                }
            }}
        ]);

        const categoryStats = await Spending.aggregate([
            { $match: monthMatchStage },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryDoc" } },
            { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, category: { $ifNull: ["$categoryDoc.label", "Uncategorized"] }, amount: 1 } },
            { $sort: { amount: -1 } } 
        ]);

        const walletData = wallets.map(wallet => {
            const stats = spendStats.find(s => s._id && s._id.toString() === wallet._id.toString()) || { yearSpend: 0, monthSpend: 0 };
            return {
                name: wallet.walletName,
                user: wallet.user?.name || 'General',
                balance: wallet.isVirtual ? null : wallet.balance,
                isVirtual: wallet.isVirtual,
                monthSpend: stats.monthSpend,
                yearSpend: stats.yearSpend
            };
        });

        // Step 4
        res.status(200).json({
            success: true,
            aggregated: {
                totalCashBalance: wallets.filter(w => !w.isVirtual).reduce((acc, w) => acc + (w.balance || 0), 0),
                monthNetSpend: walletData.reduce((acc, w) => acc + w.monthSpend, 0),
                yearNetSpend: walletData.reduce((acc, w) => acc + w.yearSpend, 0)
            },
            walletWise: walletData.sort((a, b) => a.name.localeCompare(b.name)),
            categoryWise: categoryStats 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Standard Summary
// @route   GET /api/spending/summary
exports.getFinanceSummary = async (req, res) => {
    try {
        const wallets = await Wallet.find().populate('user', 'name');
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const systemCategory = await Category.findOne({ label: 'System' });

        const matchStage = { type: 'DEBIT', date: { $gte: startOfMonth } };
        if (systemCategory) matchStage.category = { $ne: systemCategory._id };

        const spendingStats = await Spending.aggregate([
            { $match: matchStage },
            { $lookup: { from: "wallets", localField: "sourceWallet", foreignField: "_id", as: "walletInfo" } },
            { $unwind: "$walletInfo" },
            { $group: { _id: "$walletInfo.isVirtual", totalAmount: { $sum: "$amount" } } }
        ]);

        const report = { total: 0, cash: 0, digital: 0 };
        spendingStats.forEach(stat => {
            if (stat._id === true) report.digital = stat.totalAmount;
            else report.cash = stat.totalAmount;
            report.total += stat.totalAmount;
        });

        res.status(200).json({ success: true, wallets, analytics: report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Standard History (Filters Month/Year/Wallet/Search)
// @route   GET /api/spending/history
exports.getSpendingHistory = async (req, res) => {
    try {
        const { month, year, walletId, search } = req.query;
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);

        let query = { date: { $gte: startDate, $lte: endDate } };

        if (walletId && walletId !== 'All') query.sourceWallet = walletId;
        if (search && search.trim() !== "") query.description = { $regex: search, $options: 'i' };

        const history = await Spending.find(query)
            // Nested populate to grab the Parent Category if it exists
            .populate({
                path: 'category',
                populate: { path: 'parent' }
            })
            .populate('sourceWallet', 'walletName isVirtual') 
            .sort({ date: -1 });

        // Map data to match the new Frontend UI expectations
        const formattedHistory = history.map(item => {
            const doc = item.toObject();
            
            // Sub-category logic separation
            if (doc.category) {
                if (doc.category.parent) {
                    doc.subCategory = doc.category.label;     // Child becomes subCategory
                    doc.category = doc.category.parent;       // Parent becomes main category
                } else {
                    doc.subCategory = "";                     // No parent, so it is the main category
                }
            }
            return doc;
        });

        res.status(200).json({ success: true, data: formattedHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all transactions for a specific wallet via Param ID
// @route   GET /api/spending/history/:walletId
exports.getWalletHistory = async (req, res) => {
    try {
        const { walletId } = req.params;
        let query = {};
        if (walletId && walletId !== 'all') query.sourceWallet = walletId;

        const history = await Spending.find(query)
            .populate({
                path: 'category',
                populate: { path: 'parent' }
            })
            .populate('sourceWallet', 'walletName isVirtual isGeneralPool') 
            .sort({ date: -1 })
            .limit(50); 

        const formattedHistory = history.map(item => {
            const doc = item.toObject();
            
            if (doc.category) {
                if (doc.category.parent) {
                    doc.subCategory = doc.category.label;
                    doc.category = doc.category.parent;
                } else {
                    doc.subCategory = "";
                }
            }
            return doc;
        });

        res.status(200).json({ success: true, data: formattedHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};