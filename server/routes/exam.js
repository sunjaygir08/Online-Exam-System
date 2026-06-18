const express = require('express');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// --- EXAM CRUD ---

// @route   POST /api/exams
// @desc    Create a new exam (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.post('/', authMiddleware, roleMiddleware(['teacher', 'admin']), validate(schemas.exam), async (req, res) => {
  const { title, duration, scheduledAt, assignedTo } = req.body;

  try {
    const exam = new Exam({
      title,
      duration,
      scheduledAt,
      assignedTo: assignedTo || [],
      createdBy: req.user.id
    });

    await exam.save();
    return sendSuccess(res, 'Exam created successfully', exam, 201);
  } catch (err) {
    return sendError(res, 'Server error creating exam.', 500);
  }
});

// @route   GET /api/exams
// @desc    Get exams list based on user role
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    
    // Filter exams by role
    if (req.user.role === 'teacher') {
      // Teachers only see their own created exams
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students see exams that are either assigned to them specifically OR open to all (assignedTo is empty)
      // and they have not yet attempted or can see all upcoming
      query.$or = [
        { assignedTo: { $exists: true, $size: 0 } },
        { assignedTo: req.user.id }
      ];
    }
    // Admins see all exams (query stays empty)

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ scheduledAt: -1 });

    // For students, add "attempted" flag by looking at their results
    if (req.user.role === 'student') {
      const studentResults = await Result.find({ userId: req.user.id }).select('examId score passed');
      const attemptedExamIds = studentResults.map(r => r.examId.toString());

      const enrichedExams = exams.map(exam => {
        const attempted = attemptedExamIds.includes(exam._id.toString());
        const result = attempted ? studentResults.find(r => r.examId.toString() === exam._id.toString()) : null;
        
        return {
          ...exam.toObject(),
          attempted,
          score: result ? result.score : null,
          passed: result ? result.passed : null
        };
      });

      return sendSuccess(res, 'Exams list retrieved', enrichedExams);
    }

    return sendSuccess(res, 'Exams list retrieved', exams);
  } catch (err) {
    return sendError(res, 'Server error fetching exams.', 500);
  }
});

// @route   GET /api/exams/:id
// @desc    Get specific exam details (Students don't get correct answers)
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check student permissions
    if (req.user.role === 'student') {
      if (exam.assignedTo.length > 0 && !exam.assignedTo.includes(req.user.id)) {
        return sendError(res, 'You are not assigned to this exam', 403);
      }
    }

    // Retrieve questions for this exam
    let questionsQuery = Question.find({ examId: exam._id });
    
    // Critically hide correctAnswer from students!
    if (req.user.role === 'student') {
      questionsQuery = questionsQuery.select('-correctAnswer');
    }

    const questions = await questionsQuery.sort({ createdAt: 1 });

    return sendSuccess(res, 'Exam details retrieved', {
      ...exam.toObject(),
      questions
    });
  } catch (err) {
    return sendError(res, 'Server error retrieving exam details.', 500);
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'admin']), validate(schemas.exam), async (req, res) => {
  const { title, duration, scheduledAt, assignedTo } = req.body;

  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check if teacher created it
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You can only edit your own exams', 403);
    }

    exam.title = title;
    exam.duration = duration;
    exam.scheduledAt = scheduledAt;
    exam.assignedTo = assignedTo || [];

    await exam.save();
    return sendSuccess(res, 'Exam updated successfully', exam);
  } catch (err) {
    return sendError(res, 'Server error updating exam.', 500);
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam & associated questions (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.delete('/:id', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check if teacher created it
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You can only delete your own exams', 403);
    }

    // Delete all associated questions
    await Question.deleteMany({ examId: exam._id });
    // Delete exam
    await Exam.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 'Exam and associated questions deleted successfully');
  } catch (err) {
    return sendError(res, 'Server error deleting exam.', 500);
  }
});

// --- QUESTION MANAGEMENT ---

// @route   POST /api/exams/:id/questions
// @desc    Add a question to an exam (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.post('/:id/questions', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  const { questionText, options, correctAnswer, marks } = req.body;

  // Manual validation logic to bundle examId with req.body for validation middleware
  req.body.examId = req.params.id;
  const { error } = schemas.question.validate(req.body);
  if (error) {
    return sendError(res, error.details[0].message, 400);
  }

  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return sendError(res, 'Exam not found', 404);
    }

    // Check ownership
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You do not have permission to modify this exam', 403);
    }

    const question = new Question({
      examId: exam._id,
      questionText,
      options,
      correctAnswer,
      marks: marks || 1
    });

    await question.save();

    // Add to exam's questions list
    exam.questions.push(question._id);
    await exam.save();

    return sendSuccess(res, 'Question added successfully', question, 201);
  } catch (err) {
    return sendError(res, 'Server error adding question.', 500);
  }
});

// @route   PUT /api/exams/questions/:questionId
// @desc    Edit a question (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.put('/questions/:questionId', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  const { questionText, options, correctAnswer, marks } = req.body;

  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    const exam = await Exam.findById(question.examId);
    if (!exam) {
      return sendError(res, 'Associated exam not found', 404);
    }

    // Check ownership
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You do not have permission to modify this question', 403);
    }

    question.questionText = questionText || question.questionText;
    question.options = options || question.options;
    question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
    question.marks = marks || question.marks;

    await question.save();
    return sendSuccess(res, 'Question updated successfully', question);
  } catch (err) {
    return sendError(res, 'Server error editing question.', 500);
  }
});

// @route   DELETE /api/exams/questions/:questionId
// @desc    Delete a question from an exam (Teacher & Admin only)
// @access  Private/Teacher/Admin
router.delete('/questions/:questionId', authMiddleware, roleMiddleware(['teacher', 'admin']), async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    const exam = await Exam.findById(question.examId);
    if (!exam) {
      return sendError(res, 'Associated exam not found', 404);
    }

    // Check ownership
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user.id) {
      return sendError(res, 'You do not have permission to delete this question', 403);
    }

    // Remove reference from Exam questions list
    exam.questions = exam.questions.filter(qId => qId.toString() !== question._id.toString());
    await exam.save();

    // Delete question
    await Question.findByIdAndDelete(req.params.questionId);

    return sendSuccess(res, 'Question deleted successfully');
  } catch (err) {
    return sendError(res, 'Server error deleting question.', 500);
  }
});

module.exports = router;
