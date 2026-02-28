import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCi9eoGpQSYdFD2xPCfyMwdPkbubi7yEpw",
  authDomain: "project1-9fd86.firebaseapp.com",
  databaseURL: "https://project1-9fd86-default-rtdb.firebaseio.com",
  projectId: "project1-9fd86",
  storageBucket: "project1-9fd86.firebasestorage.app",
  messagingSenderId: "174567723508",
  appId: "1:174567723508:web:dfb53e4404b0719b4f69a1",
  measurementId: "G-LP768Y71C0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const fs = getFirestore(app); // Keep for backwards compatibility if needed
export const db = getDatabase(app); // Realtime Database
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
