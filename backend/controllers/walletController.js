const Wallet = require('../models/Wallet');
const Spending = require('../models/Spending');
const mongoose = require('mongoose');

const getSystemCategory = async () => {
    const Category = mongoose.model('Category');
    return await Category.findOne({ label: 'System' });
};

exports.createWallet = async (req, res) => {
    try {
        const { isGeneralPool, isVirtual, walletName, targetAllowance, balance, user } = req.body;

        if (isGeneralPool) {
            const existingPool = await Wallet.findOne({ isGeneralPool: true });
            if (existingPool) return res.status(400).json({ message: "A Master Pool already exists." });

            const Category = mongoose.model('Category');
            let systemCat = await Category.findOne({ label: 'System' });
            if (!systemCat) {
                systemCat = new Category({
                    label: 'System',
                    icon: 'Settings',
                    color: '#10b981',
                    isParent: false
                });
                await systemCat.save();
            }
        }

        const wallet = new Wallet({
            walletName,
            targetAllowance,
            isGeneralPool: isGeneralPool || false,
            isVirtual: isVirtual || false,
            user: isGeneralPool ? null : user, 
            balance: (isGeneralPool || isVirtual) ? (Number(balance) || 0) : 0 
        });

        await wallet.save();
        res.status(201).json(wallet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateWallet = async (req, res) => {
    try {
        const { balance, ...updateData } = req.body;
        const wallet = await Wallet.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const walletToDelete = await Wallet.findById(req.params.id).session(session);
        if (!walletToDelete) throw new Error("Wallet not found");
        if (walletToDelete.isGeneralPool) throw new Error("The Master Pool cannot be deleted");

        const leftoverBalance = walletToDelete.balance;

        // ONLY sweep funds if it's a standard wallet. 
        // Virtual/UPI funds don't exist in the physical "Drawer".
        if (leftoverBalance > 0 && !walletToDelete.isVirtual) {
            const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
            if (!drawer) throw new Error("Master Pool not found to receive leftover funds");

            drawer.balance += leftoverBalance;
            await drawer.save({ session });

            const systemCat = await getSystemCategory();
            const cleanupLog = new Spending({
                amount: leftoverBalance,
                type: 'TOP_UP',
                category: systemCat ? systemCat._id : drawer._id,
                description: `Cleanup: Funds returned from deleted wallet (${walletToDelete.walletName})`,
                sourceWallet: drawer._id,
                recordedBy: req.user.id
            });
            await cleanupLog.save({ session });
        }

        await Wallet.findByIdAndDelete(req.params.id).session(session);
        await session.commitTransaction();
        res.status(200).json({ message: "Wallet removed successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

exports.clearWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const wallet = await Wallet.findById(req.params.id).session(session);
        if (!wallet) throw new Error("Wallet not found");

        const amountToMove = wallet.balance;
        const systemCat = await getSystemCategory();

        // 1. If it's the Drawer or a Virtual Wallet, just zero it out.
        // We don't "sweep" virtual bank money into the physical drawer.
        if (wallet.isGeneralPool || wallet.isVirtual) {
            wallet.balance = 0;
            const log = new Spending({
                amount: amountToMove,
                type: 'DEBIT',
                category: systemCat ? systemCat._id : wallet._id,
                description: `${wallet.walletName} balance manually cleared to zero`,
                sourceWallet: wallet._id,
                recordedBy: req.user.id
            });
            await wallet.save({ session });
            await log.save({ session });
        } else {
            // 2. Standard member wallet: Sweep back to Drawer
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

exports.topUpWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { amount, description, isExternal } = req.body; 
        const topUpAmount = Number(amount);

        // Security/Validation check to prevent negative or zero injections
        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            throw new Error("Invalid top-up amount provided.");
        }

        const systemCategory = await getSystemCategory();

        const targetWallet = await Wallet.findById(req.params.id).session(session);
        if (!targetWallet) throw new Error("Target wallet not found.");

        // Logic: If it's a Virtual Wallet OR isGeneralPool OR marked 'isExternal' from the frontend,
        // it's a direct external deposit (bypasses the physical Drawer deduction).
        if (targetWallet.isGeneralPool || targetWallet.isVirtual || isExternal) {
            targetWallet.balance += topUpAmount;
            
            const depositLog = new Spending({
                amount: topUpAmount,
                type: 'TOP_UP',
                category: systemCategory ? systemCategory._id : targetWallet._id,
                description: description || (isExternal ? `External source deposit` : `Direct deposit to ${targetWallet.walletName}`),
                sourceWallet: targetWallet._id,
                recordedBy: req.user.id
            });
            
            await targetWallet.save({ session });
            await depositLog.save({ session });
            
        } else {
            // Standard Top-up from physical Drawer
            const drawer = await Wallet.findOne({ isGeneralPool: true }).session(session);
            if (!drawer) throw new Error("General Pool (Drawer) not found.");
            
            if (drawer.balance < topUpAmount) {
                throw new Error("Insufficient funds in the Drawer for this top-up.");
            }

            // Move the money
            drawer.balance -= topUpAmount;
            targetWallet.balance += topUpAmount;

            const topUpLog = new Spending({
                amount: topUpAmount,
                type: 'TOP_UP',
                category: systemCategory ? systemCategory._id : targetWallet._id,
                description: description || `Top-up allocated from ${drawer.walletName}`,
                sourceWallet: targetWallet._id,
                recordedBy: req.user.id
            });

            await drawer.save({ session });
            await targetWallet.save({ session });
            await topUpLog.save({ session });
        }

        await session.commitTransaction();
        res.status(200).json({ 
            success: true,
            message: "Top-up completed successfully.", 
            newBalance: targetWallet.balance 
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.error("Top-Up Error:", error);
        res.status(400).json({ success: false, message: error.message }); 
    } finally {
        session.endSession();
    }
};

// --- NEW METHOD: Transfer Funds Between Wallets ---
exports.transferFunds = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { sourceWallet, targetWallet, amount, description } = req.body;
        const transferAmount = Number(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            throw new Error("Invalid transfer amount.");
        }

        if (sourceWallet === targetWallet) {
            throw new Error("Cannot transfer to the same wallet.");
        }

        const source = await Wallet.findById(sourceWallet).session(session);
        const target = await Wallet.findById(targetWallet).session(session);

        if (!source) throw new Error("Origin wallet not found.");
        if (!target) throw new Error("Destination wallet not found.");

        if (source.balance < transferAmount) {
            throw new Error(`Insufficient funds in ${source.walletName}.`);
        }

        // Move the money
        source.balance -= transferAmount;
        target.balance += transferAmount;

        const systemCat = await getSystemCategory();

        // Log the deduction from the Source Wallet
        const debitLog = new Spending({
            amount: transferAmount,
            type: 'DEBIT',
            category: systemCat ? systemCat._id : source._id,
            description: description || `Internal transfer out to ${target.walletName}`,
            sourceWallet: source._id,
            recordedBy: req.user.id
        });

        // Log the addition to the Target Wallet
        const creditLog = new Spending({
            amount: transferAmount,
            type: 'TOP_UP',
            category: systemCat ? systemCat._id : target._id,
            description: description || `Internal transfer in from ${source.walletName}`,
            sourceWallet: target._id,
            recordedBy: req.user.id
        });

        await source.save({ session });
        await target.save({ session });
        await debitLog.save({ session });
        await creditLog.save({ session });

        await session.commitTransaction();
        res.status(200).json({ 
            success: true, 
            message: "Transfer completed successfully." 
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transfer Error:", error);
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

exports.reconcileWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { actualCash, description } = req.body;
        const targetAmount = Number(actualCash);
        
        if (isNaN(targetAmount) || targetAmount < 0) {
            throw new Error("Invalid cash amount.");
        }

        const wallet = await Wallet.findById(req.params.id).session(session);
        if (!wallet) throw new Error("Wallet not found");

        const difference = targetAmount - wallet.balance;
        
        if (difference === 0) {
            return res.status(200).json({ success: true, message: "Balance is already synced." });
        }

        const systemCat = await getSystemCategory();

        // If diff > 0: Found extra cash (Forgot an inflow) -> TOP_UP
        // If diff < 0: Missing cash (Forgot an expense) -> DEBIT
        const type = difference > 0 ? 'TOP_UP' : 'DEBIT';
        const absoluteDiff = Math.abs(difference);
        
        const adjustmentLog = new Spending({
            amount: absoluteDiff,
            type: type,
            category: systemCat ? systemCat._id : wallet._id,
            description: description || `Reconciliation Sync: ${difference > 0 ? 'Added unlogged' : 'Removed missing'} funds`,
            sourceWallet: wallet._id,
            recordedBy: req.user.id
        });

        // Set the wallet to precisely match reality
        wallet.balance = targetAmount;
        
        await wallet.save({ session });
        await adjustmentLog.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Wallet reconciled successfully", newBalance: wallet.balance });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};