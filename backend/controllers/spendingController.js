const Spending = require('../models/Spending');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');

const mongoose = require('mongoose');

// @desc    Add a new spending entry
// @route   POST /api/spending
exports.addSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, category, description, sourceWallet, date, type = 'DEBIT' } = req.body;
        const spendAmount = Number(amount);

        const wallet = await Wallet.findById(sourceWallet).session(session);
        if (!wallet) throw new Error("Wallet not found");

        if (type === 'DEBIT') {
            // Check balance ONLY if it's a physical wallet. 
            // Virtual/UPI wallets are assumed to be managed externally.
            if (!wallet.isVirtual && wallet.balance < spendAmount) {
                throw new Error(`Insufficient funds in ${wallet.walletName}.`);
            }
            
            // Only subtract from balance if it's NOT a virtual wallet
            if (!wallet.isVirtual) {
                wallet.balance -= spendAmount;
            }

        } else if (type === 'TOP_UP' || type === 'MONTHLY_RESET') {
            // Standard fallback logic (Top-Ups are primarily handled in walletController now)
            if (!wallet.isGeneralPool && !wallet.isVirtual) {
                const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                if (!drawer) throw new Error("Master Pool not found for top-up");
                if (drawer.balance < spendAmount) throw new Error("Drawer has insufficient funds to top-up this wallet");

                drawer.balance -= spendAmount;
                wallet.balance += spendAmount;
                await drawer.save({ session });
            } else {
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

// @desc    Monthly Reset Logic (Sequential Refill)
// @route   POST /api/spending/process-allowance
exports.processMonthlyAllowance = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
        // We only refill physical member wallets (Waterfall flow)
        const memberWallets = await Wallet.find({ isGeneralPool: false, isVirtual: false }).session(session);

        if (!drawer) throw new Error("General Pool (Drawer) not found");

        let systemCategory = await Category.findOne({ label: 'System' }).session(session);
        
        if (!systemCategory) {
            systemCategory = new Category({
                label: 'System',
                icon: 'Settings',
                color: '#10b981',
                isParent: false
            });
            await systemCategory.save({ session });
        }

        // Phase 1: Replenish Drawer
        const drawerInflow = drawer.targetAllowance;
        drawer.balance += drawerInflow;

        const drawerLog = new Spending({
            amount: drawerInflow,
            type: 'MONTHLY_RESET',
            category: systemCategory._id,
            description: `Master Fund replenished`,
            sourceWallet: drawer._id,
            recordedBy: req.user.id
        });
        await drawerLog.save({ session });

        // Phase 2: Distribute to Physical Member Wallets
        let totalDistributed = 0;
        for (let wallet of memberWallets) {
            const allowance = wallet.targetAllowance;
            wallet.balance += allowance;
            
            const allowanceLog = new Spending({
                amount: allowance,
                type: 'MONTHLY_RESET',
                category: systemCategory._id,
                description: `Monthly top-up received`,
                sourceWallet: wallet._id,
                recordedBy: req.user.id
            });

            totalDistributed += allowance;
            await wallet.save({ session });
            await allowanceLog.save({ session });
        }

        // Phase 3: Update Drawer
        drawer.balance -= totalDistributed;
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

// @desc    Delete transaction and reverse impact
// @route   DELETE /api/spending/:id
exports.deleteSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction record not found");

        // SAFETY LOCK: Prevent orphaned multi-leg transactions
        const isSystemLinked = spending.description?.includes('Internal transfer') || 
                               spending.description?.includes('Funds swept') || 
                               spending.description?.includes('Cleanup:');
                               
        if (isSystemLinked) {
            throw new Error("System-linked transfers cannot be manually deleted. Please create a reverse transfer to correct this.");
        }

        const isExternalTopUp = spending.description?.includes('External source');
        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        
        if (spending.type === 'DEBIT') {
            // Only refund the balance if it's NOT a virtual wallet
            if (wallet && !wallet.isVirtual) {
                wallet.balance += spending.amount;
                await wallet.save({ session });
            }
        } 
        else if (spending.type === 'TOP_UP' || spending.type === 'MONTHLY_RESET') {
            
            if (wallet && !wallet.isGeneralPool && !wallet.isVirtual) {
                // Remove funds from the target physical wallet
                wallet.balance -= spending.amount;
                
                // ONLY refund the Drawer if it was NOT an external top-up
                if (!isExternalTopUp) {
                    const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                    if (drawer) {
                        drawer.balance += spending.amount;
                        await drawer.save({ session });
                    }
                }
                await wallet.save({ session });
                
            } else if (wallet) {
                // Reversing direct inflow (Drawer, Virtual, or External)
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

// @desc    Edit transaction amount/desc/cat
// @route   PUT /api/spending/:id
exports.editSpending = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description, category, date } = req.body;
        const spending = await Spending.findById(req.params.id).session(session);
        if (!spending) throw new Error("Transaction not found");

        // SAFETY LOCK: Prevent orphaned multi-leg transactions
        const isSystemLinked = spending.description?.includes('Internal transfer') || 
                               spending.description?.includes('Funds swept') || 
                               spending.description?.includes('Cleanup:');

        if (isSystemLinked) {
            throw new Error("System-linked transfers cannot be manually edited. Please reverse and recreate the transfer.");
        }

        const isExternalTopUp = spending.description?.includes('External source');
        const wallet = await Wallet.findById(spending.sourceWallet).session(session);
        
        const oldAmount = spending.amount;
        const newAmount = Number(amount);
        const difference = oldAmount - newAmount;

        if (spending.type === 'DEBIT') {
            // Adjust balance ONLY for physical wallets
            if (wallet && !wallet.isVirtual) {
                wallet.balance += difference; 
                if (wallet.balance < 0) throw new Error("Insufficient funds for adjustment");
                await wallet.save({ session });
            }
        } else if (spending.type === 'TOP_UP') {
            if (wallet && !wallet.isGeneralPool && !wallet.isVirtual) {
                // Adjust Physical Wallet
                wallet.balance -= difference;
                
                // Adjust the Drawer ONLY if it wasn't an external top-up
                if (!isExternalTopUp) {
                    const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
                    if (drawer) {
                        drawer.balance += difference;
                        await drawer.save({ session });
                    }
                }
                await wallet.save({ session });
                
            } else if (wallet) {
                // Adjust direct inflow (Virtual, Drawer, External)
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

// @desc    Standard Summary
// @route   GET /api/spending/summary
exports.getFinanceSummary = async (req, res) => {
    try {
        const wallets = await Wallet.find().populate('user', 'name');
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        // Fetch the System Category to dynamically exclude transfers from analytics
        const systemCategory = await Category.findOne({ label: 'System' });

        // Build the safe match stage
        const matchStage = {
            type: 'DEBIT', 
            date: { $gte: startOfMonth }
        };
        if (systemCategory) {
            matchStage.category = { $ne: systemCategory._id };
        }

        // Aggregation to split true spending by Wallet Type
        const spendingStats = await Spending.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "wallets", 
                    localField: "sourceWallet",
                    foreignField: "_id",
                    as: "walletInfo"
                }
            },
            { $unwind: "$walletInfo" },
            {
                $group: {
                    _id: "$walletInfo.isVirtual", 
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        const report = {
            total: 0,
            cash: 0,
            digital: 0
        };

        spendingStats.forEach(stat => {
            if (stat._id === true) {
                report.digital = stat.totalAmount;
            } else {
                report.cash = stat.totalAmount;
            }
            report.total += stat.totalAmount;
        });

        res.status(200).json({
            success: true,
            wallets,
            analytics: report
        });
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

        if (walletId && walletId !== 'All') {
            query.sourceWallet = walletId;
        }

        if (search && search.trim() !== "") {
            query.description = { $regex: search, $options: 'i' };
        }

        const history = await Spending.find(query)
            .populate('category')
            .populate('sourceWallet', 'walletName isVirtual') 
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: history });
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

        if (walletId && walletId !== 'all') {
            query.sourceWallet = walletId;
        }

        const history = await Spending.find(query)
            .populate('category')
            .populate('sourceWallet', 'walletName isVirtual isGeneralPool') 
            .sort({ date: -1 })
            .limit(50); 

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};


exports.getDetailedAnalytics = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const startOfYear = new Date(targetYear, 0, 1);

        const wallets = await Wallet.find({}).populate('user', 'name');

        // Fetch System Category to protect accurate data
        const systemCategory = await Category.findOne({ label: 'System' });

        // Match Stages protecting the analytics from internal Transfers
        const yearMatchStage = {
            date: { $gte: startOfYear, $lte: endDate },
            type: 'DEBIT'
        };
        const monthMatchStage = {
            date: { $gte: startDate, $lte: endDate },
            type: 'DEBIT'
        };

        if (systemCategory) {
            yearMatchStage.category = { $ne: systemCategory._id };
            monthMatchStage.category = { $ne: systemCategory._id };
        }

        const spendStats = await Spending.aggregate([
            { $match: yearMatchStage },
            {
                $group: {
                    _id: "$sourceWallet",
                    yearSpend: { $sum: "$amount" },
                    monthSpend: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ["$date", startDate] }, { $lte: ["$date", endDate] }] },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const categoryStats = await Spending.aggregate([
            { $match: monthMatchStage },
            {
                $group: {
                    _id: "$category", 
                    amount: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "categories", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDoc"
                }
            },
            { 
                $unwind: { 
                    path: "$categoryDoc", 
                    preserveNullAndEmptyArrays: true 
                } 
            },
            {
                $project: {
                    _id: 0,
                    category: { $ifNull: ["$categoryDoc.label", "Uncategorized"] },
                    amount: 1
                }
            },
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