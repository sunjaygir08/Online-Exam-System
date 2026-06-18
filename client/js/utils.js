/**
 * UTILS.JS
 * Toast system, Modal helpers, Skeleton triggers, Date formatters, Client validation
 */

/**
 * Toast notification manager
 */
const toast = {
  /**
   * Show a toast message
   * @param {String} message - Text to display
   * @param {String} [type='info'] - 'success', 'error', 'warning', 'info'
   * @param {Number} [duration=4000] - Duration in ms before auto-dismiss
   */
  show(message, type = 'info', duration = 4000) {
    // Check if container exists, create if not
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast--${type}`;

    // Select icon based on type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toastEl.innerHTML = `
      <div class="toast__content">
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
      </div>
      <button class="toast__close">&times;</button>
    `;

    container.appendChild(toastEl);

    // Setup close button handler
    const closeBtn = toastEl.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(toastEl);
    });

    // Auto dismiss
    const autoDismissTimeout = setTimeout(() => {
      this.dismiss(toastEl);
    }, duration);

    // Attach timeout ID to element for clean removal
    toastEl.dataset.timeoutId = autoDismissTimeout;
  },

  dismiss(toastEl) {
    if (!toastEl) return;
    
    // Clear auto-dismiss timer
    if (toastEl.dataset.timeoutId) {
      clearTimeout(Number(toastEl.dataset.timeoutId));
    }

    // Animate slide out
    toastEl.style.transform = 'translateX(120%)';
    toastEl.style.transition = 'transform 0.3s ease';

    // Remove element from DOM after transition
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 300);
  },

  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration) { this.show(msg, 'error', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },
  info(msg, duration) { this.show(msg, 'info', duration); }
};

/**
 * Modal visibility manager
 */
const modal = {
  /**
   * Open a specific modal
   * @param {String} modalId - Element ID of the modal overlay
   */
  open(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.classList.add('active');
    }
  },

  /**
   * Close a specific modal
   * @param {String} modalId - Element ID of the modal overlay
   */
  close(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.classList.remove('active');
    }
  }
};

/**
 * Loading Skeletons Helper
 */
const skeleton = {
  /**
   * Generate an array of skeleton card strings
   * @param {Number} count - Number of cards to build
   * @returns {String} HTML string representation
   */
  getCardsMarkup(count = 3) {
    return Array(count)
      .fill(0)
      .map(
        () => `
        <div class="card">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text" style="width: 40%"></div>
        </div>
      `
      )
      .join('');
  },

  /**
   * Generate a skeleton table row markup
   * @param {Number} rows - Number of rows
   * @param {Number} cols - Number of columns
   * @returns {String} HTML string representation
   */
  getTableMarkup(rows = 4, cols = 4) {
    return Array(rows)
      .fill(0)
      .map(
        () => `
        <tr>
          ${Array(cols)
            .fill(0)
            .map(() => '<td><div class="skeleton skeleton--text" style="margin: 0; height: 12px;"></div></td>')
            .join('')}
        </tr>
      `
      )
      .join('');
  }
};

/**
 * Format timestamp into standard date/time readable form
 * @param {String|Date} dateVal - Input date
 * @returns {String} e.g. "Jun 18, 2026, 07:34 PM"
 */
function formatDate(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
