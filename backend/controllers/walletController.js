const Wallet = require('../models/Wallet');
const Spending = require('../models/Spending');
const mongoose = require('mongoose');

// Helper to get System Category (used for internal logs)
const getSystemCategory = async () => {
    const Category = mongoose.model('Category');
    return await Category.findOne({ label: 'System' });
};

// CREATE: Add a new family member wallet
exports.createWallet = async (req, res) => {
    try {
        // Ensure new wallets start at 0 as per UI requirements
        const walletData = { ...req.body, balance: 0 };
        const wallet = new Wallet(walletData);
        await wallet.save();
        res.status(201).json(wallet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// UPDATE: Edit target allowance or wallet name
exports.updateWallet = async (req, res) => {
    try {
        // Strip out balance from req.body to prevent "Magic Money" edits via Postman/Frontend
        const { balance, ...updateData } = req.body;
        
        const wallet = await Wallet.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE: Remove a wallet and move leftover funds to Drawer
exports.deleteWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const walletToDelete = await Wallet.findById(req.params.id).session(session);
        if (!walletToDelete) throw new Error("Wallet not found");
        if (walletToDelete.isGeneralPool) throw new Error("The Master Pool cannot be deleted");

        const leftoverBalance = walletToDelete.balance;

        // If there's money left, move it to the Drawer
        if (leftoverBalance > 0) {
            const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
            if (!drawer) throw new Error("Master Pool not found to receive leftover funds");

            drawer.balance += leftoverBalance;
            await drawer.save({ session });

            const systemCat = await getSystemCategory();
            const cleanupLog = new Spending({
                amount: leftoverBalance,
                type: 'TOP_UP', // Treated as an inflow to the Drawer
                category: systemCat ? systemCat._id : drawer._id,
                description: `Cleanup: Funds returned from deleted wallet (${walletToDelete.walletName})`,
                sourceWallet: drawer._id,
                recordedBy: req.user.id
            });
            await cleanupLog.save({ session });
        }

        await Wallet.findByIdAndDelete(req.params.id).session(session);
        
        await session.commitTransaction();
        res.status(200).json({ message: "Wallet removed and funds returned to Master Pool" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// CLEAR: Sweep balance to Drawer (or zero out Drawer)
exports.clearWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const wallet = await Wallet.findById(req.params.id).session(session);
        if (!wallet) throw new Error("Wallet not found");

        const amountToMove = wallet.balance;
        const systemCat = await getSystemCategory();

        if (wallet.isGeneralPool) {
            // Case A: Just zero out the Drawer
            wallet.balance = 0;
            const log = new Spending({
                amount: amountToMove,
                type: 'DEBIT',
                category: systemCat ? systemCat._id : wallet._id,
                description: "Master Pool balance manually cleared to zero",
                sourceWallet: wallet._id,
                recordedBy: req.user.id
            });
            await wallet.save({ session });
            await log.save({ session });
        } else {
            // Case B: Sweep member funds back to Drawer
            const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
            if (!drawer) throw new Error("Master Pool not found");

            wallet.balance = 0;
            drawer.balance += amountToMove;

            const log = new Spending({
                amount: amountToMove,
                type: 'TOP_UP',
                category: systemCat ? systemCat._id : drawer._id,
                description: `Funds swept from ${wallet.walletName} back to Master Pool`,
                sourceWallet: drawer._id,
                recordedBy: req.user.id
            });

            await wallet.save({ session });
            await drawer.save({ session });
            await log.save({ session });
        }

        await session.commitTransaction();
        res.status(200).json({ message: "Wallet cleared successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Top-up a wallet specifically from the General Pool (Drawer)
// @route   POST /api/wallets/:id/topup
exports.topUpWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description } = req.body;
        const topUpAmount = Number(amount);

        // 1. Fetch a "System" category to satisfy the ObjectId requirement
        // If you don't have one, you might need to create it once in your DB
        const Category = mongoose.model('Category'); 
        let systemCategory = await Category.findOne({ label: 'System' });

        const targetWallet = await Wallet.findById(req.params.id).session(session);
        if (!targetWallet) throw new Error("Wallet not found");

        if (targetWallet.isGeneralPool) {
            targetWallet.balance += topUpAmount;
            const depositLog = new Spending({
                amount: topUpAmount,
                type: 'TOP_UP',
                category: systemCategory ? systemCategory._id : targetWallet._id, // Fallback to avoid BSON error
                description: description || `Direct cash deposit to Master Pool`,
                sourceWallet: targetWallet._id,
                recordedBy: req.user.id
            });
            await targetWallet.save({ session });
            await depositLog.save({ session });
        } else {
            const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
            if (!drawer) throw new Error("General Pool (Drawer) not found");
            if (drawer.balance < topUpAmount) throw new Error("Insufficient funds in the General Pool");

            drawer.balance -= topUpAmount;
            targetWallet.balance += topUpAmount;

            const topUpLog = new Spending({
                amount: topUpAmount,
                type: 'TOP_UP',
                category: systemCategory ? systemCategory._id : targetWallet._id, // Use valid ID
                description: description || `Top-up from ${drawer.walletName}`,
                sourceWallet: targetWallet._id,
                recordedBy: req.user.id
            });

            await drawer.save({ session });
            await targetWallet.save({ session });
            await topUpLog.save({ session });
        }

        await session.commitTransaction();
        res.status(200).json({ message: "Operation completed", newBalance: targetWallet.balance });
    } catch (error) {
        await session.abortTransaction();
        // Return 400 or 500 so the frontend catch block triggers
        res.status(400).json({ message: error.message }); 
    } finally {
        session.endSession();
    }
};