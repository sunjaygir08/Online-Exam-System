const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseHandler');

/**
 * Configure rate limiter.
 * Limits users to 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP, please try again after 15 minutes.',
      429
    );
  }
});

module.exports = { apiLimiter };
