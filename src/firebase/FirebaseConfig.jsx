import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjJihuByYxwEQvXuI5FKuonTEx3varwK8",
  authDomain: "onlinemart-fe1dc.firebaseapp.com",
  projectId: "onlinemart-fe1dc",
  storageBucket: "onlinemart-fe1dc.firebasestorage.app",
  messagingSenderId: "905673672942",
  appId: "1:905673672942:web:ee14022ec72360b8260bff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);
const auth = getAuth(app)
export {fireDB, auth};