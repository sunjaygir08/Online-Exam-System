/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {String} message - Response message
 * @param {Object|Array} [data=null] - Payload data
 * @param {Number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} [statusCode=500] - HTTP status code
 * @param {Array|Object} [errors=null] - Validation or detail errors
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
