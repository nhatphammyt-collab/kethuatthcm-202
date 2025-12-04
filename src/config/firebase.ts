import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey: "AIzaSyD_7weiW4VqBzyzl6yOCg3TVbVNo_0wgxY",
  authDomain: "hcm202-1eafa.firebaseapp.com",
  projectId: "hcm202-1eafa",
  storageBucket: "hcm202-1eafa.firebasestorage.app",
  messagingSenderId: "895894768594",
  appId: "1:895894768594:web:3af407fd0a3090ffc8560b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { db, supabase };