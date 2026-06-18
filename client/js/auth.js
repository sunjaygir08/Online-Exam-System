/**
 * AUTH.JS
 * Login, registration, password strength, logout, and token session guards
 */

// Initialize login/register form event listeners if present on the page
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const regPassword = document.getElementById('regPassword');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (regPassword) {
    regPassword.addEventListener('input', checkPasswordStrength);
  }

  // Handle error messages from OAuth query strings
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    const errorType = urlParams.get('error');
    if (errorType === 'google_auth_failed') {
      toast.error('Google authentication failed. Please try again.');
    } else if (errorType === 'google_callback_failed') {
      toast.error('An error occurred during Google Sign-in redirection.');
    } else if (errorType === 'session_expired') {
      toast.warning('Your session has expired. Please log in again.');
    }
  }
});

/**
 * Handle user registration
 */
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const role = document.getElementById('regRole').value;

  // Client-side validations
  if (!name || !email || !password || !confirmPassword || !role) {
    toast.error('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    toast.error('Password must be at least 6 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    toast.error('Passwords do not match.');
    return;
  }

  try {
    const response = await api.post('/auth/register', { name, email, password, role });
    toast.success(response.message || 'Registration successful!');
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      window.location.href = '/pages/index.html';
    }, 2000);
  } catch (error) {
    if (error.errors) {
      // Handle Joi validation errors
      const errorMsg = Object.values(error.errors).join(', ');
      toast.error(errorMsg);
    } else {
      toast.error(error.message || 'Registration failed.');
    }
  }
}

/**
 * Handle user login
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    toast.error('Please enter email and password.');
    return;
  }

  try {
    const response = await api.post('/auth/login', { email, password });
    toast.success('Login successful!');
    
    // Save minimal user representation in localStorage for routing references
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect to dashboard page
    setTimeout(() => {
      window.location.href = '/pages/dashboard.html';
    }, 1000);
  } catch (error) {
    toast.error(error.message || 'Invalid email or password.');
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
    setTimeout(() => {
      window.location.href = '/pages/index.html';
    }, 1000);
  } catch (error) {
    toast.error('Failed to log out correctly.');
  }
}

/**
 * Interactive password strength checker
 */
function checkPasswordStrength(e) {
  const val = e.target.value;
  const bar = document.getElementById('strengthBar');
  
  if (!bar) return;

  let score = 0;
  if (val.length >= 6) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;

  let width = '0%';
  let bg = 'var(--danger)';

  if (val.length > 0) {
    switch (score) {
      case 1:
        width = '25%';
        bg = 'var(--danger)';
        break;
      case 2:
        width = '50%';
        bg = 'var(--warning)';
        break;
      case 3:
        width = '75%';
        bg = 'var(--secondary)';
        break;
      case 4:
        width = '100%';
        bg = 'var(--success)';
        break;
    }
  }

  bar.style.width = width;
  bar.style.backgroundColor = bg;
}

/**
 * Role guard and authorization check for protected pages.
 * @param {Array<String>} allowedRoles - Roles permitted to view the page
 */
async function checkAuthGuard(allowedRoles = []) {
  try {
    const response = await api.get('/auth/me');
    const user = response.data;
    
    // Update local user reference
    localStorage.setItem('user', JSON.stringify(user));
    
    // Render sidebar details (name, avatar, badges)
    updateSidebarUI(user);

    // Guard route
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      toast.warning('Access denied. Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/pages/dashboard.html';
      }, 1500);
      return null;
    }

    return user;
  } catch (err) {
    // Redirect handled by api.js interceptor if it fails with 401
    return null;
  }
}

/**
 * Updates sidebar user fields dynamically
 */
function updateSidebarUI(user) {
  const avatarEl = document.getElementById('sbAvatar');
  const nameEl = document.getElementById('sbName');
  const roleEl = document.getElementById('sbRoleBadge');

  if (nameEl) nameEl.textContent = user.name;
  if (avatarEl) {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEl.textContent = initials;
  }
  if (roleEl) {
    roleEl.textContent = user.role;
    roleEl.className = `badge badge--${user.role}`;
  }
}
