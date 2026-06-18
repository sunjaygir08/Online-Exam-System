/**
 * RESULT.JS
 * Score circle SVG animations, metrics calculation, and detailed answer review tables.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth - Student, Teacher, or Admin can view results
  const user = await checkAuthGuard();
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const resultId = urlParams.get('id');

  if (!resultId) {
    toast.error('Invalid Result Access. Redirecting...');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 1500);
    return;
  }

  await loadResult(resultId);
});

/**
 * Fetch and render exam result data
 */
async function loadResult(resultId) {
  try {
    const response = await api.get(`/results/${resultId}`);
    const { result, answersReview } = response.data;

    // Calculate core metrics
    const totalQuestions = answersReview.length;
    const correctCount = answersReview.filter(a => a.isCorrect).length;
    const skippedCount = answersReview.filter(a => a.selectedOption === null).length;
    const wrongCount = totalQuestions - correctCount - skippedCount;

    // Calculate percentage
    const scorePercentage = result.totalMarks > 0 
      ? Math.round((result.score / result.totalMarks) * 100) 
      : 0;

    // 1. Animate SVG Score Ring
    animateScoreRing(scorePercentage);

    // 2. Render Pass/Fail Badge
    const statusBadge = document.getElementById('resultStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = result.passed ? 'Passed' : 'Failed';
      statusBadge.className = `badge badge--${result.passed ? 'success' : 'danger'}`;
      statusBadge.style.fontSize = 'var(--font-base)';
      statusBadge.style.padding = '8px 16px';
    }

    // 3. Render Metric Cards
    document.getElementById('metricTotal').textContent = totalQuestions;
    document.getElementById('metricCorrect').textContent = correctCount;
    document.getElementById('metricWrong').textContent = wrongCount;
    document.getElementById('metricSkipped').textContent = skippedCount;

    // 4. Render Answers Review Table
    const reviewTableBody = document.getElementById('answersReviewBody');
    if (reviewTableBody) {
      reviewTableBody.innerHTML = answersReview.map((ans, i) => {
        // Find option labels
        const studentAnsLabel = ans.selectedOption !== null ? `${String.fromCharCode(65 + ans.selectedOption)}. ${ans.options[ans.selectedOption]}` : '<span style="color: var(--warning);">Skipped</span>';
        const correctAnsLabel = `${String.fromCharCode(65 + ans.correctAnswer)}. ${ans.options[ans.correctAnswer]}`;

        let statusIcon = '<i class="fas fa-check-circle" style="color: var(--success);"></i>';
        if (ans.selectedOption === null) {
          statusIcon = '<i class="fas fa-minus-circle" style="color: var(--warning);"></i>';
        } else if (!ans.isCorrect) {
          statusIcon = '<i class="fas fa-times-circle" style="color: var(--danger);"></i>';
        }

        return `
          <tr>
            <td><strong>Q${i + 1}</strong></td>
            <td>
              <div style="margin-bottom: var(--spacing-sm); line-height: 1.4;">
                <strong>${ans.questionText}</strong>
              </div>
              <div style="font-size: var(--font-xs); display: flex; flex-direction: column; gap: var(--spacing-xs);">
                <div>Options:</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-xs); padding-left: var(--spacing-sm);">
                  ${ans.options.map((opt, oIdx) => {
                    const isSelected = ans.selectedOption === oIdx;
                    const isCorrect = ans.correctAnswer === oIdx;
                    let color = 'var(--text-muted)';
                    let weight = 'normal';
                    if (isCorrect) { color = 'var(--success)'; weight = 'bold'; }
                    else if (isSelected && !isCorrect) { color = 'var(--danger)'; }
                    
                    return `<span style="color: ${color}; font-weight: ${weight};">${String.fromCharCode(65 + oIdx)}. ${opt}</span>`;
                  }).join('')}
                </div>
              </div>
            </td>
            <td>${studentAnsLabel}</td>
            <td>${correctAnsLabel}</td>
            <td style="text-align: center;">${statusIcon}</td>
            <td><strong>${ans.isCorrect ? ans.marks : 0} / ${ans.marks}</strong></td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    toast.error('Failed to load result sheet details.');
  }
}

/**
 * Animate the SVG dashoffset of the score ring loader
 */
function animateScoreRing(percentage) {
  const ring = document.getElementById('scoreRingProgress');
  const textVal = document.getElementById('scoreRingValue');

  if (!ring || !textVal) return;

  // Total circumference of circle (r=70) is 2 * PI * 70 = 440
  const circumference = 440;
  const offset = circumference - (circumference * percentage) / 100;

  // Let DOM layout finish, then animate offset
  setTimeout(() => {
    ring.style.strokeDashoffset = String(offset);
  }, 100);

  // Animate the text counter from 0 to percentage
  let currentPct = 0;
  if (percentage === 0) {
    textVal.textContent = '0%';
    return;
  }
  
  const stepTime = Math.abs(Math.floor(1500 / percentage));
  const timer = setInterval(() => {
    currentPct++;
    textVal.textContent = `${currentPct}%`;
    if (currentPct >= percentage) {
      clearInterval(timer);
    }
  }, stepTime);
}
