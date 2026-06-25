/**
 * DASHBOARD.JS
 * Role-based dashboard loading, statistics calculation, list rendering, and Chart.js initialization
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Guard the page and fetch the authenticated profile
  const user = await checkAuthGuard();
  if (!user) return;

  // Show correct dashboard panel
  toggleDashboardPanel(user.role);

  // Load panel specific content
  if (user.role === 'student') {
    await loadStudentDashboard();
  } else if (user.role === 'teacher') {
    await loadTeacherDashboard();
  } else if (user.role === 'admin') {
    await loadAdminDashboard();
  }

  // Listen to themeChanged events to update Chart.js colors
  document.addEventListener('themeChanged', async () => {
    const freshUser = JSON.parse(localStorage.getItem('user'));
    if (freshUser && freshUser.role === 'admin') {
      await loadAdminDashboard();
    }
  });
});

/**
 * Toggle section visibility based on roles
 */
function toggleDashboardPanel(role) {
  const panels = {
    student: document.getElementById('studentDashboard'),
    teacher: document.getElementById('teacherDashboard'),
    admin: document.getElementById('adminDashboard')
  };

  Object.keys(panels).forEach(key => {
    if (panels[key]) {
      if (key === role) {
        panels[key].style.display = 'block';
      } else {
        panels[key].style.display = 'none';
      }
    }
  });

  // Display admin / teacher panel navigation links in sidebar based on roles
  const teacherLink = document.getElementById('sbTeacherLink');
  const adminLink = document.getElementById('sbAdminLink');

  if (teacherLink) {
    teacherLink.style.display = (role === 'teacher' || role === 'admin') ? 'flex' : 'none';
  }
  if (adminLink) {
    adminLink.style.display = role === 'admin' ? 'flex' : 'none';
  }
}

/**
 * Loading Student Dashboard
 */
