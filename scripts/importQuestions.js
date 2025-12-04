// Script to import questions from questions.txt to Firestore
// Run with: node scripts/importQuestions.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read questions.txt file
const questionsPath = path.join(__dirname, '..', 'questions.txt');
const content = fs.readFileSync(questionsPath, 'utf-8');

// Parse questions
const questions = [];
const lines = content.split('\n').map(line => line.trim()).filter(line => line);

let currentQuestion = null;
let currentOptions = [];
let currentAnswer = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if it's a question number (starts with number and dot)
  if (/^\d+\./.test(line)) {
    // Save previous question if exists
    if (currentQuestion && currentOptions.length === 4 && currentAnswer !== null) {
      questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: currentAnswer,
        category: 'Tư tưởng Hồ Chí Minh',
        difficulty: 'medium',
      });
    }
    
    // Start new question
    currentQuestion = line.replace(/^\d+\.\s*/, '');
    currentOptions = [];
    currentAnswer = null;
  }
  // Check if it's an option (A., B., C., D.)
  else if (/^[A-D]\./.test(line)) {
    const optionText = line.replace(/^[A-D]\.\s*/, '');
    currentOptions.push(optionText);
  }
  // Check if it's the answer
  else if (line.startsWith('Đáp án:')) {
    const answerLetter = line.replace('Đáp án:', '').trim();
    currentAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  }
}

// Save last question
if (currentQuestion && currentOptions.length === 4 && currentAnswer !== null) {
  questions.push({
    question: currentQuestion,
    options: currentOptions,
    correctAnswer: currentAnswer,
    category: 'Tư tưởng Hồ Chí Minh',
    difficulty: 'medium',
  });
}

// Output JSON for manual import or use with Firebase Admin SDK
console.log(JSON.stringify(questions, null, 2));
console.log(`\nTotal questions parsed: ${questions.length}`);

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'questions.json');
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`\nQuestions saved to: ${outputPath}`);

