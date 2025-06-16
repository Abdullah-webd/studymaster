import express from 'express';
import Question from '../models/Question.js';
import CBTResult from '../models/CBTResult.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { WaecQuestion } from '../models/WaecQuestion.js';

const router = express.Router();

// Get random CBT questions
router.get('/questions/:examType/:subject', protect, async (req, res) => {
  try {
    const { examType, subject } = req.params;

    // Get 50 random objective questions
    const objectives = await WaecQuestion.aggregate([
      { $match: { examType, subject, questionType: 'objective' } },
      { $sample: { size: 50 } }
    ]);

    // Get 7 random theory questions
    const theories = await WaecQuestion.aggregate([
      { $match: { examType, subject, questionType: 'theory' } },
      { $sample: { size: 7 } }
    ]);

    console.log(`Fetched ${objectives.length} objective and ${theories.length} theory questions for ${examType} - ${subject}`);

    res.json({
  objectives: objectives.slice(38, 40), // return exactly 10 objective questions
  theories,
  totalQuestions: 10 + theories.length
});

  } catch (error) {
    console.error('Get CBT questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit CBT result
router.post('/submit', protect, async (req, res) => {
  try {
    const { examType, subject, answers, timeTaken } = req.body;

    // Calculate score
    let correctAnswers = 0;
    const processedQuestions = [];
    console.log(examType, subject, answers, timeTaken);

    // In your loop:
for (const answer of answers) {
  const question = await WaecQuestion.findById(answer.questionId);
  if (question && question.questionType === 'objective') { // ✅ FIXED HERE
    const isCorrect = question.answer.trim().toLowerCase() === answer.userAnswer.trim().toLowerCase(); // ✅ FIXED HERE
    if (isCorrect) correctAnswers++;

    processedQuestions.push({
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      isCorrect,
      timeSpent: answer.timeSpent || 0
    });
  } else {
    processedQuestions.push({
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      isCorrect: null,
      timeSpent: answer.timeSpent || 0
    });
  }
}


    const objectiveQuestions = processedQuestions.filter(q => q.isCorrect !== null);
    const theoryQuestions = processedQuestions.filter(q => q.isCorrect === null);
    
    const objectivePercentage = objectiveQuestions.length > 0 ? 
      (correctAnswers / objectiveQuestions.length) * 100 : 0;

    // Determine grade
    let grade = 'F';
    if (objectivePercentage >= 90) grade = 'A+';
    else if (objectivePercentage >= 80) grade = 'A';
    else if (objectivePercentage >= 70) grade = 'B';
    else if (objectivePercentage >= 60) grade = 'C';
    else if (objectivePercentage >= 50) grade = 'D';

    // Save result
    const result = await CBTResult.create({
      user: req.user.id,
      examType,
      subject,
      questions: processedQuestions,
      score: {
        objectives: {
          total: objectiveQuestions.length,
          correct: correctAnswers,
          percentage: objectivePercentage
        },
        theory: {
          total: theoryQuestions.length,
          answered: theoryQuestions.filter(q => q.userAnswer).length
        },
        overall: {
          percentage: objectivePercentage,
          grade
        }
      },
      timeTaken
    });

    // Update user performance
    await updateUserPerformance(req.user.id, subject, objectivePercentage);

    res.json({
      message: 'CBT submitted successfully',
      result: {
        score: result.score,
        grade,
        timeTaken,
        resultId: result._id
      }
    });

  } catch (error) {
    console.error('Submit CBT error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get CBT results
router.get('/results', protect, async (req, res) => {
  try {
    const results = await CBTResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(results);

  } catch (error) {
    console.error('Get CBT results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user performance
async function updateUserPerformance(userId, subject, score) {
  try {
    const user = await User.findById(userId);
    const results = await CBTResult.find({ user: userId });

    if (results.length === 0) return;

    // Calculate average score
    const totalTests = results.length;
    const averageScore = results.reduce((sum, result) => 
      sum + result.score.overall.percentage, 0) / totalTests;

    // Identify weak and strong subjects
    const subjectScores = {};
    results.forEach(result => {
      if (!subjectScores[result.subject]) {
        subjectScores[result.subject] = [];
      }
      subjectScores[result.subject].push(result.score.overall.percentage);
    });

    const weakSubjects = [];
    const strongSubjects = [];

    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avgScore < 60) {
        weakSubjects.push(subject);
      } else if (avgScore >= 80) {
        strongSubjects.push(subject);
      }
    });

    // Update user performance
    user.performance = {
      totalTests,
      averageScore,
      weakSubjects,
      strongSubjects
    };

    await user.save();

  } catch (error) {
    console.error('Update performance error:', error);
  }
}

export default router;