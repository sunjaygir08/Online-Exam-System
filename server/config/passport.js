const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Configure Passport to use Google OAuth 2.0 strategy.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      proxy: true // Trust reverse proxies for HTTPS callbacks
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // Try to find user by googleId
        let user = await User.findOne({ googleId });

        if (!user) {
          // Try to find user by email to link accounts
          user = await User.findOne({ email });

          if (user) {
            // Link googleId to existing user
            user.googleId = googleId;
            await user.save();
          } else {
            // Create a new user with 'student' role by default
            user = new User({
              name,
              email,
              role: 'student', // Default role
              googleId
            });
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
