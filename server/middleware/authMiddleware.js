const User = require('../models/User');
const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/tokenUtils');
const { sendError } = require('../utils/responseHandler');

/**
 * Authentication middleware that validates access tokens stored in cookies.
 * Automatically tries to refresh using the refresh token if the access token has expired.
 */
const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    // If no access token but refresh token exists, try to refresh
    if (refreshToken) {
      return await handleTokenRefresh(req, res, next, refreshToken);
    }
    return sendError(res, 'Access denied. Please log in.', 401);
  }

  const decoded = verifyAccessToken(accessToken);

  if (decoded) {
    // Token is valid, attach user to request
    req.user = decoded;
    return next();
  }

  // If access token is expired/invalid, try refresh token
  if (refreshToken) {
    return await handleTokenRefresh(req, res, next, refreshToken);
  }

  return sendError(res, 'Authentication failed. Please log in again.', 401);
};

/**
 * Helper function to handle transparent refresh token processing
 */
const handleTokenRefresh = async (req, res, next, token) => {
  const decodedRefresh = verifyRefreshToken(token);

  if (!decodedRefresh) {
    return sendError(res, 'Session expired. Please log in again.', 401);
  }

  try {
    const user = await User.findById(decodedRefresh.id);

    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Session invalid. Please log in again.', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Attach decoded user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (err) {
    return sendError(res, 'Error authenticating user session.', 500);
  }
};

module.exports = authMiddleware;
