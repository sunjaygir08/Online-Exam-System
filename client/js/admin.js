/**
 * ADMIN.JS
 * CRUD Exam actions, dynamic question lists, Admin user edits, role guards, and CSV exporting.
 */

// Global state trackers
let currentActiveExamId = null;
let currentActiveQuestionId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth - allows either teacher or admin to load these components
  const user = await checkAuthGuard(['teacher', 'admin']);
  if (!user) return;

  // Determine current page and initialize specific sections
  const path = window.location.pathname;

  if (path.includes('teacher.html')) {
    await initTeacherPanel();
  } else if (path.includes('admin.html')) {
    await initAdminPanel();
  }
});

// ==========================================
// TEACHER PANEL FUNCTIONS
// ==========================================

async function initTeacherPanel() {
  await loadTeacherExams();

  // Create Exam submit binding
  const examForm = document.getElementById('examForm');
  if (examForm) {
    examForm.addEventListener('submit', handleExamSubmit);
  }

  // Question Form submit binding
  const questionForm = document.getElementById('questionForm');
  if (questionForm) {
    questionForm.addEventListener('submit', handleQuestionSubmit);
  }

  // Handle direct edit parameters in query string
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('editId');
  if (editId) {
    openEditExamModal(editId);
  }
}

/**
 * Fetch and load teacher's exams
 */
async function loadTeacherExams() {
  const tbody = document.getElementById('teacherExamsTableBody');
  if (!tbody) return;

  tbody.innerHTML = skeleton.getTableMarkup(4, 5);

  try {
    const response = await api.get('/exams');
    const exams = response.data;

    if (exams.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: var(--spacing-lg);">No exams created yet. Click "+ Create Exam" to start.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = exams.map(exam => `
      <tr>
        <td><strong>${exam.title}</strong></td>
        <td>${formatDate(exam.scheduledAt)}</td>
        <td>${exam.duration} mins</td>
        <td><span class="badge badge--student">${exam.questions.length} Qs</span></td>
        <td>
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap;">
            <button class="btn btn--outline btn--sm" onclick="openEditExamModal('${exam._id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn--secondary btn--sm" onclick="openManageQuestions('${exam._id}')">
              <i class="fas fa-question-circle"></i> Questions
            </button>
            <button class="btn btn--outline btn--sm" onclick="downloadExamResultsCSV('${exam._id}', '${exam.title}')">
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
            <button class="btn btn--danger btn--sm" onclick="triggerDeleteExam('${exam._id}')">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    toast.error('Failed to load exams list.');
  }
}

/**
 * Open Modal to Create Exam
 */
window.openCreateExamModal = function() {
  currentActiveExamId = null; // resets edit state
  const form = document.getElementById('examForm');
  if (form) form.reset();
  
  document.getElementById('examModalTitle').textContent = 'Create New Exam';
  modal.open('examModal');
};

/**
 * Open Modal to Edit Exam
 */
window.openEditExamModal = async function(examId) {
  currentActiveExamId = examId;
  const form = document.getElementById('examForm');
  if (form) form.reset();

  try {
    const response = await api.get(`/exams/${examId}`);
    const exam = response.data;

    document.getElementById('examTitleInput').value = exam.title;
    document.getElementById('examDurationInput').value = exam.duration;
    
    // Format date string for ISO input
    if (exam.scheduledAt) {
      const date = new Date(exam.scheduledAt);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      document.getElementById('examDateInput').value = date.toISOString().slice(0, 16);
    }

    document.getElementById('examModalTitle').textContent = 'Edit Exam Details';
    modal.open('examModal');
  } catch (err) {
    toast.error('Failed to load exam data.');
  }
};

/**
 * Submit Exam Creation/Modification
 */
async function handleExamSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('examTitleInput').value.trim();
  const duration = parseInt(document.getElementById('examDurationInput').value);
  const scheduledAt = document.getElementById('examDateInput').value;

  if (!title || !duration || !scheduledAt) {
    toast.error('Please fill in all details.');
    return;
  }

  try {
    let response;
    if (currentActiveExamId) {
      // Modify
      response = await api.put(`/exams/${currentActiveExamId}`, { title, duration, scheduledAt });
      toast.success('Exam updated successfully!');
    } else {
      // Create
      response = await api.post('/exams', { title, duration, scheduledAt });
      toast.success('Exam created successfully!');
    }

    modal.close('examModal');
    await loadTeacherExams();
  } catch (err) {
    toast.error(err.message || 'Saving exam failed.');
  }
}

/**
 * Delete confirmation trigger
 */
window.triggerDeleteExam = function(examId) {
  currentActiveExamId = examId;
  modal.open('deleteExamModal');
};

