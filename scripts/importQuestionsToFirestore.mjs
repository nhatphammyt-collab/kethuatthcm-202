// Script to import questions from questions.json to Firestore
// Run with: node scripts/importQuestionsToFirestore.mjs
// Note: Make sure Firebase is configured and you have write access

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config (same as src/config/firebase.ts)
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

// Read questions.json
const questionsPath = path.join(__dirname, '..', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log(`📚 Bắt đầu import ${questions.length} câu hỏi vào Firestore...\n`);

async function importQuestions() {
  const questionsRef = collection(db, 'questions');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    try {
      await addDoc(questionsRef, {
        ...question,
        createdAt: serverTimestamp(),
      });
      successCount++;
      console.log(`✅ [${i + 1}/${questions.length}] Đã import: "${question.question.substring(0, 50)}..."`);
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${questions.length}] Lỗi:`, error.message);
    }
  }

  console.log(`\n📊 Kết quả:`);
  console.log(`✅ Thành công: ${successCount}`);
  console.log(`❌ Lỗi: ${errorCount}`);
  console.log(`\n🎉 Hoàn thành!`);
}

// Run import
importQuestions()
  .then(() => {
    console.log('\n✨ Import hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Lỗi khi import:', error);
    process.exit(1);
  });

