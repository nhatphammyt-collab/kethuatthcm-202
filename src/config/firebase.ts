// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_7weiW4VqBzyzl6yOCg3TVbVNo_0wgxY",
  authDomain: "hcm202-1eafa.firebaseapp.com",
  projectId: "hcm202-1eafa",
  storageBucket: "hcm202-1eafa.firebasestorage.app",
  messagingSenderId: "895894768594",
  appId: "1:895894768594:web:3af407fd0a3090ffc8560b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };