const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

const seedDatabase = async () => {
  console.log('Clearing old records for seeding...');
  await User.deleteMany({});
  await Exam.deleteMany({});
  await Question.deleteMany({});
  await Result.deleteMany({});

  console.log('Creating default users...');

  // 1. Create Admin
  const admin = new User({
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  });
  await admin.save();

  // 2. Create Teacher
  const teacher = new User({
    name: 'Professor Smith',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher'
  });
  await teacher.save();

  // 3. Create Student
  const student = new User({
    name: 'John Doe',
    email: 'student@example.com',
    password: 'password123',
    role: 'student'
  });
  await student.save();

  console.log('Users created successfully:');
  console.log('  Admin  : admin@example.com / password123');
  console.log('  Teacher: teacher@example.com / password123');
  console.log('  Student: student@example.com / password123');

  console.log('Creating mock exam...');

  // 4. Create Exam
  const exam = new Exam({
    title: 'General JavaScript Trivia',
    duration: 10, // 10 minutes
    createdBy: teacher._id,
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
  });
  await exam.save();

  // 5. Create Questions
  const q1 = new Question({
    examId: exam._id,
    questionText: 'Which keyword is used to declare a block-scoped local variable in JavaScript?',
    options: ['var', 'let', 'const', 'define'],
    correctAnswer: 1, // 'let'
    marks: 2
  });
  await q1.save();

  const q2 = new Question({
    examId: exam._id,
    questionText: 'Which of the following is NOT a primitive data type in JavaScript?',
    options: ['String', 'Number', 'Boolean', 'Object'],
    correctAnswer: 3, // 'Object'
    marks: 2
  });
  await q2.save();

  const q3 = new Question({
    examId: exam._id,
    questionText: 'What is the output of: console.log(typeof null);',
    options: ['"null"', '"undefined"', '"object"', '"string"'],
    correctAnswer: 2, // '"object"'
    marks: 2
  });
  await q3.save();

  const q4 = new Question({
    examId: exam._id,
    questionText: 'Which method is used to add one or more elements to the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 0, // 'push()'
    marks: 2
  });
  await q4.save();

  // Link questions to the exam
  exam.questions = [q1._id, q2._id, q3._id, q4._id];
  await exam.save();

  console.log('Mock Exam and 4 questions created successfully.');
};

module.exports = seedDatabase;
