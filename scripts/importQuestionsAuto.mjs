// Script tự động import questions vào Firestore sử dụng Firebase Admin SDK
// Run with: node scripts/importQuestionsAuto.mjs

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Admin credentials
const serviceAccountPath = path.join(__dirname, '..', 'firebaseadmin.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Read questions.json
const questionsPath = path.join(__dirname, '..', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log(`📚 Bắt đầu import ${questions.length} câu hỏi vào Firestore...\n`);

async function importQuestions() {
  const questionsRef = db.collection('questions');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    try {
      await questionsRef.add({
        ...question,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
  
  if (successCount > 0) {
    console.log(`\n🎉 Đã import ${successCount} câu hỏi vào Firestore thành công!`);
  }
  
  if (errorCount > 0) {
    console.log(`\n⚠️ Có ${errorCount} câu hỏi bị lỗi. Vui lòng kiểm tra lại.`);
  }
}

// Run import
importQuestions()
  .then(() => {
    console.log('\n✨ Hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Lỗi khi import:', error);
    process.exit(1);
  });

