const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const User = require('../models/User'); 

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedWallets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Clear existing wallets to start fresh
        await Wallet.deleteMany({});

        // 1. Fetch existing users from your database
        // Replace 'brother_username' and 'dad_username' with the actual usernames in your DB
        const manan = await User.findOne({ username: 'mud10' });
        const brother = await User.findOne({ username: 'aud28' });
        const dad = await User.findOne({ username: 'uad24' });

        const initialWallets = [
            {
                walletName: "The Drawer",
                balance: 20000, 
                targetAllowance: 100000,
                isGeneralPool: true,
                user: null
            },
            {
                walletName: "Uday's Wallet",
                balance: 25000,
                targetAllowance: 25000,
                user: dad?._id
            },
            {
                walletName: "Manan's Wallet",
                balance: 15000,
                targetAllowance: 15000,
                user: manan?._id
            },
            {
                walletName: "Aman's Wallet",
                balance: 15000,
                targetAllowance: 15000,
                user: brother?._id
            }
        ];

        // 2. Filter out wallets where the User wasn't found (except for the General Pool)
        const validWallets = initialWallets.filter(w => {
            if (w.isGeneralPool) return true;
            if (!w.user) {
                console.warn(`⚠️ Skipping ${w.walletName}: User not found in database.`);
                return false;
            }
            return true;
        });

        if (validWallets.length > 0) {
            await Wallet.insertMany(validWallets);
            console.log(`✅ Success: ${validWallets.length} wallets initialized.`);
        } else {
            console.error("❌ No valid wallets to create. Check your usernames.");
        }

        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedWallets();