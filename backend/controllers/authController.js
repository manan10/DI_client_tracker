const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require("firebase-admin");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Normalize username to match how it's stored
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ error: "Access Denied: Invalid Credentials" });
    }

    // Use the method from our User model or bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Access Denied: Invalid Credentials" });
    }

    // Generate JWT
    // UPDATED: Include isAdmin in the token payload for server-side middleware checks
    const token = jwt.sign(
      { 
        id: user._id, 
        isAdmin: user.isAdmin // Added to JWT payload
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return the user object
    res.status(200).json({
      token,
      user: { 
        _id: user._id,
        name: user.name, 
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false, // CRITICAL: Frontend needs this to show/hide admin menus
        allowedApps: user.allowedApps || []
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
    // UPDATED: Use the actual MongoDB User ID instead of a hardcoded string
    // This ensures Firebase audit logs match your app's user IDs
    const uid = req.user.id.toString(); 

    const additionalClaims = {
      isAdmin: req.user.isAdmin || false, // Pass admin status to Firebase Storage/DB rules
      premiumUser: true,
    };

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

    res.json({ token: customToken });
  } catch (error) {
    console.error("Firebase Admin Error:", error);
    res.status(500).json({ message: "Failed to generate security token" });
  }
};