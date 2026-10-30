require("dotenv").config();
const path = require("path");
const fs = require("fs");

let admin = null;
let isInitialized = false;

function getFirebaseAdmin() {
  if (!admin) {
    try {
      admin = require("firebase-admin");
    } catch (e) {
      console.warn("⚠️ firebase-admin could not be loaded:", e.message);
    }
  }
  return admin;
}

// Client configuration object (for frontend or client SDK usage)
const clientFirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

/**
 * Check if Firebase Admin is configured with service account credentials
 */
function isFirebaseAdminReady() {
  if (isInitialized) return true;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return false;
  }

  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) return false;

  try {
    if (!fbAdmin.apps.length) {
      let credential = null;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        if (raw.startsWith("{")) {
          credential = fbAdmin.credential.cert(JSON.parse(raw));
        } else if (fs.existsSync(raw)) {
          credential = fbAdmin.credential.cert(require(path.resolve(raw)));
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        credential = fbAdmin.credential.applicationDefault();
      }

      if (credential) {
        fbAdmin.initializeApp({
          credential,
          projectId: process.env.FIREBASE_PROJECT_ID || "oohwheels",
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        isInitialized = true;
        console.log("🔥 Firebase Admin initialized successfully with credentials for project:", process.env.FIREBASE_PROJECT_ID || "oohwheels");
      }
    } else {
      isInitialized = true;
    }
  } catch (error) {
    console.warn("⚠️ Firebase Admin initialization warning:", error.message);
  }

  return isInitialized;
}

/**
 * Verify a Firebase ID Token sent from the frontend client.
 * @param {string} idToken - Raw JWT token from client
 * @returns {Promise<any>} Decoded user info
 */
async function verifyFirebaseToken(idToken) {
  if (!isFirebaseAdminReady()) {
    throw new Error("Firebase Admin is not configured with service account credentials.");
  }
  const fbAdmin = getFirebaseAdmin();
  return fbAdmin.auth().verifyIdToken(idToken);
}

module.exports = {
  getFirebaseAdmin,
  clientFirebaseConfig,
  isFirebaseAdminReady,
  verifyFirebaseToken,
};
