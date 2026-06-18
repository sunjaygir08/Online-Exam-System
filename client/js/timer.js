/**
 * TIMER.JS
 * Real-time Countdown Timer and Progress Bar Warnings.
 */

let timerInterval = null;

/**
 * Start the countdown timer
 * @param {Number} durationMinutes - Exam duration in minutes
 */
function startExamTimer(durationMinutes) {
  const totalSeconds = durationMinutes * 60;
  let secondsRemaining = totalSeconds;

  const timerTextEl = document.getElementById('timerText');
  const progressFillEl = document.getElementById('timerProgressFill');

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Initial update
  updateTimerUI(secondsRemaining, totalSeconds, timerTextEl, progressFillEl);

  timerInterval = setInterval(() => {
    secondsRemaining--;

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      updateTimerUI(0, totalSeconds, timerTextEl, progressFillEl);
      
      // Call global autoSubmitExam (defined in exam.js)
      if (typeof window.autoSubmitExam === 'function') {
        window.autoSubmitExam();
      }
      return;
    }

    updateTimerUI(secondsRemaining, totalSeconds, timerTextEl, progressFillEl);
  }, 1000);
}

/**
 * Helper to update text clock and progress fill width
 */
function updateTimerUI(remaining, total, textEl, progressEl) {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  // Format clock text
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  if (textEl) {
    textEl.textContent = formattedTime;
  }

  // Calculate percentage
  const percentage = (remaining / total) * 100;
  if (progressEl) {
    progressEl.style.width = `${percentage}%`;
  }

  // Danger limits
  const warningTimeSecs = 5 * 60; // 5 mins
  const dangerTimeSecs = 1 * 60;  // 1 min

  if (remaining <= dangerTimeSecs) {
    // Red color alarm
    if (textEl) textEl.style.color = 'var(--danger)';
    if (progressEl) {
      progressEl.className = 'timer-bar__fill timer-bar__fill--danger';
    }
  } else if (remaining <= warningTimeSecs) {
    // Orange color alarm
    if (textEl) textEl.style.color = 'var(--warning)';
    if (progressEl) {
      progressEl.className = 'timer-bar__fill timer-bar__fill--warning';
    }
  } else {
    // Normal state
    if (textEl) textEl.style.color = 'var(--text-primary)';
    if (progressEl) {
      progressEl.className = 'timer-bar__fill';
    }
  }
}
