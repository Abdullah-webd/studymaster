import mongoose from 'mongoose';
import Question from '../models/Question.js';
import connectDB from '../config/database.js';

// Sample questions data
const sampleQuestions = [
  // WAEC Mathematics
  {
    examType: 'WAEC',
    subject: 'Mathematics',
    year: 2023,
    type: 'objective',
    question: 'If 3x - 2 = 10, find the value of x.',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    difficulty: 'easy'
  },
  {
    examType: 'WAEC',
    subject: 'Mathematics',
    year: 2023,
    type: 'objective',
    question: 'What is the area of a circle with radius 7cm? (Take π = 22/7)',
    options: ['154 cm²', '144 cm²', '164 cm²', '174 cm²'],
    correctAnswer: '154 cm²',
    difficulty: 'medium'
  },
  {
    examType: 'WAEC',
    subject: 'Mathematics',
    year: 2023,
    type: 'theory',
    question: 'A bag contains 5 red balls, 3 blue balls, and 2 green balls. If a ball is drawn at random, find the probability that it is: (a) red (b) not green',
    points: 10,
    difficulty: 'medium'
  },
  
  // WAEC English
  {
    examType: 'WAEC',
    subject: 'English Language',
    year: 2023,
    type: 'objective',
    question: 'Choose the word opposite in meaning to "generous".',
    options: ['kind', 'stingy', 'helpful', 'caring'],
    correctAnswer: 'stingy',
    difficulty: 'easy'
  },
  {
    examType: 'WAEC',
    subject: 'English Language',
    year: 2023,
    type: 'objective',
    question: 'The plural form of "child" is:',
    options: ['childs', 'children', 'childrens', 'child'],
    correctAnswer: 'children',
    difficulty: 'easy'
  }
];

// Generate more questions programmatically
const generateMoreQuestions = () => {
  const subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];
  const examTypes = ['WAEC', 'NECO', 'JAMB'];
  const years = [2020, 2021, 2022, 2023, 2024];
  const difficulties = ['easy', 'medium', 'hard'];

  const questions = [];

  examTypes.forEach(examType => {
    subjects.forEach(subject => {
      years.forEach(year => {
        // Generate 60 objective questions per subject/exam/year
        for (let i = 1; i <= 60; i++) {
          questions.push({
            examType,
            subject,
            year,
            type: 'objective',
            question: `${subject} ${examType} ${year} objective question ${i}. Sample question content for testing purposes.`,
            options: [`Option A for Q${i}`, `Option B for Q${i}`, `Option C for Q${i}`, `Option D for Q${i}`],
            correctAnswer: `Option ${['A', 'B', 'C', 'D'][i % 4]} for Q${i}`,
            difficulty: difficulties[i % 3]
          });
        }

        // Generate 10 theory questions per subject/exam/year
        for (let i = 1; i <= 10; i++) {
          questions.push({
            examType,
            subject,
            year,
            type: 'theory',
            question: `${subject} ${examType} ${year} theory question ${i}. Explain the concept with detailed examples and provide comprehensive analysis.`,
            points: Math.floor(Math.random() * 10) + 5,
            difficulty: difficulties[i % 3]
          });
        }
      });
    });
  });

  return questions;
};

// Seed function
const seedQuestions = async () => {
  try {
    await connectDB();
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    await Question.insertMany(sampleQuestions);
    console.log('Inserted sample questions');

    // Generate and insert more questions
    const moreQuestions = generateMoreQuestions();
    
    // Insert in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < moreQuestions.length; i += batchSize) {
      const batch = moreQuestions.slice(i, i + batchSize);
      await Question.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(moreQuestions.length / batchSize)}`);
    }

    console.log(`✅ Successfully seeded ${sampleQuestions.length + moreQuestions.length} questions`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedQuestions();
}

export default seedQuestions;