window.confirmDeleteExam = async function() {
  if (!currentActiveExamId) return;

  try {
    await api.delete(`/exams/${currentActiveExamId}`);
    toast.success('Exam deleted successfully.');
    modal.close('deleteExamModal');
    await loadTeacherExams();
  } catch (err) {
    toast.error('Deleting exam failed.');
  }
};

// --- Question Management Operations ---

window.openManageQuestions = async function(examId) {
  currentActiveExamId = examId;
  modal.open('questionsModal');
  await loadExamQuestions();
};

async function loadExamQuestions() {
  const container = document.getElementById('examQuestionsContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding: 20px;"><div class="spinner" style="margin:auto;"></div></div>';

  try {
    const response = await api.get(`/exams/${currentActiveExamId}`);
    const { questions } = response.data;
    
    // Set Header
    document.getElementById('questionsModalTitle').textContent = `Manage Questions: ${response.data.title}`;

    if (questions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-lg); color: var(--text-muted);">
          No questions added to this exam. Use the form below to add one.
        </div>
      `;
      return;
    }

    container.innerHTML = questions.map((q, i) => `
      <div class="card" style="margin-bottom: var(--spacing-sm); padding: var(--spacing-md); border-color: var(--border-light);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-md);">
          <div style="flex: 1;">
            <strong>Q${i + 1}. ${q.questionText}</strong>
            <div style="font-size: var(--font-xs); display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin: 10px 0; color: var(--text-muted);">
              ${q.options.map((opt, optIdx) => {
                const isCorrect = optIdx === q.correctAnswer;
                return `<span style="color: ${isCorrect ? 'var(--success)' : 'inherit'}; font-weight: ${isCorrect ? '600' : 'normal'};">
                  ${String.fromCharCode(65 + optIdx)}. ${opt} ${isCorrect ? '<i class="fas fa-check"></i>' : ''}
                </span>`;
              }).join('')}
            </div>
            <div style="font-size: var(--font-xs); color: var(--secondary);">Marks: ${q.marks}</div>
          </div>
          <div style="display: flex; gap: var(--spacing-xs);">
            <button class="btn btn--outline btn--sm" onclick="editQuestionTrigger('${q._id}')" style="padding: 6px 10px;">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn--danger btn--sm" onclick="deleteQuestionTrigger('${q._id}')" style="padding: 6px 10px;">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    toast.error('Failed to load questions list.');
  }
}

/**
 * Triggers loading question parameters into inputs for edits
 */
window.editQuestionTrigger = async function(questionId) {
  currentActiveQuestionId = questionId;

  try {
    // Note: We need to pull the specific question object. We find it in the DOM or from exam details.
    // Fetching the exam again is easiest
    const response = await api.get(`/exams/${currentActiveExamId}`);
    const q = response.data.questions.find(item => item._id === questionId);

    if (q) {
      document.getElementById('qTextInput').value = q.questionText;
      document.getElementById('qOptA').value = q.options[0] || '';
      document.getElementById('qOptB').value = q.options[1] || '';
      document.getElementById('qOptC').value = q.options[2] || '';
      document.getElementById('qOptD').value = q.options[3] || '';
      document.getElementById('qCorrectSelect').value = q.correctAnswer;
      document.getElementById('qMarksInput').value = q.marks;

      document.getElementById('questionSubmitBtn').innerHTML = '<i class="fas fa-check"></i> Update Question';
    }
  } catch (err) {
    toast.error('Error fetching question parameters.');
  }
};

/**
 * Trigger question deletion
 */
window.deleteQuestionTrigger = async function(questionId) {
  if (!confirm('Are you sure you want to delete this question?')) return;

  try {
    await api.delete(`/exams/questions/${questionId}`);
    toast.success('Question deleted successfully.');
    resetQuestionForm();
    await loadExamQuestions();
    await loadTeacherExams(); // Update count badge in parent table
  } catch (err) {
    toast.error('Deleting question failed.');
  }
};

/**
 * Reset question inputs
 */
function resetQuestionForm() {
  currentActiveQuestionId = null;
  const form = document.getElementById('questionForm');
  if (form) form.reset();
  
  const submitBtn = document.getElementById('questionSubmitBtn');
  if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
}

/**
 * Submit question creation/edits
 */
async function handleQuestionSubmit(e) {
  e.preventDefault();

  const questionText = document.getElementById('qTextInput').value.trim();
  const optA = document.getElementById('qOptA').value.trim();
  const optB = document.getElementById('qOptB').value.trim();
  const optC = document.getElementById('qOptC').value.trim();
  const optD = document.getElementById('qOptD').value.trim();
  const correctAnswer = parseInt(document.getElementById('qCorrectSelect').value);
  const marks = parseInt(document.getElementById('qMarksInput').value) || 1;

  if (!questionText || !optA || !optB || !optC || !optD) {
    toast.error('Please fill in question text and all 4 options.');
    return;
  }

  const options = [optA, optB, optC, optD];

  try {
    if (currentActiveQuestionId) {
      // Edit Question
      await api.put(`/exams/questions/${currentActiveQuestionId}`, {
        questionText,
        options,
        correctAnswer,
        marks
      });
      toast.success('Question updated successfully!');
    } else {
      // Add Question
      await api.post(`/exams/${currentActiveExamId}/questions`, {
        questionText,
        options,
        correctAnswer,
        marks
      });
      toast.success('Question added successfully!');
    }

    resetQuestionForm();
    await loadExamQuestions();
    await loadTeacherExams(); // Update count badge in parent table
  } catch (err) {
    toast.error(err.message || 'Saving question failed.');
  }
}

// ==========================================
// ADMIN PANEL FUNCTIONS
// ==========================================

async function initAdminPanel() {
  await loadAdminUsers();
  
  // Search user listener
  const searchInput = document.getElementById('userSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterUsersTable);
  }
}

/**
 * Fetch and load all users for the administrator
 */
let allUsersDataCache = []; // Cache list for front-end searches
async function loadAdminUsers() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  tbody.innerHTML = skeleton.getTableMarkup(4, 5);

  try {
    const response = await api.get('/auth/users');
    allUsersDataCache = response.data;
    renderUsersList(allUsersDataCache);
  } catch (err) {
    toast.error('Failed to retrieve user accounts database.');
  }
}