async function loadStudentDashboard() {
  const examsGrid = document.getElementById('studentUpcomingExams');
  const resultsTableBody = document.getElementById('studentRecentResults');

  // Load Skeletons
  if (examsGrid) examsGrid.innerHTML = skeleton.getCardsMarkup(2);
  if (resultsTableBody) resultsTableBody.innerHTML = skeleton.getTableMarkup(3, 4);

  try {
    // 1. Fetch Exams and Results
    const examsRes = await api.get('/exams');
    const resultsRes = await api.get('/results/my');
    
    const exams = examsRes.data;
    const results = resultsRes.data;

    // 2. Render Student Statistics
    const totalTaken = results.length;
    const passedExams = results.filter(r => r.passed).length;
    const avgScore = totalTaken > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / totalTaken * 100) 
      : 0;

    document.getElementById('statTotalExams').textContent = totalTaken;
    document.getElementById('statPassedExams').textContent = passedExams;
    document.getElementById('statAvgScore').textContent = `${avgScore}%`;

    // 3. Render Upcoming Exams (Exams not attempted yet)
    const upcomingExams = exams.filter(e => !e.attempted);
    if (examsGrid) {
      if (upcomingExams.length === 0) {
        examsGrid.innerHTML = `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
            <i class="fas fa-calendar-check" style="font-size: var(--font-xl); color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
            <p>No upcoming exams assigned to you at the moment.</p>
          </div>
        `;
      } else {
        examsGrid.innerHTML = upcomingExams.map(exam => `
          <div class="card card--interactive">
            <div class="card__header">
              <span class="badge badge--student">${exam.createdBy.name}</span>
              <h3 style="margin-top: var(--spacing-sm);">${exam.title}</h3>
            </div>
            <div class="card__body">
              <p><i class="fas fa-clock" style="margin-right: 8px;"></i> Duration: <strong>${exam.duration} mins</strong></p>
              <p><i class="fas fa-calendar-alt" style="margin-right: 8px;"></i> Date: <strong>${formatDate(exam.scheduledAt)}</strong></p>
            </div>
            <div class="card__footer">
              <a href="/pages/exam.html?id=${exam._id}" class="btn btn--primary btn--sm">
                <i class="fas fa-play"></i> Start Exam
              </a>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Render Recent Attempt Results
    if (resultsTableBody) {
      if (results.length === 0) {
        resultsTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: var(--spacing-lg);">You haven't attempted any exams yet.</td>
          </tr>
        `;
      } else {
        resultsTableBody.innerHTML = results.map(res => `
          <tr>
            <td><strong>${res.examId ? res.examId.title : 'Deleted Exam'}</strong></td>
            <td>${formatDate(res.submittedAt)}</td>
            <td><strong>${res.score} / ${res.totalMarks}</strong></td>
            <td>
              <span class="badge badge--${res.passed ? 'success' : 'danger'}">
                ${res.passed ? 'Pass' : 'Fail'}
              </span>
            </td>
            <td>
              <a href="/pages/result.html?id=${res._id}" class="btn btn--outline btn--sm">
                <i class="fas fa-eye"></i> Review
              </a>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    toast.error('Failed to load student dashboard details.');
  }
}

/**
 * Loading Teacher Dashboard
 */
async function loadTeacherDashboard() {
  const examsTableBody = document.getElementById('teacherExamsList');
  if (examsTableBody) examsTableBody.innerHTML = skeleton.getTableMarkup(3, 4);

  try {
    const examsRes = await api.get('/exams');
    const exams = examsRes.data;

    // Load simple statistics
    document.getElementById('teacherTotalExams').textContent = exams.length;

    if (examsTableBody) {
      if (exams.length === 0) {
        examsTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: var(--spacing-lg);">You haven't created any exams yet. Go to the Teacher Panel to start.</td>
          </tr>
        `;
      } else {
        examsTableBody.innerHTML = exams.map(exam => `
          <tr>
            <td><strong>${exam.title}</strong></td>
            <td>${formatDate(exam.scheduledAt)}</td>
            <td>${exam.duration} mins</td>
            <td><strong>${exam.questions.length}</strong></td>
            <td>
              <a href="/pages/teacher.html?editId=${exam._id}" class="btn btn--outline btn--sm">
                <i class="fas fa-edit"></i> Edit
              </a>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    toast.error('Failed to load teacher dashboard details.');
  }
}

/**
 * Loading Admin Dashboard (Visual Analytics Charts using Chart.js)
 */
async function loadAdminDashboard() {
  try {
    // 1. Fetch Admin Data Overview
    const usersRes = await api.get('/auth/users');
    const examsRes = await api.get('/exams');
    const resultsRes = await api.get('/results/all');

    const users = usersRes.data;
    const exams = examsRes.data;
    const results = resultsRes.data;

    // 2. Set Admin Summary Widgets text
    document.getElementById('adminTotalUsers').textContent = users.length;
    document.getElementById('adminTotalExams').textContent = exams.length;
    document.getElementById('adminTotalResults').textContent = results.length;

    // 3. Render Chart.js visual graphs
    renderAdminCharts(users, exams, results);
  } catch (err) {
    toast.error('Failed to load system administrator statistics.');
  }
}

/**
 * Renders graphical summary details on Canvas using Chart.js
 */
function renderAdminCharts(users, exams, results) {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx) return;

  // Calculate roles breakdown
  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // Calculate exam pass vs fail rates
  const passes = results.filter(r => r.passed).length;
  const fails = results.filter(r => !r.passed).length;

  // Destroy previous chart if initialized to prevent overlapping canvas renders
  if (window.myDashboardChart) {
    window.myDashboardChart.destroy();
  }

  // Read theme colors dynamically from CSS variables
  const gridColor = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#334155';
  const tickColor = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#94A3B8';

  // Draw Combined Bar/Doughnut Chart details
  window.myDashboardChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Students', 'Teachers', 'Admins', 'Exam Passes', 'Exam Fails'],
      datasets: [
        {
          label: 'System Metrics Summary',
          data: [studentCount, teacherCount, adminCount, passes, fails],
          backgroundColor: [
            'rgba(6, 182, 212, 0.6)',  // Cyan
            'rgba(245, 158, 11, 0.6)',  // Warning Orange
            'rgba(239, 68, 68, 0.6)',   // Danger Red
            'rgba(16, 185, 129, 0.6)',  // Emerald Success
            'rgba(239, 68, 68, 0.6)'    // Red
          ],
          borderColor: [
            '#06B6D4',
            '#F59E0B',
            '#EF4444',
            '#10B981',
            '#EF4444'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: tickColor
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: tickColor
          }
        }
      }
    }
  });
}
