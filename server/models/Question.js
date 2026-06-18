const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function(val) {
          return val.length >= 2; // At least 2 options required
        },
        message: 'A question must have at least 2 options.'
      }
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: 0
    },
    marks: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
