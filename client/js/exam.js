/**
 * EXAM.JS
 * Exam taking controller. Shuffles questions, manages question selection, option bindings,
 * renders the side status grid (palette), and handles final submission callbacks.
 */

// Global State
let examData = null;
let questions = [];
let currentQuestionIndex = 0;
let studentAnswers = []; // Format: [{ questionId, selectedOption }]

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth - Student role allowed
  const user = await checkAuthGuard(['student']);
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('id');

  if (!examId) {
    toast.error('Invalid Exam Access. Redirecting...');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 1500);
    return;
  }

  await loadExam(examId);
});

/**
 * Fetch exam details and questions from API
 */
async function loadExam(examId) {
  try {
    const response = await api.get(`/exams/${examId}`);
    examData = response.data;
    questions = examData.questions;

    if (examData.attempted) {
      toast.warning('You have already attempted this exam.');
      setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 2000);
      return;
    }

    if (questions.length === 0) {
      toast.error('This exam has no questions compiled.');
      setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 2000);
      return;
    }

    // Question Shuffling (Randomization to prevent cheating)
    shuffleArray(questions);

    // Initialize answer tracking
    studentAnswers = questions.map(q => ({
      questionId: q._id,
      selectedOption: null
    }));

    // Start countdown timer (timer.js)
    if (typeof startExamTimer === 'function') {
      startExamTimer(examData.duration);
    }

    // Set header details
    document.getElementById('examTitleHeader').textContent = examData.title;
    
    // Render first question
    renderQuestion(0);
    renderQuestionPalette();
    
    // Bind navigation buttons
    document.getElementById('prevQuestionBtn').addEventListener('click', () => navigateQuestion(-1));
    document.getElementById('nextQuestionBtn').addEventListener('click', () => navigateQuestion(1));
    document.getElementById('submitExamTriggerBtn').addEventListener('click', openSubmitConfirmation);
    document.getElementById('confirmSubmitBtn').addEventListener('click', submitExamAnswers);
    document.getElementById('cancelSubmitBtn').addEventListener('click', () => modal.close('submitConfirmModal'));

  } catch (err) {
    toast.error(err.message || 'Failed to initialize exam workspace.');
  }
}

/**
 * Array shuffling using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Renders the question card at the specified index
 */
