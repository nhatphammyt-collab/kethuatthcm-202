// Script to import questions from questions.json to Firestore
// Run with: node scripts/importQuestionsToFirestore.js
// Note: This requires Firebase Admin SDK or you can use the Firebase Console to import manually

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read questions.json
const questionsPath = path.join(__dirname, '..', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

console.log(`Found ${questions.length} questions to import\n`);

// Output instructions for manual import
console.log('📋 HƯỚNG DẪN IMPORT VÀO FIRESTORE:');
console.log('=====================================\n');
console.log('Cách 1: Import qua Firebase Console (Khuyến nghị)');
console.log('1. Mở Firebase Console: https://console.firebase.google.com');
console.log('2. Chọn project của bạn');
console.log('3. Vào Firestore Database');
console.log('4. Tạo collection mới tên "questions" (nếu chưa có)');
console.log('5. Click "Add document" và paste từng question từ questions.json\n');

console.log('Cách 2: Sử dụng Firebase Admin SDK');
console.log('1. Cài đặt: npm install firebase-admin');
console.log('2. Tạo service account key từ Firebase Console');
console.log('3. Chạy script với Admin SDK\n');

console.log('📝 Dữ liệu questions.json đã được tạo tại:');
console.log(questionsPath);
console.log(`\nTổng số câu hỏi: ${questions.length}`);
console.log('\nVí dụ câu hỏi đầu tiên:');
console.log(JSON.stringify(questions[0], null, 2));

