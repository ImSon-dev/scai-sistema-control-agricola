import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhCfYDryogpES20IuB_ZCSYASb9axHXHE",
  authDomain: "scai-57b5d.firebaseapp.com",
  projectId: "scai-57b5d",
  storageBucket: "scai-57b5d.firebasestorage.app",
  messagingSenderId: "998414668434",
  appId: "1:998414668434:web:38e9b1a1ff1d4e7f90cc4b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);