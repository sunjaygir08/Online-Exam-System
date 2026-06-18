const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate a JWT access token for a user.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey1234567890!@#$',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate a JWT refresh token for a user.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey9876543210!@#$',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify JWT access token.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey1234567890!@#$');
  } catch (err) {
    return null;
  }
};

/**
 * Verify JWT refresh token.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey9876543210!@#$');
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