function renderUsersList(users) {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: var(--spacing-lg);">No users found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td><strong>${user.name}</strong></td>
      <td>${user.email}</td>
      <td>
        <select class="select-control" onchange="changeUserRole('${user._id}', this.value)" style="
          padding: 6px 12px;
          font-size: var(--font-xs);
          width: 120px;
          margin: 0;
        ">
          <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
          <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Teacher</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td>${formatDate(user.createdAt)}</td>
      <td>
        <button class="btn btn--danger btn--sm" onclick="triggerDeleteUser('${user._id}', '${user.name}')" style="padding: 6px 10px;">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Filter users client-side via input searches
 */
function filterUsersTable(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderUsersList(allUsersDataCache);
    return;
  }

  const filtered = allUsersDataCache.filter(u => 
    u.name.toLowerCase().includes(query) || 
    u.email.toLowerCase().includes(query) ||
    u.role.toLowerCase().includes(query)
  );

  renderUsersList(filtered);
}

/**
 * Call role update route
 */
window.changeUserRole = async function(userId, newRole) {
  try {
    await api.put(`/auth/users/${userId}/role`, { role: newRole });
    toast.success(`User role updated to ${newRole} successfully.`);
    // Update cache
    const cachedUser = allUsersDataCache.find(u => u._id === userId);
    if (cachedUser) cachedUser.role = newRole;
  } catch (err) {
    toast.error(err.message || 'Failed to update user role.');
    await loadAdminUsers(); // Reverts DOM selections to actual state
  }
};

/**
 * Deleting users
 */
let userToDeleteId = null;
window.triggerDeleteUser = function(userId, name) {
  userToDeleteId = userId;
  document.getElementById('deleteUserConfirmText').textContent = `Are you sure you want to delete user "${name}"? This action is permanent and deletes all records.`;
  modal.open('deleteUserModal');
};

window.confirmDeleteUser = async function() {
  if (!userToDeleteId) return;

  try {
    await api.delete(`/auth/users/${userToDeleteId}`);
    toast.success('User account deleted.');
    modal.close('deleteUserModal');
    await loadAdminUsers();
  } catch (err) {
    toast.error(err.message || 'Failed to delete user.');
  }
};

// ==========================================
// CSV REPORT EXPORTS
// ==========================================

/**
 * Downloads result reports for a specific Exam as CSV
 */
window.downloadExamResultsCSV = async function(examId, examTitle) {
  try {
    const response = await api.get(`/results/exam/${examId}`);
    const results = response.data;

    if (results.length === 0) {
      toast.warning('No student results recorded for this exam yet.');
      return;
    }

    // Build Rows
    const headers = ['Student Name', 'Email', 'Score', 'Total Marks', 'Passed Status', 'Attempted Date'];
    const rows = results.map(r => [
      r.userId ? r.userId.name : 'Unknown User',
      r.userId ? r.userId.email : 'N/A',
      r.score,
      r.totalMarks,
      r.passed ? 'PASSED' : 'FAILED',
      new Date(r.submittedAt).toLocaleDateString()
    ]);

    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Trigger Browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${examTitle.replace(/\s+/g, '_')}_results.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Report exported successfully.');
  } catch (err) {
    toast.error('Failed to export CSV report details.');
  }
};
