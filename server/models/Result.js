const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true
        },
        selectedOption: {
          type: Number, // Option index selected by student, or null if skipped
          default: null
        }
      }
    ],
    score: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Result', resultSchema);
