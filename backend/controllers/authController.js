const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require("firebase-admin");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

// Helper to generate the JWT Token for successful logins
const generateTokenAndPayload = (user) => {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { 
      _id: user._id,
      name: user.name, 
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false,
      allowedApps: user.allowedApps || [],
      credentials: user.credentials || []
    }
  };
};

// =========================================================
// STANDARD AUTHENTICATION
// =========================================================

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ error: "Access Denied: Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Access Denied: Invalid Credentials" });
    }

    const payload = generateTokenAndPayload(user);
    res.status(200).json(payload);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal System Handshake Error" });
  }
};

exports.getFirebaseToken = async (req, res) => {
  try {
    const uid = req.user.id.toString(); 

    const additionalClaims = {
      isAdmin: req.user.isAdmin || false,
      premiumUser: true,
    };

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

    res.json({ token: customToken });
  } catch (error) {
    console.error("Firebase Admin Error:", error);
    res.status(500).json({ message: "Failed to generate security token" });
  }
};

// =========================================================
// WEBAUTHN / BIOMETRIC SETUP (Pairing a Device)
// =========================================================

// @route   POST /api/auth/webauthn/register-options
// @desc    Generate the challenge for a logged-in user to register their phone fingerprint
exports.generateRegistrationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const options = await generateRegistrationOptions({
      rpName: 'Dalal Investment App',
      rpID: process.env.RP_ID || 'di-node-nh0x.onrender.com',
      userID: Buffer.from(user._id.toString()),
      userName: user.username,
      // Exclude already registered devices
      excludeCredentials: user.credentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.status(200).json(options);
  } catch (error) {
    console.error("Generate Reg Options Error:", error);
    res.status(500).json({ error: "Failed to generate registration options" });
  }
};

// @route   POST /api/auth/webauthn/register-verify
// @desc    Verify the public key signature and save the device to MongoDB
exports.verifyRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const expectedChallenge = user.currentChallenge;
    const body = req.body; 

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: process.env.FRONTEND_URL || 'https://di-node-nh0x.onrender.com',
        expectedRPID: process.env.RP_ID || 'di-node-nh0x.onrender.com',
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    if (verification.verified) {
      // FIX 1: Access `credential` object nested under registrationInfo (v13 Standard)
      const { credential } = verification.registrationInfo;
      
      user.credentials.push({
        credentialID: credential.id, // v13 provides this safely as a base64url string
        credentialPublicKey: Buffer.from(credential.publicKey), // Extract raw Uint8Array and convert to Buffer for Mongoose
        counter: credential.counter,
        transports: credential.transports || body.response?.transports || []
      });

      user.currentChallenge = null;
      await user.save();

      return res.status(200).json({ verified: true, message: "Device successfully paired!" });
    }
    
    res.status(400).json({ error: "Verification failed" });
  } catch (error) {
    console.error("Verify Reg Error:", error);
    res.status(500).json({ error: "Internal server error during verification" });
  }
};

// =========================================================
// WEBAUTHN / BIOMETRIC LOGIN (Using a Paired Device)
// =========================================================

// @route   POST /api/auth/webauthn/login-options
// @desc    User enters username -> we give them a challenge to sign with their fingerprint
exports.generateAuthOptions = async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) return res.status(400).json({ error: "Username required" });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.credentials || user.credentials.length === 0) {
      return res.status(400).json({ error: "No biometric devices registered for this user." });
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || 'di-node-nh0x.onrender.com',
      allowCredentials: user.credentials.map(cred => ({
        id: cred.credentialID, // Already mapped as base64url string
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.status(200).json(options);
  } catch (error) {
    console.error("Generate Auth Options Error:", error);
    res.status(500).json({ error: "Failed to generate authentication options" });
  }
};

// @route   POST /api/auth/webauthn/login-verify
// @desc    Verify the fingerprint signature. If valid, log them in like normal!
exports.verifyAuth = async (req, res) => {
  try {
    const { username, response } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const expectedChallenge = user.currentChallenge;
    const authenticator = user.credentials.find(c => c.credentialID === response.id);

    if (!authenticator) {
      return res.status(400).json({ error: "Authenticator is not registered with this account." });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: process.env.FRONTEND_URL || 'https://di-node-nh0x.onrender.com',
        expectedRPID: process.env.RP_ID || 'di-node-nh0x.onrender.com',
        // FIX 2: v13 standardizes "authenticator" input parameter to "credential"
        credential: {
          id: authenticator.credentialID, 
          publicKey: new Uint8Array(authenticator.credentialPublicKey), // Back to Uint8Array for the library
          counter: authenticator.counter,
          transports: authenticator.transports,
        }
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    if (verification.verified) {
      authenticator.counter = verification.authenticationInfo.newCounter;
      user.currentChallenge = null;
      await user.save();

      const payload = generateTokenAndPayload(user);
      return res.status(200).json(payload);
    }

    res.status(400).json({ error: "Biometric verification failed" });
  } catch (error) {
    console.error("Verify Auth Error:", error);
    res.status(500).json({ error: "Internal server error during biometric login" });
  }
};