const Spending = require('../models/Spending');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

// @desc    Add a new spending entry and update wallet balance
// @route   POST /api/spending
exports.addSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, category, description, sourceWallet, date, type = 'DEBIT' } = req.body;
        const spendAmount = Number(amount);

        const wallet = await Wallet.findById(sourceWallet).session(session);
        if (!wallet) throw new Error("Wallet not found");

        // Fetch the Drawer (General Pool)
        const generalPool = await Wallet.findOne({ isGeneralPool: true }).session(session);

        if (type === 'DEBIT' && wallet.balance < spendAmount) {
            throw new Error(`Insufficient funds in ${wallet.walletName}.`);
        }

        const newSpending = new Spending({
            amount: spendAmount,
            type,
            category,
            description,
            sourceWallet,
            recordedBy: req.user.id,
            date: date || Date.now()
        });

        // --- DUAL UPDATE LOGIC ---
        if (type === 'DEBIT') {
            wallet.balance -= spendAmount;
            // Subtract from drawer if the current wallet is NOT the drawer itself 
            // (to avoid double subtraction if sourceWallet IS the drawer)
            if (!wallet.isGeneralPool && generalPool) {
                generalPool.balance -= spendAmount;
            }
        } else if (type === 'TOP_UP' || type === 'MONTHLY_RESET') {
            wallet.balance += spendAmount;
            if (!wallet.isGeneralPool && generalPool) {
                generalPool.balance += spendAmount;
            }
        }

        if (generalPool) await generalPool.save({ session });
        await wallet.save({ session });
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

