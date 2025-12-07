import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKp0rcWiLyd60YFcrY0yt0DDJBoHdq_uo",
  authDomain: "hcm202-b1d7f.firebaseapp.com",
  projectId: "hcm202-b1d7f",
  storageBucket: "hcm202-b1d7f.firebasestorage.app",
  messagingSenderId: "330529122338",
  appId: "1:330529122338:web:dbba1fa52a0fe54ef3c27b",
  measurementId: "G-6MW53BF9Z9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
