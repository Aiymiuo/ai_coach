import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDC8Zv2zPsdl81ghkJGlwQBI08F9gDxbGQ",
  authDomain: "ai-coach---startups.firebaseapp.com",
  projectId: "ai-coach---startups",
  storageBucket: "ai-coach---startups.firebasestorage.app",
  messagingSenderId: "735256710905",
  appId: "1:735256710905:web:59929833d7d366ffb25c28",
  measurementId: "G-3X6MNKEWFH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Can remove if not using Analytics
const db = getFirestore(app);
const auth = getAuth(app);

// Recommended additional configuration
import { enableIndexedDbPersistence } from "firebase/firestore"; 

// Enable offline persistence (optional but recommended for chat)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log("Offline persistence can only be enabled in one tab at a time.");
  } else if (err.code == 'unimplemented') {
    console.log("The current browser doesn't support offline persistence.");
  }
});

export { app, db, auth };