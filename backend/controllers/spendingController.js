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

        // 1. Fetch the Wallet to check balance
        const wallet = await Wallet.findById(sourceWallet).session(session);
        if (!wallet) throw new Error("Wallet not found");

        // --- NEW: BALANCE VALIDATION ---
        if (type === 'DEBIT' && wallet.balance < spendAmount) {
            // Throwing an error here triggers the catch block and aborts transaction
            throw new Error(`Insufficient funds in ${wallet.walletName}. Current balance: ₹${wallet.balance.toLocaleString('en-IN')}`);
        }

        // 2. Create the spending record
        const newSpending = new Spending({
            amount: spendAmount,
            type,
            category,
            description,
            sourceWallet,
            recordedBy: req.user.id,
            date: date || Date.now()
        });

        // 3. Update the Wallet balance
        if (type === 'DEBIT') {
            wallet.balance -= spendAmount;
        } else if (type === 'TOP_UP' || type === 'MONTHLY_RESET') {
            wallet.balance += spendAmount;
        }

        await wallet.save({ session });
        await newSpending.save({ session });

        await session.commitTransaction();
        res.status(201).json({ 
            message: "Transaction successful", 
            spending: newSpending, 
            newBalance: wallet.balance 
        });
    } catch (error) {
        await session.abortTransaction();
        // Return 400 for validation errors so frontend can display the message
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
        // 1. Fetch Drawer and Member Wallets
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        const memberWallets = await Wallet.find({ isGeneralPool: false }).session(session);

        if (!drawer) throw new Error("General Pool (Drawer) not found");

        // --- PHASE 1: REPLENISH THE DRAWER ---
        const drawerInflow = drawer.targetAllowance;
        drawer.balance += drawerInflow;

        // Log the Drawer's replenishment
        const drawerLog = new Spending({
            amount: drawerInflow,
            type: 'MONTHLY_RESET',
            category: 'System Refill',
            description: `Master Fund replenished by monthly target`,
            sourceWallet: drawer._id,
            recordedBy: req.user.id
        });
        await drawerLog.save({ session });

        // --- PHASE 2: DISTRIBUTE TO MEMBERS ---
        let totalDistributed = 0;

        for (let wallet of memberWallets) {
            const allowance = wallet.targetAllowance;

            // Credit the member
            wallet.balance += allowance;
            
            // Log the member credit
            const allowanceLog = new Spending({
                amount: allowance,
                type: 'MONTHLY_RESET',
                category: 'Monthly Allowance',
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
            message: "Sequential refill protocol executed successfully", 
            inflow: drawerInflow,
            outflow: totalDistributed,
            drawerFinalBalance: drawer.balance 
        });
        
    } catch (error) {
        await session.abortTransaction();
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
        if (wallet) {
            // Refund the money
            wallet.balance += spending.amount;
            await wallet.save({ session });
        }

        await spending.deleteOne({ session });

        await session.commitTransaction();
        res.status(200).json({ message: "Transaction undone and balance restored" });
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
        const { amount, description, category, date } = req.body;
        const spending = await Spending.findById(req.params.id).session(session);
        
        if (!spending) throw new Error("Transaction not found");

        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        if (!wallet) throw new Error("Associated wallet not found");

        // --- MATH LOGIC ---
        // If old amount was 1000 and new is 100:
        // difference = 1000 - 100 = 900 (Refund 900)
        // If old was 100 and new is 1000:
        // difference = 100 - 1000 = -900 (Deduct 900)
        const difference = spending.amount - Number(amount);
        
        // Update wallet balance
        wallet.balance += difference;

        // Check if the wallet has enough for this change (if increasing the expense)
        if (wallet.balance < 0) {
            throw new Error("Insufficient funds in wallet for this adjustment");
        }

        // Update the spending record
        spending.amount = Number(amount);
        spending.description = description || spending.description;
        spending.category = category || spending.category;
        spending.date = date || spending.date;

        await wallet.save({ session });
        await spending.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: "Transaction updated", updatedSpending: spending });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};