const { Account, BalanceSnapshot } = require('../models/Account');

// @desc    Get bank accounts (Optional: Filter by ARN)
// @route   GET /api/accounts
exports.getAccounts = async (req, res) => {
  try {
    const { arn } = req.query; 
    const query = { isActive: true };
    
    if (arn) {
      query.arn = arn;
    }

    const accounts = await Account.find(query).sort({ arn: 1, name: 1 });
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add a new bank account linked to an ARN
// @route   POST /api/accounts
exports.addAccount = async (req, res) => {
  try {
    const { accountName, accountNumber, arn, category } = req.body;
    
    const newAccount = await Account.create({
      name: accountName,
      accountNumber: accountNumber,
      arn: arn,        // Added ARN support
      category: category || 'Bank'
    });
    
    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update bank account details
// @route   PUT /api/accounts/:id
exports.updateAccount = async (req, res) => {
  try {
    const { accountName, accountNumber, arn, category } = req.body;
    
    const account = await Account.findByIdAndUpdate(
      req.params.id, 
      { 
        name: accountName, 
        accountNumber: accountNumber,
        arn: arn,        // Added ARN support
        category: category 
      }, 
      { new: true, runValidators: true }
    );
    
    if (!account) return res.status(404).json({ success: false, error: "Account not found" });
    
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete bank account
// @route   DELETE /api/accounts/:id
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ success: false, error: "Account not found" });
    
    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Snapshot Logic (No changes needed, but ensuring it populates ARN) ---

exports.getHistory = async (req, res) => {
  try {
    const history = await BalanceSnapshot.find()
      .populate('balances.accountId', 'name category arn') // Added 'arn' to population
      .sort({ date: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Snapshot Logic ---

exports.saveSnapshot = async (req, res) => {
  try {
    const { date, balances, note } = req.body;
    const totalBalance = balances.reduce((sum, item) => sum + Number(item.amount), 0);
    
    const snapshot = await BalanceSnapshot.create({
      date: date || new Date(),
      balances,
      totalBalance,
      note
    });

    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, balances, note } = req.body;
    const totalBalance = balances.reduce((sum, item) => sum + Number(item.amount), 0);

    const updatedSnapshot = await BalanceSnapshot.findByIdAndUpdate(
      id,
      { date, balances, totalBalance, note },
      { new: true, runValidators: true }
    );

    if (!updatedSnapshot) return res.status(404).json({ success: false, error: "Snapshot not found" });

    res.json({ success: true, data: updatedSnapshot });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

