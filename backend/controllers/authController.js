const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require("firebase-admin");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ error: "Access Denied: Invalid Distributor Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Access Denied: Invalid Distributor Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { 
        name: user.name, 
        username: user.username,
        email: user.email 
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal System Handshake Error" });
  }
};


// @desc    Generate a Firebase Custom Token for Storage Access
// @route   GET /api/auth/firebase-token
exports.getFirebaseToken = async (req, res) => {
  try {
    // This is the UID you hardcoded in your Firebase Storage Rules
    const uid = "QuG96wUfsLa9X9Cyx6HzFssCfQr1";

    // Optional: You can add custom claims if you want to use them in Rules later
    const additionalClaims = {
      premiumUser: true,
    };

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

    res.json({ token: customToken });
  } catch (error) {
    console.error("Firebase Admin Error:", error);
    res.status(500).json({ message: "Failed to generate security token" });
  }
};