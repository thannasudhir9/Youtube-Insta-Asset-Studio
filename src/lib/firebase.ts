import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0284442464",
  appId: "1:755661219748:web:6ac6fa7744b790d6bc8331",
  apiKey: "AIzaSyCh7EJSPu27W4F1-EnS3pb1p12yNX1bVJc",
  authDomain: "gen-lang-client-0284442464.firebaseapp.com",
  storageBucket: "gen-lang-client-0284442464.firebasestorage.app",
  messagingSenderId: "755661219748"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add Google Drive scopes for Workspace Integration
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;

export const getAccessToken = () => cachedAccessToken;
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Authentication helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
