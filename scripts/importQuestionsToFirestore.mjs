// Script to import questions from questions.json to Firestore
// Run with: node scripts/importQuestionsToFirestore.mjs
// ⚡ Sử dụng Firebase Admin SDK để bypass Firestore Rules

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Admin credentials
// Tự động tìm file service account (ưu tiên file mới nhất)
const possiblePaths = [
  path.join(__dirname, '..', 'hcm202-b1d7f-firebase-adminsdk-fbsvc-2058dd403c.json'),
  path.join(__dirname, '..', 'firebaseadmin.json'),
];

let serviceAccountPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

if (!serviceAccountPath) {
  console.error('❌ Không tìm thấy file service account!');
  console.error('Vui lòng đảm bảo có file firebaseadmin.json hoặc hcm202-b1d7f-firebase-adminsdk-*.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase Admin (bypass Firestore Rules)
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

