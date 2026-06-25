const Joi = require('joi');
const { sendError } = require('../utils/responseHandler');

/**
 * Higher-order middleware to validate req.body against a Joi schema.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const errorDetails = error.details.reduce((acc, current) => {
        acc[current.path[0]] = current.message;
        return acc;
      }, {});
      return sendError(res, 'Validation error', 400, errorDetails);
    }

    next();
  };
};

// --- JOI SCHEMAS ---

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email cannot be empty',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('student', 'teacher', 'admin').default('student')
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const examSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Title cannot be empty',
    'any.required': 'Title is required'
  }),
  duration: Joi.number().integer().min(1).max(300).required().messages({
    'number.min': 'Duration must be at least 1 minute',
    'any.required': 'Duration is required'
  }),
  scheduledAt: Joi.date().iso().default(Date.now),
  assignedTo: Joi.array().items(Joi.string()).optional()
});

const questionSchema = Joi.object({
  examId: Joi.string().required().messages({
    'any.required': 'Exam ID is required'
  }),
  questionText: Joi.string().trim().required().messages({
    'string.empty': 'Question text cannot be empty',
    'any.required': 'Question text is required'
  }),
  options: Joi.array().items(Joi.string().trim().required()).min(2).max(10).required().messages({
    'array.min': 'A question must have at least 2 options',
    'any.required': 'Options are required'
  }),
  correctAnswer: Joi.number().integer().min(0).required().messages({
    'number.min': 'Correct option index must be non-negative',
    'any.required': 'Correct answer index is required'
  }),
  marks: Joi.number().integer().min(1).default(1)
});

const resultSubmitSchema = Joi.object({
  examId: Joi.string().required().messages({
    'any.required': 'Exam ID is required'
  }),
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      selectedOption: Joi.number().integer().min(0).max(10).allow(null).required()
    })
  ).required()
});

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    exam: examSchema,
    question: questionSchema,
    resultSubmit: resultSubmitSchema
  }
};
