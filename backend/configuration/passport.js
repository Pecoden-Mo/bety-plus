import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
// import { Strategy as AppleStrategy } from 'passport-apple';

// Passport configuration for Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        'http://localhost:3020/api/v1/users/auth/social/google/callback', // Handle user profile and authentication logic herehttp://localhost:3020/api/v1/users/auth/social/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);
        const user = {
          provider: profile.provider,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
          googleId: profile.id,
        };

        done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
// Passport configuration for Microsoft OAuth
// ... (your existing Google and Apple strategies) ...

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL:
        'http://localhost:3020/api/v1/users/auth/social/microsoft/callback',
      scope: ['user.read', 'profile', 'openid', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
          console.log('Microsoft profile:', profile);
          
        return done(null, profile);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Uncomment and configure the following strategies as needed

// // Passport configuration for Apple OAuth
// passport.use(new AppleStrategy({}));