// @desc    Get dashboard summary (Total spent, member balances)
// @route   GET /api/spending/summary
exports.getFinanceSummary = async (req, res) => {
    try {
        const wallets = await Wallet.find().populate('user', 'name');
        
        // Calculate total spending this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const totalMonthlySpent = await Spending.aggregate([
            { $match: { type: 'DEBIT', date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            wallets,
            monthlyTotal: totalMonthlySpent[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Monthly Reset Logic
// @route   POST /api/spending/reset
exports.monthlyReset = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const wallets = await Wallet.find({ isGeneralPool: false });
        
        for (let wallet of wallets) {
            const refillAmount = wallet.targetAllowance - wallet.balance;
            
            // Only log if we are actually adding money to reach the reset target
            if (refillAmount > 0) {
                const resetLog = new Spending({
                    amount: refillAmount,
                    type: 'MONTHLY_RESET',
                    category: 'System Reset',
                    description: `Monthly refill to ${wallet.targetAllowance}`,
                    sourceWallet: wallet._id,
                    recordedBy: req.user.id
                });
                
                wallet.balance = wallet.targetAllowance;
                await wallet.save({ session });
                await resetLog.save({ session });
            } else {
                // If they have more than the target, we still reset them down (as per "Reset" rule)
                wallet.balance = wallet.targetAllowance;
                await wallet.save({ session });
            }
        }

        await session.commitTransaction();
        res.status(200).json({ message: "All wallets reset to target allowances" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get all transactions for a specific wallet
// @route   GET /api/spending/wallet/:walletId
exports.getWalletHistory = async (req, res) => {
    try {
        const { walletId } = req.params;
        let query = {};

        if (walletId !== 'all') {
            query.sourceWallet = walletId;
        }

        const history = await Spending.find(query)
            .populate('category') // <--- CRITICAL: This fixes the ID/Miscellaneous issue
            .sort({ date: -1 })
            .limit(20);

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process Monthly Allowance (Carry Forward Logic)
// @route   POST /api/spending/process-allowance
// @desc    Process Monthly Allowance (Sequential Refill Logic)
// @route   POST /api/spending/process-allowance
exports.processMonthlyAllowance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        const memberWallets = await Wallet.find({ isGeneralPool: false }).session(session);

        if (!drawer) throw new Error("General Pool (Drawer) not found");

        // --- PHASE 0: FIND OR CREATE SYSTEM CATEGORY ---
        const Category = mongoose.model('Category'); 
        let systemCategory = await Category.findOne({ label: 'System' }).session(session);
        
        // If it doesn't exist, create it on the fly so the script doesn't crash
        if (!systemCategory) {
            systemCategory = new Category({
                label: 'System',
                icon: 'Settings', // Lucide icon name
                color: '#10b981', // Emerald
                isParent: false
            });
            await systemCategory.save({ session });
        }

        // --- PHASE 1: REPLENISH THE DRAWER ---
        const drawerInflow = drawer.targetAllowance;
        drawer.balance += drawerInflow;

        const drawerLog = new Spending({
            amount: drawerInflow,
            type: 'MONTHLY_RESET',
            category: systemCategory._id, // Now guaranteed to be an ObjectId
            description: `Master Fund replenished by monthly target`,
            sourceWallet: drawer._id,
            recordedBy: req.user.id
        });
        await drawerLog.save({ session });

        // --- PHASE 2: DISTRIBUTE TO MEMBERS ---
        let totalDistributed = 0;

        for (let wallet of memberWallets) {
            const allowance = wallet.targetAllowance;
            wallet.balance += allowance;
            
            const allowanceLog = new Spending({
                amount: allowance,
                type: 'MONTHLY_RESET',
                category: systemCategory._id,
                description: `Monthly top-up received from ${drawer.walletName}`,
                sourceWallet: wallet._id,
                recordedBy: req.user.id
            });

            totalDistributed += allowance;
            await wallet.save({ session });
            await allowanceLog.save({ session });
        }

        // --- PHASE 3: DEDUCT FROM DRAWER ---
        drawer.balance -= totalDistributed;
        await drawer.save({ session });

        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true,
            message: "Sequential refill protocol executed successfully", 
            inflow: drawerInflow,
            outflow: totalDistributed,
            drawerFinalBalance: drawer.balance 
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error("Allowance Error:", error);
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
exports.deleteSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction record not found");

        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        const generalPool = await Wallet.findOne({ isGeneralPool: true }).session(session);

        if (wallet) {
            // Calculate adjustment: If we delete a DEBIT, we ADD back.
            const adjustment = spending.type === 'DEBIT' ? spending.amount : -spending.amount;
            
            wallet.balance += adjustment;
            
            // Refund the drawer too if this wallet isn't the drawer itself
            if (!wallet.isGeneralPool && generalPool) {
                generalPool.balance += adjustment;
            }

            await wallet.save({ session });
            if (generalPool) await generalPool.save({ session });
        }

        await spending.deleteOne({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Transaction undone and drawer updated" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
exports.editSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description, category, date, sourceWallet } = req.body;
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction not found");

        const newAmount = Number(amount);
        const newWalletId = sourceWallet || spending.sourceWallet;

        // 1. REVERT OLD TRANSACTION IMPACT
        const oldWallet = await Wallet.findById(spending.sourceWallet).session(session);
        if (!oldWallet) throw new Error("Original wallet not found");
        
        // If it was a debit, give money back. If credit, take it away.
        const revertAmount = spending.type === 'DEBIT' ? spending.amount : -spending.amount;
        oldWallet.balance += revertAmount;
        await oldWallet.save({ session });

        // 2. APPLY NEW TRANSACTION IMPACT
        const targetWallet = (spending.sourceWallet.toString() === newWalletId.toString()) 
            ? oldWallet 
            : await Wallet.findById(newWalletId).session(session);

        if (!targetWallet) throw new Error("Target wallet not found");

        // If new type is debit, take money. If credit, add money.
        // Assuming type stays the same as original for now
        const applyAmount = spending.type === 'DEBIT' ? newAmount : -newAmount;
        targetWallet.balance -= applyAmount;

        if (targetWallet.balance < 0) throw new Error("Insufficient funds for this adjustment");
        await targetWallet.save({ session });

        // 3. UPDATE RECORD
        spending.amount = newAmount;
        spending.description = description || spending.description;
        spending.category = category || spending.category;
        spending.date = date || spending.date;
        spending.sourceWallet = newWalletId;

        await spending.save({ session });
        await session.commitTransaction();
        
        res.status(200).json({ success: true, message: "Updated", updatedSpending: spending });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get transaction history with Month/Year/Wallet filters
// @route   GET /api/spending/history
exports.getSpendingHistory = async (req, res) => {
    try {
        const { month, year, walletId, search } = req.query;

        // 1. Create a date range for the selected month/year
        // month is 0-indexed (Jan = 0) from the frontend
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);

        let query = {
            // Assuming you have auth middleware: user: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        };

        // 2. Apply Wallet Filter
        if (walletId && walletId !== 'All') {
            query.sourceWallet = walletId;
        }

        // 3. Apply Search Filter (Search in description or label)
        if (search && search.trim() !== "") {
            query.description = { $regex: search, $options: 'i' };
        }

        // 4. Fetch and Populate
        const history = await Spending.find(query)
            .populate('category') // To get color and label
            .populate('sourceWallet', 'walletName') // To get the name of the bank/wallet
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};