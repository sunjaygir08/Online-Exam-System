/**
 * API.JS
 * Fetch API Wrapper with Credentials and Automatic Error Interception
 */

const BASE_URL = '/api';

/**
 * Perform an HTTP Request
 * @param {String} endpoint - API endpoint (e.g. '/auth/login')
 * @param {String} [method='GET'] - HTTP Method
 * @param {Object} [body=null] - Request body object
 * @returns {Promise<Object>} - Response data
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Crucial: forces inclusion of HTTP-only JWT cookies
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    // Parse json response
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, the user session is invalid. Redirect to login.
      if (response.status === 401 && !window.location.pathname.includes('/pages/index.html') && !window.location.pathname.includes('/pages/register.html')) {
        // Clear local credentials representation (if any) and redirect
        window.location.href = '/pages/index.html?error=session_expired';
      }
      
      const errorMsg = data.message || 'Something went wrong';
      const error = new Error(errorMsg);
      error.status = response.status;
      error.errors = data.errors || null; // Capture structured Joi validation errors
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Request Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}

// Named HTTP methods for ease of use
const api = {
  get: (endpoint) => apiRequest(endpoint, 'GET'),
  post: (endpoint, body) => apiRequest(endpoint, 'POST', body),
  put: (endpoint, body) => apiRequest(endpoint, 'PUT', body),
  delete: (endpoint) => apiRequest(endpoint, 'DELETE')
};
