// Firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
