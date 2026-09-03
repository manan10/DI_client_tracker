const admin = require("firebase-admin");

const initializeFirebase = () => {
  try {
    const firebaseConfig = process.env.FIREBASE_CONFIG_JSON;

    if (!firebaseConfig) {
      throw new Error("FIREBASE_CONFIG_JSON is missing from environment variables.");
    }

    const serviceAccount = JSON.parse(firebaseConfig);

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log("✅ Firebase: Initialized via Environment Variable");
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
  }
};

module.exports = initializeFirebase;