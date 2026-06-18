const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to restrict route access by user roles.
 * @param {Array<String>} allowedRoles - Array of roles allowed to access the route
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied. You do not have permission to perform this action.', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;
