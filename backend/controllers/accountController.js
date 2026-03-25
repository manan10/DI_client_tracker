const { Account, BalanceSnapshot } = require('../models/Account');

// @desc    Get all active bank accounts
// @route   GET /api/accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ isActive: true });
    // Wrap in data object to match your frontend useApi hook expectations
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// @desc    Add a new bank account
// @route   POST /api/accounts
exports.addAccount = async (req, res) => {
  try {
    // We take 'accountName' from the UI and save it as 'name' in DB
    const { accountName, accountNumber } = req.body;
    const newAccount = await Account.create({
      name: accountName,
      accountNumber: accountNumber
    });
    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update bank account details (Name/Number)
// @route   PUT /api/accounts/:id
exports.updateAccount = async (req, res) => {
  try {
    const { accountName, accountNumber } = req.body;
    const account = await Account.findByIdAndUpdate(
      req.params.id, 
      { name: accountName, accountNumber: accountNumber }, 
      { new: true }
    );
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

exports.getHistory = async (req, res) => {
  try {
    const history = await BalanceSnapshot.find()
      .populate('balances.accountId', 'name category')
      .sort({ date: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};