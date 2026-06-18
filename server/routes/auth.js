const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

/**
 * Helper to set cookies for JWT tokens.
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set Access Token (15 mins)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });

  // Set Refresh Token (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

/**
 * Helper to clear JWT cookies.
 */
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(schemas.register), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 'User with this email already exists', 400);
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();
    return sendSuccess(res, 'Registration successful. Please log in.', null, 201);
  } catch (err) {
    return sendError(res, 'Server error during registration.', 500);
  }
});

// @route   POST /api/auth/login
// @desc    Login user & set JWT cookies
// @access  Public
router.post('/login', validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 400);
    }

    // If registered via Google and has no password
    if (user.googleId && !user.password) {
      return sendError(res, 'This account is registered via Google Login. Please use Google Login.', 400);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 400);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to db
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return sendError(res, 'Server error during login.', 500);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookies
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    clearTokenCookies(res);
    return sendSuccess(res, 'Logged out successfully');
  } catch (err) {
    return sendError(res, 'Server error during logout.', 500);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'Profile retrieved', user);
  } catch (err) {
    return sendError(res, 'Server error fetching profile.', 500);
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth authentication
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/pages/index.html?error=google_auth_failed', session: false }),
  async (req, res) => {
    try {
      const user = req.user; // Attached by passport callback strategy

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      // Redirect to dashboard
      res.redirect('/pages/dashboard.html');
    } catch (err) {
      res.redirect('/pages/index.html?error=google_callback_failed');
    }
  }
);

// --- ADMIN USER MANAGEMENT ROUTES ---

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users list retrieved', users);
  } catch (err) {
    return sendError(res, 'Server error fetching users.', 500);
  }
});

// @route   PUT /api/auth/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/users/:id/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { role } = req.body;
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return sendError(res, 'Invalid role value', 400);
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.role = role;
    await user.save();

    return sendSuccess(res, `User role updated to ${role} successfully`, {
      id: user._id,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    return sendError(res, 'Server error updating user role.', 500);
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user.id.toString()) {
      return sendError(res, 'You cannot delete your own admin account', 400);
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'User account deleted successfully');
  } catch (err) {
    return sendError(res, 'Server error deleting user.', 500);
  }
});

module.exports = router;
