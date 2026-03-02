const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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