import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, updateDoc, query, where, orderBy, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxItk9ysbTZ8R5WuM4ZD75ZqYe1Vur51g",
  authDomain: "ranosha-store.firebaseapp.com",
  projectId: "ranosha-store",
  storageBucket: "ranosha-store.firebasestorage.app",
  messagingSenderId: "47543065801",
  appId: "1:47543065801:web:e64f2cfadd1152d0ea0118"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const RANOSHA_STATS = "RANOSHA_STATS";
export const RANOSHA_USERS = "RANOSHA_USERS";

export { db, auth, collection, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, updateDoc, query, where, orderBy, increment, serverTimestamp, signInWithEmailAndPassword, signOut, onAuthStateChanged };
