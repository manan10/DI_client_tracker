const Spending = require('../models/Spending');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

exports.addSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, category, description, sourceWallet, date, type = 'DEBIT' } = req.body;
        const spendAmount = Number(amount);

        const wallet = await Wallet.findById(sourceWallet).session(session);
        if (!wallet) throw new Error("Wallet not found");

        if (type === 'DEBIT') {
            // Check balance of ONLY the used wallet
            if (wallet.balance < spendAmount) {
                throw new Error(`Insufficient funds in ${wallet.walletName}.`);
            }
            
            // --- EXCLUSIVE DEBIT ---
            // We only subtract from the wallet used. 
            // If it's a member wallet, the Drawer stays untouched.
            wallet.balance -= spendAmount;

        } else if (type === 'TOP_UP' || type === 'MONTHLY_RESET') {
            // If we are topping up a member wallet, money MUST come from somewhere.
            // In your system, TOP_UP implies money moving FROM Drawer TO Wallet.
            if (!wallet.isGeneralPool) {
                const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                if (!drawer) throw new Error("Master Pool not found for top-up");
                if (drawer.balance < spendAmount) throw new Error("Drawer has insufficient funds to top-up this wallet");

                drawer.balance -= spendAmount; // Remove from Master
                wallet.balance += spendAmount; // Add to Member
                await drawer.save({ session });
            } else {
                // If we are topping up the Drawer itself (External Inflow)
                wallet.balance += spendAmount;
            }
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
        
        if (spending.type === 'DEBIT') {
            // REVERSE EXPENSE: Money goes back to the specific wallet used
            if (wallet) {
                wallet.balance += spending.amount;
                await wallet.save({ session });
            }
        } 
        else if (spending.type === 'TOP_UP' || spending.type === 'MONTHLY_RESET') {
            // REVERSE TRANSFER: Money leaves the member wallet and returns to Drawer
            if (wallet && !wallet.isGeneralPool) {
                const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                
                wallet.balance -= spending.amount; // Member loses the top-up
                if (drawer) {
                    drawer.balance += spending.amount; // Drawer gets it back
                    await drawer.save({ session });
                }
                await wallet.save({ session });
            } else if (wallet && wallet.isGeneralPool) {
                // Reversing an external deposit into the Drawer
                wallet.balance -= spending.amount;
                await wallet.save({ session });
            }
        }

        await spending.deleteOne({ session });
        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Transaction reversed successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
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
        const oldAmount = spending.amount;
        const newAmount = Number(amount);
        const difference = oldAmount - newAmount; // Positive if price decreased (refund)

        if (spending.type === 'DEBIT') {
            // Adjust the balance of the wallet that paid
            if (wallet) {
                wallet.balance += difference; 
                // If 500 -> 400, diff is 100, wallet gets +100
                // If 500 -> 600, diff is -100, wallet gets -100
                if (wallet.balance < 0) throw new Error("Insufficient funds for this adjustment");
                await wallet.save({ session });
            }
        } else if (spending.type === 'TOP_UP') {
            // Adjust a Transfer: Wallet and Drawer both change
            if (wallet && !wallet.isGeneralPool) {
                const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                
                wallet.balance -= difference; // If top-up was 1000->1200, wallet gets +200
                if (drawer) {
                    drawer.balance += difference; // Drawer loses 200
                    await drawer.save({ session });
                }
                await wallet.save({ session });
            } else if (wallet) {
                wallet.balance -= difference;
                await wallet.save({ session });
            }
        }

        spending.amount = newAmount;
        spending.description = description || spending.description;
        spending.category = category || spending.category;
        spending.date = date || spending.date;

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