function renderQuestion(index) {
  currentQuestionIndex = index;
  const question = questions[index];
  
  // Update Question Counter
  document.getElementById('questionCounterText').textContent = `Question ${index + 1} of ${questions.length}`;

  // Update card content
  const cardBody = document.getElementById('questionCardBody');
  cardBody.className = 'card__body fade-in';
  
  cardBody.innerHTML = `
    <h3 style="margin-bottom: var(--spacing-lg); line-height: 1.4;">${question.questionText}</h3>
    <div class="options-container" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      ${question.options.map((opt, i) => {
        const isSelected = studentAnswers[index].selectedOption === i;
        return `
          <label class="option-item" style="
            display: flex; 
            align-items: center; 
            gap: var(--spacing-md); 
            padding: 14px 20px; 
            border: 1px solid ${isSelected ? 'var(--secondary)' : 'var(--border)'}; 
            background: ${isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(30, 41, 59, 0.3)'}; 
            border-radius: var(--radius-sm); 
            cursor: pointer;
            transition: all var(--transition-fast);
          " onmouseover="this.style.borderColor='var(--secondary)'" onmouseout="this.style.borderColor='${isSelected ? 'var(--secondary)' : 'var(--border)'}'">
            <input type="radio" name="qOptions" value="${i}" ${isSelected ? 'checked' : ''} style="
              accent-color: var(--secondary);
              width: 18px;
              height: 18px;
              cursor: pointer;
            " onclick="selectOption(${i})">
            <span>${opt}</span>
          </label>
        `;
      }).join('')}
    </div>
  `;

  // Manage Nav Button bounds
  document.getElementById('prevQuestionBtn').style.visibility = index === 0 ? 'hidden' : 'visible';
  
  const nextBtn = document.getElementById('nextQuestionBtn');
  const submitTrigger = document.getElementById('submitExamTriggerBtn');

  if (index === questions.length - 1) {
    nextBtn.style.display = 'none';
    submitTrigger.style.display = 'inline-flex';
  } else {
    nextBtn.style.display = 'inline-flex';
    submitTrigger.style.display = 'none';
  }
}

/**
 * Handle option clicks and update local array
 */
window.selectOption = function(optionIndex) {
  studentAnswers[currentQuestionIndex].selectedOption = optionIndex;
  
  // Re-render current question to update styles (borders)
  renderQuestion(currentQuestionIndex);
  
  // Update palette status
  renderQuestionPalette();
};

/**
 * Render right-hand navigation grid (palette)
 */
function renderQuestionPalette() {
  const paletteContainer = document.getElementById('questionPaletteGrid');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = studentAnswers.map((ans, i) => {
    let statusClass = 'palette-item--unanswered';
    let styleAttr = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: var(--font-sm);
      cursor: pointer;
      border: 1px solid var(--border);
      background: rgba(30, 41, 59, 0.3);
      color: var(--text-muted);
      transition: all var(--transition-fast);
    `;

    // Active (current) question highlights
    if (i === currentQuestionIndex) {
      styleAttr += ' border-color: var(--secondary); box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);';
    }

    if (ans.selectedOption !== null) {
      // Answered status
      styleAttr += ' background: var(--success); color: #fff; border-color: var(--success);';
    } else if (i < currentQuestionIndex) {
      // Skipped questions (visited but no answer selected)
      styleAttr += ' background: rgba(245, 158, 11, 0.15); color: var(--warning); border-color: rgba(245, 158, 11, 0.4);';
    }

    return `
      <div style="${styleAttr}" onclick="renderQuestion(${i})">
        ${i + 1}
      </div>
    `;
  }).join('');
}

/**
 * Page Navigation jumps
 */
function navigateQuestion(direction) {
  const nextIndex = currentQuestionIndex + direction;
  if (nextIndex >= 0 && nextIndex < questions.length) {
    renderQuestion(nextIndex);
    renderQuestionPalette();
  }
}

/**
 * Open Submission Dialog
 */
function openSubmitConfirmation() {
  const unansweredCount = studentAnswers.filter(ans => ans.selectedOption === null).length;
  const warningText = document.getElementById('submitWarningText');
  
  if (warningText) {
    if (unansweredCount > 0) {
      warningText.innerHTML = `<span style="color: var(--danger); font-weight: 700;"><i class="fas fa-exclamation-triangle"></i> Warning:</span> You have <strong>${unansweredCount}</strong> unanswered questions left. Submitting will score them as zero.`;
    } else {
      warningText.innerHTML = `You have answered all questions. Click submit to finish.`;
    }
  }

  modal.open('submitConfirmModal');
}

/**
 * Final Server Answer Submission
 */
async function submitExamAnswers() {
  modal.close('submitConfirmModal');
  
  // Show loader overlay
  const loader = document.getElementById('examLoaderOverlay');
  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.post('/results/submit', {
      examId: examData._id,
      answers: studentAnswers
    });

    toast.success('Exam submitted successfully!');
    
    // Redirect to results screen
    setTimeout(() => {
      window.location.href = `/pages/result.html?id=${response.data._id}`;
    }, 1500);

  } catch (err) {
    if (loader) loader.style.display = 'none';
    toast.error(err.message || 'An error occurred during submission.');
  }
}

/**
 * Global function called when the count hits zero (triggered by timer.js)
 */
window.autoSubmitExam = async function() {
  toast.warning('Time limit expired! Auto-submitting your answers...');
  
  // Show loader overlay
  const loader = document.getElementById('examLoaderOverlay');
  if (loader) loader.style.display = 'flex';

  try {
    const response = await api.post('/results/submit', {
      examId: examData._id,
      answers: studentAnswers
    });
    
    setTimeout(() => {
      window.location.href = `/pages/result.html?id=${response.data._id}`;
    }, 2000);
  } catch (err) {
    if (loader) loader.style.display = 'none';
    toast.error('Auto-submission failed. Redirecting to dashboard...');
    setTimeout(() => {
      window.location.href = '/pages/dashboard.html';
    }, 3000);
  }
};
