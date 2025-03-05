// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOn94tMlz6MvZaBbLMPiQfbfP1Saqwfk4",
  authDomain: "history-guess-game.firebaseapp.com",
  projectId: "history-guess-game",
  storageBucket: "history-guess-game.firebasestorage.app",
  messagingSenderId: "120929218418",
  appId: "1:120929218418:web:c88222068255b9934577eb",
  measurementId: "G-B5B8XT4CLR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
