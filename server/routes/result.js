const express = require('express');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// @route   POST /api/results/submit
// @desc    Submit exam answers & calculate score
// @access  Private
router.post('/submit', authMiddleware, validate(schemas.resultSubmit), async (req, res) => {
  const { examId, answers } = req.body;

  try {
    // 1. Fetch the exam and verify it exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check if student has already submitted this exam
    const existingResult = await Result.findOne({ userId: req.user.id, examId });
    if (existingResult) {
      return sendError(res, 'You have already submitted this exam once.', 400);
    }

    // 2. Fetch all questions for this exam to perform server-side grading
    const questions = await Question.find({ examId });
    if (questions.length === 0) {
      return sendError(res, 'This exam has no questions', 400);
    }

    let score = 0;
    let totalMarks = 0;
    const finalAnswers = [];

    // Map questions for quick lookup
    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q._id.toString(), q));

    // 3. Process answers
    answers.forEach(submittedAns => {
      const question = questionMap.get(submittedAns.questionId);
      if (question) {
        totalMarks += question.marks;
        const isCorrect = submittedAns.selectedOption !== null && submittedAns.selectedOption === question.correctAnswer;
        
        if (isCorrect) {
          score += question.marks;
        }

        finalAnswers.push({
          questionId: question._id,
          selectedOption: submittedAns.selectedOption
        });
      }
    });

    // Capture any questions that were completely missed/skipped
    questions.forEach(q => {
      const wasSubmitted = answers.some(ans => ans.questionId === q._id.toString());
      if (!wasSubmitted) {
        totalMarks += q.marks;
        finalAnswers.push({
          questionId: q._id,
          selectedOption: null
        });
      }
    });

    // 4. Calculate pass status (50% threshold)
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passed = percentage >= 50;

    // 5. Save the result
    const result = new Result({
      userId: req.user.id,
      examId,
      answers: finalAnswers,
      score,
      totalMarks,
      passed
    });

    await result.save();
    return sendSuccess(res, 'Exam submitted successfully', result, 201);
  } catch (err) {
    return sendError(res, 'Server error during submission.', 500);
  }
});

// @route   GET /api/results/my
// @desc    Get current student's results history
// @access  Private
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .populate('examId', 'title duration')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, 'Results history retrieved', results);
  } catch (err) {
    return sendError(res, 'Server error retrieving history.', 500);
  }
});

// @route   GET /api/results/:id
// @desc    Get detailed review for a specific result
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('examId', 'title duration');

    if (!result) {
      return sendError(res, 'Result not found', 404);
    }

    // Role Guard: Student can only view their own result
    if (req.user.role === 'student' && result.userId._id.toString() !== req.user.id) {
      return sendError(res, 'You are not authorized to view this result', 403);
    }

    // Fetch the questions so we can bundle them in the review response
    const questions = await Question.find({ examId: result.examId._id }).sort({ createdAt: 1 });

    // Bundle questions with selected options
    const answersReview = result.answers.map(ans => {
      const question = questions.find(q => q._id.toString() === ans.questionId.toString());
      return {
        questionId: ans.questionId,
        questionText: question ? question.questionText : 'Question deleted',
        options: question ? question.options : [],
        correctAnswer: question ? question.correctAnswer : null,
        selectedOption: ans.selectedOption,
        marks: question ? question.marks : 0,
        isCorrect: question ? (ans.selectedOption !== null && ans.selectedOption === question.correctAnswer) : false
      };
    });

    return sendSuccess(res, 'Result review details retrieved', {
      result: {
        id: result._id,
        examTitle: result.examId.title,
        studentName: result.userId.name,
        score: result.score,
        totalMarks: result.totalMarks,
        passed: result.passed,
        submittedAt: result.submittedAt
      },
      answersReview
    });
  } catch (err) {
    return sendError(res, 'Server error retrieving result details.', 500);
  }
});

// @route   GET /api/results/exam/:examId
// @desc    Get all results for a specific exam (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.get('/exam/:examId', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check ownership if teacher
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You do not have permission to view results for this exam', 403);
    }

    const results = await Result.find({ examId: req.params.examId })
      .populate('userId', 'name email')
      .sort({ score: -1 });

    return sendSuccess(res, `Results for ${exam.title} retrieved`, results);
  } catch (err) {
    return sendError(res, 'Server error retrieving exam results.', 500);
  }
});

// @route   GET /api/results/all
// @desc    Get all results in system (Admin only)
// @access  Private/Admin
router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const results = await Result.find()
      .populate('userId', 'name email')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, 'All system results retrieved', results);
  } catch (err) {
    return sendError(res, 'Server error retrieving results.', 500);
  }
});

module.exports = router;
